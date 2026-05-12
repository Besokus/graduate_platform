package com.graduateplatform.questionbank.controller;

import com.graduateplatform.common.dto.ApiResponse;
import com.graduateplatform.questionbank.service.AttemptService;
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
