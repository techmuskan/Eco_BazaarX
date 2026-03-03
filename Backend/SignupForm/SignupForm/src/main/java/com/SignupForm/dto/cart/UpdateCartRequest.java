package com.SignupForm.dto.cart;

import lombok.*;

import jakarta.validation.constraints.NotNull;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateCartRequest {

    @NotNull(message = "Product ID is required")
    private Long productId;

    /**
     * Quantity change can be +1 or -1
     */
    @NotNull(message = "Quantity change is required")
    private Integer quantityChange;
}