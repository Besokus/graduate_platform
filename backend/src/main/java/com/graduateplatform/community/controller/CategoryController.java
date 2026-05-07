package com.graduateplatform.community.controller;

import com.graduateplatform.common.dto.ApiResponse;
import com.graduateplatform.community.service.CategoryService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/post-categories")
public class CategoryController {

    private final CategoryService categoryService;

    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    @GetMapping
    public ApiResponse<?> list() {
        return ApiResponse.ok(categoryService.getAll());
    }
}
