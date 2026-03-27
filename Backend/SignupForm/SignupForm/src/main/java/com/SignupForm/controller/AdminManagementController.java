package com.SignupForm.controller;

import com.SignupForm.entity.*;
import com.SignupForm.repository.ProductRepository;
import com.SignupForm.repository.UserRepository;
import com.SignupForm.repository.OrderRepository;
import com.SignupForm.service.AdminService;
import com.SignupForm.service.CarbonCalculationService;
import com.SignupForm.dto.product.ProductRequest;
import com.SignupForm.dto.seller.SellerProfileResponse;
import com.SignupForm.responses.UserResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.LinkedHashMap;
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
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        return ResponseEntity.ok(adminService.getAllUsers());
    }

    @GetMapping("/seller-profiles")
    public ResponseEntity<List<SellerProfileResponse>> getSellerProfiles() {
        return ResponseEntity.ok(adminService.getAllSellerProfiles());
    }

    @PutMapping("/seller-profiles/{id}/approval")
    public ResponseEntity<SellerProfileResponse> updateSellerApproval(
            @PathVariable Long id,
            @RequestParam boolean approved
    ) {
        return ResponseEntity.ok(adminService.updateSellerApproval(id, approved));
    }

    @PutMapping("/users/{id}/role")
    public ResponseEntity<?> updateUserRole(@PathVariable Long id, @RequestParam String role) {
        try {
            com.SignupForm.enums.Role targetRole = com.SignupForm.enums.Role.valueOf(role.toUpperCase());
            return ResponseEntity.ok(adminService.changeUserRole(id, targetRole));
        } catch (IllegalArgumentException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Invalid role: " + role);
            return ResponseEntity.badRequest().body(response);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
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
        List<Order> allOrders = orderRepository.findAll();

        long greenCount = allProducts.stream()
                .filter(p -> Boolean.TRUE.equals(p.getIsEcoFriendly()))
                .count();

        double totalSavings = allProducts.stream()
                .filter(p -> Boolean.TRUE.equals(p.getIsEcoFriendly()))
                .mapToDouble(p -> p.getEmission() != null ? p.getEmission() : 0.0)
                .sum();

        // Fetching top 20 recent orders
        List<Order> recentOrders = orderRepository.findTop20WithUserAndOrderItemsByOrderByOrderDateDesc();

        stats.put("totalNormalUsers", adminService.getTotalNormalUsers());
        stats.put("totalAdmins", adminService.getTotalAdmins());
        stats.put("greenSkus", greenCount);
        stats.put("totalCarbonImpact", Math.round(totalSavings * 100.0) / 100.0);
        stats.put("inventoryCount", allProducts.size());
        stats.put("totalOrders", orderRepository.count());
        stats.put("categoryBreakdown", buildCategoryBreakdown(allProducts));
        stats.put("orderStatusBreakdown", buildOrderStatusBreakdown(allOrders));
        stats.put("monthlyEmissionTrend", buildMonthlyEmissionTrend());

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

    private List<Map<String, Object>> buildCategoryBreakdown(List<Product> products) {
        return products.stream()
                .collect(Collectors.groupingBy(
                        product -> product.getCategory() == null || product.getCategory().isBlank()
                                ? "Uncategorized"
                                : product.getCategory(),
                        Collectors.counting()
                ))
                .entrySet()
                .stream()
                .sorted((a, b) -> Long.compare(b.getValue(), a.getValue()))
                .map(entry -> {
                    Map<String, Object> row = new LinkedHashMap<>();
                    row.put("label", entry.getKey());
                    row.put("count", entry.getValue());
                    return row;
                })
                .toList();
    }

    private List<Map<String, Object>> buildOrderStatusBreakdown(List<Order> orders) {
        return orders.stream()
                .collect(Collectors.groupingBy(
                        order -> order.getStatus() == null || order.getStatus().isBlank()
                                ? "Pending"
                                : order.getStatus(),
                        Collectors.counting()
                ))
                .entrySet()
                .stream()
                .sorted((a, b) -> Long.compare(b.getValue(), a.getValue()))
                .map(entry -> {
                    Map<String, Object> row = new LinkedHashMap<>();
                    row.put("label", entry.getKey());
                    row.put("count", entry.getValue());
                    return row;
                })
                .toList();
    }

    private List<Map<String, Object>> buildMonthlyEmissionTrend() {
        return orderRepository.getMonthlyEmissionStats().stream()
                .map(row -> {
                    Map<String, Object> point = new LinkedHashMap<>();
                    point.put("label", row[0] == null ? "Unknown" : row[0].toString());
                    point.put("value", safeNumericValue(row.length > 1 ? row[1] : null));
                    return point;
                })
                .toList();
    }

    private double safeNumericValue(Object value) {
        if (value == null) {
            return 0.0;
        }

        if (value instanceof Number number) {
            return Math.round(number.doubleValue() * 100.0) / 100.0;
        }

        try {
            return Math.round(Double.parseDouble(value.toString()) * 100.0) / 100.0;
        } catch (NumberFormatException ignored) {
            return 0.0;
        }
    }
}
