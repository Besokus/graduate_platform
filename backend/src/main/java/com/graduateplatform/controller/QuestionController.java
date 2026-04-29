package com.graduateplatform.controller;

import com.graduateplatform.dto.request.SubmitAttemptRequest;
import com.graduateplatform.dto.response.ApiResponse;
import com.graduateplatform.service.AttemptService;
import com.graduateplatform.service.QuestionService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class QuestionController {

    private final QuestionService questionService;
    private final AttemptService attemptService;

    public QuestionController(QuestionService questionService, AttemptService attemptService) {
        this.questionService = questionService;
        this.attemptService = attemptService;
    }

    @GetMapping("/question-banks/{bankId}/questions")
    public ApiResponse<?> listQuestions(@PathVariable Long bankId) {
        return ApiResponse.ok(questionService.getQuestions(bankId));
    }

    @PostMapping("/questions/{id}/attempt")
    public ApiResponse<?> submitAttempt(@PathVariable Long id, @Valid @RequestBody SubmitAttemptRequest req) {
        return ApiResponse.ok(attemptService.submit(id, req), "答题记录已保存");
    }
}
