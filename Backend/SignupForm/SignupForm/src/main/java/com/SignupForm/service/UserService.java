package com.SignupForm.service;

import com.SignupForm.dto.auth.LoginRequest;
import com.SignupForm.enums.Role;
import com.SignupForm.entity.Users;
import com.SignupForm.repository.UserRepository;
import com.SignupForm.dto.auth.LoginRequest;
import com.SignupForm.security.JwtUtil;
import jakarta.validation.Valid;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Random;

@Service
public class UserService {

    private final UserRepository usersRepo;
    private final BCryptPasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final JwtUtil jwtUtil;

    public UserService(UserRepository usersRepo,
                       BCryptPasswordEncoder passwordEncoder,
                       EmailService emailService,
                       JwtUtil jwtUtil) {
        this.usersRepo = usersRepo;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
        this.jwtUtil = jwtUtil;
    }

    // ================= GET PROFILE =================
    public Users getByEmail(String email) {
        return usersRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    // ================= UPDATE PROFILE =================
    public Users updateProfile(String email, Users updated) {

        Users user = usersRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (updated.getName() != null)
            user.setName(updated.getName());

        if (updated.getPhone() != null)
            user.setPhone(updated.getPhone());

        return usersRepo.save(user);
    }

    // ================= SIGNUP =================
    public Users addUser(Users user) {

        if (user.getEmail() == null || user.getEmail().isEmpty())
            throw new RuntimeException("Email cannot be null or empty");

        if (user.getPassword() == null || user.getPassword().isEmpty())
            throw new RuntimeException("Password cannot be null or empty");

        if (usersRepo.findByEmail(user.getEmail()).isPresent())
            throw new RuntimeException("Email already exists");

        // Encode password before saving
        user.setPassword(passwordEncoder.encode(user.getPassword()));

        // Ensure role is set (fallback safety)
        if (user.getRole() == null)
            user.setRole(Role.USER);

        return usersRepo.save(user);
    }

    // ================= LOGIN =================
    public String loginUser(@Valid @org.jetbrains.annotations.UnknownNullability LoginRequest loginRequest) {

        if (loginRequest.getEmail() == null || loginRequest.getEmail().isEmpty())
            throw new RuntimeException("Email cannot be empty");

        if (loginRequest.getPassword() == null || loginRequest.getPassword().isEmpty())
            throw new RuntimeException("Password cannot be empty");

        Users user = usersRepo.findByEmail(loginRequest.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPassword()))
            throw new RuntimeException("Invalid email or password");

        return jwtUtil.generateToken(user.getEmail(), user.getRole().name());
    }

    // ================= FIND USER =================
    public Optional<Users> findByEmail(String email) {
        if (email == null || email.isEmpty())
            throw new RuntimeException("Email cannot be empty");

        return usersRepo.findByEmail(email);
    }

    // ================= FORGOT PASSWORD =================
    public String forgotPassword(String email) {

        if (email == null || email.isEmpty())
            throw new RuntimeException("Email cannot be empty");

        Users user = usersRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String otp = generateOtp();

        user.setOtp(otp);
        user.setOtpExpiry(LocalDateTime.now().plusMinutes(5));
        usersRepo.save(user);

        emailService.sendOtpEmail(email, otp);

        return "OTP sent to email successfully";
    }

    // ================= RESET PASSWORD =================
    public String resetPassword(String email, String otp, String newPassword) {

        if (email == null || email.isEmpty())
            throw new RuntimeException("Email cannot be empty");

        if (newPassword == null || newPassword.isEmpty())
            throw new RuntimeException("New password cannot be empty");

        Users user = usersRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getOtp() == null || user.getOtpExpiry() == null)
            throw new RuntimeException("No OTP requested");

        if (!user.getOtp().equals(otp))
            throw new RuntimeException("Invalid OTP");

        if (user.getOtpExpiry().isBefore(LocalDateTime.now()))
            throw new RuntimeException("OTP expired");

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setOtp(null);
        user.setOtpExpiry(null);

        usersRepo.save(user);

        return "Password reset successful";
    }

    // ================= GENERATE JWT =================
    public String generateTokenForUser(Users user) {
        return jwtUtil.generateToken(user.getEmail(), user.getRole().name());
    }

    // ================= HELPER =================
    private String generateOtp() {
        return String.valueOf(100000 + new Random().nextInt(900000));
    }
}