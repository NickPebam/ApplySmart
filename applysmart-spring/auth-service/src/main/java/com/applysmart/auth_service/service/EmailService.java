package com.applysmart.auth_service.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;
import java.util.List;

@Service
@Slf4j
public class EmailService {

    @Value("${brevo.api.key}")
    private String brevoApiKey;

    @Value("${brevo.sender.email}")
    private String senderEmail;

    @Value("${brevo.sender.name:ApplySmart}")
    private String senderName;

    private final RestTemplate restTemplate = new RestTemplate();
    private static final String BREVO_URL = "https://api.brevo.com/v3/smtp/email";

    public void sendOTP(String toEmail, String otp) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("api-key", brevoApiKey);

        Map<String, Object> body = Map.of(
            "sender",      Map.of("name", senderName, "email", senderEmail),
            "to",          List.of(Map.of("email", toEmail)),
            "subject",     "ApplySmart – Your Verification Code",
            "htmlContent", buildOtpHtml(otp)
        );

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<String> response = restTemplate.postForEntity(BREVO_URL, request, String.class);
            if (response.getStatusCode().is2xxSuccessful()) {
                log.info("OTP email sent to {}", toEmail);
            } else {
                log.error("Brevo returned {}: {}", response.getStatusCode(), response.getBody());
                throw new RuntimeException("Failed to send OTP email. Please try again.");
            }
        } catch (Exception e) {
            log.error("Failed to send OTP email to {}: {}", toEmail, e.getMessage());
            throw new RuntimeException("Failed to send OTP email. Please try again.");
        }
    }

    private String buildOtpHtml(String otp) {
        return """
                <!DOCTYPE html>
                <html>
                <body style="margin:0;padding:0;background:#f9fafb;font-family:Arial,sans-serif;">
                  <table width="100%%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
                    <tr>
                      <td align="center">
                        <table width="480" cellpadding="0" cellspacing="0"
                               style="background:#ffffff;border-radius:16px;overflow:hidden;
                                      box-shadow:0 1px 4px rgba(0,0,0,0.08);">
                          <!-- Header -->
                          <tr>
                            <td style="background:linear-gradient(135deg,#7c3aed,#2563eb);
                                       padding:32px;text-align:center;">
                              <h1 style="color:#ffffff;margin:0;font-size:24px;font-weight:700;">
                                ApplySmart
                              </h1>
                              <p style="color:#e0d9ff;margin:6px 0 0;font-size:14px;">
                                Email Verification
                              </p>
                            </td>
                          </tr>
                          <!-- Body -->
                          <tr>
                            <td style="padding:36px 40px;">
                              <p style="color:#374151;font-size:15px;margin:0 0 8px;">
                                Hi there,
                              </p>
                              <p style="color:#374151;font-size:15px;margin:0 0 28px;line-height:1.6;">
                                Use the code below to verify your email address.
                                It expires in <strong>10 minutes</strong>.
                              </p>
                              <!-- OTP Box -->
                              <div style="background:#f3f0ff;border:2px dashed #7c3aed;
                                          border-radius:12px;padding:24px;text-align:center;
                                          margin-bottom:28px;">
                                <span style="font-size:40px;font-weight:800;letter-spacing:12px;
                                             color:#7c3aed;">
                                  %s
                                </span>
                              </div>
                              <p style="color:#6b7280;font-size:13px;margin:0;line-height:1.6;">
                                If you didn't create an ApplySmart account, you can safely
                                ignore this email.
                              </p>
                            </td>
                          </tr>
                          <!-- Footer -->
                          <tr>
                            <td style="background:#f9fafb;padding:20px 40px;
                                       border-top:1px solid #e5e7eb;text-align:center;">
                              <p style="color:#9ca3af;font-size:12px;margin:0;">
                                © 2026 ApplySmart. All rights reserved.
                              </p>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </body>
                </html>
                """.formatted(otp);
    }
}