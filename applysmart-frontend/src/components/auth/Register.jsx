import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// ─── Layout defined OUTSIDE to prevent remount on re-render ──────────────────
const Layout = ({ children }) => (
  <div className="min-h-screen flex">
    <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-purple-600 via-purple-700 to-blue-800 p-12 flex-col justify-between relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-300 rounded-full blur-3xl" />
      </div>
      <div className="relative z-10">
        <h1 className="text-5xl font-bold text-white mb-4">Join ApplySmart</h1>
        <p className="text-purple-100 text-lg">Start landing your dream job today</p>
      </div>
      <div className="relative z-10 space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
            <span className="text-2xl">🚀</span>
          </div>
          <p className="text-white text-lg">Free forever · No credit card required</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
            <span className="text-2xl">⚡</span>
          </div>
          <p className="text-white text-lg">Get started in under 2 minutes</p>
        </div>
      </div>
      <p className="text-purple-200 text-sm relative z-10">© 2026 ApplySmart. All rights reserved.</p>
    </div>
    <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
      <div className="w-full max-w-md">{children}</div>
    </div>
  </div>
);

// ─── OTP Input: 6 boxes ───────────────────────────────────────────────────────
const OtpInput = ({ value, onChange }) => {
  const inputs = useRef([]);

  const handleKey = (e, idx) => {
    if (e.key === 'Backspace' && !value[idx] && idx > 0)
      inputs.current[idx - 1]?.focus();
  };

  const handleChange = (e, idx) => {
    const ch = e.target.value.replace(/\D/g, '').slice(-1);
    const next = value.split('');
    next[idx] = ch;
    onChange(next.join(''));
    if (ch && idx < 5) inputs.current[idx + 1]?.focus();
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted) {
      onChange(pasted.padEnd(6, '').slice(0, 6));
      inputs.current[Math.min(pasted.length, 5)]?.focus();
    }
    e.preventDefault();
  };

  return (
    <div className="flex gap-3 justify-center" onPaste={handlePaste}>
      {Array.from({ length: 6 }).map((_, i) => (
        <input
          key={i}
          ref={el => (inputs.current[i] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[i] || ''}
          onChange={e => handleChange(e, i)}
          onKeyDown={e => handleKey(e, i)}
          className="w-12 h-14 text-center text-xl font-bold border-2 rounded-xl
                     border-gray-200 focus:border-purple-500 focus:outline-none
                     bg-white text-gray-900 transition-colors"
        />
      ))}
    </div>
  );
};

// ─── Register component ───────────────────────────────────────────────────────
const Register = () => {
  const [step, setStep]               = useState('form');
  const [formData, setFormData]       = useState({ name: '', email: '', phone: '', password: '' });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp]                 = useState('');
  const [error, setError]             = useState('');
  const [loading, setLoading]         = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  const { register, verifyOtp, resendOtp } = useAuth();
  const navigate = useNavigate();

  // Resend countdown
  useEffect(() => {
    if (resendTimer <= 0) return;
    const id = setTimeout(() => setResendTimer(t => t - 1), 1000);
    return () => clearTimeout(id);
  }, [resendTimer]);

  // Auto-submit when 6 digits filled
  useEffect(() => {
    if (otp.length === 6 && step === 'otp') handleVerify();
  }, [otp]);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    // ── Client-side password match check ─────────────────────────────────────
    if (formData.password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await register(formData);
      setStep('otp');
      setResendTimer(60);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e?.preventDefault();
    if (otp.length < 6) { setError('Please enter the full 6-digit code'); return; }
    setError('');
    setLoading(true);
    try {
      await verifyOtp({ email: formData.email, otp });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Invalid or expired OTP');
      setOtp('');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    setError('');
    try {
      await resendOtp(formData.email);
      setOtp('');
      setResendTimer(60);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP');
    }
  };

  // ── Step 1: Registration form ─────────────────────────────────────────────
  if (step === 'form') {
    return (
      <Layout>
        <div className="text-center mb-8">
          <div className="inline-block p-3 bg-purple-600 rounded-2xl mb-4">
            <span className="text-4xl">🎉</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Create Account</h2>
          <p className="text-gray-600 mt-2">Join thousands of job seekers</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
            <input
              type="text" className="input" placeholder="John Doe" required
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
            <input
              type="email" className="input" placeholder="you@example.com" required
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone (Optional)</label>
            <input
              type="tel" className="input" placeholder="+1 (555) 000-0000"
              value={formData.phone}
              onChange={e => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <input
              type="password" className="input" placeholder="••••••••" required
              value={formData.password}
              onChange={e => setFormData({ ...formData, password: e.target.value })}
            />
            <p className="text-xs text-gray-500 mt-1">Must be at least 6 characters</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
            <input
              type="password" className="input" placeholder="••••••••" required
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
            />
            {/* Inline mismatch hint */}
            {confirmPassword && formData.password !== confirmPassword && (
              <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
            )}
            {confirmPassword && formData.password === confirmPassword && confirmPassword.length > 0 && (
              <p className="text-xs text-emerald-600 mt-1">✓ Passwords match</p>
            )}
          </div>

          <button
            type="submit" disabled={loading}
            className="w-full btn btn-primary py-3 text-base font-semibold"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Creating Account…
              </span>
            ) : 'Create Account'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </Layout>
    );
  }

  // ── Step 2: OTP verification ──────────────────────────────────────────────
  return (
    <Layout>
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-2xl mb-4">
          <span className="text-4xl">📧</span>
        </div>
        <h2 className="text-3xl font-bold text-gray-900">Check your email</h2>
        <p className="text-gray-600 mt-2">We sent a 6-digit code to</p>
        <p className="font-semibold text-gray-900 mt-0.5">{formData.email}</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm text-center">
          {error}
        </div>
      )}

      <form onSubmit={handleVerify} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-4 text-center">
            Enter verification code
          </label>
          <OtpInput value={otp} onChange={setOtp} />
        </div>

        <button
          type="submit"
          disabled={loading || otp.length < 6}
          className="w-full btn btn-primary py-3 text-base font-semibold disabled:opacity-50"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Verifying…
            </span>
          ) : 'Verify Email'}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-gray-600 text-sm">
          Didn't receive a code?{' '}
          {resendTimer > 0 ? (
            <span className="text-gray-400">Resend in {resendTimer}s</span>
          ) : (
            <button onClick={handleResend} className="text-primary font-semibold hover:underline">
              Resend code
            </button>
          )}
        </p>
      </div>

      <div className="mt-3 text-center">
        <button
          onClick={() => { setStep('form'); setError(''); setOtp(''); }}
          className="text-sm text-gray-500 hover:text-gray-700 underline"
        >
          ← Use a different email
        </button>
      </div>
    </Layout>
  );
};

export default Register;