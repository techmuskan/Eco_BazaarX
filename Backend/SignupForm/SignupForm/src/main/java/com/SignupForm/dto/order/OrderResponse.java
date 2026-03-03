package com.SignupForm.dto.order;

import lombok.*;
import com.SignupForm.dto.address.AddressResponse;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderResponse {

    private Long orderId;
    private String orderNumber;
    private String status;
    private Double totalAmount;
    private Double totalEmission;
    private Double shipping;
    private String paymentMethod;
    private String customerName;
    private String email;
    private AddressResponse address;
    private String image;
    private LocalDateTime orderDate;

    private List<OrderItemResponse> items;
}