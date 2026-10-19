import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { Lock, Mail, Phone, ShieldCheck, UserCheck, KeyRound, ArrowRight, User } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const { showToast } = useNotification();
  const navigate = useNavigate();
  const location = useLocation();

  // Role Selection: Student / Coordinator / Admin
  const [selectedRole, setSelectedRole] = useState('student');

  // Form inputs
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [adminId, setAdminId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (selectedRole === 'student' && !email) {
      showToast('Please enter your Outlook mail address', 'warning');
      return;
    }
    if (selectedRole === 'admin' && !adminId && !phone) {
      showToast('Please enter your Admin ID or Phone number', 'warning');
      return;
    }
    if (selectedRole === 'coordinator' && !email && !phone) {
      showToast('Please enter your Outlook mail or Phone number', 'warning');
      return;
    }
    if (!password) {
      showToast('Please enter your password', 'warning');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        role: selectedRole,
        password,
        email: (selectedRole === 'student' || selectedRole === 'coordinator') ? email : undefined,
        phone: (selectedRole === 'admin' || selectedRole === 'coordinator') ? phone : undefined,
        adminId: selectedRole === 'admin' ? adminId : undefined,
      };

      const res = await login(payload);
      if (res.requiresOtp) {
        showToast('Verification code dispatched! Please verify OTP.', 'info');
        navigate('/verify-otp', {
          state: {
            challengeId: res.challengeId,
            purpose: res.purpose || 'login',
            channel: res.channel,
            destinationMasked: res.destinationMasked || res.destination,
            role: selectedRole,
            from,
          },
        });
      } else {
        showToast(`Welcome back, ${res.user.name}!`, 'success');
        if (res.user.role === 'admin') navigate('/admin');
        else if (res.user.role === 'coordinator') navigate('/coordinator');
        else navigate('/dashboard');
      }
    } catch (err) {
      showToast(err.message || 'Login failed. Please check credentials.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (role, idOrEmail, pass, phoneNum = '') => {
    setSelectedRole(role);
    setPassword(pass);
    if (role === 'student') {
      setEmail(idOrEmail);
      setPhone('');
      setAdminId('');
    } else if (role === 'coordinator') {
      setEmail(idOrEmail);
      setPhone(phoneNum || '+919876543210');
      setAdminId('');
    } else if (role === 'admin') {
      setAdminId('ADM-001');
      setEmail(idOrEmail);
      setPhone(phoneNum || '+919876543211');
    }
  };

  return (
    <div style={{
      padding: '7rem 1.5rem 5rem 1.5rem',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#05070e',
      backgroundImage: `
        radial-gradient(circle at 10% 20%, rgba(212, 175, 55, 0.08) 0%, transparent 40%),
        radial-gradient(circle at 90% 80%, rgba(136, 19, 55, 0.12) 0%, transparent 45%),
        linear-gradient(180deg, #05070e 0%, #0d1222 50%, #080a14 100%)
      `
    }}>
      <div style={{ width: '100%', maxWidth: '520px' }}>
        <div style={{
          backgroundColor: 'rgba(15, 23, 42, 0.92)',
          border: '2px solid rgba(212, 175, 55, 0.4)',
          borderRadius: '4px',
          padding: '2.5rem',
          boxShadow: '0 20px 45px rgba(0, 0, 0, 0.7), 0 0 25px rgba(212, 175, 55, 0.2)',
          backdropFilter: 'blur(12px)'
        }}>
          
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{
              width: '52px',
              height: '52px',
              background: '#d4af37',
              color: '#05070e',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
              fontWeight: 900,
              fontFamily: 'Cinzel, serif',
              fontSize: '1.5rem',
              boxShadow: '0 0 15px rgba(212, 175, 55, 0.6)'
            }}>
              A
            </div>
            <h1 style={{
              fontFamily: 'Cinzel, serif',
              fontSize: '2rem',
              fontWeight: 700,
              color: '#ffffff',
              marginBottom: '0.4rem',
              letterSpacing: '1px'
            }}>
              SIGN IN // AMRITA CONNECT
            </h1>
            <p style={{ fontSize: '0.9rem', color: '#94a3b8' }}>
              Access student clubs, registrations, and campus operations
            </p>
          </div>

          {/* INITIAL PROMPT: Are you a Student / Coordinator / Admin? */}
          <div style={{ marginBottom: '1.8rem' }}>
            <label style={{
              display: 'block',
              fontFamily: 'Cinzel, serif',
              fontWeight: 700,
              fontSize: '0.9rem',
              color: '#d4af37',
              marginBottom: '0.6rem',
              letterSpacing: '1px'
            }}>
              Are you a Student / Coordinator / Admin?
            </label>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '0.5rem',
              background: 'rgba(0, 0, 0, 0.4)',
              padding: '0.35rem',
              border: '1px solid rgba(212, 175, 55, 0.3)'
            }}>
              {[
                { id: 'student', label: 'Student' },
                { id: 'coordinator', label: 'Coordinator' },
                { id: 'admin', label: 'Admin' },
              ].map((role) => (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => setSelectedRole(role.id)}
                  style={{
                    backgroundColor: selectedRole === role.id ? '#d4af37' : 'transparent',
                    color: selectedRole === role.id ? '#05070e' : '#cbd5e1',
                    padding: '0.6rem 0.5rem',
                    fontFamily: 'Cinzel, serif',
                    fontWeight: 'bold',
                    fontSize: '0.85rem',
                    letterSpacing: '0.5px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: selectedRole === role.id ? '0 0 12px rgba(212, 175, 55, 0.5)' : 'none'
                  }}
                >
                  {role.label}
                </button>
              ))}
            </div>
          </div>

          {/* DYNAMIC FORM FIELDS */}
          <form onSubmit={handleSubmit}>
            
            {/* Student: Outlook Mail */}
            {selectedRole === 'student' && (
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 600, marginBottom: '0.4rem' }}>
                  Outlook Mail (@cb.students.amrita.edu) *
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={18} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input
                    type="email"
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem 0.85rem 0.75rem 2.6rem',
                      backgroundColor: 'rgba(5, 12, 28, 0.9)',
                      border: '1px solid rgba(212, 175, 55, 0.4)',
                      color: '#ffffff',
                      fontSize: '0.95rem',
                      boxSizing: 'border-box'
                    }}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@cb.students.amrita.edu"
                  />
                </div>
              </div>
            )}

            {/* Admin: Phone Number or ID */}
            {selectedRole === 'admin' && (
              <>
                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 600, marginBottom: '0.4rem' }}>
                    Admin ID (e.g. ADM-001) or Email *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <ShieldCheck size={18} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input
                      type="text"
                      required
                      style={{
                        width: '100%',
                        padding: '0.75rem 0.85rem 0.75rem 2.6rem',
                        backgroundColor: 'rgba(5, 12, 28, 0.9)',
                        border: '1px solid rgba(212, 175, 55, 0.4)',
                        color: '#ffffff',
                        fontSize: '0.95rem',
                        boxSizing: 'border-box'
                      }}
                      value={adminId}
                      onChange={(e) => setAdminId(e.target.value)}
                      placeholder="ADM-001 or admin@cb.amrita.edu"
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 600, marginBottom: '0.4rem' }}>
                    Phone Number (Registered for SMS OTP)
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Phone size={18} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input
                      type="text"
                      style={{
                        width: '100%',
                        padding: '0.75rem 0.85rem 0.75rem 2.6rem',
                        backgroundColor: 'rgba(5, 12, 28, 0.9)',
                        border: '1px solid rgba(212, 175, 55, 0.4)',
                        color: '#ffffff',
                        fontSize: '0.95rem',
                        boxSizing: 'border-box'
                      }}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+919876543211 (optional if using ID)"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Coordinator: Phone Number and/or Outlook Mail */}
            {selectedRole === 'coordinator' && (
              <>
                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 600, marginBottom: '0.4rem' }}>
                    Outlook Mail *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={18} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input
                      type="email"
                      required
                      style={{
                        width: '100%',
                        padding: '0.75rem 0.85rem 0.75rem 2.6rem',
                        backgroundColor: 'rgba(5, 12, 28, 0.9)',
                        border: '1px solid rgba(212, 175, 55, 0.4)',
                        color: '#ffffff',
                        fontSize: '0.95rem',
                        boxSizing: 'border-box'
                      }}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="coordinator@cb.amrita.edu"
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 600, marginBottom: '0.4rem' }}>
                    Registered Phone Number
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Phone size={18} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input
                      type="text"
                      style={{
                        width: '100%',
                        padding: '0.75rem 0.85rem 0.75rem 2.6rem',
                        backgroundColor: 'rgba(5, 12, 28, 0.9)',
                        border: '1px solid rgba(212, 175, 55, 0.4)',
                        color: '#ffffff',
                        fontSize: '0.95rem',
                        boxSizing: 'border-box'
                      }}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+919876543210"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Password Field (Common to all roles) */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 600, marginBottom: '0.4rem' }}>
                Password *
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input
                  type="password"
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem 0.85rem 0.75rem 2.6rem',
                    backgroundColor: 'rgba(5, 12, 28, 0.9)',
                    border: '1px solid rgba(212, 175, 55, 0.4)',
                    color: '#ffffff',
                    fontSize: '0.95rem',
                    boxSizing: 'border-box'
                  }}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                backgroundColor: '#d4af37',
                color: '#05070e',
                padding: '0.85rem',
                fontFamily: 'Cinzel, serif',
                fontWeight: 'bold',
                fontSize: '1rem',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                letterSpacing: '1px',
                boxShadow: '0 0 15px rgba(212, 175, 55, 0.4)',
                transition: 'all 0.2s ease',
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? 'AUTHENTICATING...' : `SIGN IN AS ${selectedRole.toUpperCase()}`}
            </button>
          </form>

          {/* Quick Demo Credentials Assistant */}
          <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255, 255, 255, 0.1)', fontSize: '0.825rem' }}>
            <div style={{ fontWeight: 700, color: '#d4af37', marginBottom: '0.6rem', fontFamily: 'Cinzel, serif', letterSpacing: '0.5px' }}>
              ⚡ Quick Evaluation Logins:
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <button
                type="button"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 0.8rem',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(212, 175, 55, 0.2)',
                  color: '#cbd5e1',
                  cursor: 'pointer',
                  fontSize: '0.78rem',
                  textAlign: 'left'
                }}
                onClick={() => handleQuickLogin('student', 'student@cb.students.amrita.edu', 'StudentPass123!')}
              >
                <UserCheck size={14} color="#d4af37" />
                <span><strong>Demo Student:</strong> student@cb.students.amrita.edu</span>
              </button>
              <button
                type="button"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 0.8rem',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(212, 175, 55, 0.2)',
                  color: '#cbd5e1',
                  cursor: 'pointer',
                  fontSize: '0.78rem',
                  textAlign: 'left'
                }}
                onClick={() => handleQuickLogin('coordinator', 'coordinator@cb.amrita.edu', 'CoordPass123!', '+919876543210')}
              >
                <ShieldCheck size={14} color="#00ffff" />
                <span><strong>Coordinator:</strong> coordinator@cb.amrita.edu</span>
              </button>
              <button
                type="button"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 0.8rem',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(212, 175, 55, 0.2)',
                  color: '#cbd5e1',
                  cursor: 'pointer',
                  fontSize: '0.78rem',
                  textAlign: 'left'
                }}
                onClick={() => handleQuickLogin('admin', 'admin@cb.amrita.edu', 'AdminPass123!', '+919876543211')}
              >
                <ShieldCheck size={14} color="#ec4899" />
                <span><strong>Admin (ID: ADM-001):</strong> admin@cb.amrita.edu</span>
              </button>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: '#94a3b8' }}>
            Don&apos;t have an account yet?{' '}
            <Link to="/register" style={{ color: '#d4af37', fontWeight: 'bold', textDecoration: 'none' }}>
              Create Account
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
