package com.trulydesignfirm.laundryadda.repository;

import com.trulydesignfirm.laundryadda.model.Rating;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface RatingRepo extends JpaRepository<Rating, UUID> {
}
