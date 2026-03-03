package com.SignupForm.dto.product;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductResponse {

    private Long id;
    private String name;
    private String category;
    private String description;
    private Double price;
    private Double carbonFootprint;
}