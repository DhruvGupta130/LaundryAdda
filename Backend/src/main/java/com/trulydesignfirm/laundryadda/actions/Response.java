package com.trulydesignfirm.laundryadda.actions;

import lombok.Builder;
import lombok.Getter;
import org.springframework.http.HttpStatus;

@Builder
@Getter
public class Response {
    private String message;
    private HttpStatus status;
}
