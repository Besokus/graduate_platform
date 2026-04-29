package com.graduateplatform.config;

import com.graduateplatform.security.JwtAuthFilter;
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
                // 公开的 POST 请求
                .requestMatchers(HttpMethod.POST, "/api/auth/register", "/api/auth/login", "/api/auth/send-code").permitAll()
                // 公开的 GET 请求
                .requestMatchers(HttpMethod.GET, "/api/**").permitAll()
                // 需要认证的写操作
                .requestMatchers(HttpMethod.POST, "/api/posts/**").authenticated()
                .requestMatchers(HttpMethod.POST, "/api/questions/*/attempt").authenticated()
                .requestMatchers("/api/auth/me", "/api/auth/logout", "/api/users/**").authenticated()
                // 管理员接口
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                // H2 控制台
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
