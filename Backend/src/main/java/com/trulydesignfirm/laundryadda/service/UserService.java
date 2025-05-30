package com.trulydesignfirm.laundryadda.service;

import com.trulydesignfirm.laundryadda.model.LoginUser;
import org.springframework.stereotype.Service;

@Service
public interface UserService {
    LoginUser getUserProfile(String token);
}
