package com.graduateplatform.community.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class CreateCommentRequest {
    @NotBlank
    @Size(max = 300)
    private String content;
}
