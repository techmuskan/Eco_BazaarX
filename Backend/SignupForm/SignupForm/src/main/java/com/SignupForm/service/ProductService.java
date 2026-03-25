package com.SignupForm.service;

import com.SignupForm.entity.Product;
import com.SignupForm.repository.ProductRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class ProductService {

    private final ProductRepository productRepo;

    public ProductService(ProductRepository productRepo) {
        this.productRepo = productRepo;
    }

    public List<Product> getAllProducts() {
        return productRepo.findAll();
    }

    public Optional<Product> getProductById(Long id) {
        return productRepo.findById(id);
    }

    public Product saveProduct(Product product) {
        return productRepo.save(product);
    }

    public void deleteProduct(Long id) {
        productRepo.deleteById(id);
    }

    public List<Product> search(String keyword) {
        // New code matching your updated Repository
        // Fixed: Matches the new method name in Repo
        return productRepo.searchApprovedProducts(keyword);
    }
    public List<Product> getPendingVerifications() {
        // Finds products that are NOT YET marked eco-friendly but have carbon data
        return productRepo.findAll().stream()
                .filter(p -> p.getIsEcoFriendly() == null || !p.getIsEcoFriendly())
                .toList();
    }
}