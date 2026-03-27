package com.SignupForm.repository;

import com.SignupForm.entity.SellerProfile;
import com.SignupForm.entity.Users;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SellerProfileRepository extends JpaRepository<SellerProfile, Long> {
    Optional<SellerProfile> findByUser(Users user);
    Optional<SellerProfile> findByUserEmail(String email);
    @EntityGraph(attributePaths = {"user"})
    java.util.List<SellerProfile> findAllByOrderByApprovedAscStoreNameAsc();
}
