package com.graduateplatform.community.controller;

import com.graduateplatform.community.dto.CreatePostRequest;
import com.graduateplatform.community.dto.ReportPostRequest;
import com.graduateplatform.common.dto.ApiResponse;
import com.graduateplatform.community.service.PostService;
import jakarta.validation.Valid;
import org.springframework.http.MediaType;
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

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<?> create(@Valid @ModelAttribute CreatePostRequest req, Authentication auth) {
        Long currentUserId = getCurrentUserId(auth);
        if (currentUserId == null) {
            return ApiResponse.fail("未登录或登录已失效");
        }
        return ApiResponse.ok(postService.createPost(req, currentUserId), "发布成功");
    }

    @PostMapping("/{id}/like")
    public ApiResponse<?> toggleLike(@PathVariable Long id, Authentication auth) {
        Long currentUserId = getCurrentUserId(auth);
        if (currentUserId == null) {
            return ApiResponse.fail("未登录或登录已失效");
        }
        return ApiResponse.ok(postService.toggleLike(id, currentUserId), "操作成功");
    }

    @PostMapping("/{id}/favorite")
    public ApiResponse<?> toggleFavorite(@PathVariable Long id, Authentication auth) {
        Long currentUserId = getCurrentUserId(auth);
        if (currentUserId == null) {
            return ApiResponse.fail("未登录或登录已失效");
        }
        return ApiResponse.ok(postService.toggleFavorite(id, currentUserId), "操作成功");
    }

    @PostMapping("/{id}/report")
    public ApiResponse<?> report(@PathVariable Long id,
                                 @Valid @RequestBody ReportPostRequest req,
                                 Authentication auth) {
        Long currentUserId = getCurrentUserId(auth);
        if (currentUserId == null) {
            return ApiResponse.fail("未登录或登录已失效");
        }
        return ApiResponse.ok(postService.reportPost(id, currentUserId, req.getReason()), "举报已提交");
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
