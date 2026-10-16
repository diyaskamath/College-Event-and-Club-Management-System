import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { User, Mail, Lock, Building, ArrowRight, AlertCircle } from 'lucide-react';

export default function RegisterPage() {
  const { register } = useAuth();
  const { showToast } = useNotification();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    campusId: 1,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      showToast('Please fill out all required fields', 'warning');
      return;
    }

    if (!form.email.endsWith('@cb.students.amrita.edu')) {
      showToast('Registration is restricted to @cb.students.amrita.edu email addresses', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await register(form);
      showToast('Registration initiated! Please enter the OTP verification code.', 'success');
      navigate('/verify-otp', {
        state: {
          challengeId: res.challengeId,
          purpose: 'register',
          channel: res.channel || 'email',
          destinationMasked: res.destinationMasked || form.email,
        },
      });
    } catch (err) {
      showToast(err.message || 'Registration failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '3.5rem 0', minHeight: '80vh', display: 'flex', alignItems: 'center' }}>
      <div className="container" style={{ maxWidth: '500px' }}>
        <div className="card" style={{ padding: '2.5rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ width: '48px', height: '48px', background: 'var(--theme-primary)', color: '#fff', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', fontWeight: 800, fontSize: '1.25rem' }}>
              A
            </div>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.85rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.35rem' }}>
              Student Registration
            </h1>
            <p style={{ fontSize: '0.9rem', color: '#64748B' }}>
              Create your official Amrita Connect student account
            </p>
          </div>

          <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', padding: '0.75rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: '#1E40AF' }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>Registration requires an official Amrita student email (<code>@cb.students.amrita.edu</code>).</span>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <div style={{ position: 'relative' }}>
                <User size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                <input
                  type="text"
                  required
                  className="form-input"
                  style={{ paddingLeft: '2.35rem' }}
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Diya Kamath"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Student Email *</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                <input
                  type="email"
                  required
                  className="form-input"
                  style={{ paddingLeft: '2.35rem' }}
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="cb.en.u4cse22001@cb.students.amrita.edu"
                />
              </div>
              <div className="form-helper">Must end with @cb.students.amrita.edu</div>
            </div>

            <div className="form-group">
              <label className="form-label">Password *</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                <input
                  type="password"
                  required
                  minLength={8}
                  className="form-input"
                  style={{ paddingLeft: '2.35rem' }}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="At least 8 characters"
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }} disabled={loading}>
              {loading ? 'Creating Account...' : 'Continue to OTP Verification'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: '#64748B' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--theme-primary)', fontWeight: 600 }}>
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
