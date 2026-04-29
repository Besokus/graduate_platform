package com.graduateplatform.controller;

import com.graduateplatform.dto.response.ApiResponse;
import com.graduateplatform.service.UserService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/me/profile")
    public ApiResponse<?> profile(Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        return ApiResponse.ok(userService.getProfile(userId));
    }

    @GetMapping("/me/dashboard")
    public ApiResponse<?> dashboard(Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        return ApiResponse.ok(userService.getDashboard(userId));
    }
}
