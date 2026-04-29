package com.graduateplatform.service;

import com.graduateplatform.entity.*;
import com.graduateplatform.exception.BusinessException;
import com.graduateplatform.repository.*;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
public class AdminService {

    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final CommentRepository commentRepository;

    public AdminService(PostRepository postRepository, UserRepository userRepository, CommentRepository commentRepository) {
        this.postRepository = postRepository;
        this.userRepository = userRepository;
        this.commentRepository = commentRepository;
    }

    // ==================== 内容审核 ====================

    @Transactional(readOnly = true)
    public Map<String, Object> getPendingPosts(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Post> postPage = postRepository.findByStatusOrderByCreatedAtDesc("PENDING", pageable);

        List<Map<String, Object>> content = postPage.getContent().stream().map(this::toPostDetail).toList();
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("content", content);
        result.put("totalPages", postPage.getTotalPages());
        result.put("totalElements", postPage.getTotalElements());
        return result;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getReviewList(String status, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Post> postPage;
        if (status != null && !status.isEmpty()) {
            postPage = postRepository.findByStatusOrderByCreatedAtDesc(status.toUpperCase(), pageable);
        } else {
            postPage = postRepository.findAllByOrderByCreatedAtDesc(pageable);
        }

        List<Map<String, Object>> content = postPage.getContent().stream().map(this::toPostDetail).toList();
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("content", content);
        result.put("totalPages", postPage.getTotalPages());
        result.put("totalElements", postPage.getTotalElements());
        return result;
    }

    @Transactional
    public Map<String, Object> reviewPost(Long postId, String action, String reason) {
        Post post = postRepository.findById(postId)
            .orElseThrow(() -> new BusinessException("帖子不存在"));

        String validActions = "APPROVE,REJECT,OFFLINE";
        if (!Arrays.asList("APPROVE", "REJECT", "OFFLINE").contains(action.toUpperCase())) {
            throw new BusinessException("无效操作，支持: " + validActions);
        }

        switch (action.toUpperCase()) {
            case "APPROVE":
                if (!"PENDING".equals(post.getStatus())) {
                    throw new BusinessException("只能审核待审核状态的帖子");
                }
                post.setStatus("PUBLISHED");
                break;
            case "REJECT":
                if (!"PENDING".equals(post.getStatus())) {
                    throw new BusinessException("只能驳回待审核状态的帖子");
                }
                post.setStatus("REJECTED");
                break;
            case "OFFLINE":
                if (!"PUBLISHED".equals(post.getStatus())) {
                    throw new BusinessException("只能下架已发布的帖子");
                }
                post.setStatus("OFFLINE");
                break;
        }

        postRepository.save(post);
        return toPostDetail(post);
    }

    // ==================== 用户管理 ====================

    @Transactional(readOnly = true)
    public Map<String, Object> getUsers(String target, String status, int page, int size) {
        List<User> allUsers = userRepository.findAll();
        List<User> filtered = new ArrayList<>(allUsers);

        if (target != null && !target.isEmpty()) {
            filtered.removeIf(u -> !target.equals(u.getTarget()));
        }
        if (status != null && !status.isEmpty()) {
            filtered.removeIf(u -> !status.equalsIgnoreCase(u.getStatus()));
        }

        int total = filtered.size();
        int start = page * size;
        int end = Math.min(start + size, total);
        List<User> paged = start < total ? filtered.subList(start, end) : List.of();

        List<Map<String, Object>> content = paged.stream().map(u -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", u.getId());
            m.put("name", u.getName());
            m.put("email", u.getEmail());
            m.put("phone", u.getPhone());
            m.put("target", u.getTarget());
            m.put("school", u.getSchool());
            m.put("role", u.getRole());
            m.put("status", u.getStatus());
            m.put("createdAt", u.getCreatedAt().toString());
            return m;
        }).toList();

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("content", content);
        result.put("totalPages", (int) Math.ceil((double) total / size));
        result.put("totalElements", (long) total);
        return result;
    }

    @Transactional
    public Map<String, Object> updateUserStatus(Long userId, String newStatus, String reason) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new BusinessException("用户不存在"));

        if ("admin".equals(user.getRole())) {
            throw new BusinessException("不能修改管理员状态");
        }

        Set<String> validStatuses = Set.of("normal", "muted", "upload_limited", "temporary_locked", "banned");
        if (!validStatuses.contains(newStatus)) {
            throw new BusinessException("无效状态，支持: " + String.join(", ", validStatuses));
        }

        user.setStatus(newStatus);
        if ("temporary_locked".equals(newStatus)) {
            user.setLockedUntil(java.time.LocalDateTime.now().plusHours(24));
        }
        if ("normal".equals(newStatus)) {
            user.setLoginFailCount(0);
            user.setLockedUntil(null);
        }
        userRepository.save(user);

        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", user.getId());
        m.put("name", user.getName());
        m.put("status", user.getStatus());
        m.put("reason", reason);
        return m;
    }

    // ==================== 统计 ====================

    @Transactional(readOnly = true)
    public Map<String, Object> getDashboard() {
        long totalUsers = userRepository.count();
        long pendingPosts = postRepository.findByStatusOrderByCreatedAtDesc("PENDING", PageRequest.of(0, 1)).getTotalElements();

        Map<String, Object> dash = new LinkedHashMap<>();
        dash.put("totalUsers", totalUsers);
        dash.put("pendingPosts", pendingPosts);
        return dash;
    }

    // ==================== 辅助 ====================

    private Map<String, Object> toPostDetail(Post post) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", post.getId());
        map.put("title", post.getTitle());
        map.put("content", post.getContent());
        map.put("category", Map.of("code", post.getCategory().getCode(), "name", post.getCategory().getName()));
        map.put("tags", post.getTags());
        map.put("visibility", post.getVisibility());
        map.put("anonymous", post.getAnonymous());
        map.put("hasAttachment", post.getHasAttachment());
        map.put("authorId", post.getAuthor().getId());
        map.put("authorName", post.getAuthor().getName());
        map.put("status", post.getStatus());
        map.put("viewCount", post.getViewCount());
        map.put("commentCount", post.getCommentCount());
        map.put("reportCount", post.getReportCount());
        map.put("createdAt", post.getCreatedAt().toString());
        return map;
    }
}
