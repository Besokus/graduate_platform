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
    public ApiResponse<?> list(@RequestParam(required = false) String target) {
        return ApiResponse.ok(bankService.getBanks(target));
    }
}
