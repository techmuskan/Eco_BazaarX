package com.SignupForm.service;

import com.SignupForm.entity.Users;
import com.SignupForm.repository.UsersRepo;
import com.SignupForm.requests.LoginRequest;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Random;

@Service
public class UserService {

    private final UsersRepo usersRepo;
    private final BCryptPasswordEncoder passwordEncoder;
    private final EmailService emailService;

    public UserService(UsersRepo usersRepo, EmailService emailService) {
        this.usersRepo = usersRepo;
        this.emailService = emailService;
        this.passwordEncoder = new BCryptPasswordEncoder();
    }

    // SIGNUP
    public Users addUser(Users user) {
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return usersRepo.save(user);
    }

    // LOGIN
    public Optional<Users> loginUser(LoginRequest loginRequest) {
        return usersRepo.findByEmail(loginRequest.getEmail())
                .filter(user ->
                        passwordEncoder.matches(
                                loginRequest.getPassword(),
                                user.getPassword()
                        )
                );
    }

    // FORGOT PASSWORD
    public String forgotPassword(String email) {
        Optional<Users> optionalUser = usersRepo.findByEmail(email);

        if (optionalUser.isEmpty()) {
            return "User not found";
        }

        Users user = optionalUser.get();
        String otp = generateOtp();

        user.setOtp(otp);
        user.setOtpExpiry(LocalDateTime.now().plusMinutes(5));
        usersRepo.save(user);

        // ✅ SEND EMAIL
        emailService.sendOtpEmail(email, otp);

        return "OTP sent to your email";
    }


    // RESET PASSWORD
    public String resetPassword(String email, String otp, String newPassword) {
        Optional<Users> optionalUser = usersRepo.findByEmail(email);

        if (optionalUser.isEmpty()) {
            return "User not found";
        }

        Users user = optionalUser.get();

        if (user.getOtp() == null || !user.getOtp().equals(otp)) {
            return "Invalid OTP";
        }

        if (user.getOtpExpiry().isBefore(LocalDateTime.now())) {
            return "OTP expired";
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setOtp(null);
        user.setOtpExpiry(null);
        usersRepo.save(user);

        return "Password reset successfully";
    }

    private String generateOtp() {
        return String.valueOf(100000 + new Random().nextInt(900000));
    }
}
