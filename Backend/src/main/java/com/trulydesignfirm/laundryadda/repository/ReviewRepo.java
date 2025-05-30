package com.trulydesignfirm.laundryadda.repository;

import com.trulydesignfirm.laundryadda.model.Customer;
import com.trulydesignfirm.laundryadda.model.LaundryShop;
import com.trulydesignfirm.laundryadda.model.Orders;
import com.trulydesignfirm.laundryadda.model.Review;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ReviewRepo extends JpaRepository<Review, UUID> {

    Optional<Review> getReviewByOrder(Orders order);
    Review findByCustomerAndOrder(Customer customer, Orders order);

    List<Review> getReviewByShop(LaundryShop shop, Sort sort);
}
