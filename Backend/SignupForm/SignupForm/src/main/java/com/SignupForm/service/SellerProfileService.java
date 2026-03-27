package com.SignupForm.service;

import com.SignupForm.dto.seller.SellerProfileResponse;
import com.SignupForm.dto.seller.UpdateSellerProfileRequest;
import com.SignupForm.entity.SellerProfile;
import com.SignupForm.entity.Users;
import com.SignupForm.enums.Role;
import com.SignupForm.repository.SellerProfileRepository;
import com.SignupForm.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class SellerProfileService {

    private final SellerProfileRepository sellerProfileRepository;
    private final UserRepository userRepository;

    public SellerProfile ensureProfile(Users user) {
        if (user.getRole() != Role.SELLER) {
            throw new RuntimeException("Seller profile is only available for seller accounts");
        }

        return sellerProfileRepository.findByUser(user)
                .orElseGet(() -> sellerProfileRepository.save(SellerProfile.builder()
                        .user(user)
                        .storeName(defaultStoreName(user))
                        .storeDescription("Tell buyers what makes your store special.")
                        .contactEmail(user.getEmail())
                        .contactPhone(user.getPhone())
                        .approved(false)
                        .build()));
    }

    public SellerProfileResponse getProfileByEmail(String email) {
        Users user = getSeller(email);
        return mapToResponse(ensureProfile(user));
    }

    public SellerProfileResponse updateProfile(String email, UpdateSellerProfileRequest request) {
        Users user = getSeller(email);
        SellerProfile profile = ensureProfile(user);

        if (request.getStoreName() != null && !request.getStoreName().isBlank()) {
            profile.setStoreName(request.getStoreName().trim());
        }
        if (request.getStoreDescription() != null) {
            profile.setStoreDescription(request.getStoreDescription().trim());
        }
        if (request.getContactEmail() != null && !request.getContactEmail().isBlank()) {
            profile.setContactEmail(request.getContactEmail().trim());
        }
        if (request.getContactPhone() != null && !request.getContactPhone().isBlank()) {
            profile.setContactPhone(request.getContactPhone().trim());
        }

        return mapToResponse(sellerProfileRepository.save(profile));
    }

    public SellerProfile getProfileEntityByEmail(String email) {
        Users user = getSeller(email);
        return ensureProfile(user);
    }

    public SellerProfile requireApprovedProfile(String email) {
        SellerProfile profile = getProfileEntityByEmail(email);
        if (!Boolean.TRUE.equals(profile.getApproved())) {
            throw new RuntimeException("Your seller account is pending admin approval");
        }
        return profile;
    }

    private Users getSeller(String email) {
        Users user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Seller not found"));

        if (user.getRole() != Role.SELLER) {
            throw new RuntimeException("Only seller accounts can access seller profile");
        }

        return user;
    }

    private String defaultStoreName(Users user) {
        return (user.getName() == null || user.getName().isBlank())
                ? "EcoBazaar Seller Store"
                : user.getName().trim() + "'s Store";
    }

    public SellerProfileResponse mapToResponse(SellerProfile profile) {
        return SellerProfileResponse.builder()
                .id(profile.getId())
                .sellerName(profile.getUser().getName())
                .storeName(profile.getStoreName())
                .storeDescription(profile.getStoreDescription())
                .contactEmail(profile.getContactEmail())
                .contactPhone(profile.getContactPhone())
                .approved(profile.getApproved())
                .build();
    }
}
