import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { KeyRound, RefreshCw, ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function OtpVerificationPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { verifyLogin, verifyRegister, resendOtp } = useAuth();
  const { showToast } = useNotification();

  const state = location.state || {};
  const { challengeId, purpose = 'register', channel = 'email', destinationMasked, from = '/dashboard' } = state;

  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(30);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  if (!challengeId) {
    return (
      <div className="container" style={{ padding: '5rem 0', textAlign: 'center' }}>
        <h3>No active verification challenge found</h3>
        <p style={{ color: '#64748B', marginTop: '0.5rem', marginBottom: '1.5rem' }}>
          Please start from the sign in or registration page.
        </p>
        <Link to="/login" className="btn btn-secondary">
          Go to Sign In
        </Link>
      </div>
    );
  }

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!code || code.length < 6) {
      showToast('Please enter the 6-digit verification code', 'warning');
      return;
    }

    setLoading(true);
    try {
      if (purpose === 'register') {
        const user = await verifyRegister(challengeId, code.trim());
        showToast(`Registration verified! Welcome, ${user.name}!`, 'success');
        navigate('/dashboard');
      } else {
        const user = await verifyLogin(challengeId, code.trim());
        showToast(`Signed in successfully as ${user.name}`, 'success');
        if (user.role === 'admin') navigate('/admin');
        else if (user.role === 'coordinator') navigate('/coordinator');
        else navigate(from);
      }
    } catch (err) {
      showToast(err.message || 'Invalid or expired OTP code', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    setResending(true);
    try {
      await resendOtp(challengeId);
      showToast('A new verification code has been dispatched', 'success');
      setCountdown(30);
    } catch (err) {
      showToast(err.message || 'Failed to resend code', 'error');
    } finally {
      setResending(false);
    }
  };

  return (
    <div style={{ padding: '3.5rem 0', minHeight: '80vh', display: 'flex', alignItems: 'center' }}>
      <div className="container" style={{ maxWidth: '460px' }}>
        <div className="card" style={{ padding: '2.5rem', textAlign: 'center' }}>
          <div style={{ width: '48px', height: '48px', background: 'rgba(136, 19, 55, 0.1)', color: 'var(--theme-primary)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
            <KeyRound size={24} />
          </div>

          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.85rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.5rem' }}>
            Two-Step Verification
          </h1>

          <p style={{ fontSize: '0.9rem', color: '#64748B', lineHeight: 1.5, marginBottom: '1.75rem' }}>
            We have sent a 6-digit one-time password via <strong>{channel.toUpperCase()}</strong> to{' '}
            <span style={{ color: '#0F172A', fontWeight: 600 }}>{destinationMasked || 'your registered contact'}</span>.
          </p>

          <form onSubmit={handleVerify}>
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <input
                type="text"
                maxLength={6}
                autoFocus
                required
                className="form-input"
                style={{ textAlign: 'center', fontSize: '1.75rem', letterSpacing: '0.35em', fontWeight: 700, padding: '0.75rem' }}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                placeholder="000000"
              />
              <div className="form-helper">Enter the 6 digits</div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
              {loading ? 'Verifying...' : 'Verify & Continue'}
            </button>
          </form>

          <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.85rem' }}>
            <span style={{ color: '#64748B' }}>Didn&apos;t receive code?</span>
            <button
              onClick={handleResend}
              disabled={countdown > 0 || resending}
              style={{ color: countdown > 0 ? '#94A3B8' : 'var(--theme-primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}
            >
              <RefreshCw size={13} className={resending ? 'spin' : ''} />
              <span>{countdown > 0 ? `Resend in ${countdown}s` : 'Resend Code'}</span>
            </button>
          </div>

          <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
            <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: '#64748B', fontSize: '0.85rem' }}>
              <ArrowLeft size={14} />
              <span>Cancel and return to Sign In</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
