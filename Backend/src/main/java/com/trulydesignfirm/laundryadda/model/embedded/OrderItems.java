package com.trulydesignfirm.laundryadda.model.embedded;

import jakarta.persistence.Embeddable;
import lombok.Getter;
import lombok.Setter;

@Embeddable
@Getter
@Setter
public class OrderItems {

    private short quantity;
    private PricingItem requests;

}
