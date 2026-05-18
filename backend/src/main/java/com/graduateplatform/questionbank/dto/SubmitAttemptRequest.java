package com.graduateplatform.questionbank.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SubmitAttemptRequest {
    private Long userId;

    @NotBlank
    private String answer;
}
