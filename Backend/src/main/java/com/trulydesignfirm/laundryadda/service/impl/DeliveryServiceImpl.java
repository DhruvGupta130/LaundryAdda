package com.trulydesignfirm.laundryadda.service.impl;

import com.trulydesignfirm.laundryadda.actions.OrdersDTO;
import com.trulydesignfirm.laundryadda.actions.PaymentResponse;
import com.trulydesignfirm.laundryadda.actions.Response;
import com.trulydesignfirm.laundryadda.enums.OrderStatus;
import com.trulydesignfirm.laundryadda.model.*;
import com.trulydesignfirm.laundryadda.repository.DeliveryRepo;
import com.trulydesignfirm.laundryadda.repository.OrderRepo;
import com.trulydesignfirm.laundryadda.service.DeliveryService;
import com.trulydesignfirm.laundryadda.service.PaymentService;
import com.trulydesignfirm.laundryadda.service.utils.Utility;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@AllArgsConstructor
public class DeliveryServiceImpl implements DeliveryService {

    private final OrderRepo orderRepo;
    private final PaymentService paymentService;
    private final Utility utility;
    private final DeliveryRepo deliveryRepo;

    @Override
    public Boolean validateProfile(String token) {
        return deliveryRepo.findByUser(utility.getUserFromToken(token)).isPresent();
    }

    @Override
    public Delivery getDeliveryProfile(String token) {
        return deliveryRepo.findByUser(utility.getUserFromToken(token))
                .orElseThrow(() -> new RuntimeException("Delivery profile not found."));
    }

    @Override
    public Response updateDeliveryProfile(String token, Delivery profile) {
        LoginUser user = utility.getUserFromToken(token);
        Delivery delivery = deliveryRepo.findByUser(user).orElse(new Delivery());
        delivery.setGender(profile.getGender());
        delivery.setMobile(profile.getMobile());
        delivery.setAadharImage(profile.getAadharImage());
        delivery.setAadharNumber(profile.getAadharNumber());
        delivery.setUser(user);
        deliveryRepo.save(delivery);
        return Response.builder()
                .status(HttpStatus.CREATED)
                .message("Delivery profile updated successfully.")
                .build();
    }

    @Override
    public List<Area> getAllDeliveryAreas(String token) {
        return getDeliveryFromToken(token).getAreas();
    }

    @Override
    public Map<String, Integer> getDashboardData(String token) {
        Delivery delivery = getDeliveryFromToken(token);
        List<Area> deliveryAreas = delivery.getAreas();
        int totalOrders = orderRepo.countByAddress_AreaIn(deliveryAreas);
        int pickedUpOrders = orderRepo.countByAddress_AreaInAndStatus(deliveryAreas, OrderStatus.PICKED_UP);
        int awaitingPickupOrders = orderRepo.countByAddress_AreaInAndStatus(deliveryAreas, OrderStatus.AWAITING_PICKUP);
        int deliveredOrders = orderRepo.countByAddress_AreaInAndStatus(deliveryAreas, OrderStatus.DELIVERED);
        int outForDeliveryOrders = orderRepo.countByAddress_AreaInAndStatus(deliveryAreas, OrderStatus.OUT_FOR_DELIVERY);
        return Map.of(
                "totalOrders", totalOrders,
                "pickedUpOrders", pickedUpOrders,
                "awaitingPickupOrders", awaitingPickupOrders,
                "deliveredOrders", deliveredOrders,
                "outForDeliveryOrders", outForDeliveryOrders
        );
    }

    @Override
    public List<OrdersDTO> getAllPickups(String token) {
        return orderRepo.findAllByAddress_AreaInAndStatus(getDeliveryFromToken(token).getAreas(), OrderStatus.AWAITING_PICKUP)
                .stream().map(OrdersDTO::new).toList();
    }

    @Override
    public Response updateCustomerPickup(UUID orderId, int secretCode) {
        Orders order = orderRepo.findById(orderId).orElseThrow(() -> new RuntimeException("Order not found."));
        if (order.getStatus() != OrderStatus.AWAITING_PICKUP) {
            throw new IllegalArgumentException("Invalid Request.");
        }
        if (order.getSecretCode() == null || !order.getSecretCode().equals(secretCode)) {
            throw new IllegalArgumentException("Invalid Secret Code.");
        }
        order.setStatus(OrderStatus.PICKED_UP);
        orderRepo.save(order);
        return Response.builder()
                .status(HttpStatus.OK)
                .message("Order picked up successfully.")
                .build();
    }

    @Override
    public List<OrdersDTO> getShopDeliveries(String token) {
        return orderRepo.findAllByAddress_AreaInAndStatus(getDeliveryFromToken(token).getAreas(), OrderStatus.PICKED_UP)
                .stream().map(OrdersDTO::new).toList();
    }

    @Override
    public Response updateShopDelivery(UUID orderId) {
        Orders order = orderRepo.findById(orderId).orElseThrow(() -> new RuntimeException("Order not found."));
        if (order.getStatus() != OrderStatus.PICKED_UP) {
            throw new IllegalArgumentException("Invalid Request.");
        }
        order.setStatus(OrderStatus.COUNTING);
        orderRepo.save(order);
        return Response.builder()
                .status(HttpStatus.OK)
                .message("Order delivered to laundry shop.")
                .build();
    }

    @Override
    public List<OrdersDTO> getShopPickups(String token) {
        return orderRepo.findAllByAddress_AreaInAndStatus(getDeliveryFromToken(token).getAreas(), OrderStatus.READY_FOR_DELIVERY)
                .stream().map(OrdersDTO::new).toList();
    }

    @Override
    public Response updateShopPickup(UUID orderId) {
        Orders order = orderRepo.findById(orderId).orElseThrow(() -> new RuntimeException("Order not found."));
        if (order.getStatus() != OrderStatus.READY_FOR_DELIVERY) {
            throw new IllegalArgumentException("Invalid Request.");
        }
        order.setStatus(OrderStatus.OUT_FOR_DELIVERY);
        orderRepo.save(order);
        return Response.builder()
                .status(HttpStatus.OK)
                .message("Order picked up successfully.")
                .build();
    }

    @Override
    public List<OrdersDTO> getAllDeliveries(String token) {
        return orderRepo.findAllByAddress_AreaInAndStatus(getDeliveryFromToken(token).getAreas(), OrderStatus.OUT_FOR_DELIVERY)
                .stream().map(OrdersDTO::new).toList();
    }

    @Override
    public Response updateCustomerDelivery(UUID orderId, int secretCode) {
        Orders order = orderRepo.findById(orderId).orElseThrow(() -> new RuntimeException("Order not found."));
        if (order.getStatus() != OrderStatus.OUT_FOR_DELIVERY) {
            throw new IllegalArgumentException("Invalid Request.");
        }
        if (order.getSecretCode() == null || !order.getSecretCode().equals(secretCode)) {
            throw new IllegalArgumentException("Invalid Secret Code.");
        }
        order.setStatus(OrderStatus.DELIVERED);
        orderRepo.save(order);
        return Response.builder()
                .status(HttpStatus.OK)
                .message("Order delivered to customer successfully.")
                .build();
    }

    @Override
    public PaymentResponse getPayOnlineLink(UUID orderId) {
        try {
            Orders order = orderRepo.findById(orderId)
                    .orElseThrow(() -> new RuntimeException("Order not found."));
            if (order.getStatus() != OrderStatus.DELIVERED) {
                throw new IllegalArgumentException("You can pay only when order is delivered.");
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
    public Response verifyPayment(String paymentId, String razorPayId, String signature) {
        return paymentService.verifyPayment(paymentId, razorPayId, signature);
    }

    private Delivery getDeliveryFromToken(String token) {
        return deliveryRepo.findByUser(utility.getUserFromToken(token))
                .orElseThrow(() -> new RuntimeException("Delivery profile not found."));
    }
}
