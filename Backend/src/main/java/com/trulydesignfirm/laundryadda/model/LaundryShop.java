package com.trulydesignfirm.laundryadda.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.trulydesignfirm.laundryadda.enums.Services;
import com.trulydesignfirm.laundryadda.model.embedded.DeliveryAndPickup;
import com.trulydesignfirm.laundryadda.model.embedded.KycDetails;
import com.trulydesignfirm.laundryadda.model.embedded.PricingItem;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Entity
@Getter
@Setter
public class LaundryShop {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    @Pattern(regexp = "^(http|https)://.*$", message = "Invalid logo image Url")
    private String logo;

    @Column(nullable = false)
    @Pattern(regexp = "^(http|https)://.*$", message = "Invalid cover image Url")
    private String coverPhoto;

    @ElementCollection
    private List<String> images = new ArrayList<>();

    @Column(length = 10, nullable = false)
    @Pattern(regexp = "^[6-9]\\d{9}$", message = "Invalid mobile number")
    private String mobile;

    @Email(message = "Invalid email address")
    @Column(nullable = false)
    private String email;

    @Column(nullable = false)
    private String managerName;

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(nullable = false)
    private Address address;

    @JsonIgnore
    @Embedded
    private KycDetails details;

    @JsonIgnore
    @ElementCollection
    private List<PricingItem> prices = new ArrayList<>();

    @Embedded
    private DeliveryAndPickup deliveryAndPickup;

    @JsonIgnore
    @OneToMany(mappedBy = "shop", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Orders> orders = new ArrayList<>();

    @OneToMany(mappedBy = "shop", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Review> reviews = new ArrayList<>();

    @OneToOne(mappedBy = "shop", cascade = CascadeType.ALL, orphanRemoval = true)
    private Rating rating;

    @JsonIgnore
    @OneToOne(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(nullable = false)
    private LoginUser owner;

    public Set<Services> getServices() {
        return prices.stream().map(PricingItem::getService)
                .collect(Collectors.toSet());
    }
}

