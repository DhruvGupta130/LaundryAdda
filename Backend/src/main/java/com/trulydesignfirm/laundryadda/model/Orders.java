package com.trulydesignfirm.laundryadda.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.trulydesignfirm.laundryadda.enums.OrderStatus;
import com.trulydesignfirm.laundryadda.enums.OrderType;
import com.trulydesignfirm.laundryadda.model.embedded.BookingSlot;
import com.trulydesignfirm.laundryadda.model.embedded.OrderItems;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Getter
@Setter
public class Orders {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ElementCollection
    private List<OrderItems> items;

    @Column(length = 250)
    private String notes;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private OrderStatus status = OrderStatus.PENDING_OWNER_CONFIRMATION;

    @Column(nullable = false)
    private BigDecimal totalAmount = BigDecimal.ZERO;

    @ManyToOne
    @JoinColumn(nullable = false)
    private Address address;

    @Embedded
    @AttributeOverrides({
            @AttributeOverride(name = "timeSlot", column = @Column(name = "pickup_time_slot")),
            @AttributeOverride(name = "date", column = @Column(name = "pickup_date"))
    })
    private BookingSlot pickupSlot;

    private LocalDate deliveryDate;

    private String instructions;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    @OneToOne(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private Invoice invoice;

    @ManyToOne
    @JoinColumn(nullable = false)
    private Customer customer;

    @ManyToOne
    @JoinColumn(nullable = false)
    private LaundryShop shop;

    @OneToOne(mappedBy = "order", cascade = CascadeType.ALL)
    private PaymentDetails paymentDetails;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private OrderType orderType = OrderType.STANDARD;

    private Integer secretCode;

    @JsonIgnore
    @OneToOne(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private Review review;

    @PrePersist
    @PreUpdate
    public void calculateTotalAmount() {
        if (items != null) {
            this.totalAmount = items.stream()
                    .map(item -> item.getRequests().getPrice()
                            .multiply(BigDecimal.valueOf(item.getQuantity())))
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
        }
    }
}
