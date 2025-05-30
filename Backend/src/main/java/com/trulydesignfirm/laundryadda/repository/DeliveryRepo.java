package com.trulydesignfirm.laundryadda.repository;

import com.trulydesignfirm.laundryadda.model.Delivery;
import com.trulydesignfirm.laundryadda.model.LoginUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface DeliveryRepo extends JpaRepository<Delivery, UUID> {
    Optional<Delivery> findByUser(LoginUser user);
}
