package com.applysmart.auth_service.service;

import com.applysmart.auth_service.dto.*;
import com.applysmart.auth_service.entity.RefreshToken;
import com.applysmart.auth_service.entity.User;
import com.applysmart.auth_service.repository.UserRepository;
import com.applysmart.auth_service.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.authentication.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    private final RefreshTokenService refreshTokenService;
    private final EmailService emailService;

    // ── REGISTER ──────────────────────────────────────────────────────────────
    public AuthResponse register(RegisterRequest request) {
        Optional<User> existingUser = userRepository.findByEmail(request.getEmail());

        if (existingUser.isPresent()) {
            if (existingUser.get().isEmailVerified()) {
                throw new RuntimeException("Email already registered");
            } else {
                // Unverified — delete stale record and let them retry
                userRepository.delete(existingUser.get());
            }
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
        sendOtp(user);

        return AuthResponse.builder()
                .userId(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .build();
    }

    // ── VERIFY EMAIL ──────────────────────────────────────────────────────────
    public AuthResponse verifyEmail(VerifyEmailRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.isEmailVerified()) {
            throw new RuntimeException("Email already verified");
        }

        validateOtp(user, request.getOtp());

        user.setEmailVerified(true);
        user.setOtp(null);
        user.setOtpExpiresAt(null);
        userRepository.save(user);

        return buildAuthResponse(user);
    }

    // ── LOGIN STEP 1 ──────────────────────────────────────────────────────────
    public void login(LoginRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );
        } catch (BadCredentialsException e) {
            throw new RuntimeException("Invalid email or password");
        }

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!user.isEmailVerified()) {
            throw new RuntimeException("Email not verified. Please complete registration first.");
        }

        sendOtp(user);
    }

    // ── LOGIN STEP 2 ──────────────────────────────────────────────────────────
    public AuthResponse verifyLoginOtp(LoginVerifyRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        validateOtp(user, request.getOtp());

        user.setOtp(null);
        user.setOtpExpiresAt(null);
        userRepository.save(user);

        return buildAuthResponse(user);
    }

    // ── RESEND OTP ────────────────────────────────────────────────────────────
    public void sendVerificationOTP(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        sendOtp(user);
    }

    // ── REFRESH TOKEN ─────────────────────────────────────────────────────────
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

    // ── LOGOUT ────────────────────────────────────────────────────────────────
    public void logout(Long userId) {
        refreshTokenService.deleteByUserId(userId);
    }

    // ── VALIDATE TOKEN ────────────────────────────────────────────────────────
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

    // ── CLEANUP: delete unverified users older than 24h ───────────────────────
    @Scheduled(fixedRate = 86400000)
    public void deleteUnverifiedUsers() {
        long cutoff = System.currentTimeMillis() - (24 * 60 * 60 * 1000L);
        userRepository.deleteByEmailVerifiedFalseAndOtpExpiresAtBefore(cutoff);
    }

    // ── HELPERS ───────────────────────────────────────────────────────────────
    private void sendOtp(User user) {
        String otp = String.format("%06d", new Random().nextInt(999999));
        user.setOtp(otp);
        user.setOtpExpiresAt(System.currentTimeMillis() + 600000);
        userRepository.save(user);
        emailService.sendOTP(user.getEmail(), otp);
    }

    private void validateOtp(User user, String inputOtp) {
        if (user.getOtp() == null || !user.getOtp().equals(inputOtp)) {
            throw new RuntimeException("Invalid OTP. Please check and try again.");
        }
        if (System.currentTimeMillis() > user.getOtpExpiresAt()) {
            throw new RuntimeException("OTP has expired. Please request a new one.");
        }
    }

    private AuthResponse buildAuthResponse(User user) {
        String token = jwtUtil.generateToken(user.getId(), user.getEmail(), user.getRole());
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(user.getId());
        return AuthResponse.builder()
                .token(token)
                .refreshToken(refreshToken.getToken())
                .userId(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .build();
    }
}