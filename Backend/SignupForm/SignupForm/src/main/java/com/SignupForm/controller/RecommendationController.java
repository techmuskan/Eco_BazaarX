package com.SignupForm.controller;

import com.SignupForm.dto.recommendation.RecommendationRequest;
import com.SignupForm.dto.recommendation.RecommendationResponse;
import com.SignupForm.service.RecommendationService;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/recommendations")
@RequiredArgsConstructor
public class RecommendationController {

    private final RecommendationService recommendationService;

    @PostMapping
    public List<RecommendationResponse> getRecommendations(
            @RequestBody RecommendationRequest request) {

        return recommendationService.getRecommendations(request);
    }
}