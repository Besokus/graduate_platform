package com.graduateplatform.controller;

import com.graduateplatform.dto.request.CreatePostRequest;
import com.graduateplatform.dto.response.ApiResponse;
import com.graduateplatform.service.PostService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/posts")
public class PostController {

    private final PostService postService;

    public PostController(PostService postService) {
        this.postService = postService;
    }

    @GetMapping
    public ApiResponse<?> list(
        @RequestParam(required = false) String category,
        @RequestParam(required = false) String keyword,
        @RequestParam(defaultValue = "latest") String sort,
        @RequestParam(required = false) String tag,
        @RequestParam(required = false) Boolean hasAttachment,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size,
        Authentication auth
    ) {
        boolean includeMembers = getCurrentUserId(auth) != null;
        return ApiResponse.ok(postService.getPosts(category, keyword, sort, tag, hasAttachment, page, size, includeMembers));
    }

    @GetMapping("/{id}")
    public ApiResponse<?> detail(@PathVariable Long id, Authentication auth) {
        return ApiResponse.ok(postService.getPostDetail(id, getCurrentUserId(auth), isAdmin(auth)));
    }

    @PostMapping
    public ApiResponse<?> create(@Valid @RequestBody CreatePostRequest req, Authentication auth) {
        Long currentUserId = getCurrentUserId(auth);
        if (currentUserId == null) {
            return ApiResponse.fail("未登录或登录已失效");
        }
        return ApiResponse.ok(postService.createPost(req, currentUserId), "发布成功");
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
