package com.graduateplatform.kaoyan.controller;

import com.graduateplatform.common.dto.ApiResponse;
import com.graduateplatform.kaoyan.service.MaterialService;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/kaoyan/materials")
public class AdminMaterialController {

    private final MaterialService materialService;

    public AdminMaterialController(MaterialService materialService) {
        this.materialService = materialService;
    }

    @GetMapping("/pending")
    public ApiResponse<?> listPending(@RequestParam Map<String, String> filters) {
        return ApiResponse.ok(materialService.adminListPendingPage(filters));
    }

    @GetMapping("/page")
    public ApiResponse<?> listMaterialsPage(@RequestParam Map<String, String> filters) {
        return ApiResponse.ok(materialService.adminListMaterialsPage(filters));
    }

    @PutMapping("/{id}/review")
    public ApiResponse<?> reviewMaterial(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String status = body.get("status");
        return ApiResponse.ok(materialService.reviewMaterial(id, status), "审核完成");
    }

    @DeleteMapping("/{id}")
    public ApiResponse<?> deleteMaterial(@PathVariable Long id) {
        return ApiResponse.ok(materialService.deleteMaterial(id), "已删除");
    }
}