package com.graduateplatform.service;

import com.graduateplatform.dto.request.CreateCommentRequest;
import com.graduateplatform.entity.Comment;
import com.graduateplatform.entity.Post;
import com.graduateplatform.entity.User;
import com.graduateplatform.exception.BusinessException;
import com.graduateplatform.repository.CommentRepository;
import com.graduateplatform.repository.PostRepository;
import com.graduateplatform.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class CommentService {

    private final CommentRepository commentRepository;
    private final PostRepository postRepository;
    private final UserRepository userRepository;

    public CommentService(CommentRepository commentRepository, PostRepository postRepository, UserRepository userRepository) {
        this.commentRepository = commentRepository;
        this.postRepository = postRepository;
        this.userRepository = userRepository;
    }

    public List<Map<String, Object>> getComments(Long postId) {
        return commentRepository.findByPostIdOrderByCreatedAtAsc(postId).stream()
            .map(this::toMap)
            .toList();
    }

    public Map<String, Object> createComment(Long postId, CreateCommentRequest req) {
        Post post = postRepository.findById(postId)
            .orElseThrow(() -> new BusinessException("帖子不存在"));

        User author = userRepository.findById(req.getAuthorId())
            .orElseThrow(() -> new BusinessException("用户不存在"));

        if (req.getContent().length() > 300) {
            throw new BusinessException("评论内容不能超过300字");
        }

        Comment comment = Comment.builder()
            .content(req.getContent())
            .post(post)
            .author(author)
            .status("PUBLISHED")
            .build();

        comment = commentRepository.save(comment);
        return toMap(comment);
    }

    private Map<String, Object> toMap(Comment c) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", c.getId());
        map.put("content", c.getContent());
        map.put("authorId", c.getAuthor().getId());
        map.put("status", c.getStatus());
        map.put("createdAt", c.getCreatedAt().toString());
        return map;
    }
}
