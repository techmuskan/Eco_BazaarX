package com.SignupForm.controller;

import com.SignupForm.entity.*;
import com.SignupForm.repository.ProductRepository;
import com.SignupForm.repository.UserRepository;
import com.SignupForm.repository.OrderRepository;
import com.SignupForm.service.AdminService;
import com.SignupForm.service.CarbonCalculationService;
import com.SignupForm.dto.product.ProductRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminManagementController {

    private final AdminService adminService;
    private final ProductRepository productRepo;
    private final UserRepository userRepo;
    private final OrderRepository orderRepository;
    private final CarbonCalculationService carbonService;

    // --- USERS & ROLES ---
    @GetMapping("/users")
    public ResponseEntity<List<Users>> getAllUsers() {
        return ResponseEntity.ok(userRepo.findAll());
    }

    @PutMapping("/users/{id}/role")
    public ResponseEntity<?> updateUserRole(@PathVariable Long id, @RequestParam String role) {
        return userRepo.findById(id).map(user -> {
            try {
                com.SignupForm.enums.Role targetRole = com.SignupForm.enums.Role.valueOf(role.toUpperCase());
                user.setRole(targetRole);
                userRepo.save(user);

                Map<String, Object> response = new HashMap<>();
                response.put("message", "User role updated to " + targetRole);
                return ResponseEntity.ok(response);
            } catch (IllegalArgumentException e) {
                Map<String, Object> response = new HashMap<>();
                response.put("message", "Invalid role: " + role);
                return ResponseEntity.badRequest().body(response);
            }
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        return userRepo.findById(id).map(u -> {
            userRepo.delete(u);
            Map<String, Object> response = new HashMap<>();
            response.put("message", "User removed");
            return ResponseEntity.ok(response);
        }).orElse(ResponseEntity.notFound().build());
    }

    // --- PRODUCTS & STATUS ---
    @PutMapping("/products/{id}/status")
    public ResponseEntity<Product> updateProductStatus(
            @PathVariable Long id,
            @RequestBody ProductRequest request) {

        return productRepo.findById(id).map(product -> {
            if (request.getStatus() != null) {
                product.setStatus(request.getStatus());
            }
            if (request.getIsEcoFriendly() != null) {
                product.setIsEcoFriendly(request.getIsEcoFriendly());
            }

            if (product.getCarbonData() == null) {
                product.setCarbonData(new CarbonData());
            }
            CarbonData cd = product.getCarbonData();

            if (cd.getBreakdown() == null) {
                cd.setBreakdown(new CarbonBreakdown());
            }
            CarbonBreakdown cb = cd.getBreakdown();

            cb.setManufacturing(request.getManufacturing() != null ? request.getManufacturing() : 0.0);
            cb.setPackaging(request.getPackaging() != null ? request.getPackaging() : 0.0);
            cb.setTransport(request.getTransport() != null ? request.getTransport() : 0.0);
            cb.setHandling(request.getHandling() != null ? request.getHandling() : 0.0);

            carbonService.calculate(cd);
            product.setEmission(cd.getTotalCO2ePerKg());

            return ResponseEntity.ok(productRepo.save(product));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/products/bulk-approve")
    public ResponseEntity<?> bulkApprove(@RequestBody List<Long> ids) {
        List<Product> products = productRepo.findAllById(ids);
        products.forEach(p -> {
            p.setStatus("Approved");
            p.setIsEcoFriendly(true);
        });
        productRepo.saveAll(products);

        Map<String, Object> response = new HashMap<>();
        response.put("message", products.size() + " products approved.");
        return ResponseEntity.ok(response);
    }

    // --- STATS & REPORTS ---
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getAdminStats() {
        Map<String, Object> stats = new HashMap<>();
        List<Product> allProducts = productRepo.findAll();

        long greenCount = allProducts.stream()
                .filter(p -> Boolean.TRUE.equals(p.getIsEcoFriendly()))
                .count();

        double totalSavings = allProducts.stream()
                .filter(p -> Boolean.TRUE.equals(p.getIsEcoFriendly()))
                .mapToDouble(p -> p.getEmission() != null ? p.getEmission() : 0.0)
                .sum();

        // Fetching top 20 recent orders
        List<Order> recentOrders = orderRepository.findTop20ByOrderByOrderDateDesc();

        stats.put("totalNormalUsers", adminService.getTotalNormalUsers());
        stats.put("totalAdmins", adminService.getTotalAdmins());
        stats.put("greenSkus", greenCount);
        stats.put("totalCarbonImpact", Math.round(totalSavings * 100.0) / 100.0);
        stats.put("inventoryCount", allProducts.size());
        stats.put("totalOrders", orderRepository.count());

        // Map recent orders into the format React expects
        List<Map<String, Object>> recentOrdersMapped = recentOrders.stream().map(order -> {
            Map<String, Object> map = new HashMap<>();

            // Fixed: Added orderDate
            map.put("orderDate", order.getOrderDate());
            map.put("userName", order.getUser() != null ? order.getUser().getName() : "Guest");

            // Fixed: Safely calculate total quantity
            int totalQty = (order.getOrderItems() != null)
                    ? order.getOrderItems().stream().mapToInt(OrderItem::getQuantity).sum()
                    : 0;
            map.put("totalQuantity", totalQty);

            map.put("status", order.getStatus());

            // Map the items list
            List<Map<String, Object>> itemDetails = (order.getOrderItems() != null)
                    ? order.getOrderItems().stream().map(item -> {
                Map<String, Object> itemMap = new HashMap<>();
                itemMap.put("name", item.getProductName());
                itemMap.put("qty", item.getQuantity());
                return itemMap;
            }).collect(Collectors.toList())
                    : List.of();

            map.put("items", itemDetails);
            return map;
        }).collect(Collectors.toList());

        stats.put("recentOrders", recentOrdersMapped);

        return ResponseEntity.ok(stats);
    }

    // --- SYSTEM HEALTH ---
    @GetMapping("/system/health")
    public ResponseEntity<Map<String, Object>> getSystemHealth() {
        Map<String, Object> health = new HashMap<>();
        Runtime runtime = Runtime.getRuntime();

        health.put("database", "CONNECTED");
        health.put("usedMemoryMB", (runtime.totalMemory() - runtime.freeMemory()) / 1048576);
        health.put("maxMemoryMB", runtime.maxMemory() / 1048576);
        health.put("activeThreads", Thread.activeCount());
        health.put("serverTime", System.currentTimeMillis());

        return ResponseEntity.ok(health);
    }
}