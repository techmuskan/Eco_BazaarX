package com.SignupForm.repository;

import com.SignupForm.entity.Shipping;
import com.SignupForm.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ShippingRepository extends JpaRepository<Shipping, Long> {

    Optional<Shipping> findByOrder(Order order);
}