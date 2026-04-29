package com.graduateplatform.service;

import com.graduateplatform.entity.User;
import com.graduateplatform.exception.BusinessException;
import com.graduateplatform.repository.*;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PostRepository postRepository;
    private final CommentRepository commentRepository;
    private final AttemptRepository attemptRepository;

    public UserService(UserRepository userRepository, PostRepository postRepository,
                       CommentRepository commentRepository, AttemptRepository attemptRepository) {
        this.userRepository = userRepository;
        this.postRepository = postRepository;
        this.commentRepository = commentRepository;
        this.attemptRepository = attemptRepository;
    }

    public Map<String, Object> getProfile(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new BusinessException("用户不存在"));

        Map<String, Object> profile = new LinkedHashMap<>();
        profile.put("id", user.getId());
        profile.put("name", user.getName());
        profile.put("email", user.getEmail());
        profile.put("phone", user.getPhone());
        profile.put("studentId", user.getStudentId());
        profile.put("target", user.getTarget());
        profile.put("school", user.getSchool());
        profile.put("major", user.getMajor());
        profile.put("grade", user.getGrade());
        profile.put("intentRegion", user.getIntentRegion());
        profile.put("role", user.getRole());
        profile.put("status", user.getStatus());

        // 安全信息子对象（前端 ProfilePage 优先读取 profile.security.xxx）
        Map<String, Object> security = new LinkedHashMap<>();
        security.put("lastLoginAt", user.getLastLoginAt() != null ? user.getLastLoginAt().toString() : null);
        security.put("lastDevice", user.getLastLoginDevice());
        security.put("lastLocation", user.getLastLoginIp()); // IP 作为位置参考
        security.put("lastIp", user.getLastLoginIp());
        profile.put("security", security);

        // 同时保留扁平字段作为 fallback
        profile.put("lastLoginAt", user.getLastLoginAt() != null ? user.getLastLoginAt().toString() : null);
        profile.put("lastLoginIp", user.getLastLoginIp());
        profile.put("lastLoginDevice", user.getLastLoginDevice());
        profile.put("lastDevice", user.getLastLoginDevice());
        profile.put("lastLocation", user.getLastLoginIp());
        profile.put("lastIp", user.getLastLoginIp());

        return profile;
    }

    public Map<String, Object> getDashboard(Long userId) {
        userRepository.findById(userId)
            .orElseThrow(() -> new BusinessException("用户不存在"));

        Map<String, Object> dashboard = new LinkedHashMap<>();
        dashboard.put("postCount", postRepository.countByAuthorId(userId));
        dashboard.put("commentCount", commentRepository.countByAuthorId(userId));
        dashboard.put("attemptCount", attemptRepository.countByUserId(userId));
        dashboard.put("checkinCount", 0); // future
        return dashboard;
    }
}
