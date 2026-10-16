import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { Lock, Mail, ArrowRight, ShieldCheck, UserCheck } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const { showToast } = useNotification();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Please enter both email and password', 'warning');
      return;
    }
    setLoading(true);
    try {
      const res = await login(email, password);
      if (res.requiresOtp) {
        showToast('Verification code sent! Please verify OTP.', 'info');
        navigate('/verify-otp', {
          state: {
            challengeId: res.challengeId,
            purpose: res.purpose || 'login',
            channel: res.channel,
            destinationMasked: res.destinationMasked,
            from,
          },
        });
      } else {
        showToast(`Welcome back, ${res.user.name}!`, 'success');
        if (res.user.role === 'admin') navigate('/admin');
        else if (res.user.role === 'coordinator') navigate('/coordinator');
        else navigate(from);
      }
    } catch (err) {
      showToast(err.message || 'Login failed. Please check credentials.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div style={{ padding: '3.5rem 0', minHeight: '80vh', display: 'flex', alignItems: 'center' }}>
      <div className="container" style={{ maxWidth: '480px' }}>
        <div className="card" style={{ padding: '2.5rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ width: '48px', height: '48px', background: 'var(--theme-primary)', color: '#fff', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', fontWeight: 800, fontSize: '1.25rem' }}>
              A
            </div>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.85rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.35rem' }}>
              Sign In to Amrita Connect
            </h1>
            <p style={{ fontSize: '0.9rem', color: '#64748B' }}>
              Access student clubs, registrations, and portal administration
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">University Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                <input
                  type="email"
                  required
                  className="form-input"
                  style={{ paddingLeft: '2.35rem' }}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@cb.students.amrita.edu"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                <input
                  type="password"
                  required
                  className="form-input"
                  style={{ paddingLeft: '2.35rem' }}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }} disabled={loading}>
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>

          {/* Quick Demo Credentials Assistant */}
          <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #E2E8F0', fontSize: '0.825rem' }}>
            <div style={{ fontWeight: 700, color: '#475569', marginBottom: '0.6rem' }}>
              Quick Evaluation Logins:
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                style={{ justifyContent: 'flex-start', fontSize: '0.75rem' }}
                onClick={() => handleQuickLogin('student@cb.students.amrita.edu', 'StudentPass123!')}
              >
                <UserCheck size={14} color="var(--theme-primary)" />
                <span>Demo Student (<code>student@cb.students.amrita.edu</code>)</span>
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                style={{ justifyContent: 'flex-start', fontSize: '0.75rem' }}
                onClick={() => handleQuickLogin('coordinator@cb.amrita.edu', 'CoordPass123!')}
              >
                <ShieldCheck size={14} color="#D97706" />
                <span>Club Coordinator (<code>coordinator@cb.amrita.edu</code>)</span>
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                style={{ justifyContent: 'flex-start', fontSize: '0.75rem' }}
                onClick={() => handleQuickLogin('admin@cb.amrita.edu', 'AdminPass123!')}
              >
                <ShieldCheck size={14} color="#15803D" />
                <span>Portal Administrator (<code>admin@cb.amrita.edu</code>)</span>
              </button>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: '#64748B' }}>
            Don&apos;t have an account yet?{' '}
            <Link to="/register" style={{ color: 'var(--theme-primary)', fontWeight: 600 }}>
              Register here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
