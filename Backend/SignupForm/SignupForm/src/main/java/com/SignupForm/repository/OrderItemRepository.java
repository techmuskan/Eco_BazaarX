package com.SignupForm.repository;

import com.SignupForm.entity.OrderItem;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {

    @EntityGraph(attributePaths = {"order", "product"})
    List<OrderItem> findBySellerEmailOrderByOrder_OrderDateDesc(String sellerEmail);

    @EntityGraph(attributePaths = {"order", "product"})
    List<OrderItem> findByOrderIdAndSellerEmail(Long orderId, String sellerEmail);
}
