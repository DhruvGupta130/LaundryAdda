package com.trulydesignfirm.laundryadda.service.impl;

import okhttp3.*;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;

@Service
public class RazorpayPayoutService {

    @Value("${razorpay.key_id}")
    private String keyId;

    @Value("${razorpay.key_secret}")
    private String keySecret;

    private static final String BASE_URL = "https://api.razorpay.com/v1/payouts";

    public void payout() throws IOException {
        OkHttpClient client = new OkHttpClient();

        JSONObject payoutRequest = createPayoutRequest();

        RequestBody body = RequestBody.create(
                MediaType.parse("application/json"),
                payoutRequest.toString()
                );

        String credentials = Credentials.basic(keyId, keySecret);

        Request request = new Request.Builder()
                .url(BASE_URL)
                .post(body)
                .header("Authorization", credentials)
                .header("Content-Type", "application/json")
                .build();

        try (Response response = client.newCall(request).execute()) {
            if (!response.isSuccessful()) {
                System.err.println("Request failed: " + response.code() + " - " + response.message());
                System.err.println(response.body());
            } else {
                System.out.println("✅ Payout successful:\n" + response.body());
            }
        }
    }

    private JSONObject createPayoutRequest() {
        JSONObject payoutRequest = new JSONObject();
        payoutRequest.put("account_number", "2323232323"); // Your virtual account number from RazorpayX dashboard
        payoutRequest.put("fund_account_id", "fa_XXXXXXXXXXXX"); // Replace it with an actual fund account ID
        payoutRequest.put("amount", 50000); // In paise — ₹500.00
        payoutRequest.put("currency", "INR");
        payoutRequest.put("mode", "IMPS"); // IMPS, NEFT, RTGS, UPI
        payoutRequest.put("purpose", "payout");
        payoutRequest.put("queue_if_low_balance", true);
        payoutRequest.put("reference_id", "txn_" + System.currentTimeMillis());
        payoutRequest.put("narration", "Laundry Adda payout");
        return payoutRequest;
    }
}