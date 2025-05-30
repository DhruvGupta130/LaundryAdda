package com.trulydesignfirm.laundryadda.model;

import com.trulydesignfirm.laundryadda.enums.AddressType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
public class Address {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String street;

    @Column(nullable = false)
    private String state;

    @Column(nullable = false)
    private String zip;

    private String landmark;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AddressType addressType = AddressType.OTHER;

    @ManyToOne(optional = false)
    @JoinColumn(nullable = false)
    private Area area;


    @Column(nullable = false)
    private double latitude;

    @Column(nullable = false)
    private double longitude;
}