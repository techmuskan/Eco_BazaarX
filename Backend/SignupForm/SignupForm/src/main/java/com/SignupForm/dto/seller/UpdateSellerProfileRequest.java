package com.SignupForm.dto.seller;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UpdateSellerProfileRequest {
    private String storeName;
    private String storeDescription;
    private String contactEmail;
    private String contactPhone;
}
