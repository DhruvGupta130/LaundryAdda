package com.trulydesignfirm.laundryadda.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.trulydesignfirm.laundryadda.enums.PaymentStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Getter
@Setter
public class PaymentDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    private String razorPayId;
    private BigDecimal amount;
    private String receipt;

    @Enumerated(EnumType.STRING)
    private PaymentStatus paymentStatus;

    private String paymentId;
    private String refundId;

    @JsonIgnore
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(nullable = false, unique = true)
    private Orders order;
}
