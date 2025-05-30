package com.trulydesignfirm.laundryadda.repository;

import com.trulydesignfirm.laundryadda.model.LaundryShop;
import com.trulydesignfirm.laundryadda.model.LoginUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface LaundryShopRepo extends JpaRepository<LaundryShop, UUID> {

    Optional<LaundryShop> findByOwner(LoginUser owner);

    @Query("SELECT s FROM LaundryShop s WHERE " +
            "(6371 * acos(cos(radians(:lat)) * cos(radians(s.address.latitude)) " +
            "* cos(radians(s.address.longitude) - radians(:lng)) + sin(radians(:lat)) " +
            "* sin(radians(s.address.latitude)))) <= :radius ")
    List<LaundryShop> findShopsWithinRadiusAndService(
            @Param("lat") double latitude,
            @Param("lng") double longitude,
            @Param("radius") double radius);

    boolean existsByOwner(LoginUser owner);
}
