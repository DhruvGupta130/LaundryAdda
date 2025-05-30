package com.trulydesignfirm.laundryadda.repository;

import com.trulydesignfirm.laundryadda.model.PaymentDetails;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface PaymentRepo extends JpaRepository<PaymentDetails, String> {
    Optional<PaymentDetails> findByPaymentId(String paymentId);
    Optional<PaymentDetails> findByRazorPayId(String razorPayId);
}
