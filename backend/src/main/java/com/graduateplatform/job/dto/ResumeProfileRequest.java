package com.graduateplatform.job.dto;

import lombok.Data;

@Data
public class ResumeProfileRequest {
    private String templateType;
    private String baseInfo;
    private String education;
    private String projects;
    private String internships;
    private String skills;
    private String selfEvaluation;
}
