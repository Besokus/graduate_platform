package com.graduateplatform.service;

import com.graduateplatform.dto.request.CreatePostRequest;
import com.graduateplatform.entity.*;
import com.graduateplatform.exception.BusinessException;
import com.graduateplatform.repository.*;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class PostService {

    private final PostRepository postRepository;
    private final PostCategoryRepository categoryRepository;
    private final UserRepository userRepository;

    public PostService(PostRepository postRepository, PostCategoryRepository categoryRepository, UserRepository userRepository) {
        this.postRepository = postRepository;
        this.categoryRepository = categoryRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getPosts(String category, String keyword, String sort,
                                         String tag, Boolean hasAttachment, int page, int size,
                                         boolean includeMembers) {
        Long categoryId = null;
        if (category != null && !category.isEmpty()) {
            categoryId = categoryRepository.findByCode(category)
                .map(PostCategory::getId)
                .orElse(null);
        }

        Sort sortObj = Sort.by(Sort.Direction.DESC, "createdAt");
        if ("hot".equals(sort)) {
            sortObj = Sort.by(Sort.Direction.DESC, "viewCount");
        }

        Pageable pageable = PageRequest.of(page, size, sortObj);
        Page<Post> postPage = postRepository.findPublishedPosts(
            includeMembers, categoryId, keyword, tag, hasAttachment, pageable
        );

        List<Map<String, Object>> content = postPage.getContent().stream().map(this::toPostMap).toList();
        Map<String, Object> result = new HashMap<>();
        result.put("content", content);
        result.put("totalPages", postPage.getTotalPages());
        result.put("totalElements", postPage.getTotalElements());
        result.put("number", postPage.getNumber());
        result.put("size", postPage.getSize());
        return result;
    }

    @Transactional
    public Map<String, Object> getPostDetail(Long id, Long viewerUserId, boolean admin) {
        Post post = postRepository.findById(id)
            .orElseThrow(() -> new BusinessException("帖子不存在"));
        ensureCanView(post, viewerUserId, admin);
        if ("PUBLISHED".equals(post.getStatus())) {
            post.setViewCount(post.getViewCount() + 1);
            postRepository.save(post);
        }
        return toPostMap(post);
    }

    @Transactional
    public Map<String, Object> createPost(CreatePostRequest req, Long currentUserId) {
        PostCategory category = categoryRepository.findByCode(req.getCategoryCode())
            .orElseThrow(() -> new BusinessException("分类不存在"));

        User author = userRepository.findById(currentUserId)
            .orElseThrow(() -> new BusinessException("用户不存在"));

        ensureCanPost(author, Boolean.TRUE.equals(req.getHasAttachment()));

        // 审核规则：含附件 或 新注册用户 → 进入待审核
        String status = req.getStatus();
        if ("DRAFT".equals(status)) {
            // keep as draft
        } else if (Boolean.TRUE.equals(req.getHasAttachment())
                   || author.getCreatedAt().isAfter(LocalDateTime.now().minusDays(7))) {
            status = "PENDING";
        } else {
            status = "PUBLISHED";
        }

        Post post = Post.builder()
            .title(req.getTitle())
            .content(req.getContent())
            .category(category)
            .tags(req.getTags() != null ? String.join(",", req.getTags()) : null)
            .visibility(req.getVisibility() != null ? req.getVisibility() : "public")
            .anonymous(Boolean.TRUE.equals(req.getAnonymous()))
            .hasAttachment(Boolean.TRUE.equals(req.getHasAttachment()))
            .attachmentNote(req.getAttachmentNote())
            .author(author)
            .status(status)
            .build();

        post = postRepository.save(post);
        return toPostMap(post);
    }

    private Map<String, Object> toPostMap(Post post) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", post.getId());
        map.put("title", post.getTitle());
        map.put("content", post.getContent());
        map.put("category", Map.of("id", post.getCategory().getId(), "code", post.getCategory().getCode(), "name", post.getCategory().getName()));
        map.put("tags", post.getTags());
        map.put("visibility", post.getVisibility());
        map.put("anonymous", post.getAnonymous());
        map.put("hasAttachment", post.getHasAttachment());
        map.put("attachmentNote", post.getAttachmentNote());
        map.put("authorId", post.getAnonymous() ? null : post.getAuthor().getId());
        map.put("status", post.getStatus());
        map.put("viewCount", post.getViewCount());
        map.put("commentCount", post.getCommentCount());
        map.put("likeCount", post.getLikeCount());
        map.put("favoriteCount", post.getFavoriteCount());
        map.put("reportCount", post.getReportCount());
        map.put("createdAt", post.getCreatedAt().toString());
        map.put("updatedAt", post.getUpdatedAt().toString());
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
            throw new BusinessException("无权查看该帖子");
        }
    }

    private void ensureCanPost(User author, boolean hasAttachment) {
        String status = author.getStatus();
        if ("banned".equals(status)) {
            throw new BusinessException("账号已被封禁，无法发帖");
        }
        if ("muted".equals(status)) {
            throw new BusinessException("您已被禁言，无法发帖");
        }
        if ("temporary_locked".equals(status) && isCurrentlyLocked(author)) {
            throw new BusinessException("账号已被临时锁定，请稍后再试");
        }
        if ("upload_limited".equals(status) && hasAttachment) {
            throw new BusinessException("账号当前限制上传，无法发布含附件内容");
        }
    }

    private boolean isCurrentlyLocked(User user) {
        if (user.getLockedUntil() == null) {
            return false;
        }
        return user.getLockedUntil().isAfter(LocalDateTime.now());
    }
}
