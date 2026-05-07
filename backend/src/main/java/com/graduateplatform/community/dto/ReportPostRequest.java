package com.graduateplatform.community.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ReportPostRequest {
    @NotBlank
    @Size(max = 300)
    private String reason;
}
