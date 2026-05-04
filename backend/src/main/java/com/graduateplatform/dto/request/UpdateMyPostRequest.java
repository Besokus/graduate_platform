package com.graduateplatform.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateMyPostRequest {
    @NotBlank
    @Size(min = 6, max = 60)
    private String title;

    @NotBlank
    @Size(min = 20, max = 2000)
    private String content;

    @NotBlank
    private String categoryCode;

    private String tags; // comma separated

    private String visibility = "public";

    private Boolean anonymous = false;
}
