package com.graduateplatform.questionbank.controller;

import com.graduateplatform.common.dto.ApiResponse;
import com.graduateplatform.questionbank.service.QuestionBankService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/question-banks")
public class QuestionBankController {

    private final QuestionBankService bankService;

    public QuestionBankController(QuestionBankService bankService) {
        this.bankService = bankService;
    }

    @GetMapping
    public ApiResponse<?> list(@RequestParam(required = false) String target,
                               @RequestParam(required = false) String subject,
                               @RequestParam(required = false) String chapter,
                               @RequestParam(required = false) String questionType,
                               @RequestParam(required = false) String difficulty,
                               @RequestParam(required = false) Integer year) {
        return ApiResponse.ok(bankService.getBanks(target, subject, chapter, questionType, difficulty, year));
    }

    @GetMapping("/options")
    public ApiResponse<?> options() {
        return ApiResponse.ok(bankService.getOptions());
    }
}
