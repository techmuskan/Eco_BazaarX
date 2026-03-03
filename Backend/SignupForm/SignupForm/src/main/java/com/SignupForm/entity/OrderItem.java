package com.SignupForm.entity;

import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "order_items")
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id")
    private Order order;
    // Reference to the Product
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id")
    private Product product;

    private String productName;

    private int quantity;
    private double price;
    private double subtotal;
    private double emission;

    // Convenience getters for DTO mapping
    public Long getProductId() {
        return product != null ? product.getId() : null;
    }

    public String getProductName() {
        return productName != null ? productName : (product != null ? product.getName() : null);
    }

    public double getSubtotal() {
        return subtotal > 0 ? subtotal : price * quantity;
    }
}