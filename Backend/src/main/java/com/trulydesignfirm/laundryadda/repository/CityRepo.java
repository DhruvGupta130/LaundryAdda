package com.trulydesignfirm.laundryadda.repository;

import com.trulydesignfirm.laundryadda.model.City;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CityRepo extends JpaRepository<City, Long> {
    Optional<City> findByName(String name);
}
