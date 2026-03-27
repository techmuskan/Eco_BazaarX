package com.SignupForm.controller;

import com.SignupForm.dto.seller.SellerDashboardResponse;
import com.SignupForm.dto.seller.SellerOrderResponse;
import com.SignupForm.dto.seller.SellerProfileResponse;
import com.SignupForm.dto.seller.UpdateSellerOrderStatusRequest;
import com.SignupForm.dto.seller.UpdateSellerProfileRequest;
import com.SignupForm.entity.Product;
import com.SignupForm.service.SellerProfileService;
import com.SignupForm.service.SellerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/seller")
@RequiredArgsConstructor
@PreAuthorize("hasRole('SELLER')")
public class SellerController {

    private final SellerService sellerService;
    private final SellerProfileService sellerProfileService;

    @GetMapping("/dashboard")
    public ResponseEntity<SellerDashboardResponse> getDashboard(Principal principal) {
        return ResponseEntity.ok(sellerService.getDashboard(principal.getName()));
    }

    @GetMapping("/profile")
    public ResponseEntity<SellerProfileResponse> getProfile(Principal principal) {
        return ResponseEntity.ok(sellerProfileService.getProfileByEmail(principal.getName()));
    }

    @PutMapping("/profile")
    public ResponseEntity<SellerProfileResponse> updateProfile(
            @RequestBody UpdateSellerProfileRequest request,
            Principal principal
    ) {
        return ResponseEntity.ok(sellerProfileService.updateProfile(principal.getName(), request));
    }

    @GetMapping("/products")
    public ResponseEntity<List<Product>> getSellerProducts(Principal principal) {
        return ResponseEntity.ok(sellerService.getSellerProducts(principal.getName()));
    }

    @GetMapping("/orders")
    public ResponseEntity<List<SellerOrderResponse>> getSellerOrders(Principal principal) {
        return ResponseEntity.ok(sellerService.getSellerOrders(principal.getName()));
    }

    @PutMapping("/orders/{orderId}/status")
    public ResponseEntity<SellerOrderResponse> updateSellerOrderStatus(
            @PathVariable Long orderId,
            @RequestBody UpdateSellerOrderStatusRequest request,
            Principal principal
    ) {
        return ResponseEntity.ok(sellerService.updateSellerOrderStatus(principal.getName(), orderId, request));
    }
}
