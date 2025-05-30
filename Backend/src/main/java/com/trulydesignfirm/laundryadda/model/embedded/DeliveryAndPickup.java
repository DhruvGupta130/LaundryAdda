package com.trulydesignfirm.laundryadda.model.embedded;

import com.trulydesignfirm.laundryadda.enums.TimeSlots;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Embeddable;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Embeddable
@Setter
@Getter
public class DeliveryAndPickup {
    private Boolean express;
    private Boolean semiExpress;
    private Short serviceRadius;

    @ElementCollection
    @Enumerated(EnumType.STRING)
    private List<TimeSlots> pickupSlots = new ArrayList<>();

}
