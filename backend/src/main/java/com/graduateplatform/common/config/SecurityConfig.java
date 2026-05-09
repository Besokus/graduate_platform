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
                // 认证相关 POST 接口放行
                .requestMatchers(HttpMethod.POST, "/api/auth/register", "/api/auth/login", "/api/auth/send-code").permitAll()
                // 管理员接口需先于通用 /api/** GET 放行规则声明
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                // 就业方向公开查询接口放行，其余就业个人数据接口需登录
                .requestMatchers(HttpMethod.GET, "/api/job/fairs/**", "/api/job/postings/**").permitAll()
                .requestMatchers("/api/job/resume/**", "/api/job/applications/**", "/api/job/notifications/**",
                    "/api/job/preferences/**", "/api/job/recommendations/**").authenticated()
                // 通用 GET 接口默认放行，支持未登录浏览内容
                .requestMatchers(HttpMethod.GET, "/api/**").permitAll()
                // 写入、答题和用户信息接口需登录
                .requestMatchers(HttpMethod.POST, "/api/posts/**").authenticated()
                .requestMatchers(HttpMethod.POST, "/api/questions/*/attempt").authenticated()
                .requestMatchers("/api/auth/me", "/api/auth/logout", "/api/users/**").authenticated()
                // H2 控制台放行
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
