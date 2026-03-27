package com.SignupForm.service;

import com.SignupForm.dto.insights.CarbonInsightsResponse;
import com.SignupForm.entity.Order;
import com.SignupForm.entity.OrderItem;
import com.SignupForm.entity.Product;
import com.SignupForm.repository.OrderRepository;
import com.SignupForm.repository.ProductRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InsightsService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;

    @Transactional(readOnly = true)
    public CarbonInsightsResponse getInsightsData(String email) {

        // 1. Fetch orders sorted by date
        List<Order> orders = orderRepository.findByEmailOrderByOrderDateAsc(email);
        List<Order> datedOrders = orders.stream()
                .filter(order -> order.getOrderDate() != null)
                .toList();

        // 2. Monthly Trend Calculation
        Map<String, Double> trendMap = datedOrders.stream()
                .collect(Collectors.groupingBy(
                        o -> o.getOrderDate().getMonth().name().substring(0, 3),
                        LinkedHashMap::new,
                        Collectors.summingDouble(o ->
                                Optional.ofNullable(o.getTotalEmission()).orElse(0.0)
                        )
                ));

        List<CarbonInsightsResponse.MonthlyTrendDTO> trends = trendMap.entrySet().stream()
                .map(e -> new CarbonInsightsResponse.MonthlyTrendDTO(
                        e.getKey(),
                        e.getValue()
                ))
                .collect(Collectors.toList());

        // 3. Total Footprint
        Double total = orders.stream()
                .mapToDouble(o -> Optional.ofNullable(o.getTotalEmission()).orElse(0.0))
                .sum();

        // 4. Best Month (lowest emission)
        String bestMonth = trendMap.entrySet().stream()
                .min(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse("N/A");

        // 5. Top Products Calculation
        Map<Long, CarbonInsightsResponse.TopProductDTO> productMap = new HashMap<>();

        for (Order order : orders) {

            if (order.getOrderItems() == null) continue;

            for (OrderItem item : order.getOrderItems()) {

                Long productId = item.getProductId();
                if (productId == null) continue;

                Optional<Product> optionalProduct = productRepository.findById(productId);
                if (optionalProduct.isEmpty()) continue;

                Product product = optionalProduct.get();

                Double emission = Optional.ofNullable(item.getEmission()).orElse(0.0);

                // ✅ Correct field (Cloudinary URL)
                String imageUrl = product.getImage();

                if (!productMap.containsKey(productId)) {

                    productMap.put(productId,
                            new CarbonInsightsResponse.TopProductDTO(
                                    productId,
                                    product.getName(),
                                    emission,
                                    imageUrl // ✅ Direct URL
                            )
                    );

                } else {

                    CarbonInsightsResponse.TopProductDTO existing = productMap.get(productId);
                    existing.setEmission(existing.getEmission() + emission);
                }
            }
        }

        List<CarbonInsightsResponse.TopProductDTO> topProducts = productMap.values()
                .stream()
                .filter(p -> p.getEmission() < 20) // ✅ FILTER HERE
                .sorted(Comparator.comparing(
                        CarbonInsightsResponse.TopProductDTO::getEmission
                ).reversed())
                .limit(4)
                .collect(Collectors.toList());

        // 6. Final Response
        return CarbonInsightsResponse.builder()
                .totalFootprint(total)
                .averageMonthly(orders.isEmpty() ? 0.0 : total / orders.size())
                .bestMonth(bestMonth)
                .monthlyTrends(trends)
                .topProducts(topProducts)
                .build();
    }

    // Admin Module
    public Map<String, Object> getAdminGlobalReport() {

        Double systemTotal = orderRepository.getSystemWideTotalEmission();

        Map<String, Object> report = new HashMap<>();
        report.put("globalCarbonSaved", systemTotal != null ? systemTotal : 0.0);

        return report;
    }
}
