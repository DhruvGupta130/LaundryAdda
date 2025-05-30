package com.trulydesignfirm.laundryadda.repository;

import com.trulydesignfirm.laundryadda.model.LoginUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepo extends JpaRepository<LoginUser, UUID> {
    Optional<LoginUser> findByEmail(String email);
    boolean existsByEmail(String email);
}
