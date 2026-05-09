package com.graduateplatform.common.config;

import com.graduateplatform.common.security.JwtAuthFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;

    public SecurityConfig(JwtAuthFilter jwtAuthFilter) {
        this.jwtAuthFilter = jwtAuthFilter;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // ??? POST ??
                .requestMatchers(HttpMethod.POST, "/api/auth/register", "/api/auth/login", "/api/auth/send-code").permitAll()
                // ???????????? /api/** ????????? GET ??????
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                // ?????????/??????????????????
                .requestMatchers(HttpMethod.GET, "/api/job/fairs/**", "/api/job/postings/**").permitAll()
                .requestMatchers("/api/job/resume/**", "/api/job/applications/**", "/api/job/notifications/**",
                    "/api/job/preferences/**", "/api/job/recommendations/**").authenticated()
                // ??? GET ?????????/?????????
                .requestMatchers(HttpMethod.GET, "/api/**").permitAll()
                // ????????
                .requestMatchers(HttpMethod.POST, "/api/posts/**").authenticated()
                .requestMatchers(HttpMethod.POST, "/api/questions/*/attempt").authenticated()
                .requestMatchers("/api/auth/me", "/api/auth/logout", "/api/users/**").authenticated()
                // H2 ???
                .requestMatchers("/h2-console/**").permitAll()
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
            .headers(headers -> headers.frameOptions(fo -> fo.sameOrigin()));

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
