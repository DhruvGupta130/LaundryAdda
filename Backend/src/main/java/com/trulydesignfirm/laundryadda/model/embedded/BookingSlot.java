package com.trulydesignfirm.laundryadda.model.embedded;

import com.trulydesignfirm.laundryadda.enums.TimeSlots;
import jakarta.persistence.Embeddable;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Embeddable
@Getter
@Setter
public class BookingSlot {
    private TimeSlots timeSlot;
    private LocalDate date;
}
