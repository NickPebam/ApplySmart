import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = authService.getUser();
    if (storedUser) setUser(storedUser);
    setLoading(false);
  }, []);

  // ── REGISTER STEP 1: create account + send OTP. Does NOT set user yet. ────
  const register = async (data) => {
    return await authService.register(data);
  };

  // ── REGISTER STEP 2: verify OTP → set user + JWT ─────────────────────────
  const verifyOtp = async ({ email, otp }) => {
    const userData = await authService.verifyOtp({ email, otp });
    setUser({ userId: userData.userId, name: userData.name, email: userData.email, role: userData.role });
    return userData;
  };

  // ── LOGIN STEP 1: verify credentials → OTP sent. Does NOT set user yet. ───
  const login = async (data) => {
    return await authService.login(data);
  };

  // ── LOGIN STEP 2: verify OTP → set user + JWT ────────────────────────────
  const verifyLoginOtp = async ({ email, otp }) => {
    const userData = await authService.verifyLoginOtp({ email, otp });
    setUser({ userId: userData.userId, name: userData.name, email: userData.email, role: userData.role });
    return userData;
  };

  // ── RESEND OTP ────────────────────────────────────────────────────────────
  const resendOtp = async (email) => {
    return await authService.resendOtp(email);
  };

  // ── LOGOUT ────────────────────────────────────────────────────────────────
  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  const value = {
    user,
    loading,
    register,
    verifyOtp,
    login,
    verifyLoginOtp,
    resendOtp,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};