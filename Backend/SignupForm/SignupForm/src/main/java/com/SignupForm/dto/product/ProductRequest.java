package com.SignupForm.dto.product;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ProductRequest {

    private String name;
    private String category;
    private String description;
    private Double price;
    private Double carbonFootprint;
}