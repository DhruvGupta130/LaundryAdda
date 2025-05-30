package com.trulydesignfirm.laundryadda.service;

import com.trulydesignfirm.laundryadda.actions.OrdersDTO;
import com.trulydesignfirm.laundryadda.actions.PaymentResponse;
import com.trulydesignfirm.laundryadda.actions.PickupRequest;
import com.trulydesignfirm.laundryadda.actions.Response;
import com.trulydesignfirm.laundryadda.model.Customer;
import com.trulydesignfirm.laundryadda.model.Address;
import com.trulydesignfirm.laundryadda.model.Invoice;
import com.trulydesignfirm.laundryadda.model.Review;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public interface CustomerService {
    Boolean validateProfile(String token);
    Customer getProfile(String token);
    Response updateProfile(String token, Customer customer);
    List<Address> getAllAddresses(String token);
    Response addAddress(String token, Address address);
    Response removeAddress(String token, long addressId);
    Page<OrdersDTO> getAllOrders(String token, int pageNumber, int size);
    Response requestPickup(String token, PickupRequest request);
    Review getOrderReview(String token, UUID orderId);
    Integer getSecretCode(String token, UUID orderId);
    Invoice getOrderInvoice(String token, UUID orderId);
    Response cancelPickup(String token, UUID orderId);
    PaymentResponse getPayOnlineLink(String token, UUID orderId);
    Response updateOrderReview(String token, UUID orderId, Review review);
    Response verifyPayment(String paymentId, String orderId, String signature);
}
