package com.SignupForm.service;

import com.SignupForm.dto.seller.SellerDashboardResponse;
import com.SignupForm.dto.seller.SellerOrderItemResponse;
import com.SignupForm.dto.seller.SellerOrderResponse;
import com.SignupForm.dto.seller.UpdateSellerOrderStatusRequest;
import com.SignupForm.entity.OrderItem;
import com.SignupForm.entity.Product;
import com.SignupForm.entity.SellerProfile;
import com.SignupForm.entity.Users;
import com.SignupForm.repository.OrderItemRepository;
import com.SignupForm.repository.ProductRepository;
import com.SignupForm.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class SellerService {

    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final OrderItemRepository orderItemRepository;
    private final SellerProfileService sellerProfileService;

    public SellerDashboardResponse getDashboard(String email) {
        Users seller = getSeller(email);
        SellerProfile profile = sellerProfileService.getProfileEntityByEmail(email);
        List<Product> products = productRepository.findBySellerOwnerEmailOrderByCreatedAtDesc(email);
        List<SellerOrderResponse> sellerOrders = getSellerOrders(email);

        long approvedListings = productRepository.countBySellerOwnerEmailAndStatus(email, "Approved");
        long ecoListings = productRepository.countBySellerOwnerEmailAndIsEcoFriendlyTrue(email);
        long totalListings = productRepository.countBySellerOwnerEmail(email);
        long pendingListings = totalListings - approvedListings;
        double revenue = sellerOrders.stream().mapToDouble(order -> order.getSellerRevenue() == null ? 0.0 : order.getSellerRevenue()).sum();
        double totalEmission = sellerOrders.stream().mapToDouble(order -> order.getSellerEmission() == null ? 0.0 : order.getSellerEmission()).sum();

        return SellerDashboardResponse.builder()
                .sellerProfileId(profile.getId())
                .storeName(profile.getStoreName())
                .sellerName(seller.getName())
                .storeDescription(profile.getStoreDescription())
                .contactEmail(profile.getContactEmail())
                .contactPhone(profile.getContactPhone())
                .approved(profile.getApproved())
                .totalListings(totalListings)
                .approvedListings(approvedListings)
                .pendingListings(Math.max(pendingListings, 0))
                .ecoListings(ecoListings)
                .totalOrders(sellerOrders.size())
                .sellerRevenue(revenue)
                .totalEmission(totalEmission)
                .recentProducts(products.stream().limit(6).toList())
                .recentOrders(sellerOrders.stream().limit(8).toList())
                .build();
    }

    public List<Product> getSellerProducts(String email) {
        getSeller(email);
        return productRepository.findBySellerOwnerEmailOrderByCreatedAtDesc(email);
    }

    public List<SellerOrderResponse> getSellerOrders(String email) {
        getSeller(email);

        List<OrderItem> orderItems = orderItemRepository.findBySellerEmailOrderByOrder_OrderDateDesc(email);
        Map<Long, SellerOrderResponse> groupedOrders = new LinkedHashMap<>();

        for (OrderItem item : orderItems) {
            if (item.getOrder() == null) {
                continue;
            }

            Long orderId = item.getOrder().getId();
            SellerOrderResponse existing = groupedOrders.get(orderId);

            if (existing == null) {
                existing = SellerOrderResponse.builder()
                        .orderId(orderId)
                        .orderNumber(item.getOrder().getOrderNumber())
                        .customerName(item.getOrder().getCustomerName())
                        .customerEmail(item.getOrder().getEmail())
                        .status(item.getOrder().getStatus())
                        .sellerFulfillmentStatus(item.getSellerFulfillmentStatus())
                        .orderDate(item.getOrder().getOrderDate())
                        .totalUnits(0)
                        .sellerRevenue(0.0)
                        .sellerEmission(0.0)
                        .items(new ArrayList<>())
                        .build();
                groupedOrders.put(orderId, existing);
            }

            existing.setTotalUnits(existing.getTotalUnits() + item.getQuantity());
            existing.setSellerRevenue(existing.getSellerRevenue() + item.getSubtotal());
            existing.setSellerEmission(existing.getSellerEmission() + item.getEmission());
            existing.setSellerFulfillmentStatus(resolveAggregateFulfillment(existing.getSellerFulfillmentStatus(), item.getSellerFulfillmentStatus()));
            existing.getItems().add(SellerOrderItemResponse.builder()
                    .productId(item.getProductId())
                    .productName(item.getProductName())
                    .quantity(item.getQuantity())
                    .subtotal(item.getSubtotal())
                    .emission(item.getEmission())
                    .fulfillmentStatus(item.getSellerFulfillmentStatus())
                    .build());
        }

        return new ArrayList<>(groupedOrders.values());
    }

    public SellerOrderResponse updateSellerOrderStatus(String email, Long orderId, UpdateSellerOrderStatusRequest request) {
        getSeller(email);

        String nextStatus = normalizeFulfillmentStatus(request.getFulfillmentStatus());
        List<OrderItem> sellerItems = orderItemRepository.findByOrderIdAndSellerEmail(orderId, email);

        if (sellerItems.isEmpty()) {
            throw new RuntimeException("Seller order not found");
        }

        sellerItems.forEach(item -> item.setSellerFulfillmentStatus(nextStatus));
        orderItemRepository.saveAll(sellerItems);

        return getSellerOrders(email).stream()
                .filter(order -> orderId.equals(order.getOrderId()))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Updated seller order could not be loaded"));
    }

    private Users getSeller(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Seller not found"));
    }

    private String normalizeFulfillmentStatus(String status) {
        if (status == null || status.isBlank()) {
            throw new RuntimeException("Fulfillment status is required");
        }

        String normalized = status.trim().toUpperCase();
        Set<String> allowed = Set.of("PENDING", "PACKING", "READY_TO_SHIP", "SHIPPED");
        if (!allowed.contains(normalized)) {
            throw new RuntimeException("Invalid seller fulfillment status");
        }

        return normalized;
    }

    private String resolveAggregateFulfillment(String current, String candidate) {
        if (current == null || current.isBlank()) {
            return candidate;
        }

        if (candidate == null || candidate.isBlank() || current.equals(candidate)) {
            return current;
        }

        return "MIXED";
    }

}
