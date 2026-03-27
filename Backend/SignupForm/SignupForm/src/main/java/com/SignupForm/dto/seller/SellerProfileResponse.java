package com.SignupForm.dto.seller;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SellerProfileResponse {
    private Long id;
    private String sellerName;
    private String storeName;
    private String storeDescription;
    private String contactEmail;
    private String contactPhone;
    private Boolean approved;
}
