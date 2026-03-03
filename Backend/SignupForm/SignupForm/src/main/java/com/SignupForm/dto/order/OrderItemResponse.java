package com.SignupForm.dto.order;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderItemResponse {

    private Long productId;
    private String productName;
    private Integer quantity;
    private Double price;
    private Double subtotal;   // price * quantity
    private Double emission;   // CO2 estimate
}