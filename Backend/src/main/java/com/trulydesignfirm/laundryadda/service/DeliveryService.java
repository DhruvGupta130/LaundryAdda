package com.trulydesignfirm.laundryadda.service;

import com.trulydesignfirm.laundryadda.actions.OrdersDTO;
import com.trulydesignfirm.laundryadda.actions.PaymentResponse;
import com.trulydesignfirm.laundryadda.actions.Response;
import com.trulydesignfirm.laundryadda.model.Area;
import com.trulydesignfirm.laundryadda.model.Delivery;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public interface DeliveryService {
    Boolean validateProfile(String token);
    Delivery getDeliveryProfile(String token);
    Response updateDeliveryProfile(String token, Delivery delivery);
    List<Area> getAllDeliveryAreas(String token);
    Map<String, Integer> getDashboardData(String token);
    List<OrdersDTO> getAllPickups(String token);
    Response updateCustomerPickup(UUID orderId, int secretCode);
    List<OrdersDTO> getShopDeliveries(String token);
    Response updateShopDelivery(UUID orderId);
    List<OrdersDTO> getShopPickups(String token);
    Response updateShopPickup(UUID orderId);
    List<OrdersDTO> getAllDeliveries(String token);
    Response updateCustomerDelivery(UUID orderId, int secretCode);
    PaymentResponse getPayOnlineLink(UUID orderId);
    Response verifyPayment(String paymentId, String orderId, String signature);
}
