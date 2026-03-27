package com.SignupForm.controller;

import com.SignupForm.dto.product.ProductRequest;
import com.SignupForm.entity.Product;
import com.SignupForm.entity.CarbonData;
import com.SignupForm.entity.CarbonBreakdown;
import com.SignupForm.entity.SellerProfile;
import com.SignupForm.entity.Users;
import com.SignupForm.enums.Role;
import com.SignupForm.repository.ProductRepository;
import com.SignupForm.repository.UserRepository;
import com.SignupForm.service.SellerProfileService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api")
public class ProductController {

    private final ProductRepository productRepo;
    private final UserRepository userRepository;
    private final SellerProfileService sellerProfileService;

    public ProductController(ProductRepository productRepo, UserRepository userRepository, SellerProfileService sellerProfileService) {
        this.productRepo = productRepo;
        this.userRepository = userRepository;
        this.sellerProfileService = sellerProfileService;
    }

    @GetMapping("/products")
    public List<Product> getAll() {
        return productRepo.findAll();
    }

    @GetMapping("/product/{id}")
    public ResponseEntity<Product> getById(@PathVariable Long id) {
        return productRepo.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/products/search")
    public List<Product> search(@RequestParam String keyword) {
        return productRepo.findByNameContainingIgnoreCase(keyword);
    }

    @PostMapping("/product")
    @PreAuthorize("hasAnyRole('ADMIN', 'SELLER')")
    public ResponseEntity<Product> create(@RequestBody ProductRequest dto, Authentication authentication) {
        Product product = mapToEntity(new Product(), dto);
        applyOwnership(product, dto, authentication, true);
        return ResponseEntity.status(HttpStatus.CREATED).body(productRepo.save(product));
    }

    @PutMapping("/product/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SELLER')")
    public ResponseEntity<Product> update(@PathVariable Long id, @RequestBody ProductRequest dto, Authentication authentication) {
        return productRepo.findById(id).map(existingProduct -> {
            ensureCanManageProduct(existingProduct, authentication);
            Product updatedProduct = mapToEntity(existingProduct, dto);
            applyOwnership(updatedProduct, dto, authentication, false);
            return ResponseEntity.ok(productRepo.save(updatedProduct));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/product/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SELLER')")
    public ResponseEntity<Void> delete(@PathVariable Long id, Authentication authentication) {
        return productRepo.findById(id).map(product -> {
            ensureCanManageProduct(product, authentication);
            productRepo.delete(product);
            return ResponseEntity.noContent().<Void>build();
        }).orElse(ResponseEntity.notFound().build());
    }

    /**
     * Maps the flat DTO from React to the nested Entity structure for Hibernate.
     */
    private Product mapToEntity(Product product, ProductRequest dto) {
        // Basic Product Info
        product.setName(dto.getName());
        product.setCategory(dto.getCategory());
        product.setSeller(dto.getSeller());
        product.setPrice(round(dto.getPrice()));
        product.setImage(dto.getImage());
        product.setDescription(dto.getDescription());
        product.setIsEcoFriendly(dto.getIsEcoFriendly());

        // Carbon Breakdown Nesting
        CarbonBreakdown br = new CarbonBreakdown();
        double m = round(dto.getManufacturing());
        double p = round(dto.getPackaging());
        double t = round(dto.getTransport());
        double h = round(dto.getHandling());

        br.setManufacturing(m);
        br.setPackaging(p);
        br.setTransport(t);
        br.setHandling(h);

        // Carbon Data Wrapper
        CarbonData cd = new CarbonData();
        cd.setBreakdown(br);
        cd.setMaterial("Standard"); // Default material

        // Total CO2 Calculation Logic
        if (dto.getTotalCO2e() != null && dto.getTotalCO2e() > 0) {
            cd.setTotalCO2ePerKg(round(dto.getTotalCO2e()));
            cd.setMethod("manual");
        } else {
            cd.setTotalCO2ePerKg(round(m + p + t + h));
            cd.setMethod("automatic");
        }

        product.setCarbonData(cd);

        // Ensure top-level emission field is synced with total
        product.setEmission(cd.getTotalCO2ePerKg());

        return product;
    }

    private void applyOwnership(Product product, ProductRequest dto, Authentication authentication, boolean isCreate) {
        Users currentUser = getCurrentUser(authentication);
        boolean isSeller = currentUser.getRole() == Role.SELLER;

        if (isSeller) {
            SellerProfile sellerProfile = sellerProfileService.requireApprovedProfile(currentUser.getEmail());
            product.setSellerProfileId(sellerProfile.getId());
            product.setSellerOwnerEmail(currentUser.getEmail());
            product.setSellerOwnerName(currentUser.getName());
            product.setSeller(sellerProfile.getStoreName());

            if (isCreate) {
                product.setStatus("Hold");
            }
            return;
        }

        if (dto.getSeller() != null && !dto.getSeller().isBlank()) {
            product.setSeller(dto.getSeller().trim());
        }
        if (product.getSellerOwnerEmail() == null || product.getSellerOwnerEmail().isBlank()) {
            product.setSellerOwnerEmail(currentUser.getEmail());
        }
        if (product.getSellerOwnerName() == null || product.getSellerOwnerName().isBlank()) {
            product.setSellerOwnerName(currentUser.getName());
        }
    }

    private void ensureCanManageProduct(Product product, Authentication authentication) {
        Users currentUser = getCurrentUser(authentication);
        if (currentUser.getRole() == Role.ADMIN) {
            return;
        }

        if (!currentUser.getEmail().equalsIgnoreCase(product.getSellerOwnerEmail())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only manage your own products");
        }
    }

    private Users getCurrentUser(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication required");
        }

        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authenticated user not found"));
    }

    private Double round(Double value) {
        if (value == null) return 0.0;
        return Math.round(value * 100.0) / 100.0;
    }
}
