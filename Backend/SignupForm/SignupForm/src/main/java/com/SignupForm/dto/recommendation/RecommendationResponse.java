package com.SignupForm.dto.recommendation;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RecommendationResponse {

    private Long productId;
    private String productName;
    private Double price;
    private Double ecoScore;
    private Double carbonFootprint;
    private Double score;
}