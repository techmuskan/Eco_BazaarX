package com.SignupForm.dto.address;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AddressRequest {

    private String street;
    private String city;
    private String state;
    private String zipCode;
}