package com.trulydesignfirm.laundryadda.actions;

import com.trulydesignfirm.laundryadda.model.Address;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class LaundryRequest {
    private String name;
    private String description;
    private String logo;
    private String coverPhoto;
    private List<String> images;
    private String mobile;
    private String email;
    private String managerName;
    private Address address;
}
