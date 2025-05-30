package com.trulydesignfirm.laundryadda.service.impl;

import com.trulydesignfirm.laundryadda.actions.LoginRequest;
import com.trulydesignfirm.laundryadda.actions.LoginResponse;
import com.trulydesignfirm.laundryadda.actions.Response;
import com.trulydesignfirm.laundryadda.configuration.JwtUtils;
import com.trulydesignfirm.laundryadda.enums.Role;
import com.trulydesignfirm.laundryadda.model.LoginUser;
import com.trulydesignfirm.laundryadda.repository.UserRepo;
import com.trulydesignfirm.laundryadda.service.AuthService;
import com.trulydesignfirm.laundryadda.service.utils.OtpService;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@AllArgsConstructor
@Service
public class AuthServiceImpl implements AuthService {

    private final PasswordEncoder passwordEncoder;
    private final UserRepo userRepo;
    private final AuthenticationManager authenticationManager;
    private final UserDetailsService customUserDetailsService;
    private final JwtUtils jwtUtils;
    private final OtpService otpService;

    @Override
    @Transactional
    public Response register(LoginUser user) {
        if (userRepo.existsByEmail(user.getEmail())) {
            throw new IllegalArgumentException("Email already exists");
        }
        user.setRole(user.getRole() == null ? Role.LAUNDRY : user.getRole());
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        userRepo.save(user);
        return Response.builder()
                .message("User registered successfully")
                .status(HttpStatus.CREATED)
                .build();
    }

    @Override
    public void exitsUser(LoginUser user) {
        if (userRepo.existsByEmail(user.getEmail())) {
            throw new IllegalArgumentException("Email already exists");
        }
    }

    @Override
    public LoginResponse loginService(LoginRequest request) {
        LoginUser user = userRepo.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadCredentialsException("Bad credentials"));
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(user.getEmail(), request.getPassword())
        );
        UserDetails userDetails = customUserDetailsService.loadUserByUsername(user.getEmail());
        String token = jwtUtils.generateToken(userDetails);
        return LoginResponse.builder()
                .message("Successfully logged in")
                .role(user.getRole().name())
                .email(user.getEmail())
                .token(token)
                .build();
    }

    @Override
    public Response sendForgotPasswordLink(String email) {
        if ((email == null || email.isEmpty())) {
            throw new IllegalArgumentException("Please provide at least one of email or mobile.");
        }
        verifyEmail(email);
        otpService.sendPasswordResetLink(email, "Reset Password");
        return Response.builder()
                .message("Email sent successfully.")
                .status(HttpStatus.OK)
                .build();
    }

    @Override
    public Boolean isTokenValid(String token, String email) {
        if ((email == null || email.isEmpty())) {
            throw new IllegalArgumentException("Please provide email.");
        }
        return token != null && !token.isEmpty() && otpService.isTokenValid(email, token);
    }

    @Override
    public Response verifyForgotPasswordOtp(String password, String email, String emailOtp) {
        if ((email == null || email.isEmpty())) {
            throw new IllegalArgumentException("Please provide email.");
        }
        boolean isEmailOtpValid = emailOtp != null && !emailOtp.isEmpty() && otpService.validateOtp(email, emailOtp);
        LoginUser user = null;
        if (isEmailOtpValid) {
            user = userRepo.findByEmail(email).orElse(null);
        }
        if (user == null) {
            throw new IllegalArgumentException("User not found.");
        }
        user.setPassword(passwordEncoder.encode(password));
        userRepo.save(user);
        return Response.builder()
                .message("Password updated successfully.")
                .status(HttpStatus.OK)
                .build();
    }

    private void verifyEmail(String email){
        userRepo.findByEmail(email).orElseThrow(() -> new RuntimeException("No user found with provided email address!"));
    }

}