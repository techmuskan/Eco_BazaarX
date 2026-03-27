package com.SignupForm.controller;

import com.SignupForm.enums.Role;
import com.SignupForm.entity.Users;
import com.SignupForm.dto.auth.LoginRequest;
import com.SignupForm.dto.auth.RegisterRequest;
import com.SignupForm.responses.LoginResponse;
import com.SignupForm.responses.UserResponse;
import com.SignupForm.service.SellerProfileService;
import com.SignupForm.service.UserService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;
    private final SellerProfileService sellerProfileService;
    
    @Value("${app.signup.admin-enabled:false}")
    private boolean adminSignupEnabled;

    // ================= SIGNUP =================
    @PostMapping("/signup")
    public ResponseEntity<?> signup(@Valid @RequestBody RegisterRequest registerRequest) {
        try {
            Role requestedRole = registerRequest.getRole() == null ? Role.USER : registerRequest.getRole();
            if (requestedRole == Role.ADMIN && !adminSignupEnabled) {
                throw new RuntimeException("Admin signup is currently disabled");
            }

            Users user = new Users();
            user.setName(registerRequest.getName());
            user.setEmail(registerRequest.getEmail());
            user.setPassword(registerRequest.getPassword());
            user.setPhone(registerRequest.getPhone());
            user.setRole(requestedRole);

            Users savedUser = userService.addUser(user);
            String token = userService.generateTokenForUser(savedUser);

            UserResponse userResponse = mapToUserResponse(savedUser);

            Map<String, Object> response = new HashMap<>();
            response.put(
                    "message",
                    switch (requestedRole) {
                        case ADMIN -> "Admin account registered successfully";
                        case SELLER -> "Seller account registered successfully";
                        default -> "User account registered successfully";
                    }
            );
            response.put("token", token);
            response.put("user", userResponse);

            return new ResponseEntity<>(response, HttpStatus.CREATED);

        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
        }
    }

    // ================= LOGIN =================
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest loginRequest) {
        try {
            String token = userService.loginUser(loginRequest);

            Users user = userService.findByEmail(loginRequest.getEmail())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            UserResponse userResponse = mapToUserResponse(user);

            return ResponseEntity.ok(new LoginResponse(token, userResponse));

        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.UNAUTHORIZED);
        }
    }

    // ================= FORGOT PASSWORD =================
    @PostMapping("/forgot")
    public ResponseEntity<?> forgotPassword(@RequestParam String email) {
        String response = userService.forgotPassword(email);

        Map<String, String> result = new HashMap<>();
        result.put("message", response);

        return ResponseEntity.ok(result);
    }

    // ================= RESET PASSWORD =================
    @PostMapping("/reset")
    public ResponseEntity<?> resetPassword(
            @RequestParam String email,
            @RequestParam String otp,
            @RequestParam String newPassword) {

        String response = userService.resetPassword(email, otp, newPassword);

        Map<String, String> result = new HashMap<>();
        result.put("message", response);

        return ResponseEntity.ok(result);
    }

    // ================= HELPER =================
    private UserResponse mapToUserResponse(Users user) {
        String storeName = null;
        if (user.getRole() == Role.SELLER) {
            storeName = sellerProfileService.getProfileEntityByEmail(user.getEmail()).getStoreName();
        }

        return new UserResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getPhone(),
                user.getRole(),
                storeName
        );
    }
}
