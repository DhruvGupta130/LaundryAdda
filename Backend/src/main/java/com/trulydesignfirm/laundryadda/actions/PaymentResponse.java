package com.trulydesignfirm.laundryadda.actions;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import org.springframework.http.HttpStatus;

import java.util.Map;

@Getter
@Builder
public class PaymentResponse {
    private String message;
    private HttpStatus status;
    private Map<?,?> data;
}