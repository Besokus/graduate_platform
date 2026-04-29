package com.graduateplatform.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginRequest {
    @NotBlank
    private String credential; // phone / email / studentId

    @NotBlank
    private String password;

    // 前端同时发送这些字段，用于兼容
    private String loginType;  // email / phone / studentId
    private String email;
    private String phone;
    private String studentId;
}
