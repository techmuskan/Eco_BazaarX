package com.SignupForm.service;

import com.SignupForm.dto.address.AddressResponse;
import com.SignupForm.dto.order.CheckoutRequest;
import com.SignupForm.dto.order.OrderItemResponse;
import com.SignupForm.dto.order.OrderResponse;
import com.SignupForm.entity.*;
import com.SignupForm.repository.*;
import com.SignupForm.util.AppConstants;
import com.SignupForm.util.OrderIdGenerator;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class CheckoutService {

    private final UserRepository userRepository;
    private final CartRepository cartRepository;
    private final OrderRepository orderRepository;
    private final AddressRepository addressRepository;

    // ================= PLACE ORDER =================
    public OrderResponse checkout(Long userId, CheckoutRequest request) {

        Users user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Cart cart = cartRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Cart not found"));

        if (cart.getCartItems().isEmpty()) {
            throw new RuntimeException("Cart is empty");
        }

        // Save Address
        Address address = Address.builder()
                .street(request.getAddress().getStreet())
                .city(request.getAddress().getCity())
                .state(request.getAddress().getState())
                .zipCode(request.getAddress().getZipCode())
                .user(user)
                .build();

        addressRepository.save(address);

        // Create Order FIRST
        Order order = Order.builder()
                .orderNumber(OrderIdGenerator.generateOrderId())
                .user(user)
                .address(address)
                .status(AppConstants.ORDER_PROCESSING)
                .orderDate(LocalDateTime.now())
                .paymentMethod(request.getPaymentMethod())
                .customerName(request.getFullName())
                .email(request.getEmail() != null ? request.getEmail() : user.getEmail())
                .build();

        List<OrderItem> orderItems = new ArrayList<>();
        double subtotal = 0.0;
        double totalEmission = 0.0;

        for (CartItem ci : cart.getCartItems()) {

            Product product = ci.getProduct();
            int quantity = ci.getQuantity();
            double price = product.getPrice();
            double emissionPerItem =
                    product.getEmission() != null ? product.getEmission() : 0.5;

            double itemSubtotal = price * quantity;
            double itemEmission = emissionPerItem * quantity;

            subtotal += itemSubtotal;
            totalEmission += itemEmission;

            OrderItem orderItem = OrderItem.builder()
                    .order(order)
                    .product(product)
                    .productName(product.getName())
                    .quantity(quantity)
                    .price(price)
                    .subtotal(itemSubtotal)
                    .emission(itemEmission)
                    .build();

            orderItems.add(orderItem);
        }

        double shipping = subtotal > 100 ? 0.0 : 7.5;

        order.setTotalAmount(subtotal + shipping);
        order.setTotalEmission(totalEmission);
        order.setShipping(shipping);
        order.setOrderItems(orderItems);

        Order savedOrder = orderRepository.save(order);

        // Clear cart
        cart.getCartItems().clear();
        cartRepository.save(cart);

        return mapToOrderResponse(savedOrder);
    }

    // ================= PAY ORDER =================
    public OrderResponse payOrder(Long orderId, Long userId) {

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (!order.getUser().getId().equals(userId)) {
            throw new RuntimeException("Access denied");
        }

        order.setStatus(AppConstants.ORDER_PLACED);

        return mapToOrderResponse(order);
    }

    // ================= MAP ORDER → DTO =================
    private OrderResponse mapToOrderResponse(Order order) {

        List<OrderItemResponse> itemResponses = new ArrayList<>();

        for (OrderItem oi : order.getOrderItems()) {

            itemResponses.add(OrderItemResponse.builder()
                    .productId(oi.getProductId())
                    .productName(oi.getProductName())
                    .quantity(oi.getQuantity())
                    .price(oi.getPrice())
                    .subtotal(oi.getSubtotal())
                    .emission(oi.getEmission())
                    .build());
        }

        AddressResponse addressResponse = AddressResponse.builder()
                .id(order.getAddress().getId())
                .street(order.getAddress().getStreet())
                .city(order.getAddress().getCity())
                .state(order.getAddress().getState())
                .zipCode(order.getAddress().getZipCode())
                .build();

        return OrderResponse.builder()
                .orderId(order.getId())
                .orderNumber(order.getOrderNumber())
                .status(order.getStatus())
                .totalAmount(order.getTotalAmount())
                .totalEmission(order.getTotalEmission())
                .shipping(order.getShipping())
                .orderDate(order.getOrderDate())
                .paymentMethod(order.getPaymentMethod())
                .customerName(order.getCustomerName())
                .email(order.getEmail())
                .address(addressResponse)
                .items(itemResponses)
                .build();
    }
}