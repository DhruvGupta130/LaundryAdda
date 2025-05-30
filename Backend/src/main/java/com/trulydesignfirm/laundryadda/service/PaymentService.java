package com.trulydesignfirm.laundryadda.service;

import com.razorpay.RazorpayException;
import com.trulydesignfirm.laundryadda.actions.Response;
import com.trulydesignfirm.laundryadda.model.Orders;
import org.springframework.stereotype.Service;

@Service
public interface PaymentService{

    String createOrder(Orders order) throws RazorpayException;
    String cancelOrder(String paymentId) throws RazorpayException;

    Response verifyWebhook(String payload, String razorpaySignature);
    Response verifyPayment(String paymentId, String orderId, String signature);
//    String processPayout(String name, String email, String phone, String accountNumber, String ifsc, String bankName, double amount) throws RazorpayException;
}
