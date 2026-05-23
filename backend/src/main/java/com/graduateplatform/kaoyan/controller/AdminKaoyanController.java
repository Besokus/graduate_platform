package com.graduateplatform.kaoyan.controller;

import com.graduateplatform.common.dto.ApiResponse;
import com.graduateplatform.kaoyan.service.KaoyanService;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/kaoyan")
public class AdminKaoyanController {

    private final KaoyanService kaoyanService;

    public AdminKaoyanController(KaoyanService kaoyanService) {
        this.kaoyanService = kaoyanService;
    }

    @GetMapping("/schools")
    public ApiResponse<?> schools(@RequestParam Map<String, String> params) {
        return ApiResponse.ok(kaoyanService.adminSchools(params));
    }

    @PostMapping("/schools")
    public ApiResponse<?> createSchool(@RequestBody Map<String, Object> body) {
        return ApiResponse.ok(kaoyanService.createSchool(body), "院校创建成功");
    }

    @PutMapping("/schools/{id}")
    public ApiResponse<?> updateSchool(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        return ApiResponse.ok(kaoyanService.updateSchool(id, body), "院校更新成功");
    }

    @DeleteMapping("/schools/{id}")
    public ApiResponse<?> deleteSchool(@PathVariable Long id) {
        return ApiResponse.ok(kaoyanService.deactivateSchool(id), "院校已停用");
    }

    @GetMapping("/score-lines")
    public ApiResponse<?> scoreLines(@RequestParam Map<String, String> params) {
        return ApiResponse.ok(kaoyanService.adminScoreLines(params));
    }

    @PostMapping("/score-lines")
    public ApiResponse<?> createScoreLine(@RequestBody Map<String, Object> body) {
        return ApiResponse.ok(kaoyanService.createScoreLine(body), "分数线创建成功");
    }

    @PutMapping("/score-lines/{id}")
    public ApiResponse<?> updateScoreLine(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        return ApiResponse.ok(kaoyanService.updateScoreLine(id, body), "分数线更新成功");
    }

    @DeleteMapping("/score-lines/{id}")
    public ApiResponse<?> deleteScoreLine(@PathVariable Long id) {
        return ApiResponse.ok(kaoyanService.deactivateScoreLine(id), "分数线已停用");
    }
}