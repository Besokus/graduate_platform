package com.graduateplatform.studyabroad.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;

@Data
public class MaterialRequest {
    @NotBlank
    @Size(max = 80)
    private String title;

    @NotBlank
    @Size(max = 40)
    private String country;

    @NotBlank
    @Size(max = 40)
    private String stage;

    @NotBlank
    @Size(max = 60)
    private String category;

    @NotNull
    private LocalDate deadline;

    private Boolean completed;

    @Size(max = 500)
    private String note;
}
