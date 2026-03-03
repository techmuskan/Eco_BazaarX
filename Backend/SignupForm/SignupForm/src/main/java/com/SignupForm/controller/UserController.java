package com.SignupForm.controller;

import com.SignupForm.entity.Users;
import com.SignupForm.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
@PreAuthorize("hasRole('USER')")
public class UserController {

    private final UserService userService;

    @GetMapping
    public ResponseEntity<Users> getProfile(Principal principal) {
        return ResponseEntity.ok(
                userService.getByEmail(principal.getName())
        );
    }

    @PutMapping
    public ResponseEntity<Users> updateProfile(
            @RequestBody Users updated,
            Principal principal
    ) {
        return ResponseEntity.ok(
                userService.updateProfile(principal.getName(), updated)
        );
    }
}