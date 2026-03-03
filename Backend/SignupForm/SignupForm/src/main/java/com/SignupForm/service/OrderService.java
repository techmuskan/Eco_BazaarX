package com.SignupForm.service;

import com.SignupForm.dto.address.AddressResponse;
import com.SignupForm.dto.order.CheckoutRequest;
import com.SignupForm.dto.order.OrderItemResponse;
import com.SignupForm.dto.order.OrderResponse;
import com.SignupForm.entity.*;
import com.SignupForm.repository.*;
import com.SignupForm.util.AppConstants;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class OrderService {

    private final CartRepository cartRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final AddressRepository addressRepository;

    // ================= PLACE ORDER =================
    public OrderResponse placeOrder(String email, CheckoutRequest request) {

        Users user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Cart cart = cartRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Cart not found"));

        if (cart.getCartItems() == null || cart.getCartItems().isEmpty()) {
            throw new RuntimeException("Cart is empty");
        }

        Address addressEntity = addressRepository.findById(request.getAddressId())
                .orElseThrow(() -> new RuntimeException("Address not found"));

        double subtotal = 0.0;
        double totalEmission = 0.0;

        // 1️⃣ Create Order FIRST
        Order order = Order.builder()
                .user(user)
                .orderDate(LocalDateTime.now())
                .status(AppConstants.ORDER_PROCESSING)
                .paymentMethod(request.getPaymentMethod())
                .customerName(request.getFullName())
                .email(request.getEmail() != null ? request.getEmail() : user.getEmail())
                .address(addressEntity)
                .orderNumber(AppConstants.ORDER_PREFIX + System.currentTimeMillis())
                .build();

        List<OrderItem> orderItems = new ArrayList<>();

        // 2️⃣ Convert CartItems → OrderItems
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

        // Save order (CascadeType.ALL should save items)
        Order savedOrder = orderRepository.save(order);

        // 3️⃣ Clear cart
        cart.getCartItems().clear();
        cartRepository.save(cart);

        return mapToOrderResponse(savedOrder);
    }

    // ================= PAY ORDER =================
    public OrderResponse payOrder(Long orderId, String email) {

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (!order.getUser().getEmail().equals(email)) {
            throw new RuntimeException("Access denied");
        }

        order.setStatus(AppConstants.ORDER_PLACED);

        return mapToOrderResponse(order);
    }

    // ================= GET USER ORDERS =================
    public List<OrderResponse> getOrdersForUser(String email) {

        Users user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<OrderResponse> responses = new ArrayList<>();

        for (Order order : orderRepository.findByUser(user)) {
            responses.add(mapToOrderResponse(order));
        }

        return responses;
    }

    // ================= GET SINGLE ORDER =================
    public OrderResponse getOrderById(Long orderId, String email) {

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (!order.getUser().getEmail().equals(email)) {
            throw new RuntimeException("Access denied");
        }

        return mapToOrderResponse(order);
    }

    // ================= MAP ORDER → DTO =================
    private OrderResponse mapToOrderResponse(Order order) {

        List<OrderItemResponse> itemResponses = new ArrayList<>();

        if (order.getOrderItems() != null) {
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
        }

        AddressResponse addressResponse = null;

        if (order.getAddress() != null) {
            addressResponse = AddressResponse.builder()
                    .id(order.getAddress().getId())
                    .street(order.getAddress().getStreet())
                    .city(order.getAddress().getCity())
                    .state(order.getAddress().getState())
                    .zipCode(order.getAddress().getZipCode())
                    .build();
        }

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