package com.trulydesignfirm.laundryadda.repository;

import com.trulydesignfirm.laundryadda.enums.OrderStatus;
import com.trulydesignfirm.laundryadda.model.Area;
import com.trulydesignfirm.laundryadda.model.Customer;
import com.trulydesignfirm.laundryadda.model.LaundryShop;
import com.trulydesignfirm.laundryadda.model.Orders;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface OrderRepo extends JpaRepository<Orders, UUID> {
    Page<Orders> findByCustomer(Customer customer, Pageable pageable);

    @Query("SELECT o FROM Orders o WHERE o.shop = :shop " +
            "AND (:status IS NULL OR o.status = :status) " +
            "AND (:query IS NULL OR LOWER(o.customer.user.name) LIKE CONCAT('%', LOWER(:query), '%'))")
    Page<Orders> findAllByShopAndStatus(LaundryShop shop, OrderStatus status, Pageable pageable, String query);

    List<Orders> findAllByShopAndStatus(LaundryShop shop, OrderStatus status);
    Optional<Orders> findByIdAndCustomer(UUID id, Customer customer);
    Optional<Orders> findByIdAndShop(UUID id, LaundryShop shop);
    List<Orders> findAllByAddress_AreaInAndStatus(List<Area> addressAreas, OrderStatus status);

    long countByShop(LaundryShop shop);
    long countDistinctCustomerByShop(LaundryShop shop);
    long countByShopAndCreatedAtBetween(LaundryShop shop, LocalDateTime startDateTime, LocalDateTime endDateTime);
    long countDistinctCustomerByShopAndCreatedAtBetween(LaundryShop shop, LocalDateTime startDateTime, LocalDateTime endDateTime);

    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Orders o WHERE o.shop = :shop " +
            "AND o.createdAt BETWEEN :startDate AND :endDate")
    Double sumTotalAmountByShopAndCreatedAtBetween(@Param("shop") LaundryShop shop,
                                                   @Param("startDate") LocalDateTime startDate,
                                                   @Param("endDate") LocalDateTime endDate);

    @Query("SELECT SUM(o.totalAmount) FROM Orders o WHERE o.shop = :shop")
    Double sumTotalAmountByShop(LaundryShop shop);

    int countByAddress_AreaIn(List<Area> address_area);
    int countByAddress_AreaInAndStatus(List<Area> deliveryAreas, OrderStatus status);
}
