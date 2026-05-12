package com.graduateplatform.questionbank.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class SubmitAttemptRequest {
    @NotNull
    private Long userId;

    @NotBlank
    private String answer;
}
