package com.SignupForm.repository;

import com.SignupForm.entity.Order;
import com.SignupForm.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
    List<OrderItem> findByOrder(Order order); // Now this works because OrderItem has a field 'order'
}