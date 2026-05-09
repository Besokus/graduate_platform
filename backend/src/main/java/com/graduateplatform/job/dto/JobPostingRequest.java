package com.graduateplatform.job.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class JobPostingRequest {
    @NotBlank(message = "Job title is required")
    private String title;
    @NotBlank(message = "Company name is required")
    private String companyName;
    private String city;
    private String industry;
    private String roleType;
    private String salaryRange;
    private String educationRequirement;
    private String majorKeywords;
    private String skillTags;
    private String description;
    private String applyUrl;
    private Boolean active;
}
