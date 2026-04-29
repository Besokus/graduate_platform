package com.graduateplatform.controller;

import com.graduateplatform.dto.response.ApiResponse;
import com.graduateplatform.service.AttemptService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/attempts")
public class AttemptController {

    private final AttemptService attemptService;

    public AttemptController(AttemptService attemptService) {
        this.attemptService = attemptService;
    }

    @GetMapping
    public ApiResponse<?> list(@RequestParam Long userId) {
        return ApiResponse.ok(attemptService.getAttempts(userId));
    }
}
