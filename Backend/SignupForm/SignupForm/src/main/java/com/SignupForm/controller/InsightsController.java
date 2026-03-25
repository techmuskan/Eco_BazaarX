package com.SignupForm.controller;

import com.SignupForm.service.InsightsService;

import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/insights")
@RequiredArgsConstructor
public class InsightsController {

    private final InsightsService insightsService;

    // ✅ USER INSIGHTS (SECURED)
    @GetMapping("/user")
    @PreAuthorize("isAuthenticated()") // 🔥 IMPORTANT
    public ResponseEntity<?> getUserInsights(Principal principal) {

        if (principal == null) {
            return ResponseEntity.status(401).body("Unauthorized");
        }

        String email = principal.getName(); // comes from JWT

        return ResponseEntity.ok(
                insightsService.getInsightsData(email)
        );
    }

    // ✅ ADMIN REPORT (ROLE BASED)
    @GetMapping("/admin/report")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAdminReport() {

        return ResponseEntity.ok(
                insightsService.getAdminGlobalReport()
        );
    }
}