package com.trulydesignfirm.laundryadda.exception;

import com.trulydesignfirm.laundryadda.actions.Response;
import jakarta.validation.ConstraintViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.transaction.TransactionSystemException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.io.IOException;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Response> handleRuntimeException(RuntimeException ex) {
        return getErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR, ex.getMessage());
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<Response> handleBadCredentialsException(BadCredentialsException ex) {
        return getErrorResponse(HttpStatus.UNAUTHORIZED, ex.getMessage());
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Response> handleIllegalArgumentException(IllegalArgumentException ex) {
        return getErrorResponse(HttpStatus.BAD_REQUEST, ex.getMessage());
    }

    @ExceptionHandler(IOException.class)
    public ResponseEntity<Response> handleIOException(IOException ex) {
        return getErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR, ex.getMessage());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Response> handleValidationExceptions(MethodArgumentNotValidException ex) {
        String errorMessages = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(FieldError::getDefaultMessage)
                .collect(Collectors.joining(", "));
        Response errorResponse = Response.builder()
                .status(HttpStatus.BAD_REQUEST)
                .message(errorMessages)
                .build();
        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(TransactionSystemException.class)
    public ResponseEntity<Response> handleTransactionSystemException(TransactionSystemException ex) {
        Throwable rootCause = ex.getRootCause();
        if (rootCause instanceof ConstraintViolationException constraintViolationException) {
            return handleConstraintViolationException(constraintViolationException);
        }
        return getErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR, "Transaction failed: " + ex.getMessage());
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<Response> handleConstraintViolationException(ConstraintViolationException ex) {
        String errorMessages = ex.getConstraintViolations()
                .stream()
                .map(cv -> cv.getPropertyPath() + ": " + cv.getMessage())
                .collect(Collectors.joining(", "));
        Response errorResponse = Response.builder()
                .status(HttpStatus.BAD_REQUEST)
                .message(errorMessages)
                .build();
        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }

    private ResponseEntity<Response> getErrorResponse(HttpStatus status, String message) {
        Response errorResponse = Response.builder()
                .message(message)
                .status(status)
                .build();
        return new ResponseEntity<>(errorResponse, status);
    }
}