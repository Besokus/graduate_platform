package com.graduateplatform.controller;

import com.graduateplatform.dto.response.ApiResponse;
import com.graduateplatform.service.CategoryService;
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
