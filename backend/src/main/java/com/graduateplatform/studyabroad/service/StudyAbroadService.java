package com.graduateplatform.studyabroad.service;

import com.graduateplatform.common.entity.User;
import com.graduateplatform.common.exception.BusinessException;
import com.graduateplatform.common.repository.UserRepository;
import com.graduateplatform.studyabroad.dto.ApplicationRequest;
import com.graduateplatform.studyabroad.dto.MaterialRequest;
import com.graduateplatform.studyabroad.dto.TimelineRequest;
import com.graduateplatform.studyabroad.entity.StudyAbroadApplication;
import com.graduateplatform.studyabroad.entity.StudyAbroadMaterial;
import com.graduateplatform.studyabroad.entity.StudyAbroadTimeline;
import com.graduateplatform.studyabroad.repository.StudyAbroadApplicationRepository;
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

    private static final Set<String> VALID_TIMELINE_STATUSES = Set.of("todo", "doing", "done");
    private static final Set<String> VALID_APPLICATION_STATUSES =
        Set.of("planning", "preparing", "submitted", "offer", "rejected");
    private static final Set<String> VALID_PRIORITIES = Set.of("dream", "match", "safe");

    private final StudyAbroadApplicationRepository applicationRepository;
    private final StudyAbroadTimelineRepository timelineRepository;
    private final StudyAbroadMaterialRepository materialRepository;
    private final UserRepository userRepository;

    public StudyAbroadService(StudyAbroadApplicationRepository applicationRepository,
                              StudyAbroadTimelineRepository timelineRepository,
                              StudyAbroadMaterialRepository materialRepository,
                              UserRepository userRepository) {
        this.applicationRepository = applicationRepository;
        this.timelineRepository = timelineRepository;
        this.materialRepository = materialRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getApplications(Long userId) {
        ensureUser(userId);
        return applicationRepository.findByUserIdOrderByDeadlineAsc(userId)
            .stream()
            .map(this::toApplicationMap)
            .toList();
    }

    @Transactional
    public Map<String, Object> createApplication(Long userId, ApplicationRequest req) {
        User user = ensureUser(userId);
        StudyAbroadApplication item = StudyAbroadApplication.builder()
            .user(user)
            .country(req.getCountry().trim())
            .school(req.getSchool().trim())
            .program(req.getProgram().trim())
            .degree(req.getDegree().trim())
            .intake(req.getIntake().trim())
            .applicationRound(req.getApplicationRound().trim())
            .deadline(req.getDeadline())
            .status(normalizeApplicationStatus(req.getStatus()))
            .priority(normalizePriority(req.getPriority()))
            .note(normalize(req.getNote(), "No note"))
            .build();
        return toApplicationMap(applicationRepository.save(item));
    }

    @Transactional
    public Map<String, Object> updateApplication(Long userId, Long id, ApplicationRequest req) {
        ensureUser(userId);
        StudyAbroadApplication item = applicationRepository.findByIdAndUserId(id, userId)
            .orElseThrow(() -> new BusinessException("Application not found or access denied"));

        item.setCountry(req.getCountry().trim());
        item.setSchool(req.getSchool().trim());
        item.setProgram(req.getProgram().trim());
        item.setDegree(req.getDegree().trim());
        item.setIntake(req.getIntake().trim());
        item.setApplicationRound(req.getApplicationRound().trim());
        item.setDeadline(req.getDeadline());
        item.setStatus(normalizeApplicationStatus(req.getStatus()));
        item.setPriority(normalizePriority(req.getPriority()));
        item.setNote(normalize(req.getNote(), "No note"));
        return toApplicationMap(applicationRepository.save(item));
    }

    @Transactional
    public void deleteApplication(Long userId, Long id) {
        ensureUser(userId);
        StudyAbroadApplication item = applicationRepository.findByIdAndUserId(id, userId)
            .orElseThrow(() -> new BusinessException("Application not found or access denied"));
        applicationRepository.delete(item);
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
            .school(normalize(req.getSchool(), "School TBD"))
            .phase(req.getPhase().trim())
            .dueDate(req.getDueDate())
            .status(normalizeTimelineStatus(req.getStatus()))
            .note(normalize(req.getNote(), "No note"))
            .build();
        return toTimelineMap(timelineRepository.save(item));
    }

    @Transactional
    public Map<String, Object> updateTimeline(Long userId, Long id, TimelineRequest req) {
        ensureUser(userId);
        StudyAbroadTimeline item = timelineRepository.findByIdAndUserId(id, userId)
            .orElseThrow(() -> new BusinessException("Timeline item not found or access denied"));

        item.setTitle(req.getTitle().trim());
        item.setCountry(req.getCountry().trim());
        item.setSchool(normalize(req.getSchool(), "School TBD"));
        item.setPhase(req.getPhase().trim());
        item.setDueDate(req.getDueDate());
        item.setStatus(normalizeTimelineStatus(req.getStatus()));
        item.setNote(normalize(req.getNote(), "No note"));
        return toTimelineMap(timelineRepository.save(item));
    }

    @Transactional
    public void deleteTimeline(Long userId, Long id) {
        ensureUser(userId);
        StudyAbroadTimeline item = timelineRepository.findByIdAndUserId(id, userId)
            .orElseThrow(() -> new BusinessException("Timeline item not found or access denied"));
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
            .note(normalize(req.getNote(), "No note"))
            .build();
        return toMaterialMap(materialRepository.save(item));
    }

    @Transactional
    public Map<String, Object> updateMaterial(Long userId, Long id, MaterialRequest req) {
        ensureUser(userId);
        StudyAbroadMaterial item = materialRepository.findByIdAndUserId(id, userId)
            .orElseThrow(() -> new BusinessException("Material item not found or access denied"));

        item.setTitle(req.getTitle().trim());
        item.setCountry(req.getCountry().trim());
        item.setStage(req.getStage().trim());
        item.setCategory(req.getCategory().trim());
        item.setDeadline(req.getDeadline());
        item.setCompleted(Boolean.TRUE.equals(req.getCompleted()));
        item.setNote(normalize(req.getNote(), "No note"));
        return toMaterialMap(materialRepository.save(item));
    }

    @Transactional
    public void deleteMaterial(Long userId, Long id) {
        ensureUser(userId);
        StudyAbroadMaterial item = materialRepository.findByIdAndUserId(id, userId)
            .orElseThrow(() -> new BusinessException("Material item not found or access denied"));
        materialRepository.delete(item);
    }

    private User ensureUser(Long userId) {
        if (userId == null) {
            throw new BusinessException("Please sign in before using study abroad management");
        }
        return userRepository.findById(userId)
            .orElseThrow(() -> new BusinessException("User not found"));
    }

    private String normalizeTimelineStatus(String status) {
        String normalized = status == null || status.isBlank() ? "todo" : status.trim();
        if (!VALID_TIMELINE_STATUSES.contains(normalized)) {
            throw new BusinessException("Timeline status is invalid");
        }
        return normalized;
    }

    private String normalizeApplicationStatus(String status) {
        String normalized = status == null || status.isBlank() ? "planning" : status.trim();
        if (!VALID_APPLICATION_STATUSES.contains(normalized)) {
            throw new BusinessException("Application status is invalid");
        }
        return normalized;
    }

    private String normalizePriority(String priority) {
        String normalized = priority == null || priority.isBlank() ? "match" : priority.trim();
        if (!VALID_PRIORITIES.contains(normalized)) {
            throw new BusinessException("Application priority is invalid");
        }
        return normalized;
    }

    private String normalize(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value.trim();
    }

    private Map<String, Object> toApplicationMap(StudyAbroadApplication item) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", item.getId());
        map.put("country", item.getCountry());
        map.put("school", item.getSchool());
        map.put("program", item.getProgram());
        map.put("degree", item.getDegree());
        map.put("intake", item.getIntake());
        map.put("applicationRound", item.getApplicationRound());
        map.put("deadline", item.getDeadline().toString());
        map.put("status", item.getStatus());
        map.put("priority", item.getPriority());
        map.put("note", item.getNote());
        map.put("createdAt", item.getCreatedAt() != null ? item.getCreatedAt().toString() : null);
        map.put("updatedAt", item.getUpdatedAt() != null ? item.getUpdatedAt().toString() : null);
        return map;
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
