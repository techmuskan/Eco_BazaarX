package com.SignupForm.dto.seller;

import com.SignupForm.entity.Product;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SellerDashboardResponse {
    private Long sellerProfileId;
    private String storeName;
    private String sellerName;
    private String storeDescription;
    private String contactEmail;
    private String contactPhone;
    private Boolean approved;
    private long totalListings;
    private long approvedListings;
    private long pendingListings;
    private long ecoListings;
    private long totalOrders;
    private double sellerRevenue;
    private double totalEmission;
    private List<Product> recentProducts;
    private List<SellerOrderResponse> recentOrders;
}
