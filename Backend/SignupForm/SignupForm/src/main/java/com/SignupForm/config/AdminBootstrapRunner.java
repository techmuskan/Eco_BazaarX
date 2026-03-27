package com.SignupForm.config;

import com.SignupForm.entity.Users;
import com.SignupForm.enums.Role;
import com.SignupForm.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class AdminBootstrapRunner implements CommandLineRunner {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    @Value("${app.bootstrap.admin.enabled:false}")
    private boolean enabled;

    @Value("${app.bootstrap.admin.name:EcoBazaar Admin}")
    private String adminName;

    @Value("${app.bootstrap.admin.email:admin@ecobazar.local}")
    private String adminEmail;

    @Value("${app.bootstrap.admin.password:Admin@123}")
    private String adminPassword;

    @Value("${app.bootstrap.admin.phone:9999999999}")
    private String adminPhone;

    @Override
    public void run(String... args) {
        if (!enabled) {
            log.info("Bootstrap admin provisioning is disabled.");
            return;
        }

        if (userRepository.findByEmail(adminEmail).isPresent()) {
            log.info("Bootstrap admin already exists for email {}", adminEmail);
            return;
        }

        Users admin = new Users();
        admin.setName(adminName);
        admin.setEmail(adminEmail);
        admin.setPassword(passwordEncoder.encode(adminPassword));
        admin.setPhone(adminPhone);
        admin.setRole(Role.ADMIN);
        admin.setIsVerified(true);

        userRepository.save(admin);
        log.info("Bootstrap admin account created for email {}", adminEmail);
    }
}
