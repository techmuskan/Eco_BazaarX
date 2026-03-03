package com.SignupForm.dto.order;

import com.SignupForm.dto.address.AddressRequest;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CheckoutRequest {

    private Long addressId;       // ID of the Address entity
    private String paymentMethod; // e.g., "COD" or "CARD"
    private String fullName;      // Customer full name
    private String email;         // Optional email if different from user



    private AddressRequest address;
}