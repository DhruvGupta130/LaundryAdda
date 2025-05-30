package com.trulydesignfirm.laundryadda.service.utils;

import com.trulydesignfirm.laundryadda.dto.OtpData;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.util.Base64;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;

@Service
@AllArgsConstructor
public class OtpService {

    private static final long OTP_EXPIRATION_MINUTES = 10;
    private final Map<String, OtpData> otpStorage = new ConcurrentHashMap<>();
    private final SecureRandom random = new SecureRandom();
    private final EmailService emailService;
    private final EmailStructures emailStructures;


    public void generateAndSendOtp(String key, String subject) {
        String otp = String.format("%06d", random.nextInt(1_000_000));
        long expiryTime = System.currentTimeMillis() + TimeUnit.MINUTES.toMillis(OTP_EXPIRATION_MINUTES);
        OtpData otpData = new OtpData(otp, expiryTime);
        otpStorage.put(key, otpData);
        emailService.sendEmail(key, subject, emailStructures.generateOtpEmail(otp, OTP_EXPIRATION_MINUTES));
    }

    public boolean validateOtp(String key, String otp) {
        OtpData otpData = otpStorage.get(key);
        if (otpData == null || isExpired(otpData.expiryTime())) {
            otpStorage.remove(key);
            return false;
        }
        boolean isValid = otpData.otp().equals(otp);
        if (isValid) {
            otpStorage.remove(key);
        }
        return isValid;
    }

    public boolean isTokenValid(String key, String token) {
        OtpData otpData = otpStorage.get(key);
        if (otpData == null || isExpired(otpData.expiryTime())) {
            otpStorage.remove(token);
            return false;
        }
        return otpData.otp().equals(token);
    }

    public void sendPasswordResetLink(String key, String subject) {
        String resetToken = generateSecureToken();
        long expiryTime = System.currentTimeMillis() + TimeUnit.MINUTES.toMillis(OTP_EXPIRATION_MINUTES);
        OtpData otpData = new OtpData(resetToken, expiryTime);
        otpStorage.put(key, otpData);
        emailService.sendEmail(key, subject, emailStructures.resetPassword(resetToken, OTP_EXPIRATION_MINUTES, key));
    }

    private String generateSecureToken() {
        SecureRandom secureRandom = new SecureRandom();
        byte[] tokenBytes = new byte[128];
        secureRandom.nextBytes(tokenBytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(tokenBytes);
    }

    private boolean isExpired(long expiryTimestamp) {
        return System.currentTimeMillis() > expiryTimestamp;
    }
}