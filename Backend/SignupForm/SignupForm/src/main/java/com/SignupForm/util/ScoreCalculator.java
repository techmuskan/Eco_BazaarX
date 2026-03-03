package com.SignupForm.util;

public class ScoreCalculator {

    /**
     * Calculates final recommendation score
     * based on normalized eco score and price comparison
     *
     * @param ecoScore       Eco-friendliness score (0-100)
     * @param productPrice   Price of the current product
     * @param alternativePrice Price of the alternative product
     * @return Recommendation score (0.0 - 1.0)
     */
    public static double calculateRecommendationScore(
            double ecoScore,
            double productPrice,
            double alternativePrice) {

        double normalizedEco = normalizeEcoScore(ecoScore);
        double priceScore = calculatePriceScore(productPrice, alternativePrice);

        return (normalizedEco * AppConstants.GREEN_SCORE_WEIGHT)
                + (priceScore * AppConstants.PRICE_SCORE_WEIGHT);
    }

    /**
     * Normalize eco score to 0.0 - 1.0
     */
    public static double normalizeEcoScore(double ecoScore) {
        return Math.max(0.0, Math.min(ecoScore / 100.0, 1.0));
    }

    /**
     * Calculates a score for price comparison.
     * If alternative is cheaper → higher score.
     */
    private static double calculatePriceScore(double productPrice, double alternativePrice) {

        if (alternativePrice <= 0 || productPrice <= 0) return 0.0;

        double difference = productPrice - alternativePrice;

        if (difference <= 0) {
            return 0.5; // Same price or product is cheaper → moderate score
        }

        return Math.min(difference / productPrice, 1.0); // Max 1.0
    }
}