package com.graduateplatform.studyabroad.controller;

import com.graduateplatform.common.dto.ApiResponse;
import com.graduateplatform.studyabroad.dto.ApplicationRequest;
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

    @GetMapping("/applications")
    public ApiResponse<?> applications(Authentication auth) {
        return ApiResponse.ok(studyAbroadService.getApplications(getCurrentUserId(auth)));
    }

    @PostMapping("/applications")
    public ApiResponse<?> createApplication(@Valid @RequestBody ApplicationRequest req, Authentication auth) {
        return ApiResponse.ok(
            studyAbroadService.createApplication(getCurrentUserId(auth), req),
            "Application created"
        );
    }

    @PutMapping("/applications/{id}")
    public ApiResponse<?> updateApplication(@PathVariable Long id,
                                            @Valid @RequestBody ApplicationRequest req,
                                            Authentication auth) {
        return ApiResponse.ok(
            studyAbroadService.updateApplication(getCurrentUserId(auth), id, req),
            "Application updated"
        );
    }

    @DeleteMapping("/applications/{id}")
    public ApiResponse<?> deleteApplication(@PathVariable Long id, Authentication auth) {
        studyAbroadService.deleteApplication(getCurrentUserId(auth), id);
        return ApiResponse.ok(null, "Application deleted");
    }

    @GetMapping("/timeline")
    public ApiResponse<?> timeline(Authentication auth) {
        return ApiResponse.ok(studyAbroadService.getTimeline(getCurrentUserId(auth)));
    }

    @PostMapping("/timeline")
    public ApiResponse<?> createTimeline(@Valid @RequestBody TimelineRequest req, Authentication auth) {
        return ApiResponse.ok(
            studyAbroadService.createTimeline(getCurrentUserId(auth), req),
            "Timeline item created"
        );
    }

    @PutMapping("/timeline/{id}")
    public ApiResponse<?> updateTimeline(@PathVariable Long id,
                                         @Valid @RequestBody TimelineRequest req,
                                         Authentication auth) {
        return ApiResponse.ok(
            studyAbroadService.updateTimeline(getCurrentUserId(auth), id, req),
            "Timeline item updated"
        );
    }

    @DeleteMapping("/timeline/{id}")
    public ApiResponse<?> deleteTimeline(@PathVariable Long id, Authentication auth) {
        studyAbroadService.deleteTimeline(getCurrentUserId(auth), id);
        return ApiResponse.ok(null, "Timeline item deleted");
    }

    @GetMapping("/materials")
    public ApiResponse<?> materials(Authentication auth) {
        return ApiResponse.ok(studyAbroadService.getMaterials(getCurrentUserId(auth)));
    }

    @PostMapping("/materials")
    public ApiResponse<?> createMaterial(@Valid @RequestBody MaterialRequest req, Authentication auth) {
        return ApiResponse.ok(
            studyAbroadService.createMaterial(getCurrentUserId(auth), req),
            "Material item created"
        );
    }

    @PutMapping("/materials/{id}")
    public ApiResponse<?> updateMaterial(@PathVariable Long id,
                                         @Valid @RequestBody MaterialRequest req,
                                         Authentication auth) {
        return ApiResponse.ok(
            studyAbroadService.updateMaterial(getCurrentUserId(auth), id, req),
            "Material item updated"
        );
    }

    @DeleteMapping("/materials/{id}")
    public ApiResponse<?> deleteMaterial(@PathVariable Long id, Authentication auth) {
        studyAbroadService.deleteMaterial(getCurrentUserId(auth), id);
        return ApiResponse.ok(null, "Material item deleted");
    }

    private Long getCurrentUserId(Authentication auth) {
        if (auth == null || auth.getPrincipal() == null) {
            return null;
        }
        Object principal = auth.getPrincipal();
        return principal instanceof Long ? (Long) principal : null;
    }
}
