package com.graduateplatform.job.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ApplicationRecordRequest {
    @NotBlank(message = "Company name is required")
    private String companyName;
    @NotBlank(message = "Job title is required")
    private String jobTitle;
    private Long jobPostingId;
    private String status;
    private LocalDateTime appliedAt;
    private LocalDateTime nextStepAt;
    private String notes;
}
