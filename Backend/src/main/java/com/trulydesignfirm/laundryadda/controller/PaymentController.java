package com.trulydesignfirm.laundryadda.controller;

import com.trulydesignfirm.laundryadda.actions.Response;
import com.trulydesignfirm.laundryadda.service.PaymentService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;

@RestController
@AllArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/webhook")
    public ResponseEntity<Response> handleWebhook(
            @RequestBody String payload,
            @RequestHeader("X-Razorpay-Signature") String razorpaySignature) {
        Response response = paymentService.verifyWebhook(payload, razorpaySignature);
        return ResponseEntity.status(response.getStatus()).body(response);
    }


}
