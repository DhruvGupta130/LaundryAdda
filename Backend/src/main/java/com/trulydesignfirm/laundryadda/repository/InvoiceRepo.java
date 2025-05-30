package com.trulydesignfirm.laundryadda.repository;

import com.trulydesignfirm.laundryadda.model.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface InvoiceRepo extends JpaRepository<Invoice, UUID> {
    Optional<Invoice> getInvoiceByOrderId(UUID orderId);
}
