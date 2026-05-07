package com.graduateplatform.admin.controller;

import com.graduateplatform.admin.dto.ReviewReportRequest;
import com.graduateplatform.common.dto.ApiResponse;
import com.graduateplatform.admin.service.AdminService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/dashboard")
    public ApiResponse<?> dashboard() {
        return ApiResponse.ok(adminService.getDashboard());
    }

    // ==================== 内容审核 ====================

    @GetMapping("/posts/pending")
    public ApiResponse<?> pendingPosts(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size
    ) {
        return ApiResponse.ok(adminService.getPendingPosts(page, size));
    }

    @GetMapping("/posts")
    public ApiResponse<?> reviewList(
        @RequestParam(required = false) String status,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size
    ) {
        return ApiResponse.ok(adminService.getReviewList(status, page, size));
    }

    @PutMapping("/posts/{id}/review")
    public ApiResponse<?> reviewPost(@PathVariable Long id,
                                     @RequestBody Map<String, String> body,
                                     Authentication auth) {
        String action = body.get("action");
        String reason = body.getOrDefault("reason", "");
        Long adminId = (Long) auth.getPrincipal();
        return ApiResponse.ok(adminService.reviewPost(id, adminId, action, reason), "操作成功");
    }

    @GetMapping("/reports")
    public ApiResponse<?> reports(
        @RequestParam(required = false) String status,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size
    ) {
        return ApiResponse.ok(adminService.getReports(status, page, size));
    }

    @PutMapping("/reports/{id}/review")
    public ApiResponse<?> reviewReport(@PathVariable Long id,
                                       @Valid @RequestBody ReviewReportRequest req,
                                       Authentication auth) {
        Long adminId = (Long) auth.getPrincipal();
        return ApiResponse.ok(
            adminService.reviewReport(id, adminId, req.getAction(), req.getNote()),
            "举报处理完成"
        );
    }

    // ==================== 用户管理 ====================

    @GetMapping("/users")
    public ApiResponse<?> users(
        @RequestParam(required = false) String target,
        @RequestParam(required = false) String status,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size
    ) {
        return ApiResponse.ok(adminService.getUsers(target, status, page, size));
    }

    @PutMapping("/users/{id}/status")
    public ApiResponse<?> updateUserStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String newStatus = body.get("status");
        String reason = body.getOrDefault("reason", "");
        return ApiResponse.ok(adminService.updateUserStatus(id, newStatus, reason), "用户状态已更新");
    }
}
