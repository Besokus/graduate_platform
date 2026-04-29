package com.graduateplatform.controller;

import com.graduateplatform.dto.response.ApiResponse;
import com.graduateplatform.service.QuestionBankService;
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
