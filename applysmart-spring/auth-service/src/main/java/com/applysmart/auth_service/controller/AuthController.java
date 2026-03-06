package com.applysmart.auth_service.controller;

import com.applysmart.auth_service.dto.*;
import com.applysmart.auth_service.entity.User;
import com.applysmart.auth_service.repository.UserRepository;
import com.applysmart.auth_service.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.Parameter;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final UserRepository userRepository;

    // ── REGISTER: creates user + sends OTP (no JWT returned yet) ─────────────
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(
            @Valid @RequestBody RegisterRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(authService.register(request));
    }

    // ── VERIFY EMAIL (registration): validates OTP → returns JWT ─────────────
    @PostMapping("/verify-email")
    public ResponseEntity<AuthResponse> verifyEmail(
            @Valid @RequestBody VerifyEmailRequest request
    ) {
        return ResponseEntity.ok(authService.verifyEmail(request));
    }

    // ── LOGIN STEP 1: validate credentials + send OTP (no JWT yet) ───────────
    @PostMapping("/login")
    public ResponseEntity<String> login(
            @Valid @RequestBody LoginRequest request
    ) {
        authService.login(request);
        return ResponseEntity.ok("OTP sent to your email");
    }

    // ── LOGIN STEP 2: validate OTP → returns JWT ─────────────────────────────
    @PostMapping("/login-verify")
    public ResponseEntity<AuthResponse> verifyLoginOtp(
            @Valid @RequestBody LoginVerifyRequest request
    ) {
        return ResponseEntity.ok(authService.verifyLoginOtp(request));
    }

    // ── RESEND OTP (registration or login) ───────────────────────────────────
    @PostMapping("/send-otp")
    public ResponseEntity<String> sendOTP(@RequestParam String email) {
        authService.sendVerificationOTP(email);
        return ResponseEntity.ok("OTP sent to email");
    }

    // ── REFRESH TOKEN ─────────────────────────────────────────────────────────
    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refreshToken(
            @Valid @RequestBody RefreshTokenRequest request
    ) {
        return ResponseEntity.ok(authService.refreshToken(request));
    }

    // ── LOGOUT ────────────────────────────────────────────────────────────────
    @PostMapping("/logout")
    public ResponseEntity<String> logout(
            @Parameter(hidden = true) Authentication authentication
    ) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Not authenticated");
        }

        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        authService.logout(user.getId());
        return ResponseEntity.ok("Logged out successfully");
    }

    // ── VALIDATE TOKEN ────────────────────────────────────────────────────────
    @PostMapping("/validate")
    public ResponseEntity<TokenValidationResponse> validateToken(
            @RequestHeader("Authorization") String authHeader
    ) {
        String token = authHeader.substring(7);
        return ResponseEntity.ok(authService.validateToken(token));
    }
}