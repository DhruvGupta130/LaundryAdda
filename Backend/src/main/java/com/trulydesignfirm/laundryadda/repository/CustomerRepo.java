package com.trulydesignfirm.laundryadda.repository;

import com.trulydesignfirm.laundryadda.model.Customer;
import com.trulydesignfirm.laundryadda.model.LoginUser;
import com.trulydesignfirm.laundryadda.model.Address;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CustomerRepo extends JpaRepository<Customer, UUID> {

    @Query("SELECT c.addresses FROM Customer c WHERE c = :customer")
    List<Address> getCustomerAddresses(Customer customer);

    Optional<Customer> findCustomerByUser(LoginUser user);
}
