package com.SignupForm.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
<<<<<<< HEAD
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
=======
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
>>>>>>> c3670d096ec4ec373c9e00b78303e75bf37d6fd4
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {
    private final JwtFilter jwtFilter;

    public SecurityConfig(JwtFilter jwtFilter) {
        this.jwtFilter = jwtFilter;
    }

    private final JwtFilter jwtFilter; // Injected your existing JwtFilter

    public SecurityConfig(JwtFilter jwtFilter) {
        this.jwtFilter = jwtFilter;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
<<<<<<< HEAD
                // 1. Disable CSRF (using JWT instead)
                .csrf(AbstractHttpConfigurer::disable)

                // 2. Enable CORS with the bean defined below
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                // 3. Define Endpoint Permissions
                .authorizeHttpRequests(auth -> auth
                        // Allow anyone to Login or Signup
                        .requestMatchers("/user/login", "/user/addUser").permitAll()

                        // Allow anyone to view products
                        .requestMatchers(HttpMethod.GET, "/api/products/**", "/api/product/**").permitAll()

                        // Only ADMIN can POST, PUT, or DELETE products
                        // Note: .hasRole("ADMIN") matches your filter's "ROLE_ADMIN" authority
                        .requestMatchers(HttpMethod.POST, "/api/product/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/product/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/product/**").hasRole("ADMIN")

                        // Any other request requires a valid login
                        .anyRequest().authenticated()
                )

                // 4. Add your JWT Filter before the standard UsernamePassword filter
=======
                .cors(cors -> {})
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers("/user/login", "/user/addUser", "/user/forgot", "/user/reset").permitAll()
                        .requestMatchers("/error").permitAll()
                        .anyRequest().authenticated()
                )
>>>>>>> c3670d096ec4ec373c9e00b78303e75bf37d6fd4
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

<<<<<<< HEAD
    /**
     * Configures CORS to allow your React application (port 3000)
     * to access the Spring Boot API (port 8080).
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // Allow your React Frontend origin
        configuration.setAllowedOrigins(List.of("http://localhost:3000"));

        // Allow common HTTP methods
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));

        // Allow the Authorization header for JWT tokens
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "Cache-Control"));

        // Allow cookies/auth headers to be sent
=======
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("http://localhost:3000", "http://localhost:3001"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
>>>>>>> c3670d096ec4ec373c9e00b78303e75bf37d6fd4
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
<<<<<<< HEAD
}
=======
}
>>>>>>> c3670d096ec4ec373c9e00b78303e75bf37d6fd4
