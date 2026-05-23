package com.graduateplatform.kaoyan.controller;

import com.graduateplatform.common.dto.ApiResponse;
import com.graduateplatform.kaoyan.service.StudyPlanService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/kaoyan")
public class StudyPlanController {

    private final StudyPlanService studyPlanService;

    public StudyPlanController(StudyPlanService studyPlanService) {
        this.studyPlanService = studyPlanService;
    }

    private Long getCurrentUserId(Authentication auth) {
        if (auth == null || auth.getPrincipal() == null) return null;
        Object principal = auth.getPrincipal();
        return principal instanceof Long ? (Long) principal : null;
    }

    @PostMapping("/plans")
    public ApiResponse<?> createPlan(Authentication auth, @RequestBody Map<String, Object> body) {
        Long userId = getCurrentUserId(auth);
        return ApiResponse.ok(studyPlanService.createPlan(userId, body));
    }

    @GetMapping("/plans")
    public ApiResponse<?> getPlans(Authentication auth) {
        Long userId = getCurrentUserId(auth);
        return ApiResponse.ok(studyPlanService.getPlans(userId));
    }

    @GetMapping("/plans/{id}")
    public ApiResponse<?> getPlanDetail(Authentication auth, @PathVariable Long id) {
        Long userId = getCurrentUserId(auth);
        return ApiResponse.ok(studyPlanService.getPlanDetail(id, userId));
    }

    @PutMapping("/plans/{id}")
    public ApiResponse<?> updatePlan(Authentication auth, @PathVariable Long id, @RequestBody Map<String, Object> body) {
        Long userId = getCurrentUserId(auth);
        return ApiResponse.ok(studyPlanService.updatePlan(id, userId, body));
    }

    @DeleteMapping("/plans/{id}")
    public ApiResponse<?> deletePlan(Authentication auth, @PathVariable Long id) {
        Long userId = getCurrentUserId(auth);
        return ApiResponse.ok(studyPlanService.deletePlan(id, userId));
    }

    @PostMapping("/plans/{id}/checkins")
    public ApiResponse<?> addCheckIn(Authentication auth, @PathVariable Long id, @RequestBody Map<String, Object> body) {
        Long userId = getCurrentUserId(auth);
        return ApiResponse.ok(studyPlanService.addCheckIn(id, userId, body));
    }

    @GetMapping("/plans/{id}/checkins")
    public ApiResponse<?> getCheckIns(Authentication auth, @PathVariable Long id) {
        Long userId = getCurrentUserId(auth);
        return ApiResponse.ok(studyPlanService.getCheckIns(id, userId));
    }

    @PutMapping("/checkins/{id}")
    public ApiResponse<?> updateCheckIn(Authentication auth, @PathVariable Long id, @RequestBody Map<String, Object> body) {
        Long userId = getCurrentUserId(auth);
        return ApiResponse.ok(studyPlanService.updateCheckIn(id, userId, body));
    }

    @DeleteMapping("/checkins/{id}")
    public ApiResponse<?> deleteCheckIn(Authentication auth, @PathVariable Long id) {
        Long userId = getCurrentUserId(auth);
        return ApiResponse.ok(studyPlanService.deleteCheckIn(id, userId));
    }
}