package com.trulydesignfirm.laundryadda.controller;

import com.trulydesignfirm.laundryadda.actions.OrdersDTO;
import com.trulydesignfirm.laundryadda.actions.PaymentResponse;
import com.trulydesignfirm.laundryadda.actions.Response;
import com.trulydesignfirm.laundryadda.model.Area;
import com.trulydesignfirm.laundryadda.model.Delivery;
import com.trulydesignfirm.laundryadda.service.DeliveryService;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/delivery")
@AllArgsConstructor
public class DeliveryController {

    private final DeliveryService deliveryService;

    @GetMapping("/validate")
    public ResponseEntity<Boolean> validateDelivery(@RequestHeader("Authorization") String token) {
        return ResponseEntity.ok(deliveryService.validateProfile(token));
    }

    @GetMapping("/profile")
    public ResponseEntity<Delivery> getProfile(@RequestHeader("Authorization") String token) {
        return ResponseEntity.ok(deliveryService.getDeliveryProfile(token));
    }

    @PostMapping("/profile")
    public ResponseEntity<Response> updateProfile(@RequestHeader("Authorization") String token, @Valid @RequestBody Delivery delivery) {
        Response response = deliveryService.updateDeliveryProfile(token, delivery);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @GetMapping("/areas")
    public ResponseEntity<List<Area>> getAllDeliveryAreas(@RequestHeader("Authorization") String token) {
        return ResponseEntity.ok(deliveryService.getAllDeliveryAreas(token));
    }

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Integer>> getDashboardData(@RequestHeader("Authorization") String token) {
        return ResponseEntity.ok(deliveryService.getDashboardData(token));
    }

    @GetMapping("/customer/pickups")
    public ResponseEntity<List<OrdersDTO>> getCustomerPickups(@RequestHeader("Authorization") String token) {
        return ResponseEntity.ok(deliveryService.getAllPickups(token));
    }

    @PutMapping("/customer/pickup/{orderId}")
    public ResponseEntity<Response> updateCustomerPickup(@PathVariable UUID orderId, @RequestParam("secret") Integer secretCode) {
        return ResponseEntity.ok(deliveryService.updateCustomerPickup(orderId, secretCode));
    }

    @GetMapping("/shop/deliveries")
    public ResponseEntity<List<OrdersDTO>> getShopDeliveries(@RequestHeader("Authorization") String token) {
        return ResponseEntity.ok(deliveryService.getShopDeliveries(token));
    }

    @PutMapping("/shop/delivery/{orderId}")
    public ResponseEntity<Response> updateShopDelivery(@PathVariable UUID orderId) {
        return ResponseEntity.ok(deliveryService.updateShopDelivery(orderId));
    }

    @GetMapping("/shop/pickups")
    public ResponseEntity<List<OrdersDTO>> getShopPickups(@RequestHeader("Authorization") String token) {
        return ResponseEntity.ok(deliveryService.getShopPickups(token));
    }

    @PutMapping("/shop/pickup/{orderId}")
    public ResponseEntity<Response> updateShopPickup(@PathVariable UUID orderId) {
        return ResponseEntity.ok(deliveryService.updateShopPickup(orderId));
    }

    @GetMapping("/customer/deliveries")
    public ResponseEntity<List<OrdersDTO>> getCustomerDeliveries(@RequestHeader("Authorization") String token) {
        return ResponseEntity.ok(deliveryService.getAllDeliveries(token));
    }

    @PutMapping("/customer/delivery/{orderId}")
    public ResponseEntity<Response> updateCustomerDelivery(@PathVariable UUID orderId, @RequestParam("secret") Integer secretCode) {
        return ResponseEntity.ok(deliveryService.updateCustomerDelivery(orderId, secretCode));
    }

    @PostMapping("/payOnline/{orderId}")
    public ResponseEntity<PaymentResponse> getPayOnlineLink(@PathVariable UUID orderId) {
        PaymentResponse response = deliveryService.getPayOnlineLink(orderId);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @PostMapping("/verify-payment")
    public ResponseEntity<Response> verifyPayment(@RequestBody Map<String, String> paymentData) {
        String paymentId = paymentData.get("payment_id");
        String orderId = paymentData.get("order_id");
        String signature = paymentData.get("signature");

        Response response = deliveryService.verifyPayment(paymentId, orderId, signature);
        return ResponseEntity.status(response.getStatus()).body(response);
    }
}
