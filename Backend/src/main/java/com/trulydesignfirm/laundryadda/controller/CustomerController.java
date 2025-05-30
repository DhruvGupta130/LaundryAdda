package com.trulydesignfirm.laundryadda.controller;

import com.trulydesignfirm.laundryadda.actions.OrdersDTO;
import com.trulydesignfirm.laundryadda.actions.PaymentResponse;
import com.trulydesignfirm.laundryadda.actions.PickupRequest;
import com.trulydesignfirm.laundryadda.actions.Response;
import com.trulydesignfirm.laundryadda.model.Customer;
import com.trulydesignfirm.laundryadda.model.Address;
import com.trulydesignfirm.laundryadda.model.Invoice;
import com.trulydesignfirm.laundryadda.model.Review;
import com.trulydesignfirm.laundryadda.service.CustomerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/customer")
public class CustomerController {

    private final CustomerService customerService;

    @GetMapping("/validate")
    public ResponseEntity<Boolean> validateCustomer(@RequestHeader("Authorization") String token) {
        return ResponseEntity.ok(customerService.validateProfile(token));
    }

    @GetMapping("/profile")
    public ResponseEntity<Customer> getProfile(@RequestHeader("Authorization") String token) {
        return ResponseEntity.ok(customerService.getProfile(token));
    }

    @PutMapping("/profile")
    public ResponseEntity<Response> updateProfile(@RequestHeader("Authorization") String token, @RequestBody @Valid Customer customer) {
        Response response = customerService.updateProfile(token, customer);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @GetMapping("/addresses")
    public ResponseEntity<List<Address>> getAllAddresses(@RequestHeader("Authorization") String token) {
        return ResponseEntity.ok(customerService.getAllAddresses(token));
    }

    @PostMapping("/address/add")
    public ResponseEntity<Response> addAddress(@RequestHeader("Authorization") String token, @RequestBody @Valid Address address) {
        Response response = customerService.addAddress(token, address);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @DeleteMapping("/address/remove/{addressId}")
    public ResponseEntity<Response> removeAddress(@RequestHeader("Authorization") String token, @PathVariable long addressId) {
        Response response = customerService.removeAddress(token, addressId);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @GetMapping("/orders")
    public ResponseEntity<Page<OrdersDTO>> getAllOrders(@RequestHeader("Authorization") String token, @RequestParam int pageNumber, @RequestParam int size) {
        return ResponseEntity.ok(customerService.getAllOrders(token, pageNumber, size));
    }

    @PostMapping("/pickup")
    public ResponseEntity<Response> requestPickup(@RequestHeader("Authorization") String token, @RequestBody @Valid PickupRequest request) {
        Response response = customerService.requestPickup(token, request);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @GetMapping("/order/secret/{orderId}")
    public ResponseEntity<Integer> getSecretCode(@RequestHeader("Authorization") String token, @PathVariable UUID orderId) {
        return ResponseEntity.ok(customerService.getSecretCode(token, orderId));
    }

    @GetMapping("/order/invoice/{orderId}")
    public ResponseEntity<Invoice> getInvoice(@RequestHeader("Authorization") String token, @PathVariable UUID orderId) {
        return ResponseEntity.ok(customerService.getOrderInvoice(token, orderId));
    }

    @DeleteMapping("/pickup/{orderId}")
    public ResponseEntity<Response> cancelPickup(@RequestHeader("Authorization") String token, @PathVariable UUID orderId) {
        Response response = customerService.cancelPickup(token, orderId);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @PostMapping("/payOnline/{orderId}")
    public ResponseEntity<PaymentResponse> getPayOnlineLink(@RequestHeader("Authorization") String token, @PathVariable UUID orderId) {
        PaymentResponse response = customerService.getPayOnlineLink(token, orderId);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @GetMapping("/review/{orderId}")
    public ResponseEntity<Review> reviewOrder(@RequestHeader("Authorization") String token, @PathVariable UUID orderId) {
        return ResponseEntity.ok(customerService.getOrderReview(token, orderId));
    }

    @PutMapping("/review/{orderId}")
    public ResponseEntity<Response> reviewOrder(@RequestHeader("Authorization") String token, @PathVariable UUID orderId, @RequestBody @Valid Review review) {
        Response response = customerService.updateOrderReview(token, orderId, review);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @PostMapping("/verify-payment")
    public ResponseEntity<Response> verifyPayment(@RequestBody Map<String, String> paymentData) {
        String paymentId = paymentData.get("payment_id");
        String orderId = paymentData.get("order_id");
        String signature = paymentData.get("signature");

        Response response = customerService.verifyPayment(paymentId, orderId, signature);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

}
