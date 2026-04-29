package com.graduateplatform.controller;

import com.graduateplatform.dto.request.LoginRequest;
import com.graduateplatform.dto.request.RegisterRequest;
import com.graduateplatform.dto.response.ApiResponse;
import com.graduateplatform.service.AuthService;
import com.graduateplatform.service.VerificationCodeService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final VerificationCodeService codeService;

    public AuthController(AuthService authService, VerificationCodeService codeService) {
        this.authService = authService;
        this.codeService = codeService;
    }

    @PostMapping("/send-code")
    public ApiResponse<?> sendCode(@RequestBody Map<String, String> body) {
        String target = body.get("target");
        String type = body.get("type"); // phone / email / studentId
        if (target == null || target.isBlank() || type == null || type.isBlank()) {
            return ApiResponse.fail("参数不完整");
        }
        codeService.sendCode(target, type);
        return ApiResponse.ok(null, "验证码已发送，5分钟内有效");
    }

    @PostMapping("/register")
    public ApiResponse<?> register(@Valid @RequestBody RegisterRequest req) {
        // 校验验证码
        String verifyTarget = resolveVerifyTarget(req);
        if (verifyTarget != null) {
            codeService.verifyAndConsume(verifyTarget, req.getAccountType(), req.getVerifyCode());
        }
        return ApiResponse.ok(authService.register(req), "注册成功");
    }

    @PostMapping("/login")
    public ApiResponse<?> login(@Valid @RequestBody LoginRequest req) {
        return ApiResponse.ok(authService.login(req), "登录成功");
    }

    @GetMapping("/me")
    public ApiResponse<?> me(Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        return ApiResponse.ok(authService.getMe(userId));
    }

    @PostMapping("/logout")
    public ApiResponse<?> logout(Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        authService.logout(userId);
        return ApiResponse.ok(null, "已登出");
    }

    private String resolveVerifyTarget(RegisterRequest req) {
        String type = req.getAccountType();
        if ("phone".equals(type)) return req.getPhone();
        if ("email".equals(type)) return req.getEmail();
        if ("studentId".equals(type)) return req.getStudentId();
        return null;
    }
}
