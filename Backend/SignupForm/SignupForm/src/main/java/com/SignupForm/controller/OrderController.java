package com.SignupForm.controller;

import com.SignupForm.dto.order.CheckoutRequest;
import com.SignupForm.dto.order.OrderResponse;
import com.SignupForm.repository.UserRepository;
import com.SignupForm.service.CheckoutService;
import com.SignupForm.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import org.springframework.security.core.Authentication;
import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final CheckoutService checkoutService;
    private final OrderService orderService;      // ✅ add this
    private final UserRepository userRepository;  // ✅ add this

    // ================= PLACE ORDER =================
    @PostMapping("/place")
    public ResponseEntity<OrderResponse> placeOrder(
            @RequestBody CheckoutRequest request,
            Authentication authentication
    ) {
        String email = authentication.getName();

        Long userId = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"))
                .getId();

        OrderResponse response = checkoutService.checkout(userId, request);

        return ResponseEntity.ok(response);
    }

    // ================= GET ALL USER ORDERS =================
    @GetMapping
    public ResponseEntity<List<OrderResponse>> getUserOrders(Principal principal) {
        String email = principal.getName();
        List<OrderResponse> orders = orderService.getOrdersForUser(email);
        return ResponseEntity.ok(orders);
    }

    // ================= GET SINGLE ORDER =================
    @GetMapping("/{orderId}")
    public ResponseEntity<OrderResponse> getOrder(
            @PathVariable Long orderId,
            Principal principal
    ) {
        String email = principal.getName();
        OrderResponse order = orderService.getOrderById(orderId, email);
        return ResponseEntity.ok(order);
    }
}