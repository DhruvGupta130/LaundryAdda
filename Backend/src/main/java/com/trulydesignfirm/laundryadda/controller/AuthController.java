package com.trulydesignfirm.laundryadda.controller;

import com.trulydesignfirm.laundryadda.actions.LoginRequest;
import com.trulydesignfirm.laundryadda.actions.LoginResponse;
import com.trulydesignfirm.laundryadda.actions.Response;
import com.trulydesignfirm.laundryadda.model.LoginUser;
import com.trulydesignfirm.laundryadda.service.AuthService;
import com.trulydesignfirm.laundryadda.service.utils.OtpService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final OtpService otpService;

    @Value("${laundry.company.name}")
    private String companyName;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody @Valid LoginRequest loginRequest) {
        return ResponseEntity.ok(authService.loginService(loginRequest));
    }

    @PostMapping("/get-otp")
    public ResponseEntity<Response> generateOtp(@RequestBody @Valid LoginUser user) {
        authService.exitsUser(user);
        otpService.generateAndSendOtp(user.getEmail(), "OTP to register in %s".formatted(companyName));
        Response response = Response.builder()
                .message("OTP successfully sent to email. Please verify OTP to complete registration.")
                .status(HttpStatus.OK)
                .build();
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @PostMapping("/register")
    public ResponseEntity<Response> register(
           @Valid @RequestBody LoginUser user,
            @RequestParam String otp) {
        if (otp == null || otp.isEmpty()) {
            throw new BadCredentialsException("Email OTP cannot be empty.");
        }
        boolean isEmailOtpValid = otpService.validateOtp(user.getEmail(), otp);
        if(!isEmailOtpValid){
            throw new BadCredentialsException("Email OTP is not valid");
        }
        Response response = authService.register(user);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Response> resetPassword(@RequestParam String email) {
        Response response = authService.sendForgotPasswordLink(email);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @PostMapping("/verify-token")
    public ResponseEntity<Boolean> verifyToken(@RequestParam String token, @RequestParam String email) {
        return ResponseEntity.ok().body(authService.isTokenValid(token, email));
    }

    @PutMapping("/reset-password")
    public ResponseEntity<Response> updatePassword(@RequestParam String password,
                                                   @RequestParam String email,
                                                   @RequestParam String token) {
        Response response = authService.verifyForgotPasswordOtp(password, email, token);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

}