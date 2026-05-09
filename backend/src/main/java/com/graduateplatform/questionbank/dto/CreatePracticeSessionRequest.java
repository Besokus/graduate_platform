package com.graduateplatform.questionbank.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreatePracticeSessionRequest {
    @NotNull(message = "题库不能为空")
    private Long bankId;

    @NotBlank(message = "练习模式不能为空")
    private String mode;

    private String chapter;

    private String questionType;

    private String difficulty;

    private Integer year;

    private Integer limit;
}
