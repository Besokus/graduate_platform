package com.graduateplatform.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class CreatePostRequest {
    @NotBlank
    @Size(min = 6, max = 60)
    private String title;

    @NotBlank
    @Size(min = 20, max = 2000)
    private String content;

    @NotBlank
    private String categoryCode;

    private java.util.List<String> tags;

    @NotNull
    private Long authorId;

    private String visibility = "public"; // public / members

    private Boolean anonymous = false;

    private Boolean hasAttachment = false;

    private String attachmentNote;

    private String status = "PENDING"; // DRAFT / PENDING
}
