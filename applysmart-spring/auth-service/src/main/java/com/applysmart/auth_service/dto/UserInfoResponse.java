package com.applysmart.auth_service.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserInfoResponse {
    private Long id;
    private String name;
    private String email;
    private String phone;
    private String role;
    private boolean emailVerified;
}