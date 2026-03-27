package com.SignupForm.service;

import com.SignupForm.dto.seller.SellerProfileResponse;
import com.SignupForm.enums.Role;
import com.SignupForm.entity.SellerProfile;
import com.SignupForm.entity.Users;
import com.SignupForm.repository.SellerProfileRepository;
import com.SignupForm.repository.UserRepository;
import com.SignupForm.responses.UserResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final SellerProfileRepository sellerProfileRepository;
    private final SellerProfileService sellerProfileService;

    // ================= GET ALL USERS =================
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::mapUserResponse)
                .toList();
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
    public UserResponse changeUserRole(Long id, Role role) {

        Users user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setRole(role);
        Users savedUser = userRepository.save(user);

        if (savedUser.getRole() == Role.SELLER) {
            sellerProfileService.ensureProfile(savedUser);
        }

        return mapUserResponse(savedUser);
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

    public java.util.List<SellerProfileResponse> getAllSellerProfiles() {
        return sellerProfileRepository.findAllByOrderByApprovedAscStoreNameAsc()
                .stream()
                .filter(profile -> profile.getUser() != null && profile.getUser().getRole() == Role.SELLER)
                .map(sellerProfileService::mapToResponse)
                .toList();
    }

    public SellerProfileResponse updateSellerApproval(Long sellerProfileId, boolean approved) {
        SellerProfile profile = sellerProfileRepository.findById(sellerProfileId)
                .orElseThrow(() -> new RuntimeException("Seller profile not found"));

        profile.setApproved(approved);
        return sellerProfileService.mapToResponse(sellerProfileRepository.save(profile));
    }

    private UserResponse mapUserResponse(Users user) {
        return new UserResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getPhone(),
                user.getRole(),
                user.getRole() == Role.SELLER
                        ? sellerProfileRepository.findByUser(user)
                        .map(SellerProfile::getStoreName)
                        .orElse(null)
                        : null
        );
    }
}
