package com.trulydesignfirm.laundryadda.controller;

import com.trulydesignfirm.laundryadda.model.LoginUser;
import com.trulydesignfirm.laundryadda.service.UserService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/user")
@AllArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/profile")
    public ResponseEntity<LoginUser> profile(@RequestHeader("Authorization") String token) {
        return ResponseEntity.ok(userService.getUserProfile(token));
    }
}
