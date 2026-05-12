package com.graduateplatform.community.controller;

import com.graduateplatform.community.dto.CreateCommentRequest;
import com.graduateplatform.common.dto.ApiResponse;
import com.graduateplatform.community.service.CommentService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/posts")
public class CommentController {

    private final CommentService commentService;

    public CommentController(CommentService commentService) {
        this.commentService = commentService;
    }

    @GetMapping("/{postId}/comments")
    public ApiResponse<?> list(@PathVariable Long postId) {
        return ApiResponse.ok(commentService.getComments(postId));
    }

    @PostMapping("/{postId}/comments")
    public ApiResponse<?> create(@PathVariable Long postId, @Valid @RequestBody CreateCommentRequest req) {
        return ApiResponse.ok(commentService.createComment(postId, req), "评论成功");
    }
}
