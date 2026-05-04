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

import java.time.LocalDateTime;
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

    public List<Map<String, Object>> getComments(Long postId, Long viewerUserId, boolean admin) {
        Post post = postRepository.findById(postId)
            .orElseThrow(() -> new BusinessException("帖子不存在"));
        ensureCanView(post, viewerUserId, admin);

        return commentRepository.findByPostIdAndStatusOrderByCreatedAtAsc(postId, "PUBLISHED").stream()
            .map(this::toMap)
            .toList();
    }

    public Map<String, Object> createComment(Long postId, CreateCommentRequest req, Long currentUserId) {
        Post post = postRepository.findById(postId)
            .orElseThrow(() -> new BusinessException("帖子不存在"));

        if (!"PUBLISHED".equals(post.getStatus())) {
            throw new BusinessException("当前帖子不可评论");
        }

        User author = userRepository.findById(currentUserId)
            .orElseThrow(() -> new BusinessException("用户不存在"));
        ensureCanComment(author);

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

    private void ensureCanView(Post post, Long viewerUserId, boolean admin) {
        boolean published = "PUBLISHED".equals(post.getStatus());
        boolean membersOnly = "members".equalsIgnoreCase(post.getVisibility());
        boolean isAuthor = viewerUserId != null && viewerUserId.equals(post.getAuthor().getId());

        if (published) {
            if (membersOnly && viewerUserId == null && !admin) {
                throw new BusinessException("该帖子仅注册用户可见");
            }
            return;
        }

        if (!admin && !isAuthor) {
            throw new BusinessException("无权查看该帖评论");
        }
    }

    private void ensureCanComment(User user) {
        String status = user.getStatus();
        if ("banned".equals(status)) {
            throw new BusinessException("账号已被封禁，无法评论");
        }
        if ("muted".equals(status)) {
            throw new BusinessException("您已被禁言，无法评论");
        }
        if ("temporary_locked".equals(status) && isCurrentlyLocked(user)) {
            throw new BusinessException("账号已被临时锁定，请稍后再试");
        }
    }

    private boolean isCurrentlyLocked(User user) {
        if (user.getLockedUntil() == null) {
            return false;
        }
        return user.getLockedUntil().isAfter(LocalDateTime.now());
    }
}
