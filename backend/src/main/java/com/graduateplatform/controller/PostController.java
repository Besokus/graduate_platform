package com.graduateplatform.controller;

import com.graduateplatform.dto.request.CreatePostRequest;
import com.graduateplatform.dto.response.ApiResponse;
import com.graduateplatform.service.PostService;
import jakarta.validation.Valid;
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
        @RequestParam(defaultValue = "20") int size
    ) {
        return ApiResponse.ok(postService.getPosts(category, keyword, sort, tag, hasAttachment, page, size));
    }

    @GetMapping("/{id}")
    public ApiResponse<?> detail(@PathVariable Long id) {
        return ApiResponse.ok(postService.getPostDetail(id));
    }

    @PostMapping
    public ApiResponse<?> create(@Valid @RequestBody CreatePostRequest req) {
        return ApiResponse.ok(postService.createPost(req), "发布成功");
    }
}
