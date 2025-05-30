package com.trulydesignfirm.laundryadda.actions;

import com.trulydesignfirm.laundryadda.enums.OrderType;
import com.trulydesignfirm.laundryadda.model.embedded.BookingSlot;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
public class PickupRequest {
    @NotNull private Long addressId;
    @NotNull private UUID shopId;
    @NotNull private BookingSlot pickupSlot;
    private OrderType orderType = OrderType.STANDARD;
    private String instructions;
}
