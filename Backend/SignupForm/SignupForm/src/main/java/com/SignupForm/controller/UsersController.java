package com.SignupForm.controller;

import com.SignupForm.entity.Users;
import com.SignupForm.requests.LoginRequest;
import com.SignupForm.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/user")
@CrossOrigin(origins = "http://localhost:3000")
public class UsersController {

    private final UserService userService;

    // ✅ Constructor Injection (BEST PRACTICE)
    public UsersController(UserService userService) {
        this.userService = userService;
    }

    // -------------------------------
    // SIGNUP
    // -------------------------------
    @PostMapping("/addUser")
    public ResponseEntity<?> addUser(@RequestBody Users user) {
        Users savedUser = userService.addUser(user);
        savedUser.setPassword(null); // hide password
        return ResponseEntity.ok(savedUser);
    }

    // -------------------------------
    // LOGIN
    // -------------------------------
    @PostMapping("/loginUser")
    public ResponseEntity<?> loginUser(@RequestBody LoginRequest loginRequest) {
        Optional<Users> userOpt = userService.loginUser(loginRequest);

        if (userOpt.isEmpty()) {
            return ResponseEntity.status(401).body("Invalid email or password");
        }

        Users user = userOpt.get();
        user.setPassword(null);
        user.setOtp(null);
        user.setOtpExpiry(null);

        return ResponseEntity.ok(user);
    }

    // -------------------------------
    // FORGOT PASSWORD
    // -------------------------------
    @PostMapping("/forgotPassword")
    public ResponseEntity<String> forgotPassword(@RequestBody Map<String, String> body) {
        String response = userService.forgotPassword(body.get("email"));
        return ResponseEntity.ok(response);
    }

    // -------------------------------
    // RESET PASSWORD
    // -------------------------------
    @PostMapping("/resetPassword")
    public ResponseEntity<String> resetPassword(@RequestBody Map<String, String> body) {
        String response = userService.resetPassword(
                body.get("email"),
                body.get("otp"),
                body.get("newPassword")
        );
        return ResponseEntity.ok(response);
    }
}
