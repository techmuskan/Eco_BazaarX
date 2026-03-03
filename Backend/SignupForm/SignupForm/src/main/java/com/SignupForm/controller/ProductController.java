package com.SignupForm.controller;

import com.SignupForm.entity.Product;
import com.SignupForm.entity.CarbonData;
import com.SignupForm.entity.CarbonBreakdown;
import com.SignupForm.repository.ProductRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class ProductController {

    private final ProductRepository productRepo;

    public ProductController(ProductRepository productRepo) {
        this.productRepo = productRepo;
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
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Product> create(@RequestBody Product product) {
        product.setPrice(round(product.getPrice()));
        processCarbonData(product);
        return ResponseEntity.status(HttpStatus.CREATED).body(productRepo.save(product));
    }

    @PutMapping("/product/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Product> update(@PathVariable Long id, @RequestBody Product details) {
        return productRepo.findById(id).map(p -> {
            p.setName(details.getName());
            p.setPrice(round(details.getPrice()));
            p.setCategory(details.getCategory());
            p.setImage(details.getImage());
            p.setSeller(details.getSeller());
            p.setDescription(details.getDescription());
            p.setIsEcoFriendly(details.getIsEcoFriendly());

            p.setCarbonData(details.getCarbonData());
            processCarbonData(p);

            return ResponseEntity.ok(productRepo.save(p));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/product/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        productRepo.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    private void processCarbonData(Product product) {
        if (product.getCarbonData() != null) {
            CarbonData cd = product.getCarbonData();
            CarbonBreakdown br = cd.getBreakdown();

            if (br != null) {
                // Safety: Get values or default to 0.0 to prevent NullPointerException
                double m = (br.getManufacturing() != null) ? br.getManufacturing() : 0.0;
                double p = (br.getPackaging() != null) ? br.getPackaging() : 0.0;
                double t = (br.getTransport() != null) ? br.getTransport() : 0.0;
                double h = (br.getHandling() != null) ? br.getHandling() : 0.0;

                // Set rounded values back to object
                br.setManufacturing(round(m));
                br.setPackaging(round(p));
                br.setTransport(round(t));
                br.setHandling(round(h));

                // If Total is missing or zero, calculate sum
                if (cd.getTotalCO2ePerKg() == null || cd.getTotalCO2ePerKg() == 0) {
                    cd.setTotalCO2ePerKg(round(m + p + t + h));
                    cd.setMethod("automatic");
                } else {
                    cd.setTotalCO2ePerKg(round(cd.getTotalCO2ePerKg()));
                    cd.setMethod("manual");
                }
            }
        }
    }

    private Double round(Double value) {
        if (value == null) return 0.0;
        return Math.round(value * 100.0) / 100.0;
    }
}