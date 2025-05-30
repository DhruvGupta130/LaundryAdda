package com.trulydesignfirm.laundryadda.model.embedded;

import jakarta.persistence.Embeddable;
import lombok.Getter;
import lombok.Setter;

@Embeddable
@Getter
@Setter
public class KycDetails {

    private String panCard;
    private String labourLicense;

    private String accountHolderName;
    private String accountNumber;
    private String ifscCode;
    private String bankName;
}
