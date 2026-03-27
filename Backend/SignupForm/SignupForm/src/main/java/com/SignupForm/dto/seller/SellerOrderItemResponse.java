package com.SignupForm.dto.seller;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SellerOrderItemResponse {
    private Long productId;
    private String productName;
    private Integer quantity;
    private Double subtotal;
    private Double emission;
    private String fulfillmentStatus;
}
