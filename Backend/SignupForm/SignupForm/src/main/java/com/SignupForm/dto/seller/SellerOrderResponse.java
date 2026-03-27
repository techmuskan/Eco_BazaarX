package com.SignupForm.dto.seller;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SellerOrderResponse {
    private Long orderId;
    private String orderNumber;
    private String customerName;
    private String customerEmail;
    private String status;
    private String sellerFulfillmentStatus;
    private LocalDateTime orderDate;
    private Integer totalUnits;
    private Double sellerRevenue;
    private Double sellerEmission;
    private List<SellerOrderItemResponse> items;
}
