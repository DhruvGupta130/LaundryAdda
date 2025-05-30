package com.trulydesignfirm.laundryadda.controller;

import com.trulydesignfirm.laundryadda.actions.LaundryRequest;
import com.trulydesignfirm.laundryadda.actions.OrdersDTO;
import com.trulydesignfirm.laundryadda.actions.Response;
import com.trulydesignfirm.laundryadda.enums.OrderStatus;
import com.trulydesignfirm.laundryadda.model.LaundryShop;
import com.trulydesignfirm.laundryadda.model.embedded.DeliveryAndPickup;
import com.trulydesignfirm.laundryadda.model.embedded.KycDetails;
import com.trulydesignfirm.laundryadda.model.embedded.OrderItems;
import com.trulydesignfirm.laundryadda.model.embedded.PricingItem;
import com.trulydesignfirm.laundryadda.service.LaundryService;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@AllArgsConstructor
@RequestMapping("/api/laundry")
public class LaundryController {

    private final LaundryService laundryService;

    @GetMapping("/get")
    public ResponseEntity<LaundryShop> getLaundryShops(@RequestHeader("Authorization") String token) {
        return ResponseEntity.ok(laundryService.getLaundryShopProfile(token));
    }

    @PostMapping("/create")
    public ResponseEntity<Response> createLaundryShop(@RequestHeader("Authorization") String token, @RequestBody LaundryRequest request) {
        Response response = laundryService.createLaundry(token, request);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @GetMapping("/kyc")
    public ResponseEntity<KycDetails> getKycDocuments(@RequestHeader("Authorization") String token) {
        return ResponseEntity.ok(laundryService.getKycDocuments(token));
    }

    @PutMapping("/kyc")
    public ResponseEntity<Response> updateKycDocuments(@RequestHeader("Authorization") String token, @RequestBody KycDetails documents) {
        Response response = laundryService.updateKycDocuments(token, documents);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @GetMapping("/pricing")
    public ResponseEntity<List<PricingItem>> getPricing(@RequestHeader("Authorization") String token) {
        return ResponseEntity.ok(laundryService.getPricing(token));
    }

    @PutMapping("/pricing")
    public ResponseEntity<Response> updatePricing(@RequestHeader("Authorization") String token, @RequestBody List<PricingItem> items) {
        Response response = laundryService.updatePricing(token, items);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @PutMapping("/pricing/upload")
    public ResponseEntity<Response> uploadPricing(@RequestHeader("Authorization") String token, @RequestParam("file") MultipartFile file) {
        Response response = laundryService.uploadPricing(token, file);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @PutMapping("/delivery-pickup")
    public ResponseEntity<Response> updateDeliveryPickup(@RequestHeader("Authorization") String token, @RequestBody DeliveryAndPickup pickup) {
        Response response = laundryService.updateDeliveryPickup(token, pickup);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @GetMapping("/validate")
    public ResponseEntity<Integer> validateLaundry(@RequestHeader("Authorization") String token) {
        return ResponseEntity.ok(laundryService.checkLaundryShop(token));
    }

    @GetMapping("/orders")
    public ResponseEntity<Page<OrdersDTO>> getOrders(@RequestHeader("Authorization") String token, @RequestParam int pageNumber, @RequestParam int size, @RequestParam(required = false) OrderStatus status, @RequestParam(required = false) String query) {
        return ResponseEntity.ok(laundryService.getAllOrders(token, pageNumber, size, status, query));
    }

    @GetMapping("/orders/new")
    public ResponseEntity<List<OrdersDTO>> getPickups(@RequestHeader("Authorization") String token) {
        return ResponseEntity.ok(laundryService.getNewOrders(token));
    }

    @PutMapping("/order/accept/{orderId}")
    public ResponseEntity<Response> acceptOrder(@RequestHeader("Authorization") String token, @PathVariable UUID orderId) {
        Response response = laundryService.acceptOrder(token, orderId);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @PutMapping("/order/bill/{orderId}")
    public ResponseEntity<Response> generateBill(@RequestHeader("Authorization") String token, @PathVariable UUID orderId, @RequestBody List<OrderItems> items, @RequestParam(required = false) String notes) throws IOException {
        Response response = laundryService.generateBill(token, orderId, items, notes);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @PutMapping("/order/process/{orderId}")
    public ResponseEntity<Response> processOrder(@RequestHeader("Authorization") String token, @PathVariable UUID orderId) {
        Response response = laundryService.startOrderProcessing(token, orderId);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @PutMapping("/order/ready/{orderId}")
    public ResponseEntity<Response> readyForDelivery(@RequestHeader("Authorization") String token, @PathVariable UUID orderId) {
        Response response = laundryService.readyForDelivery(token, orderId);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @DeleteMapping("/order/cancel/{orderId}")
    public ResponseEntity<Response> cancelOrder(@RequestHeader("Authorization") String token, @PathVariable UUID orderId) {
        Response response = laundryService.cancelOrder(token, orderId);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, ?>> getDashboard(
            @RequestHeader("Authorization") String token,
            @RequestParam(value = "period", defaultValue = "overall") String period) {
        Map<String, ?> dashboardData = laundryService.getDashboardDetails(token, period);
        return ResponseEntity.ok(dashboardData);
    }

}
