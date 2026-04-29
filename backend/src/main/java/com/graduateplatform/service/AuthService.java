package com.graduateplatform.service;

import com.graduateplatform.dto.request.LoginRequest;
import com.graduateplatform.dto.request.RegisterRequest;
import com.graduateplatform.entity.User;
import com.graduateplatform.exception.BusinessException;
import com.graduateplatform.repository.UserRepository;
import com.graduateplatform.security.JwtTokenProvider;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtTokenProvider tokenProvider) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
    }

    public Map<String, Object> register(RegisterRequest req) {
        // 将空字符串视为 null，避免空字符串存入数据库
        String phone = blankToNull(req.getPhone());
        String email = blankToNull(req.getEmail());
        String studentId = blankToNull(req.getStudentId());

        if (phone != null && userRepository.existsByPhone(phone)) {
            throw new BusinessException("该手机号已被注册");
        }
        if (email != null && userRepository.existsByEmail(email)) {
            throw new BusinessException("该邮箱已被注册");
        }
        if (studentId != null && userRepository.existsByStudentId(studentId)) {
            throw new BusinessException("该学号已被注册");
        }

        if (!req.getPassword().matches("^(?=.*[A-Za-z])(?=.*\\d).{8,20}$")) {
            throw new BusinessException("密码需为8-20位，包含字母和数字");
        }

        User user = User.builder()
            .phone(phone)
            .email(email)
            .studentId(studentId)
            .password(passwordEncoder.encode(req.getPassword()))
            .name(req.getName())
            .target(req.getTarget())
            .school(req.getSchool())
            .major(req.getMajor())
            .grade(req.getGrade())
            .intentRegion(req.getIntentRegion())
            .role("user")
            .status("normal")
            .build();

        user = userRepository.save(user);
        String token = tokenProvider.generateToken(user.getId(), user.getRole());

        Map<String, Object> result = toUserMap(user);
        result.put("token", token);
        return result;
    }

    public Map<String, Object> login(LoginRequest req) {
        String credential = req.getCredential();
        User user = userRepository.findByPhone(credential)
            .or(() -> userRepository.findByEmail(credential))
            .or(() -> userRepository.findByStudentId(credential))
            .orElseThrow(() -> new BusinessException("账号不存在"));

        if ("banned".equals(user.getStatus())) {
            throw new BusinessException("账号已被封禁");
        }
        if ("temporary_locked".equals(user.getStatus())) {
            if (user.getLockedUntil() != null && user.getLockedUntil().isAfter(LocalDateTime.now())) {
                throw new BusinessException("账号已被临时锁定，请稍后再试");
            }
            user.setStatus("normal");
            user.setLoginFailCount(0);
        }

        if (!passwordEncoder.matches(req.getPassword(), user.getPassword())) {
            user.setLoginFailCount(user.getLoginFailCount() + 1);
            if (user.getLoginFailCount() >= 5) {
                user.setStatus("temporary_locked");
                user.setLockedUntil(LocalDateTime.now().plusMinutes(30));
                userRepository.save(user);
                throw new BusinessException("密码连续错误5次，账号已临时锁定30分钟");
            }
            userRepository.save(user);
            throw new BusinessException("密码错误");
        }

        user.setLoginFailCount(0);
        user.setLastLoginAt(LocalDateTime.now());
        userRepository.save(user);

        String token = tokenProvider.generateToken(user.getId(), user.getRole());
        Map<String, Object> result = toUserMap(user);
        result.put("token", token);
        return result;
    }

    public Map<String, Object> getMe(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new BusinessException("用户不存在"));
        return toUserMap(user);
    }

    public void logout(Long userId) {
        // JWT is stateless; future enhancement: token blacklist
    }

    private Map<String, Object> toUserMap(User user) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", user.getId());
        map.put("name", user.getName());
        map.put("email", user.getEmail());
        map.put("phone", user.getPhone());
        map.put("studentId", user.getStudentId());
        map.put("target", user.getTarget());
        map.put("school", user.getSchool());
        map.put("major", user.getMajor());
        map.put("grade", user.getGrade());
        map.put("intentRegion", user.getIntentRegion());
        map.put("role", user.getRole());
        map.put("status", user.getStatus());
        map.put("lastLoginAt", user.getLastLoginAt() != null ? user.getLastLoginAt().toString() : null);
        return map;
    }

    private String blankToNull(String s) {
        return (s == null || s.isBlank()) ? null : s.trim();
    }
}
