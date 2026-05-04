package com.graduateplatform.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateProfileRequest {
    @NotBlank
    @Size(max = 40)
    private String name;

    @Size(max = 120)
    private String school;

    @Size(max = 120)
    private String major;

    @Size(max = 40)
    private String grade;

    @Size(max = 20)
    private String target; // kaoyan / kaogong / job / liuxue

    @Size(max = 120)
    private String intentRegion;
}
