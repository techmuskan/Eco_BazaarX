package com.SignupForm.repository;

import com.SignupForm.entity.Cart;
import com.SignupForm.entity.Users;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CartRepository extends JpaRepository<Cart, Long> {

    Optional<Cart> findByUser(Users user);
}