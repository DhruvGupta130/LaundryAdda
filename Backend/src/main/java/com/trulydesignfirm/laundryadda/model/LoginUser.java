package com.trulydesignfirm.laundryadda.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.trulydesignfirm.laundryadda.enums.Role;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
@Entity
public class LoginUser {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Email(message = "Invalid email address")
    @Column(unique = true, nullable = false)
    private String email;

    @Pattern(regexp = "^(http|https)://.*$", message = "Invalid profile image Url")
    private String profile;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private Role role;

    @Column(nullable = false)
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String password;
}
