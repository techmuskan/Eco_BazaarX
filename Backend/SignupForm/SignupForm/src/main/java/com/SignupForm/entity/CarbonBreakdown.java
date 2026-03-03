package com.SignupForm.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Embeddable
public class CarbonBreakdown {
    @Column(columnDefinition = "DECIMAL(10,2)")
    private Double manufacturing;
    @Column(columnDefinition = "DECIMAL(10,2)")
    private Double packaging;
    @Column(columnDefinition = "DECIMAL(10,2)")
    private Double transport;
    @Column(columnDefinition = "DECIMAL(10,2)")
    private Double handling;
}