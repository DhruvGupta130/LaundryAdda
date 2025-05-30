package com.trulydesignfirm.laundryadda.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMax;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Entity
@Getter
@Setter
public class Rating {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @DecimalMax(value = "5.0", message = "Maximum allowed rating is 5")
    private Double overall = 0.0D;

    @DecimalMax(value = "5.0", message = "Maximum allowed rating is 5")
    private Double service = 0.0D;

    @DecimalMax(value = "5.0", message = "Maximum allowed rating is 5")
    private Double time = 0.0D;

    @DecimalMax(value = "5.0", message = "Maximum allowed rating is 5")
    private Double clothing = 0.0D;

    @DecimalMax(value = "5.0", message = "Maximum allowed rating is 5")
    private Double value = 0.0D;

    @Column(nullable = false)
    private Integer reviewCount = 0;

    @OneToOne
    @JsonIgnore
    @JoinColumn(nullable = false, unique = true)
    private LaundryShop shop;
}
