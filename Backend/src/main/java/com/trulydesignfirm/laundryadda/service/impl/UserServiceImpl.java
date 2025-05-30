package com.trulydesignfirm.laundryadda.service.impl;

import com.trulydesignfirm.laundryadda.model.LoginUser;
import com.trulydesignfirm.laundryadda.service.UserService;
import com.trulydesignfirm.laundryadda.service.utils.Utility;
import lombok.AllArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class UserServiceImpl implements UserService {

    private final Utility utility;

    @Override
    @Cacheable(value = "userProfiles", key = "#token")
    public LoginUser getUserProfile(String token) {
        return utility.getUserFromToken(token);
    }
}
