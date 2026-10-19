import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { KeyRound, RefreshCw, ArrowLeft, Mail, Phone, ShieldCheck } from 'lucide-react';

export default function OtpVerificationPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { verifyLogin, verifyRegister, resendOtp } = useAuth();
  const { showToast } = useNotification();

  const state = location.state || {};
  const {
    challengeId,
    purpose = 'register',
    channel = 'email',
    destinationMasked,
    role = 'student',
    from = '/dashboard'
  } = state;

  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  if (!challengeId) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#05070e',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem'
      }}>
        <div style={{
          backgroundColor: 'rgba(15, 23, 42, 0.95)',
          border: '2px solid rgba(212, 175, 55, 0.4)',
          borderRadius: '6px',
          padding: '2.5rem',
          maxWidth: '460px',
          textAlign: 'center',
          boxShadow: '0 20px 45px rgba(0, 0, 0, 0.7)'
        }}>
          <h3 style={{ fontFamily: 'Cinzel, serif', color: '#d4af37', marginBottom: '1rem', fontSize: '1.4rem' }}>
            No Active Verification Session
          </h3>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1.8rem', lineHeight: 1.6 }}>
            Please initiate verification by signing in or completing registration.
          </p>
          <Link
            to="/login"
            style={{
              display: 'inline-block',
              backgroundColor: '#d4af37',
              color: '#05070e',
              fontFamily: 'Cinzel, serif',
              fontWeight: 700,
              padding: '0.65rem 1.5rem',
              textDecoration: 'none',
              letterSpacing: '1px'
            }}
          >
            Go to Sign In
          </Link>
        </div>
      </div>
    );
  }

  const handleVerify = async (e) => {
    if (e) e.preventDefault();
    if (!code || code.length < 6) {
      showToast('Please enter the 6-digit verification code', 'warning');
      return;
    }

    setLoading(true);
    try {
      if (purpose === 'register') {
        const user = await verifyRegister(challengeId, code.trim());
        showToast(`Verification successful! Welcome, ${user.name}!`, 'success');
        if (user.role === 'admin') navigate('/admin');
        else if (user.role === 'coordinator') navigate('/coordinator');
        else navigate('/dashboard');
      } else {
        const user = await verifyLogin(challengeId, code.trim());
        showToast(`Signed in successfully as ${user.name}`, 'success');
        if (user.role === 'admin') navigate('/admin');
        else if (user.role === 'coordinator') navigate('/coordinator');
        else navigate(from || '/dashboard');
      }
    } catch (err) {
      showToast(err.message || 'Invalid or expired verification code', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0 || resending) return;
    setResending(true);
    try {
      await resendOtp(challengeId);
      showToast('A fresh verification code has been dispatched.', 'success');
      setCountdown(60);
    } catch (err) {
      showToast(err.message || 'Failed to resend code', 'error');
    } finally {
      setResending(false);
    }
  };

  const getChannelInfo = () => {
    if (role === 'admin' || channel === 'sms') {
      return {
        badge: 'Administrator SMS Verification',
        icon: <Phone size={18} color="#ef4444" />,
        text: 'A verification code has been dispatched via SMS to your registered administrator phone number',
        detail: destinationMasked || 'registered mobile number',
        neutralNote: 'If this administrator account is registered, a code has been sent via SMS.'
      };
    }
    if (role === 'coordinator') {
      return {
        badge: 'Coordinator SMS Verification',
        icon: <Phone size={18} color="#a855f7" />,
        text: 'A verification code has been dispatched via SMS to your registered coordinator mobile number',
        detail: destinationMasked || 'registered mobile number',
        neutralNote: 'If this coordinator account is registered, a code has been sent via SMS.'
      };
    }
    return {
      badge: 'Student Outlook Mail Verification',
      icon: <Mail size={18} color="#d4af37" />,
      text: 'A verification code has been sent to your registered Amrita Outlook email address',
      detail: destinationMasked || 'registered Outlook email',
      neutralNote: 'If the address is eligible, a verification code has been sent to your registered email.'
    };
  };

  const chInfo = getChannelInfo();

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#05070e',
      backgroundImage: `
        radial-gradient(circle at 50% 15%, rgba(212, 175, 55, 0.08) 0%, transparent 50%),
        radial-gradient(circle at 80% 80%, rgba(0, 240, 255, 0.06) 0%, transparent 40%),
        linear-gradient(180deg, #05070e 0%, #0a0f1d 50%, #05070e 100%)
      `,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '6rem 1.5rem 4rem 1.5rem',
      color: '#ffffff'
    }}>
      <div style={{ width: '100%', maxWidth: '480px' }}>
        <div style={{
          backgroundColor: 'rgba(15, 23, 42, 0.94)',
          border: '2px solid rgba(212, 175, 55, 0.45)',
          borderRadius: '4px',
          padding: '2.5rem',
          boxShadow: '0 20px 45px rgba(0, 0, 0, 0.75), 0 0 25px rgba(212, 175, 55, 0.2)',
          backdropFilter: 'blur(12px)',
          textAlign: 'center'
        }}>
          
          {/* Key Icon */}
          <div style={{
            width: '56px',
            height: '56px',
            background: 'linear-gradient(135deg, #d4af37 0%, #b89628 100%)',
            color: '#05070e',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.25rem',
            boxShadow: '0 0 20px rgba(212, 175, 55, 0.5)'
          }}>
            <KeyRound size={28} />
          </div>

          {/* Heading */}
          <h1 style={{
            fontFamily: 'Cinzel, serif',
            fontSize: '1.8rem',
            fontWeight: 700,
            color: '#d4af37',
            marginBottom: '0.4rem',
            letterSpacing: '2px'
          }}>
            AUTHENTICATION VERIFICATION
          </h1>

          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            backgroundColor: 'rgba(212, 175, 55, 0.1)',
            border: '1px solid rgba(212, 175, 55, 0.35)',
            padding: '0.3rem 0.8rem',
            borderRadius: '20px',
            fontSize: '0.8rem',
            color: '#f8fafc',
            fontFamily: 'Cinzel, serif',
            marginBottom: '1.25rem',
            letterSpacing: '1px'
          }}>
            {chInfo.icon}
            <span>{chInfo.badge}</span>
          </div>

          <p style={{
            fontSize: '0.9rem',
            color: '#cbd5e1',
            lineHeight: 1.6,
            marginBottom: '0.6rem'
          }}>
            {chInfo.text}:{' '}
            <strong style={{ color: '#00ffff' }}>{chInfo.detail}</strong>
          </p>

          <p style={{
            fontSize: '0.8rem',
            color: '#94a3b8',
            fontStyle: 'italic',
            lineHeight: 1.5,
            marginBottom: '1.8rem'
          }}>
            {chInfo.neutralNote}
          </p>

          <form onSubmit={handleVerify}>
            <div style={{ marginBottom: '1.5rem' }}>
              <input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                autoFocus
                required
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                placeholder="000000"
                style={{
                  width: '100%',
                  textAlign: 'center',
                  fontSize: '2rem',
                  letterSpacing: '0.35em',
                  fontWeight: 700,
                  padding: '0.8rem',
                  backgroundColor: '#090d18',
                  color: '#d4af37',
                  border: '2px solid rgba(212, 175, 55, 0.5)',
                  borderRadius: '4px',
                  outline: 'none',
                  boxShadow: 'inset 0 2px 8px rgba(0, 0, 0, 0.6), 0 0 15px rgba(212, 175, 55, 0.2)'
                }}
              />
              <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.5rem', fontFamily: 'monospace' }}>
                Enter the 6-digit one-time passcode
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || code.length < 6}
              style={{
                width: '100%',
                backgroundColor: '#d4af37',
                color: '#05070e',
                border: 'none',
                padding: '0.9rem',
                fontFamily: 'Cinzel, serif',
                fontSize: '1rem',
                fontWeight: 700,
                letterSpacing: '2px',
                cursor: (loading || code.length < 6) ? 'not-allowed' : 'pointer',
                opacity: (loading || code.length < 6) ? 0.6 : 1,
                boxShadow: '0 0 15px rgba(212, 175, 55, 0.4)',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                if (!loading && code.length === 6) {
                  e.currentTarget.style.backgroundColor = '#ffffff';
                  e.currentTarget.style.boxShadow = '0 0 20px rgba(255, 255, 255, 0.6)';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading && code.length === 6) {
                  e.currentTarget.style.backgroundColor = '#d4af37';
                  e.currentTarget.style.boxShadow = '0 0 15px rgba(212, 175, 55, 0.4)';
                }
              }}
            >
              {loading ? 'VERIFYING...' : 'VERIFY & CONTINUE'}
            </button>
          </form>

          {/* Resend and Back links */}
          <div style={{
            marginTop: '1.8rem',
            paddingTop: '1.25rem',
            borderTop: '1px solid rgba(212, 175, 55, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.85rem'
          }}>
            <span style={{ color: '#94a3b8' }}>Didn&apos;t receive code?</span>
            <button
              type="button"
              onClick={handleResend}
              disabled={countdown > 0 || resending}
              style={{
                background: 'none',
                border: 'none',
                color: countdown > 0 ? '#64748b' : '#00ffff',
                fontWeight: 600,
                cursor: countdown > 0 || resending ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontFamily: 'Cinzel, serif',
                letterSpacing: '1px'
              }}
            >
              <RefreshCw size={13} style={{ animation: resending ? 'spin 1s linear infinite' : 'none' }} />
              <span>{countdown > 0 ? `Resend in ${countdown}s` : 'Resend Code'}</span>
            </button>
          </div>

          <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
            <Link
              to="/login"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                color: '#94a3b8',
                fontSize: '0.85rem',
                textDecoration: 'none',
                transition: 'color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#d4af37'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}
            >
              <ArrowLeft size={14} />
              <span>Cancel and return to Sign In</span>
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
