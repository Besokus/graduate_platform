package com.graduateplatform.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class CreateCommentRequest {
    @NotNull
    private Long authorId;

    @NotBlank
    @Size(max = 300)
    private String content;
}
