package com.SignupForm.dto.seller;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UpdateSellerOrderStatusRequest {
    private String fulfillmentStatus;
}
