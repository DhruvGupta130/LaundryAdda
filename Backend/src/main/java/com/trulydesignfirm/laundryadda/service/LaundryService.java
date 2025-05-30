package com.trulydesignfirm.laundryadda.service;

import com.trulydesignfirm.laundryadda.actions.LaundryRequest;
import com.trulydesignfirm.laundryadda.actions.OrdersDTO;
import com.trulydesignfirm.laundryadda.actions.Response;
import com.trulydesignfirm.laundryadda.enums.OrderStatus;
import com.trulydesignfirm.laundryadda.model.LaundryShop;
import com.trulydesignfirm.laundryadda.model.Orders;
import com.trulydesignfirm.laundryadda.model.Rating;
import com.trulydesignfirm.laundryadda.model.Review;
import com.trulydesignfirm.laundryadda.model.embedded.DeliveryAndPickup;
import com.trulydesignfirm.laundryadda.model.embedded.KycDetails;
import com.trulydesignfirm.laundryadda.model.embedded.OrderItems;
import com.trulydesignfirm.laundryadda.model.embedded.PricingItem;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public interface LaundryService {
    List<LaundryShop> getAllShops(double latitude, double longitude, double radius, String category);
    List<LaundryShop> getAllShops();
    LaundryShop getShopById(UUID id);
    LaundryShop getLaundryShopProfile(String name);
    Response createLaundry(String token, LaundryRequest request);
    KycDetails getKycDocuments(String token);
    Response updateKycDocuments(String token, KycDetails documents);
    List<PricingItem> getPricing(String token);
    List<PricingItem> getPricing(UUID shopId);
    Response updatePricing(String token, List<PricingItem> items);
    Response uploadPricing(String token, MultipartFile file);
    Response updateDeliveryPickup(String token, DeliveryAndPickup pickup);
    Integer checkLaundryShop(String token);
    Page<OrdersDTO> getAllOrders(String token, int pageNumber, int size, OrderStatus status, String query);
    List<OrdersDTO> getNewOrders(String token);
    Response acceptOrder(String token, UUID orderId);
    Response generateBill(String token, UUID orderId, List<OrderItems> items, String notes) throws IOException;
    Response startOrderProcessing(String token, UUID orderId);
    Response readyForDelivery(String token, UUID orderId);
    Response cancelOrder(String token, UUID orderId);
    Map<String,?> getDashboardDetails(String token, String period);
    void updateShopRating(Orders order, Review rating);
    Rating getShopRatings(UUID shopId);
    List<Review> getShopReviews(UUID shopId);
}
