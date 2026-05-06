package com.graduateplatform.controller;

import com.graduateplatform.dto.request.UpdateProfileRequest;
import com.graduateplatform.dto.request.UpdateMyPostRequest;
import com.graduateplatform.dto.response.ApiResponse;
import jakarta.validation.Valid;
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

    @PutMapping("/me/profile")
    public ApiResponse<?> updateProfile(@Valid @RequestBody UpdateProfileRequest req, Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        return ApiResponse.ok(userService.updateProfile(userId, req), "资料已更新");
    }

    @GetMapping("/me/posts")
    public ApiResponse<?> myPosts(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size,
        Authentication auth
    ) {
        Long userId = (Long) auth.getPrincipal();
        return ApiResponse.ok(userService.getMyPosts(userId, page, size));
    }

    @GetMapping("/me/posts/{postId}")
    public ApiResponse<?> myPostDetail(@PathVariable Long postId, Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        return ApiResponse.ok(userService.getMyPost(userId, postId));
    }

    @GetMapping("/me/comments")
    public ApiResponse<?> myComments(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size,
        Authentication auth
    ) {
        Long userId = (Long) auth.getPrincipal();
        return ApiResponse.ok(userService.getMyComments(userId, page, size));
    }

    @GetMapping("/me/attempts")
    public ApiResponse<?> myAttempts(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size,
        @RequestParam(required = false) Boolean correct,
        @RequestParam(required = false) String keyword,
        @RequestParam(required = false) String dateFrom,
        @RequestParam(required = false) String dateTo,
        Authentication auth
    ) {
        Long userId = (Long) auth.getPrincipal();
        return ApiResponse.ok(userService.getMyAttempts(userId, page, size, correct, keyword, dateFrom, dateTo));
    }

    @PutMapping("/me/posts/{postId}")
    public ApiResponse<?> updateMyPost(@PathVariable Long postId,
                                       @Valid @RequestBody UpdateMyPostRequest req,
                                       Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        return ApiResponse.ok(userService.updateMyPost(userId, postId, req), "帖子已更新");
    }

    @DeleteMapping("/me/posts/{postId}")
    public ApiResponse<?> deleteMyPost(@PathVariable Long postId, Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        userService.deleteMyPost(userId, postId);
        return ApiResponse.ok(null, "帖子已删除");
    }

    @DeleteMapping("/me/comments/{commentId}")
    public ApiResponse<?> deleteMyComment(@PathVariable Long commentId, Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        userService.deleteMyComment(userId, commentId);
        return ApiResponse.ok(null, "评论已删除");
    }
}
