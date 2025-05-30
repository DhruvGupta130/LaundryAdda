package com.trulydesignfirm.laundryadda.model.embedded;

import com.trulydesignfirm.laundryadda.enums.Services;
import com.trulydesignfirm.laundryadda.enums.ClothType;
import jakarta.persistence.Embeddable;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@Embeddable
public class PricingItem {
    @Enumerated(EnumType.STRING)
    private Services service;

    @Enumerated(EnumType.STRING)
    private ClothType clothType;

    private String cloth;
    private BigDecimal price;
}
