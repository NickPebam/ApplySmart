import axios from 'axios';

const SPRING_URL = import.meta.env.VITE_SPRING_URL || 'http://localhost:8081/api/auth';

const springApi = axios.create({
  baseURL: SPRING_URL,
  headers: { 'Content-Type': 'application/json' },
});

export const authService = {

  // ── REGISTER STEP 1: create account + auto-sends OTP ─────────────────────
  register: async (data) => {
    const response = await springApi.post('/register', data);
    const result = response.data;
    // Store temporarily — no JWT yet until email verified
    localStorage.setItem('temp_user', JSON.stringify(result));
    return result;
  },

  // ── REGISTER STEP 2: verify OTP → get JWT ────────────────────────────────
  verifyOtp: async ({ email, otp }) => {
    const response = await springApi.post('/verify-email', { email, otp });
    const result = response.data;
    // Promote to real session
    localStorage.setItem('token', result.token);
    if (result.refreshToken) localStorage.setItem('refreshToken', result.refreshToken);
    localStorage.setItem('user', JSON.stringify(result));
    localStorage.removeItem('temp_user');
    return result;
  },

  // ── LOGIN STEP 1: verify credentials → OTP sent to email ─────────────────
  login: async (data) => {
    await springApi.post('/login', data);
    // Store email temporarily so step 2 knows who to verify
    localStorage.setItem('pending_login_email', data.email);
  },

  // ── LOGIN STEP 2: verify OTP → get JWT ───────────────────────────────────
  verifyLoginOtp: async ({ email, otp }) => {
    const response = await springApi.post('/login-verify', { email, otp });
    const result = response.data;
    localStorage.setItem('token', result.token);
    if (result.refreshToken) localStorage.setItem('refreshToken', result.refreshToken);
    localStorage.setItem('user', JSON.stringify(result));
    localStorage.removeItem('pending_login_email');
    return result;
  },

  // ── RESEND OTP ────────────────────────────────────────────────────────────
  resendOtp: async (email) => {
    await springApi.post(`/send-otp?email=${encodeURIComponent(email)}`);
  },

  // ── LOGOUT ────────────────────────────────────────────────────────────────
  logout: async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        await springApi.post('/logout', {}, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    } catch { /* ignore logout errors */ }
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    localStorage.removeItem('temp_user');
    localStorage.removeItem('pending_login_email');
  },

  getUser: () => {
    try { return JSON.parse(localStorage.getItem('user') || 'null'); }
    catch { return null; }
  },

  getToken: () => localStorage.getItem('token'),

  getPendingLoginEmail: () => localStorage.getItem('pending_login_email'),
};