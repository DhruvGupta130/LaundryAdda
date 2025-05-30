package com.trulydesignfirm.laundryadda.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Getter
@Setter
public class Review {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    private Double overall = 1.0D;

    @Column(nullable = false)
    @Min(value = 1, message = "Minimum allowed rating is 1")
    @Max(value = 5, message = "Maximum allowed rating is 5")
    private Integer service;

    @Column(nullable = false)
    @Min(value = 1, message = "Minimum allowed rating is 1")
    @Max(value = 5, message = "Maximum allowed rating is 5")
    private Integer time;

    @Column(nullable = false)
    @Min(value = 1, message = "Minimum allowed rating is 1")
    @Max(value = 5, message = "Maximum allowed rating is 5")
    private Integer clothing;

    @Column(nullable = false)
    @Min(value = 1, message = "Minimum allowed rating is 1")
    @Max(value = 5, message = "Maximum allowed rating is 5")
    private Integer value;

    @Column(nullable = false, length = 1000)
    private String feedback;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    @ManyToOne
    @JoinColumn(nullable = false)
    private Customer customer;

    @ManyToOne
    @JsonIgnore
    @JoinColumn(nullable = false)
    private LaundryShop shop;

    @OneToOne
    @JsonIgnore
    @JoinColumn(nullable = false, unique = true)
    private Orders order;
}