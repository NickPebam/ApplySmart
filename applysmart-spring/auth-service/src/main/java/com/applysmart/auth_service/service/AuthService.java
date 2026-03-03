package com.applysmart.auth_service.service;

import com.applysmart.auth_service.dto.*;
import com.applysmart.auth_service.entity.RefreshToken;
import com.applysmart.auth_service.entity.User;
import com.applysmart.auth_service.repository.UserRepository;
import com.applysmart.auth_service.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Random;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    private final RefreshTokenService refreshTokenService;  // ADDED
    private final EmailService emailService;                // ADDED

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered");
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .password(passwordEncoder.encode(request.getPassword()))
                .role("USER")
                .emailVerified(false)
                .build();

        user = userRepository.save(user);
        
        String token = jwtUtil.generateToken(user.getId(), user.getEmail(), user.getRole());
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(user.getId()); // ADDED

        return AuthResponse.builder()
                .token(token)
                .refreshToken(refreshToken.getToken())  // ADDED
                .userId(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        String token = jwtUtil.generateToken(user.getId(), user.getEmail(), user.getRole());
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(user.getId()); // ADDED

        return AuthResponse.builder()
                .token(token)
                .refreshToken(refreshToken.getToken())  // ADDED
                .userId(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .build();
    }

    // NEW METHOD
    public AuthResponse refreshToken(RefreshTokenRequest request) {
        RefreshToken refreshToken = refreshTokenService.findByToken(request.getRefreshToken());
        refreshTokenService.verifyExpiration(refreshToken);

        User user = refreshToken.getUser();
        String newAccessToken = jwtUtil.generateToken(user.getId(), user.getEmail(), user.getRole());

        return AuthResponse.builder()
                .token(newAccessToken)
                .refreshToken(refreshToken.getToken())
                .userId(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .build();
    }

    //  NEW METHOD
    public void logout(Long userId) {
        refreshTokenService.deleteByUserId(userId);
    }

    // NEW METHOD
    public void sendVerificationOTP(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.isEmailVerified()) {
            throw new RuntimeException("Email already verified");
        }

        String otp = String.format("%06d", new Random().nextInt(999999));
        
        user.setOtp(otp);
        user.setOtpExpiresAt(System.currentTimeMillis() + 600000); // 10 minutes
        userRepository.save(user);

        emailService.sendOTP(email, otp);
    }

    //  NEW METHOD
    public void verifyEmail(VerifyEmailRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.isEmailVerified()) {
            throw new RuntimeException("Email already verified");
        }

        if (user.getOtp() == null || !user.getOtp().equals(request.getOtp())) {
            throw new RuntimeException("Invalid OTP");
        }

        if (System.currentTimeMillis() > user.getOtpExpiresAt()) {
            throw new RuntimeException("OTP expired");
        }

        user.setEmailVerified(true);
        user.setOtp(null);
        user.setOtpExpiresAt(null);
        userRepository.save(user);
    }

    public TokenValidationResponse validateToken(String token) {
        if (!jwtUtil.validateToken(token)) {
            return TokenValidationResponse.builder().valid(false).build();
        }

        return TokenValidationResponse.builder()
                .valid(true)
                .userId(jwtUtil.getUserId(token))
                .email(jwtUtil.getEmail(token))
                .role(jwtUtil.getRole(token))
                .build();
    }
}