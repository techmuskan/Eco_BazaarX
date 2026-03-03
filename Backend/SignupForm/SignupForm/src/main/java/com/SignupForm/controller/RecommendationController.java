package com.SignupForm.controller;

import com.SignupForm.dto.recommendation.RecommendationRequest;
import com.SignupForm.dto.recommendation.RecommendationResponse;
import com.SignupForm.service.RecommendationService;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/recommendations")
@RequiredArgsConstructor
@PreAuthorize("hasRole('USER')")
public class RecommendationController {

    private final RecommendationService recommendationService;

    // ================= GET RECOMMENDATIONS =================
    @PostMapping
    public ResponseEntity<List<RecommendationResponse>> getRecommendations(
            @RequestBody RecommendationRequest request) {

        List<RecommendationResponse> recommendations =
                recommendationService.getRecommendations(request);

        return ResponseEntity.ok(recommendations);
    }
}