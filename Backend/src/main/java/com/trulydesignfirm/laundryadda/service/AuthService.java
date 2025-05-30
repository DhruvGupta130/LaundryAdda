package com.trulydesignfirm.laundryadda.service;

import com.trulydesignfirm.laundryadda.actions.LoginRequest;
import com.trulydesignfirm.laundryadda.actions.LoginResponse;
import com.trulydesignfirm.laundryadda.actions.Response;
import com.trulydesignfirm.laundryadda.model.LoginUser;
import org.springframework.stereotype.Service;

@Service
public interface AuthService {
    Response register(LoginUser user);
    void exitsUser(LoginUser user);
    LoginResponse loginService(LoginRequest request);
    Response sendForgotPasswordLink(String email);
    Boolean isTokenValid(String token, String email);
    Response verifyForgotPasswordOtp(String password, String email, String token);
}
