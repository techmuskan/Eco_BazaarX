package com.SignupForm.entity;


import com.SignupForm.enums.ShippingStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "shipping")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Shipping {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String carrier;
    private String trackingNumber;
    private Double shippingCost;

    private LocalDate shippedDate;
    private LocalDate estimatedDelivery;

    @Enumerated(EnumType.STRING)
    private ShippingStatus deliveryStatus;

    @OneToOne
    @JoinColumn(name = "order_id", nullable = false, unique = true)
    private Order order;
}