package com.trulydesignfirm.laundryadda.dto;

import com.trulydesignfirm.laundryadda.model.Address;
import lombok.Data;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Data
public class OrderDto {

    private UUID orderId;
    private String status;
    private Instant pickupTime;
    private Instant deliveryTime;
    private Address address;
    private String specialInstructions;
    private BigDecimal totalAmount;
    private String paymentStatus;
}
