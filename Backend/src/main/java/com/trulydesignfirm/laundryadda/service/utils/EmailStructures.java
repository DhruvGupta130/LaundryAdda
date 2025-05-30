package com.trulydesignfirm.laundryadda.service.utils;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class EmailStructures {

    @Value("${laundry.support.email}")
    private String supportEmail;

    @Value("${laundry.support.phone}")
    private String supportPhone;

    @Value("${laundry.website.url}")
    private String websiteUrl;

    @Value("${laundry.company.name}")
    private String companyName;

    public String generateOtpEmail(String otp, long validTime) {
        return """
            <html>
               <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                   <div style="max-width: 500px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; background-color: #f9f9f9; text-align: center;">
                       <h2 style="color: #007bff;">🔐 OTP Verification</h2>
        
                       <p>Dear User,</p>
                       <p>Your <b>One-Time Password (OTP)</b> for <b>%s</b> is:</p>
        
                       <p style="font-size: 22px; font-weight: bold; color: #d9534f; background-color: #f8d7da; display: inline-block; padding: 10px 20px; border-radius: 5px;">%s</p>
        
                       <p>This OTP is valid for <b>%d minutes</b>.</p>
                       <p style="color: red; font-weight: bold;">⚠ Do not share this OTP with anyone for security reasons.</p>
        
                       <p>If you did not request this OTP, please ignore this email or contact our support team immediately.</p>
        
                       <hr>
        
                       <p style="text-align: center; font-size: 14px; color: #555;">
                           <b>The %s Team</b> <br>
                           📧 Email: <a href="mailto:%s" style="color: #007bff;">%s</a> <br>
                           📞 Phone: %s <br>
                           🌐 Website: <a href="%s" style="color: #007bff;">%s</a>
                       </p>
                   </div>
               </body>
           </html>
        """.formatted(companyName, otp, validTime, companyName, supportEmail, supportEmail, supportPhone, websiteUrl, websiteUrl);
    }

    public String resetPassword(String token, long expiryTime, String email) {
        return """
        <html>
        <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 30px; color: #333;">
            <div style="max-width: 550px; margin: auto; background: #ffffff; border: 1px solid #ddd; padding: 30px; border-radius: 10px; box-shadow: 0 2px 6px rgba(0,0,0,0.05); text-align: center;">
        
                <h2 style="color: #007bff;">🔑 Reset Your Password</h2>
       
                <p>Hello,</p>
                <p>We received a request to reset the password for your account.</p>
        
                <p style="font-size: 18px; font-weight: bold; color: #5bc0de;">Click the button below to reset your password:</p>
        
                <a href="%s/reset-password?token=%s&email=%s" style="display: inline-block; padding: 12px 30px; background-color: #28a745; color: white; font-size: 16px; text-decoration: none; border-radius: 5px; margin-top: 15px;">Reset Password</a>
        
                <p style="margin-top: 20px;">This link will expire in <b>%d minutes</b>.</p>
        
                <p style="color: red; font-weight: bold; margin-top: 10px;">⚠ If you did not request this, please ignore this email.</p>
        
                <p style="margin-top: 25px;">Or copy and paste this link into your browser:</p>
        
                <p style="word-break: break-all; font-size: 12px; font-weight: bold; color: #555;">
                    %s/reset-password?token=%s&email=%s
                </p>
       
                <hr style="margin: 30px 0;">
        
                <p style="text-align: center; font-size: 14px; color: #555;">
                    <b>The %s Team</b><br>
                    📧 Email: <a href="mailto:%s" style="color: #007bff;">%s</a><br>
                    📞 Phone: %s<br>
                    🌐 Website: <a href="%s" style="color: #007bff;">%s</a>
                </p>
            </div>
        </body>
        </html>
        """.formatted(
                websiteUrl, token, email,
                expiryTime,
                websiteUrl, token, email,
                companyName, supportEmail, supportEmail, supportPhone, websiteUrl, websiteUrl
        );
    }
}