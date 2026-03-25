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

        if (cart.getCartItems() == null || cart.getCartItems().isEmpty()) {
            throw new RuntimeException("Cart is empty");
        }

        // --- FIXED ADDRESS LOGIC ---
        Address address;
        if (request.getAddressId() != null) {
            // Case 1: Use an existing address ID from the database
            address = addressRepository.findById(request.getAddressId())
                    .orElseThrow(() -> new RuntimeException("Selected address not found"));
        } else if (request.getNewAddress() != null) {
            // Case 2: Save the new address sent from React 'newAddress' field
            address = Address.builder()
                    .fullName(request.getNewAddress().getFullName()) // Using the DTO's name
                    .street(request.getNewAddress().getStreet())
                    .city(request.getNewAddress().getCity())
                    .state(request.getNewAddress().getState())
                    .zipCode(request.getNewAddress().getZipCode())
                    .user(user)
                    .build();
            address = addressRepository.save(address);
        } else {
            // This prevents the NullPointerException you were seeing
            throw new RuntimeException("No delivery address details provided in request");
        }

        // Create Order Object
        Order order = Order.builder()
                .orderNumber(OrderIdGenerator.generateOrderId())
                .user(user)
                .address(address)
                .status(AppConstants.ORDER_PROCESSING)
                .orderDate(LocalDateTime.now())
                .paymentMethod(request.getPaymentMethod())
                // Use Name from request, else fall back to the address name
                .customerName(request.getFullName() != null ? request.getFullName() : address.getFullName())
                .email(request.getEmail() != null ? request.getEmail() : user.getEmail())
                .build();

        List<OrderItem> orderItems = new ArrayList<>();
        // --- CALCULATE SUBTOTAL AND EMISSION ---
        double subtotal = 0.0;
        double totalEmission = 0.0;

        for (CartItem ci : cart.getCartItems()) {
            Product product = ci.getProduct();
            int quantity = ci.getQuantity();
            double price = product.getPrice();
            double emissionPerItem = product.getEmission() != null ? product.getEmission() : 0.5;

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

// --- INITIAL TOTAL WITHOUT SHIPPING ---
        double totalAmount = subtotal;

// --- SHIPPING LOGIC BASED ON TOTAL AMOUNT ---
        double shipping = 0.0;
        if (totalAmount < 500) {
            shipping = 40.0;   // ✅ Add Rs 40 if final total < 500
            totalAmount += shipping;
        }

        order.setShipping(shipping);
        order.setTotalAmount(totalAmount);
        order.setTotalEmission(totalEmission);
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

            String productImage = null;
            if (oi.getProduct() != null && oi.getProduct().getImage() != null) {
                String img = oi.getProduct().getImage();
                // Only prepend backend URL if the image path is relative
                if (img.startsWith("http")) {
                    productImage = img; // already a full URL
                } else {
                    productImage = "http://localhost:8080" + img; // relative path
                }
            }
            itemResponses.add(OrderItemResponse.builder()
                    .productId(oi.getProductId())
                    .productName(oi.getProductName())
                    .quantity(oi.getQuantity())
                    .price(oi.getPrice())
                    .subtotal(oi.getSubtotal())
                    .emission(oi.getEmission())
                    .image(productImage)
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