package com.SignupForm.repository;

import com.SignupForm.entity.Order;
import com.SignupForm.entity.Users;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {

    // For User Dashboard: Fetch orders by email sorted by date for the trend chart
    @EntityGraph(attributePaths = {"orderItems", "orderItems.product"})
    List<Order> findByEmailOrderByOrderDateAsc(String email);

    // For User Dashboard: Fetch orders by User object
    @EntityGraph(attributePaths = {"address", "orderItems", "orderItems.product"})
    List<Order> findByUserOrderByOrderDateDesc(Users user);

    @EntityGraph(attributePaths = {"address", "orderItems", "orderItems.product", "user"})
    Optional<Order> findByIdAndUserEmail(Long id, String email);

    List<Order> findTop20ByOrderByOrderDateDesc();

    @EntityGraph(attributePaths = {"user", "orderItems"})
    List<Order> findTop20WithUserAndOrderItemsByOrderByOrderDateDesc();

    // For Module 4: Get total carbon saved by a specific user (for Badges)
    @Query("SELECT SUM(o.totalEmission) FROM Order o WHERE o.email = :email")
    Double getTotalEmissionByEmail(@Param("email") String email);

    // For Module 5: Admin Dashboard - System-wide carbon reduction trend
    @Query("SELECT SUM(o.totalEmission) FROM Order o")
    Double getSystemWideTotalEmission();

    // For Module 5: Merchant Analytics - Top eco-performing months
    @Query(value = "SELECT DATE_FORMAT(order_date, '%b %Y') as month_label, SUM(total_emission) as total " +
            "FROM orders " +
            "WHERE order_date IS NOT NULL " +
            "GROUP BY YEAR(order_date), MONTH(order_date), DATE_FORMAT(order_date, '%b %Y') " +
            "ORDER BY YEAR(order_date), MONTH(order_date)",
            nativeQuery = true)
    List<Object[]> getMonthlyEmissionStats();
}
