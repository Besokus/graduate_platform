package com.graduateplatform.studyabroad.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;

@Data
public class TimelineRequest {
    @NotBlank
    @Size(max = 80)
    private String title;

    @NotBlank
    @Size(max = 40)
    private String country;

    @Size(max = 120)
    private String school;

    @NotBlank
    @Size(max = 40)
    private String phase;

    @NotNull
    private LocalDate dueDate;

    @Size(max = 20)
    private String status;

    @Size(max = 500)
    private String note;
}
