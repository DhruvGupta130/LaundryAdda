package com.trulydesignfirm.laundryadda.service.impl;

import com.trulydesignfirm.laundryadda.actions.OrdersDTO;
import com.trulydesignfirm.laundryadda.actions.PaymentResponse;
import com.trulydesignfirm.laundryadda.actions.PickupRequest;
import com.trulydesignfirm.laundryadda.actions.Response;
import com.trulydesignfirm.laundryadda.enums.OrderStatus;
import com.trulydesignfirm.laundryadda.model.*;
import com.trulydesignfirm.laundryadda.repository.CustomerRepo;
import com.trulydesignfirm.laundryadda.repository.OrderRepo;
import com.trulydesignfirm.laundryadda.repository.ReviewRepo;
import com.trulydesignfirm.laundryadda.service.CustomerService;
import com.trulydesignfirm.laundryadda.service.LaundryService;
import com.trulydesignfirm.laundryadda.service.PaymentService;
import com.trulydesignfirm.laundryadda.service.utils.Utility;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@AllArgsConstructor
public class CustomerServiceImpl implements CustomerService {

    private final Utility utility;
    private final CustomerRepo customerRepo;
    private final OrderRepo orderRepo;
    private final LaundryService laundryService;
    private final PaymentService paymentService;
    private final ReviewRepo reviewRepo;

    @Override
    public Boolean validateProfile(String token) {
        return customerRepo.findCustomerByUser(utility.getUserFromToken(token)).isPresent();
    }

    @Override
    public Customer getProfile(String token) {
        return getCustomerByToken(token);
    }

    @Override
    public Response updateProfile(String token, Customer profile) {
        Customer customer = customerRepo.findCustomerByUser(utility.getUserFromToken(token))
                .orElse(new Customer());
        customer.setMobile(profile.getMobile());
        customer.setGender(profile.getGender());
        customer.setDob(profile.getDob());
        customer.setUser(utility.getUserFromToken(token));
        customerRepo.save(customer);
        return Response.builder()
                .status(HttpStatus.CREATED)
                .message("Customer profile updated successfully.")
                .build();
    }

    @Override
    public List<Address> getAllAddresses(String token) {
        return customerRepo.getCustomerAddresses(getCustomerByToken(token));
    }

    @Override
    public Response addAddress(String token, Address address) {
        Customer customer = getCustomerByToken(token);
        if (customer.getAddresses().contains(address)) {
            throw new IllegalArgumentException("Address already exists.");
        }
        customer.getAddresses().add(address);
        customerRepo.save(customer);
        return Response.builder()
                .status(HttpStatus.CREATED)
                .message("Address added successfully.")
                .build();
    }

    @Override
    public Response removeAddress(String token, long addressId) {
        Customer customer = getCustomerByToken(token);
        Address addressToRemove = customer.getAddresses().stream()
                .filter(address -> address.getId().equals(addressId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Address not found."));
        boolean isAddressInUse = customer.getOrders().stream()
                .anyMatch(order -> order.getAddress().getId().equals(addressId));
        if (isAddressInUse) {
            throw new IllegalArgumentException("Address is being used by an order.");
        }
        customer.getAddresses().remove(addressToRemove);
        customerRepo.save(customer);
        return Response.builder()
                .status(HttpStatus.OK)
                .message("Address removed successfully.")
                .build();
    }

    @Override
    public Page<OrdersDTO> getAllOrders(String token, int pageNumber, int size) {
        Sort sort = Sort.by(Sort.Direction.DESC, "createdAt");
        Pageable pageable = PageRequest.of(pageNumber, size, sort);
        return orderRepo.findByCustomer(getCustomerByToken(token), pageable)
                .map(OrdersDTO::new);
    }

    @Override
    public Response requestPickup(String token, PickupRequest request) {
        Customer customer = getCustomerByToken(token);
        Address selectedAddress = customer.getAddresses()
                .stream()
                .filter(addr -> addr.getId().equals(request.getAddressId()))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Invalid Address Provided."));
        Orders orders = new Orders();
        orders.setCustomer(customer);
        orders.setPickupSlot(request.getPickupSlot());
        orders.setInstructions(request.getInstructions());
        orders.setAddress(selectedAddress);
        orders.setStatus(OrderStatus.PENDING_OWNER_CONFIRMATION);
        orders.setOrderType(request.getOrderType());
        orders.setDeliveryDate(request.getPickupSlot().getDate()
                .plusDays(request.getOrderType().ordinal() + 1));
        orders.setShop(laundryService.getShopById(request.getShopId()));
        orderRepo.save(orders);
        return Response.builder()
                .status(HttpStatus.CREATED)
                .message("Pickup request submitted successfully.")
                .build();
    }

    @Override
    public Review getOrderReview(String token, UUID orderId) {
        return reviewRepo.findByCustomerAndOrder(
                getCustomerByToken(token), getCustomerOrderById(orderId, token)
        );
    }

    @Override
    public Integer getSecretCode(String token, UUID orderId) {
        Customer customer = getCustomerByToken(token);
        Orders order = orderRepo.findByIdAndCustomer(orderId, customer)
                .orElseThrow(() -> new RuntimeException("Order not found."));
        if (!order.getStatus().equals(OrderStatus.AWAITING_PICKUP)
                && !order.getStatus().equals(OrderStatus.OUT_FOR_DELIVERY)) {
            throw new IllegalArgumentException("Secret code will be generated at the time of pickup or delivery.");
        }
        return order.getSecretCode();
    }

    @Override
    public Invoice getOrderInvoice(String token, UUID orderId) {
        Orders orders = orderRepo.findByIdAndCustomer(orderId, getCustomerByToken(token))
                .orElseThrow(() -> new RuntimeException("Order not found."));
        if (orders.getStatus().ordinal() < OrderStatus.BILL_GENERATED.ordinal()) {
            throw new IllegalArgumentException("Invoice not generated for this order.");
        }
        return orders.getInvoice();
    }

    @Override
    public Response cancelPickup(String token, UUID orderId) {
        Customer customer = getCustomerByToken(token);
        Orders order = orderRepo.findByIdAndCustomer(orderId, customer)
                .orElseThrow(() -> new RuntimeException("Order not found."));
        if (!(order.getStatus() == OrderStatus.PENDING_OWNER_CONFIRMATION ||
                order.getStatus() == OrderStatus.AWAITING_PICKUP)) {
            throw new IllegalArgumentException("This order cannot be cancelled.");
        }
        order.setStatus(OrderStatus.CANCELLED_BY_CUSTOMER);
        orderRepo.save(order);
        return Response.builder()
                .status(HttpStatus.OK)
                .message("Pickup request cancelled successfully.")
                .build();
    }

    @Override
    public PaymentResponse getPayOnlineLink(String token, UUID orderId) {
        try {
            Orders order = getCustomerOrderById(orderId, token);
            if (order.getStatus().ordinal() < OrderStatus.BILL_GENERATED.ordinal()) {
                throw new IllegalArgumentException("You can pay only after bill is generated.");
            }
            String razorpayOrderId = paymentService.createOrder(order);
            return PaymentResponse.builder()
                    .message("Payment initiated. Complete payment to confirm order.")
                    .status(HttpStatus.OK)
                    .data(Map.of("razorpay_order_id", razorpayOrderId, "amount", order.getTotalAmount()))
                    .build();
        } catch (Exception e) {
            throw new IllegalStateException("Failed to initiate payment: " + e.getMessage());
        }
    }

    @Override
    @Transactional
    public Response updateOrderReview(String token, UUID orderId, Review myReview) {
        Orders order = getCustomerOrderById(orderId, token);
        if (order.getStatus() != OrderStatus.DELIVERED)
            throw new IllegalArgumentException("You can only review delivered orders.");
        Review review = reviewRepo.getReviewByOrder(order)
                .orElse(new Review());
        review.setService(myReview.getService());
        review.setTime(myReview.getTime());
        review.setClothing(myReview.getClothing());
        review.setValue(myReview.getValue());
        review.setFeedback(myReview.getFeedback());
        review.setOrder(order);
        review.setCustomer(order.getCustomer());
        review.setShop(order.getShop());
        laundryService.updateShopRating(order, myReview);
        reviewRepo.save(review);
        return Response.builder()
                .status(HttpStatus.OK)
                .message("Review updated successfully.")
                .build();
    }

    @Override
    public Response verifyPayment(String paymentId, String razorPayId, String signature) {
        return paymentService.verifyPayment(paymentId, razorPayId, signature);
    }

    private Customer getCustomerByToken(String token) {
        return customerRepo.findCustomerByUser(utility.getUserFromToken(token))
                .orElseThrow(() -> new RuntimeException("Customer not found."));
    }

    private Orders getCustomerOrderById(UUID orderId, String token) {
        return orderRepo.findByIdAndCustomer(orderId, getCustomerByToken(token))
                .orElseThrow(() -> new RuntimeException("Order not found."));
    }
}
