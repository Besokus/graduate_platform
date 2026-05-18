package com.graduateplatform.studyabroad.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;

@Data
public class ApplicationRequest {
    @NotBlank
    @Size(max = 40)
    private String country;

    @NotBlank
    @Size(max = 120)
    private String school;

    @NotBlank
    @Size(max = 120)
    private String program;

    @NotBlank
    @Size(max = 40)
    private String degree;

    @NotBlank
    @Size(max = 40)
    private String intake;

    @NotBlank
    @Size(max = 40)
    private String applicationRound;

    @NotNull
    private LocalDate deadline;

    @Size(max = 20)
    private String status;

    @Size(max = 20)
    private String priority;

    @Size(max = 500)
    private String note;
}
