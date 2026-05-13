package com.graduateplatform.job.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class NotificationTriggerRequest {
    @NotBlank(message = "Related type is required")
    private String relatedType;
    @NotNull(message = "Related id is required")
    private Long relatedId;
}
