package com.graduateplatform.questionbank.controller;

import com.graduateplatform.common.dto.ApiResponse;
import com.graduateplatform.questionbank.dto.CreatePracticeSessionRequest;
import com.graduateplatform.questionbank.dto.SavePracticeAnswerRequest;
import com.graduateplatform.questionbank.service.PracticeService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/practice")
public class PracticeController {

    private final PracticeService practiceService;

    public PracticeController(PracticeService practiceService) {
        this.practiceService = practiceService;
    }

    @PostMapping("/sessions")
    public ApiResponse<?> createSession(@Valid @RequestBody CreatePracticeSessionRequest req, Authentication auth) {
        return ApiResponse.ok(practiceService.createSession(currentUserId(auth), req), "练习已开始");
    }

    @GetMapping("/sessions/{id}")
    public ApiResponse<?> getSession(@PathVariable Long id, Authentication auth) {
        return ApiResponse.ok(practiceService.getSession(currentUserId(auth), id));
    }

    @PutMapping("/sessions/{id}/answers/{questionId}")
    public ApiResponse<?> saveAnswer(@PathVariable Long id,
                                     @PathVariable Long questionId,
                                     @Valid @RequestBody SavePracticeAnswerRequest req,
                                     Authentication auth) {
        return ApiResponse.ok(practiceService.saveAnswer(currentUserId(auth), id, questionId, req), "答案已暂存");
    }

    @PostMapping("/sessions/{id}/submit")
    public ApiResponse<?> submit(@PathVariable Long id, Authentication auth) {
        return ApiResponse.ok(practiceService.submitSession(currentUserId(auth), id), "交卷完成");
    }

    @GetMapping("/wrong-questions")
    public ApiResponse<?> wrongQuestions(@RequestParam(required = false) String target,
                                         @RequestParam(required = false) String subject,
                                         @RequestParam(required = false) String chapter,
                                         @RequestParam(required = false) Integer minWrongCount,
                                         Authentication auth) {
        return ApiResponse.ok(practiceService.getWrongQuestions(
            currentUserId(auth), target, subject, chapter, minWrongCount
        ));
    }

    @GetMapping("/statistics")
    public ApiResponse<?> statistics(@RequestParam(defaultValue = "day") String granularity, Authentication auth) {
        return ApiResponse.ok(practiceService.getStatistics(currentUserId(auth), granularity));
    }

    private Long currentUserId(Authentication auth) {
        return (Long) auth.getPrincipal();
    }
}
