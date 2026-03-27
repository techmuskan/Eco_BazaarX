package com.SignupForm.repository;

import com.SignupForm.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    // ✅ FIX: Restores the missing symbol for standard search
    List<Product> findByNameContainingIgnoreCase(String keyword);

    // ✅ Catalog Logic: Only show 'Approved' products
    @Query("SELECT p FROM Product p WHERE p.status = 'Approved'")
    List<Product> findAllApproved();

    // ✅ Search Logic: Only search within 'Approved' products
    @Query("SELECT p FROM Product p WHERE p.status = 'Approved' AND (" +
            "LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(p.category) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    List<Product> searchApprovedProducts(@Param("keyword") String keyword);

    // ✅ Admin Logic: For the 'Verification' or 'Hold' tab
    List<Product> findByStatus(String status);

    List<Product> findByCategoryAndIdNot(String category, Long id);

    List<Product> findBySellerOwnerEmailOrderByCreatedAtDesc(String sellerOwnerEmail);

    long countBySellerOwnerEmail(String sellerOwnerEmail);

    long countBySellerOwnerEmailAndStatus(String sellerOwnerEmail, String status);

    long countBySellerOwnerEmailAndIsEcoFriendlyTrue(String sellerOwnerEmail);
}
