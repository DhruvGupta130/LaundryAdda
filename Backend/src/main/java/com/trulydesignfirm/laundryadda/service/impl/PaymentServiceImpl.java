package com.trulydesignfirm.laundryadda.service.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.razorpay.*;
import com.trulydesignfirm.laundryadda.actions.Response;
import com.trulydesignfirm.laundryadda.enums.PaymentStatus;
import com.trulydesignfirm.laundryadda.model.Orders;
import com.trulydesignfirm.laundryadda.model.PaymentDetails;
import com.trulydesignfirm.laundryadda.repository.PaymentRepo;
import com.trulydesignfirm.laundryadda.service.PaymentService;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Optional;

import static com.razorpay.Utils.verifySignature;
import static com.razorpay.Utils.verifyWebhookSignature;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    @Value("${razorpay.key_id}")
    private String keyId;

    @Value("${razorpay.key_secret}")
    private String keySecret;

    @Value("${razorpay.webhook_secret}")
    private String webhookSecret;

    private final PaymentRepo paymentRepo;
    private RazorpayClient razorpayClient;

    @PostConstruct
    public void init() throws RazorpayException {
        this.razorpayClient = new RazorpayClient(keyId, keySecret);
    }

    @Override
    public String createOrder(Orders orders) throws RazorpayException {
        int amountInPaise = orders.getTotalAmount().multiply(BigDecimal.valueOf(100)).intValueExact();

        // Create order JSON object
        JSONObject options = new JSONObject();
        options.put("amount", amountInPaise);
        options.put("currency", "INR");
        options.put("receipt", "txn_" + System.currentTimeMillis());
        options.put("payment_capture", 1);

        // Create order in Razorpay
        Order order = razorpayClient.orders.create(options);

        // Save order details in DB
        PaymentDetails details = Optional.ofNullable(orders.getPaymentDetails()).orElseGet(PaymentDetails::new);
        if (details.getPaymentStatus().equals(PaymentStatus.SUCCESS)) {
            throw new IllegalStateException("Payment for this order is already processed.");
        }
        details.setRazorPayId(order.get("id"));
        details.setAmount(new BigDecimal(order.get("amount").toString()).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP));// Convert back to Rupees
        details.setReceipt(order.get("receipt"));
        details.setPaymentStatus(PaymentStatus.INITIATED);
        details.setOrder(orders);
        paymentRepo.save(details);

        return order.get("id");
    }

    @Override
    public String cancelOrder(String paymentId) throws RazorpayException {
        if(paymentId == null || paymentId.isEmpty()) {
            return "No refund applicable.";
        }
        PaymentDetails order = paymentRepo.findByPaymentId(paymentId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        JSONObject refundRequest = new JSONObject();
        refundRequest.put("amount", order.getAmount().multiply(BigDecimal.valueOf(100)).intValueExact());
        refundRequest.put("speed", "normal");
        refundRequest.put("receipt", "txn_" + System.currentTimeMillis());
       Refund refund = razorpayClient.payments.refund(paymentId, refundRequest);
       order.setRefundId(refund.get("id"));
       order.setPaymentStatus(PaymentStatus.REFUNDED);
       paymentRepo.save(order);
       return "Refund successful. Refund ID: " + refund.get("id");
    }

    @Override
    @Transactional
    public Response verifyWebhook(String payload, String razorpaySignature) {
        try {
            if(!verifyWebhookSignature(payload, razorpaySignature, webhookSecret)) {
                throw new IllegalArgumentException("Payment verification failed. Invalid signature.");
            }
            ObjectMapper mapper = new ObjectMapper();
            JsonNode rootNode = mapper.readTree(payload);
            String eventType = rootNode.path("event").asText();
            JsonNode paymentEntity = rootNode.path("payload").path("payment").path("entity");
            String razorPayId = paymentEntity.path("order_id").asText();
            String paymentId = paymentEntity.path("id").asText();
            int amount = paymentEntity.path("amount").asInt();
            if ("payment.captured".equals(eventType)) {
                log.info("Payment captured! OrderId: {}, PaymentId: {}, Amount: {}", razorPayId, paymentId, amount);
                PaymentDetails paymentDetails = paymentRepo.findByRazorPayId(razorPayId)
                        .orElseThrow(() -> new RuntimeException("Invalid orderId: " + razorPayId));
                return manageVerifiedPayment(paymentId, paymentDetails, razorPayId);
            } else {
                return Response.builder()
                        .status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .message("Event received but not handled: " + eventType)
                        .build();
            }
        } catch (RazorpayException | JsonProcessingException e) {
            throw new RuntimeException("Payment verification failed. Invalid signature.");
        }
    }

    @Override
    @Transactional
    public Response verifyPayment(String paymentId, String razorPayId, String signature) {
        try {
            String payload = razorPayId + "|" + paymentId;
            if(!verifySignature(payload, signature, keySecret)) {
                updatePaymentStatusToFailed(razorPayId);
                throw new IllegalArgumentException("Payment verification failed. Invalid signature.");
            }
            log.info("Verifying payment for Order ID: {}", razorPayId);
            PaymentDetails paymentDetails = paymentRepo.findById(razorPayId)
                    .orElseThrow(() -> new RuntimeException("Invalid orderId: " + razorPayId));
            return manageVerifiedPayment(paymentId, paymentDetails, razorPayId);
        } catch (RazorpayException e) {
            updatePaymentStatusToFailed(razorPayId);
            throw new RuntimeException("Error verifying payment: " + e.getMessage());
        }
    }

    private Response manageVerifiedPayment(String paymentId, PaymentDetails paymentDetails, String razorPayId) {
        if (PaymentStatus.SUCCESS.equals(paymentDetails.getPaymentStatus())) {
            log.info("Order {} already processed. Skipping duplicate handling.", razorPayId);
            return Response.builder().status(HttpStatus.OK).message("Order already processed.").build();
        }
        log.info("Payment ID: {}", paymentId);
        paymentDetails.setPaymentStatus(PaymentStatus.SUCCESS);
        paymentDetails.setPaymentId(paymentId);
        paymentRepo.save(paymentDetails);
        return Response.builder().status(HttpStatus.OK).message("Payment processed successfully.").build();
    }

    private void updatePaymentStatusToFailed(String razorPayId) {
        paymentRepo.findById(razorPayId).ifPresent(payment -> {
            payment.setPaymentStatus(PaymentStatus.FAILED);
            paymentRepo.save(payment);
            log.warn("Payment status set to FAILED for order ID: {}", razorPayId);
        });
    }

}