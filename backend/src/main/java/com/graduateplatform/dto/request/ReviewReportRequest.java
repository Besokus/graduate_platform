package com.graduateplatform.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ReviewReportRequest {
    @NotBlank
    private String action; // RESOLVE / REJECT

    @Size(max = 300)
    private String note;
}
