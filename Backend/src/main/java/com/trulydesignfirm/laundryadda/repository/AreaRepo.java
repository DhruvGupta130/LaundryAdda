package com.trulydesignfirm.laundryadda.repository;

import com.trulydesignfirm.laundryadda.model.Area;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AreaRepo extends JpaRepository<Area, Long> {
    Page<Area> findByCityName(String cityName, Pageable pageable);
}
