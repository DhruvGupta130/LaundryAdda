package com.trulydesignfirm.laundryadda.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.trulydesignfirm.laundryadda.enums.Gender;
import jakarta.persistence.*;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Getter
@Setter
public class Delivery {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Enumerated(EnumType.STRING)
    private Gender gender;

    @Column(length = 10, nullable = false)
    @Pattern(regexp = "^[6-9]\\d{9}$", message = "Invalid mobile number")
    private String mobile;

    private LocalDate dob;

    @Column(length = 12, nullable = false, unique = true)
    @Pattern(regexp = "\\d{12}", message = "Invalid Aadhar number")
    private String aadharNumber;

    @Column(nullable = false)
    @Pattern(regexp = "^(http|https)://.*$", message = "Invalid Aadhar image Url")
    private String aadharImage;

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Area> areas = new ArrayList<>();

    @JsonIgnore
    @OneToOne(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(nullable = false)
    private LoginUser user;
}