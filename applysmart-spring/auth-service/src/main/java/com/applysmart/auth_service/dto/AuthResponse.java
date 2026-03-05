package com.applysmart.auth_service.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private String refreshToken;  //  ADDED
    @Builder.Default
    private String tokenType = "Bearer";
    private Long userId;
    private String name;
    private String email;
    private String role;
}