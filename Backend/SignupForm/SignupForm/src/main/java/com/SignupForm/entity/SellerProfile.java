package com.SignupForm.entity;

import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "seller_profiles")
public class SellerProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private Users user;

    @Column(nullable = false)
    private String storeName;

    @Column(columnDefinition = "TEXT")
    private String storeDescription;

    private String contactEmail;

    private String contactPhone;

    @Builder.Default
    @Column(nullable = false)
    private Boolean approved = true;
}
