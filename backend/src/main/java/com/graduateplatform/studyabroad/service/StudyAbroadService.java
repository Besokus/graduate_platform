package com.graduateplatform.studyabroad.service;

import com.graduateplatform.common.entity.User;
import com.graduateplatform.common.exception.BusinessException;
import com.graduateplatform.common.repository.UserRepository;
import com.graduateplatform.studyabroad.dto.MaterialRequest;
import com.graduateplatform.studyabroad.dto.TimelineRequest;
import com.graduateplatform.studyabroad.entity.StudyAbroadMaterial;
import com.graduateplatform.studyabroad.entity.StudyAbroadTimeline;
import com.graduateplatform.studyabroad.repository.StudyAbroadMaterialRepository;
import com.graduateplatform.studyabroad.repository.StudyAbroadTimelineRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
public class StudyAbroadService {

    private static final Set<String> VALID_STATUSES = Set.of("todo", "doing", "done");

    private final StudyAbroadTimelineRepository timelineRepository;
    private final StudyAbroadMaterialRepository materialRepository;
    private final UserRepository userRepository;

    public StudyAbroadService(StudyAbroadTimelineRepository timelineRepository,
                              StudyAbroadMaterialRepository materialRepository,
                              UserRepository userRepository) {
        this.timelineRepository = timelineRepository;
        this.materialRepository = materialRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getTimeline(Long userId) {
        ensureUser(userId);
        return timelineRepository.findByUserIdOrderByDueDateAsc(userId)
            .stream()
            .map(this::toTimelineMap)
            .toList();
    }

    @Transactional
    public Map<String, Object> createTimeline(Long userId, TimelineRequest req) {
        User user = ensureUser(userId);
        StudyAbroadTimeline item = StudyAbroadTimeline.builder()
            .user(user)
            .title(req.getTitle().trim())
            .country(req.getCountry().trim())
            .school(normalize(req.getSchool(), "目标院校待定"))
            .phase(req.getPhase().trim())
            .dueDate(req.getDueDate())
            .status(normalizeStatus(req.getStatus()))
            .note(normalize(req.getNote(), "暂无备注"))
            .build();
        return toTimelineMap(timelineRepository.save(item));
    }

    @Transactional
    public Map<String, Object> updateTimeline(Long userId, Long id, TimelineRequest req) {
        ensureUser(userId);
        StudyAbroadTimeline item = timelineRepository.findByIdAndUserId(id, userId)
            .orElseThrow(() -> new BusinessException("时间线节点不存在或无权修改"));

        item.setTitle(req.getTitle().trim());
        item.setCountry(req.getCountry().trim());
        item.setSchool(normalize(req.getSchool(), "目标院校待定"));
        item.setPhase(req.getPhase().trim());
        item.setDueDate(req.getDueDate());
        item.setStatus(normalizeStatus(req.getStatus()));
        item.setNote(normalize(req.getNote(), "暂无备注"));
        return toTimelineMap(timelineRepository.save(item));
    }

    @Transactional
    public void deleteTimeline(Long userId, Long id) {
        ensureUser(userId);
        StudyAbroadTimeline item = timelineRepository.findByIdAndUserId(id, userId)
            .orElseThrow(() -> new BusinessException("时间线节点不存在或无权删除"));
        timelineRepository.delete(item);
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getMaterials(Long userId) {
        ensureUser(userId);
        return materialRepository.findByUserIdOrderByDeadlineAsc(userId)
            .stream()
            .map(this::toMaterialMap)
            .toList();
    }

    @Transactional
    public Map<String, Object> createMaterial(Long userId, MaterialRequest req) {
        User user = ensureUser(userId);
        StudyAbroadMaterial item = StudyAbroadMaterial.builder()
            .user(user)
            .title(req.getTitle().trim())
            .country(req.getCountry().trim())
            .stage(req.getStage().trim())
            .category(req.getCategory().trim())
            .deadline(req.getDeadline())
            .completed(Boolean.TRUE.equals(req.getCompleted()))
            .note(normalize(req.getNote(), "暂无备注"))
            .build();
        return toMaterialMap(materialRepository.save(item));
    }

    @Transactional
    public Map<String, Object> updateMaterial(Long userId, Long id, MaterialRequest req) {
        ensureUser(userId);
        StudyAbroadMaterial item = materialRepository.findByIdAndUserId(id, userId)
            .orElseThrow(() -> new BusinessException("申请材料不存在或无权修改"));

        item.setTitle(req.getTitle().trim());
        item.setCountry(req.getCountry().trim());
        item.setStage(req.getStage().trim());
        item.setCategory(req.getCategory().trim());
        item.setDeadline(req.getDeadline());
        item.setCompleted(Boolean.TRUE.equals(req.getCompleted()));
        item.setNote(normalize(req.getNote(), "暂无备注"));
        return toMaterialMap(materialRepository.save(item));
    }

    @Transactional
    public void deleteMaterial(Long userId, Long id) {
        ensureUser(userId);
        StudyAbroadMaterial item = materialRepository.findByIdAndUserId(id, userId)
            .orElseThrow(() -> new BusinessException("申请材料不存在或无权删除"));
        materialRepository.delete(item);
    }

    private User ensureUser(Long userId) {
        if (userId == null) {
            throw new BusinessException("请先登录后使用留学申请管理功能");
        }
        return userRepository.findById(userId)
            .orElseThrow(() -> new BusinessException("用户不存在"));
    }

    private String normalizeStatus(String status) {
        String normalized = status == null || status.isBlank() ? "todo" : status.trim();
        if (!VALID_STATUSES.contains(normalized)) {
            throw new BusinessException("时间线状态仅支持 todo、doing、done");
        }
        return normalized;
    }

    private String normalize(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value.trim();
    }

    private Map<String, Object> toTimelineMap(StudyAbroadTimeline item) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", item.getId());
        map.put("title", item.getTitle());
        map.put("country", item.getCountry());
        map.put("school", item.getSchool());
        map.put("phase", item.getPhase());
        map.put("dueDate", item.getDueDate().toString());
        map.put("status", item.getStatus());
        map.put("note", item.getNote());
        map.put("createdAt", item.getCreatedAt() != null ? item.getCreatedAt().toString() : null);
        map.put("updatedAt", item.getUpdatedAt() != null ? item.getUpdatedAt().toString() : null);
        return map;
    }

    private Map<String, Object> toMaterialMap(StudyAbroadMaterial item) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", item.getId());
        map.put("title", item.getTitle());
        map.put("country", item.getCountry());
        map.put("stage", item.getStage());
        map.put("category", item.getCategory());
        map.put("deadline", item.getDeadline().toString());
        map.put("completed", item.getCompleted());
        map.put("note", item.getNote());
        map.put("createdAt", item.getCreatedAt() != null ? item.getCreatedAt().toString() : null);
        map.put("updatedAt", item.getUpdatedAt() != null ? item.getUpdatedAt().toString() : null);
        return map;
    }
}
