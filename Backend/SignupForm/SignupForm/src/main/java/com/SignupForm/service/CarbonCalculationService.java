package com.SignupForm.service;

import com.SignupForm.entity.CarbonBreakdown;
import com.SignupForm.entity.CarbonData;
import org.springframework.stereotype.Service;

@Service
public class CarbonCalculationService {

    public void calculate(CarbonData carbonData) {

        if (carbonData == null || carbonData.getBreakdown() == null)
            return;

        CarbonBreakdown br = carbonData.getBreakdown();

        double m = safe(br.getManufacturing());
        double p = safe(br.getPackaging());
        double t = safe(br.getTransport());
        double h = safe(br.getHandling());

        double total = m + p + t + h;

        br.setManufacturing(round(m));
        br.setPackaging(round(p));
        br.setTransport(round(t));
        br.setHandling(round(h));

        carbonData.setTotalCO2ePerKg(round(total));
        carbonData.setMethod("automatic");
    }

    private double safe(Double value) {
        return value == null ? 0.0 : value;
    }

    private double round(double value) {
        return Math.round(value * 100.0) / 100.0;
    }
}