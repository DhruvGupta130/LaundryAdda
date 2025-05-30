package com.trulydesignfirm.laundryadda.actions;

import lombok.Builder;
import lombok.Getter;

@Builder
@Getter
public class LoginResponse {
    private String token;
    private String role;
    private String email;
    private String message;
}
