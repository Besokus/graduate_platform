package com.graduateplatform.studyabroad.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ExperienceRequest {
    @NotBlank
    @Size(max = 120)
    private String title;

    @NotBlank
    @Size(max = 40)
    private String country;

    @NotBlank
    @Size(max = 60)
    private String topic;

    @Size(max = 80)
    private String authorName;

    @Size(max = 20)
    private String readTime;

    @NotBlank
    @Size(max = 500)
    private String summary;

    @NotBlank
    private String content;

    @Size(max = 255)
    private String tags;
}
