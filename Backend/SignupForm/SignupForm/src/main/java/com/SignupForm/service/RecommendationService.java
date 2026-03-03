package com.SignupForm.service;

import com.SignupForm.dto.recommendation.RecommendationRequest;
import com.SignupForm.dto.recommendation.RecommendationResponse;
import com.SignupForm.entity.Product;
import com.SignupForm.repository.ProductRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RecommendationService {

    private final ProductRepository productRepository;

    // ================= GET RECOMMENDATIONS =================
    public List<RecommendationResponse> getRecommendations(RecommendationRequest request) {

        // 1️⃣ Get selected product
        Product selectedProduct = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found"));

        // 2️⃣ Find alternatives in same category but different ID
        List<Product> alternatives = productRepository
                .findByCategoryAndIdNot(
                        selectedProduct.getCategory(),
                        selectedProduct.getId()
                );

        // 3️⃣ Convert to response
        return alternatives.stream()
                .map(product -> buildRecommendation(selectedProduct, product))
                .sorted(Comparator.comparing(RecommendationResponse::getScore).reversed())
                .limit(6)
                .collect(Collectors.toList());
    }

    // ================= BUILD RESPONSE =================
    private RecommendationResponse buildRecommendation(Product original, Product alternative) {

        double score = calculateScore(original, alternative);

        Double carbonValue = null;
        if (alternative.getCarbonData() != null) {
            carbonValue = alternative.getCarbonData().getTotalCO2ePerKg();
        }

        return RecommendationResponse.builder()
                .productId(alternative.getId())
                .productName(alternative.getName())
                .price(alternative.getPrice())
                .ecoScore(Boolean.TRUE.equals(alternative.getIsEcoFriendly()) ? 1.0 : 0.0)
                .carbonFootprint(carbonValue)
                .score(score)
                .build();
    }

    // ================= CALCULATE SCORE =================
    private double calculateScore(Product original, Product alternative) {

        double ecoScore = Boolean.TRUE.equals(alternative.getIsEcoFriendly()) ? 20 : 0;

        double carbonScore = 0;
        if (alternative.getCarbonData() != null &&
                alternative.getCarbonData().getTotalCO2ePerKg() != null) {

            // Lower carbon = higher score
            carbonScore = Math.max(0, 50 - alternative.getCarbonData().getTotalCO2ePerKg());
        }

        double priceScore = 0;
        if (original.getPrice() != null &&
                alternative.getPrice() != null &&
                original.getPrice() > alternative.getPrice()) {
            priceScore = 30;
        }

        return ecoScore + carbonScore + priceScore;
    }
}