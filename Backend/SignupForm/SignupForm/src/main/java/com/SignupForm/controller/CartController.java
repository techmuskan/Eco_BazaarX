package com.SignupForm.controller;

import com.SignupForm.dto.cart.AddToCartRequest;
import com.SignupForm.dto.cart.CartResponse;
import com.SignupForm.dto.cart.UpdateCartRequest;
import com.SignupForm.service.CartService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
@PreAuthorize("hasRole('USER')")
public class CartController {

    private final CartService cartService;

    // ================= GET CART =================
    @GetMapping
    public ResponseEntity<CartResponse> getCart(Principal principal) {
        // Fetch the current user's cart
        CartResponse cartResponse = cartService.getCart(principal.getName());
        return ResponseEntity.ok(cartResponse);
    }

    // ================= ADD TO CART =================
    @PostMapping("/add")
    public ResponseEntity<CartResponse> addToCart(
            @Valid @RequestBody AddToCartRequest request,
            Principal principal
    ) {
        CartResponse updatedCart = cartService.addToCart(
                principal.getName(),
                request.getProductId(),
                request.getQuantity()
        );
        return ResponseEntity.ok(updatedCart);
    }

    // ================= REMOVE ITEM =================
    @DeleteMapping("/remove/{itemId}")
    public ResponseEntity<CartResponse> removeFromCart(
            @PathVariable Long itemId,
            Principal principal
    ) {
        CartResponse updatedCart = cartService.removeItem(
                principal.getName(),
                itemId
        );
        return ResponseEntity.ok(updatedCart);
    }

    // ================= CLEAR CART =================
    @DeleteMapping("/clear")
    public ResponseEntity<CartResponse> clearCart(Principal principal) {
        CartResponse clearedCart = cartService.clearCart(principal.getName());
        return ResponseEntity.ok(clearedCart);
    }

    // ================= UPDATE ITEM QUANTITY =================
    @PatchMapping("/update")
    public ResponseEntity<CartResponse> updateCartItem(
            @Valid @RequestBody UpdateCartRequest request,
            Principal principal
    ) {
        CartResponse updatedCart = cartService.updateQuantity(
                principal.getName(),
                request.getProductId(),
                request.getQuantityChange() // can be +1 or -1
        );
        return ResponseEntity.ok(updatedCart);
    }
}