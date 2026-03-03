package com.applysmart.auth_service.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class EmailService {

    public void sendOTP(String email, String otp) {
        // TODO: Integrate with actual email service later
        log.info("Sending OTP to {}: {}", email, otp);
        System.out.println("======================");
        System.out.println("EMAIL TO: " + email);
        System.out.println("OTP: " + otp);
        System.out.println("======================");
    }
}