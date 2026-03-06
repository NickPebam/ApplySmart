package com.applysmart.auth_service.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginVerifyRequest {

    @NotBlank(message = "Email is required")
    private String email;

    @NotBlank(message = "OTP is required")
    private String otp;
}