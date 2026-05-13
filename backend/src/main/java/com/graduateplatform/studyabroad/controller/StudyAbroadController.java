package com.graduateplatform.studyabroad.controller;

import com.graduateplatform.common.dto.ApiResponse;
import com.graduateplatform.studyabroad.dto.MaterialRequest;
import com.graduateplatform.studyabroad.dto.TimelineRequest;
import com.graduateplatform.studyabroad.service.StudyAbroadService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/studyabroad")
public class StudyAbroadController {

    private final StudyAbroadService studyAbroadService;

    public StudyAbroadController(StudyAbroadService studyAbroadService) {
        this.studyAbroadService = studyAbroadService;
    }

    @GetMapping("/timeline")
    public ApiResponse<?> timeline(Authentication auth) {
        return ApiResponse.ok(studyAbroadService.getTimeline(getCurrentUserId(auth)));
    }

    @PostMapping("/timeline")
    public ApiResponse<?> createTimeline(@Valid @RequestBody TimelineRequest req, Authentication auth) {
        return ApiResponse.ok(
            studyAbroadService.createTimeline(getCurrentUserId(auth), req),
            "时间线节点已创建"
        );
    }

    @PutMapping("/timeline/{id}")
    public ApiResponse<?> updateTimeline(@PathVariable Long id,
                                         @Valid @RequestBody TimelineRequest req,
                                         Authentication auth) {
        return ApiResponse.ok(
            studyAbroadService.updateTimeline(getCurrentUserId(auth), id, req),
            "时间线节点已更新"
        );
    }

    @DeleteMapping("/timeline/{id}")
    public ApiResponse<?> deleteTimeline(@PathVariable Long id, Authentication auth) {
        studyAbroadService.deleteTimeline(getCurrentUserId(auth), id);
        return ApiResponse.ok(null, "时间线节点已删除");
    }

    @GetMapping("/materials")
    public ApiResponse<?> materials(Authentication auth) {
        return ApiResponse.ok(studyAbroadService.getMaterials(getCurrentUserId(auth)));
    }

    @PostMapping("/materials")
    public ApiResponse<?> createMaterial(@Valid @RequestBody MaterialRequest req, Authentication auth) {
        return ApiResponse.ok(
            studyAbroadService.createMaterial(getCurrentUserId(auth), req),
            "申请材料已创建"
        );
    }

    @PutMapping("/materials/{id}")
    public ApiResponse<?> updateMaterial(@PathVariable Long id,
                                         @Valid @RequestBody MaterialRequest req,
                                         Authentication auth) {
        return ApiResponse.ok(
            studyAbroadService.updateMaterial(getCurrentUserId(auth), id, req),
            "申请材料已更新"
        );
    }

    @DeleteMapping("/materials/{id}")
    public ApiResponse<?> deleteMaterial(@PathVariable Long id, Authentication auth) {
        studyAbroadService.deleteMaterial(getCurrentUserId(auth), id);
        return ApiResponse.ok(null, "申请材料已删除");
    }

    private Long getCurrentUserId(Authentication auth) {
        if (auth == null || auth.getPrincipal() == null) {
            return null;
        }
        Object principal = auth.getPrincipal();
        return principal instanceof Long ? (Long) principal : null;
    }
}
