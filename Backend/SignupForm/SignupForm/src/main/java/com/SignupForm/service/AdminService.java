package com.SignupForm.service;

import com.SignupForm.enums.Role;
import com.SignupForm.entity.Users;
import com.SignupForm.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;

    // ================= GET ALL USERS =================
    public List<Users> getAllUsers() {
        return userRepository.findAll();
    }

    // ================= GET USER BY ID =================
    public Users getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    // ================= DELETE USER =================
    public String deleteUser(Long id) {

        Users user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        userRepository.delete(user);

        return "User deleted successfully";
    }

    // ================= CHANGE ROLE =================
    public Users changeUserRole(Long id, Role role) {

        Users user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setRole(role);

        return userRepository.save(user);
    }

    // ================= ADMIN DASHBOARD STATS =================
    public long getTotalUsers() {
        return userRepository.count();
    }

    public long getTotalAdmins() {
        return userRepository.findAll()
                .stream()
                .filter(user -> user.getRole() == Role.ADMIN)
                .count();
    }

    public long getTotalNormalUsers() {
        return userRepository.findAll()
                .stream()
                .filter(user -> user.getRole() == Role.USER)
                .count();
    }
}