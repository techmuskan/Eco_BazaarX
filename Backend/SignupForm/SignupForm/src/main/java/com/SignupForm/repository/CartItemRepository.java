package com.SignupForm.repository;

import com.SignupForm.entity.CartItem;
import com.SignupForm.entity.Cart;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {

    List<CartItem> findByCart(Cart cart);
}