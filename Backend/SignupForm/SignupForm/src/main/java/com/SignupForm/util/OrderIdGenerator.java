package com.SignupForm.util;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Random;

public class OrderIdGenerator {

    private static final Random random = new Random();
    private static final DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyyMMdd");

    public static String generateOrderId() {
        String datePart = LocalDate.now().format(formatter);
        int randomNumber = 10000 + random.nextInt(90000);
        return AppConstants.ORDER_PREFIX + datePart + "-" + randomNumber;
    }
}