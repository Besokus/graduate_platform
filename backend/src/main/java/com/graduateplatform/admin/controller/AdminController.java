package com.graduateplatform.admin.controller;

import com.graduateplatform.admin.service.AdminService;
import com.graduateplatform.common.dto.ApiResponse;
import com.graduateplatform.kaogong.service.KaoGongService;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService adminService;
    private final KaoGongService kaoGongService;

    public AdminController(AdminService adminService, KaoGongService kaoGongService) {
        this.adminService = adminService;
        this.kaoGongService = kaoGongService;
    }

    @GetMapping("/dashboard")
    public ApiResponse<?> dashboard() {
        return ApiResponse.ok(adminService.getDashboard());
    }

    @GetMapping("/posts/pending")
    public ApiResponse<?> pendingPosts(@RequestParam(defaultValue = "0") int page,
                                       @RequestParam(defaultValue = "20") int size) {
        return ApiResponse.ok(adminService.getPendingPosts(page, size));
    }

    @GetMapping("/posts")
    public ApiResponse<?> reviewList(@RequestParam(required = false) String status,
                                     @RequestParam(defaultValue = "0") int page,
                                     @RequestParam(defaultValue = "20") int size) {
        return ApiResponse.ok(adminService.getReviewList(status, page, size));
    }

    @PutMapping("/posts/{id}/review")
    public ApiResponse<?> reviewPost(@PathVariable Long id, @RequestBody Map<String, String> body) {
        return ApiResponse.ok(adminService.reviewPost(id, body.get("action"), body.getOrDefault("reason", "")), "OK");
    }

    @GetMapping("/users")
    public ApiResponse<?> users(@RequestParam(required = false) String target,
                                @RequestParam(required = false) String status,
                                @RequestParam(defaultValue = "0") int page,
                                @RequestParam(defaultValue = "20") int size) {
        return ApiResponse.ok(adminService.getUsers(target, status, page, size));
    }

    @PutMapping("/users/{id}/status")
    public ApiResponse<?> updateUserStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        return ApiResponse.ok(adminService.updateUserStatus(id, body.get("status"), body.getOrDefault("reason", "")), "OK");
    }

    @GetMapping("/kaogong/jobs")
    public ApiResponse<?> kaogongJobs(@RequestParam Map<String, String> filters) {
        return ApiResponse.ok(kaoGongService.adminJobs(filters));
    }

    @PostMapping("/kaogong/jobs")
    public ApiResponse<?> createKaogongJob(@RequestBody Map<String, Object> body) {
        return ApiResponse.ok(kaoGongService.createJob(body), "OK");
    }

    @PutMapping("/kaogong/jobs/{id}")
    public ApiResponse<?> updateKaogongJob(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        return ApiResponse.ok(kaoGongService.updateJob(id, body), "OK");
    }

    @DeleteMapping("/kaogong/jobs/{id}")
    public ApiResponse<?> deleteKaogongJob(@PathVariable Long id) {
        return ApiResponse.ok(kaoGongService.deactivateJob(id), "OK");
    }

    @GetMapping("/kaogong/score-lines")
    public ApiResponse<?> kaogongScoreLines(@RequestParam Map<String, String> filters) {
        return ApiResponse.ok(kaoGongService.adminScoreLines(filters));
    }

    @PostMapping("/kaogong/score-lines")
    public ApiResponse<?> createKaogongScoreLine(@RequestBody Map<String, Object> body) {
        return ApiResponse.ok(kaoGongService.createScoreLine(body), "OK");
    }

    @PutMapping("/kaogong/score-lines/{id}")
    public ApiResponse<?> updateKaogongScoreLine(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        return ApiResponse.ok(kaoGongService.updateScoreLine(id, body), "OK");
    }

    @DeleteMapping("/kaogong/score-lines/{id}")
    public ApiResponse<?> deleteKaogongScoreLine(@PathVariable Long id) {
        return ApiResponse.ok(kaoGongService.deactivateScoreLine(id), "OK");
    }

    @GetMapping("/kaogong/calendar-events")
    public ApiResponse<?> kaogongCalendarEvents(@RequestParam Map<String, String> filters) {
        return ApiResponse.ok(kaoGongService.adminCalendarEvents(filters));
    }

    @PostMapping("/kaogong/calendar-events")
    public ApiResponse<?> createKaogongCalendarEvent(@RequestBody Map<String, Object> body) {
        return ApiResponse.ok(kaoGongService.createCalendarEvent(body), "OK");
    }

    @PutMapping("/kaogong/calendar-events/{id}")
    public ApiResponse<?> updateKaogongCalendarEvent(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        return ApiResponse.ok(kaoGongService.updateCalendarEvent(id, body), "OK");
    }

    @DeleteMapping("/kaogong/calendar-events/{id}")
    public ApiResponse<?> deleteKaogongCalendarEvent(@PathVariable Long id) {
        return ApiResponse.ok(kaoGongService.deactivateCalendarEvent(id), "OK");
    }
}
