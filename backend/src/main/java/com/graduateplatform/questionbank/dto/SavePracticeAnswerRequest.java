package com.graduateplatform.questionbank.dto;

import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class SavePracticeAnswerRequest {
    @Size(max = 2000, message = "作答内容不能超过2000字")
    private String answer;
}
