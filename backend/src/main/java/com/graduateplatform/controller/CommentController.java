package com.graduateplatform.controller;

import com.graduateplatform.dto.request.CreateCommentRequest;
import com.graduateplatform.dto.response.ApiResponse;
import com.graduateplatform.service.CommentService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/posts")
public class CommentController {

    private final CommentService commentService;

    public CommentController(CommentService commentService) {
        this.commentService = commentService;
    }

    @GetMapping("/{postId}/comments")
    public ApiResponse<?> list(@PathVariable Long postId, Authentication auth) {
        return ApiResponse.ok(commentService.getComments(postId, getCurrentUserId(auth), isAdmin(auth)));
    }

    @PostMapping("/{postId}/comments")
    public ApiResponse<?> create(@PathVariable Long postId, @Valid @RequestBody CreateCommentRequest req, Authentication auth) {
        Long currentUserId = getCurrentUserId(auth);
        if (currentUserId == null) {
            return ApiResponse.fail("未登录或登录已失效");
        }
        return ApiResponse.ok(commentService.createComment(postId, req, currentUserId), "评论成功");
    }

    private Long getCurrentUserId(Authentication auth) {
        if (auth == null || auth.getPrincipal() == null) {
            return null;
        }
        Object principal = auth.getPrincipal();
        return principal instanceof Long ? (Long) principal : null;
    }

    private boolean isAdmin(Authentication auth) {
        if (auth == null || auth.getAuthorities() == null) {
            return false;
        }
        for (GrantedAuthority authority : auth.getAuthorities()) {
            if ("ROLE_ADMIN".equals(authority.getAuthority())) {
                return true;
            }
        }
        return false;
    }
}
