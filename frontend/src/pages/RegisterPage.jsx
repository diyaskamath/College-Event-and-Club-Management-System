import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { User, Mail, Lock, Phone, ShieldCheck, AlertCircle, ArrowRight } from 'lucide-react';

export default function RegisterPage() {
  const { register } = useAuth();
  const { showToast } = useNotification();
  const navigate = useNavigate();

  // Role Selection: Student / Coordinator / Admin
  const [selectedRole, setSelectedRole] = useState('student');

  // Form states
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    adminId: '',
    password: '',
    department: 'CSE',
    campusId: 1,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (selectedRole !== 'student') return;

    if (!form.name || !form.email || !form.password) {
      showToast('Please fill out your full name, Outlook mail, and password', 'warning');
      return;
    }
    if (!form.email.includes('@')) {
      showToast('Please enter a valid email address', 'error');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        role: 'student',
        password: form.password,
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        campusId: form.campusId || 1,
        department: form.department || 'CSE'
      };

      const res = await register(payload);
      showToast('Registration initiated! Verification code dispatched.', 'success');

      navigate('/verify-otp', {
        state: {
          challengeId: res.challengeId,
          purpose: 'register',
          channel: res.channel || 'email',
          destinationMasked: res.destinationMasked || res.destination,
          role: 'student'
        },
      });
    } catch (err) {
      showToast(err.message || 'Registration failed', 'error');
    } finally {
      setLoading(false);
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
      <div style={{ width: '100%', maxWidth: '540px' }}>
        <div style={{
          backgroundColor: 'rgba(15, 23, 42, 0.92)',
          border: '2px solid rgba(212, 175, 55, 0.4)',
          borderRadius: '4px',
          padding: '2.5rem',
          boxShadow: '0 20px 45px rgba(0, 0, 0, 0.7), 0 0 25px rgba(212, 175, 55, 0.2)',
          backdropFilter: 'blur(12px)'
        }}>
          
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '1.8rem' }}>
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
              JOIN AMRITA CONNECT
            </h1>
            <p style={{ fontSize: '0.9rem', color: '#94a3b8' }}>
              Create your official account for club participation and campus access
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

          {/* DYNAMIC FORM OR PROVISIONING GUIDANCE */}
          {selectedRole === 'student' ? (
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 600, marginBottom: '0.4rem' }}>
                  Full Name (exactly as written on ID card) *
                </label>
                <div style={{ position: 'relative' }}>
                  <User size={18} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
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
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Diya Kamath"
                  />
                </div>
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 600, marginBottom: '0.4rem' }}>
                  Amrita Outlook Mail *
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
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="cb.en.u4cse22001@cb.students.amrita.edu"
                  />
                </div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.3rem' }}>
                  Verification code will be dispatched to your student Outlook inbox
                </div>
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 600, marginBottom: '0.4rem' }}>
                  Department / Branch *
                </label>
                <select
                  style={{
                    width: '100%',
                    padding: '0.75rem 0.85rem',
                    backgroundColor: 'rgba(5, 12, 28, 0.9)',
                    border: '1px solid rgba(212, 175, 55, 0.4)',
                    color: '#ffffff',
                    fontSize: '0.95rem',
                    boxSizing: 'border-box'
                  }}
                  value={form.department}
                  onChange={(e) => setForm({ ...form, department: e.target.value })}
                >
                  <option value="CSE" style={{ background: '#0f172a' }}>Computer Science (CSE)</option>
                  <option value="ECE" style={{ background: '#0f172a' }}>Electronics & Communication (ECE)</option>
                  <option value="AI" style={{ background: '#0f172a' }}>Artificial Intelligence (AI)</option>
                  <option value="CCE" style={{ background: '#0f172a' }}>Computer & Communication (CCE)</option>
                  <option value="EEE" style={{ background: '#0f172a' }}>Electrical & Electronics (EEE)</option>
                  <option value="Mech" style={{ background: '#0f172a' }}>Mechanical Engineering (Mech)</option>
                  <option value="Aerospace" style={{ background: '#0f172a' }}>Aerospace Engineering</option>
                </select>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 600, marginBottom: '0.4rem' }}>
                  Create Password *
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={18} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input
                    type="password"
                    required
                    minLength={8}
                    style={{
                      width: '100%',
                      padding: '0.75rem 0.85rem 0.75rem 2.6rem',
                      backgroundColor: 'rgba(5, 12, 28, 0.9)',
                      border: '1px solid rgba(212, 175, 55, 0.4)',
                      color: '#ffffff',
                      fontSize: '0.95rem',
                      boxSizing: 'border-box'
                    }}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="At least 8 characters"
                  />
                </div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.3rem' }}>
                  Must contain letters and numbers (min 8 chars)
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
                  borderRadius: '2px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  letterSpacing: '1px',
                  boxShadow: '0 0 20px rgba(212, 175, 55, 0.4)',
                  transition: 'all 0.2s ease',
                  opacity: loading ? 0.7 : 1
                }}
              >
                {loading ? 'DISPATCHING CODE...' : 'VERIFY & REGISTER AS STUDENT'}
              </button>
            </form>
          ) : selectedRole === 'admin' ? (
            <div style={{
              backgroundColor: 'rgba(236, 72, 153, 0.08)',
              border: '1.5px solid rgba(236, 72, 153, 0.4)',
              borderRadius: '4px',
              padding: '1.6rem',
              textAlign: 'center'
            }}>
              <div style={{
                width: '46px',
                height: '46px',
                borderRadius: '50%',
                backgroundColor: 'rgba(236, 72, 153, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem',
                color: '#f472b6'
              }}>
                <ShieldCheck size={26} />
              </div>
              <h3 style={{
                fontFamily: 'Cinzel, serif',
                fontSize: '1.15rem',
                color: '#ffffff',
                marginBottom: '0.5rem',
                letterSpacing: '0.5px'
              }}>
                Administrator Account Provisioning
              </h3>
              <p style={{ fontSize: '0.86rem', color: '#cbd5e1', lineHeight: 1.6, marginBottom: '1.2rem' }}>
                Administrator accounts possess full campus oversight, student data access, and club creation authority.
                For institutional security, Administrator roles cannot be created through public self-registration.
              </p>
              <div style={{
                backgroundColor: 'rgba(5, 12, 28, 0.85)',
                padding: '0.9rem 1.1rem',
                borderRadius: '4px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                fontSize: '0.8rem',
                fontFamily: 'monospace',
                color: '#cbd5e1',
                textAlign: 'left',
                marginBottom: '1.4rem',
                lineHeight: 1.6
              }}>
                <div style={{ color: '#d4af37', fontWeight: 700, marginBottom: '0.3rem' }}>
                  HOW ADMINISTRATORS ARE PROVISIONED:
                </div>
                <div>&bull; Provisioned via backend CLI: <code style={{ color: '#38bdf8' }}>npm run db:seed-accounts</code></div>
                <div>&bull; Configured in <code style={{ color: '#38bdf8' }}>backend/.env</code> (<code style={{ color: '#fef08a' }}>SEED_ADMIN_ID / EMAIL / PHONE</code>)</div>
                <div>&bull; Active Demo Admin IDs: <strong style={{ color: '#ffffff' }}>ADM-001</strong> and <strong style={{ color: '#ffffff' }}>ADM-002</strong></div>
              </div>
              <Link
                to="/login"
                state={{ preselectedRole: 'admin' }}
                style={{
                  display: 'block',
                  backgroundColor: '#d4af37',
                  color: '#05070e',
                  padding: '0.85rem',
                  fontFamily: 'Cinzel, serif',
                  fontWeight: 'bold',
                  fontSize: '0.9rem',
                  textDecoration: 'none',
                  letterSpacing: '1px',
                  boxShadow: '0 0 15px rgba(212, 175, 55, 0.4)',
                  textAlign: 'center'
                }}
              >
                SIGN IN AS ADMINISTRATOR
              </Link>
            </div>
          ) : (
            <div style={{
              backgroundColor: 'rgba(0, 240, 255, 0.08)',
              border: '1.5px solid rgba(0, 240, 255, 0.4)',
              borderRadius: '4px',
              padding: '1.6rem',
              textAlign: 'center'
            }}>
              <div style={{
                width: '46px',
                height: '46px',
                borderRadius: '50%',
                backgroundColor: 'rgba(0, 240, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem',
                color: '#00ffff'
              }}>
                <User size={26} />
              </div>
              <h3 style={{
                fontFamily: 'Cinzel, serif',
                fontSize: '1.15rem',
                color: '#ffffff',
                marginBottom: '0.5rem',
                letterSpacing: '0.5px'
              }}>
                Coordinator Account Assignment
              </h3>
              <p style={{ fontSize: '0.86rem', color: '#cbd5e1', lineHeight: 1.6, marginBottom: '1.2rem' }}>
                Club Coordinator roles have club leadership, event scheduling, and notice board posting privileges.
                Coordinators are appointed and assigned to clubs by an Administrator.
              </p>
              <div style={{
                backgroundColor: 'rgba(5, 12, 28, 0.85)',
                padding: '0.9rem 1.1rem',
                borderRadius: '4px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                fontSize: '0.8rem',
                fontFamily: 'monospace',
                color: '#cbd5e1',
                textAlign: 'left',
                marginBottom: '1.4rem',
                lineHeight: 1.6
              }}>
                <div style={{ color: '#00ffff', fontWeight: 700, marginBottom: '0.3rem' }}>
                  HOW COORDINATORS ARE PROVISIONED:
                </div>
                <div>&bull; Appointed by an Admin inside the <strong style={{ color: '#ffffff' }}>Admin Dashboard</strong></div>
                <div>&bull; Or provisioned via backend CLI: <code style={{ color: '#38bdf8' }}>npm run db:seed-accounts</code></div>
                <div>&bull; Active Demo Coordinator: <strong style={{ color: '#ffffff' }}>coordinator@cb.amrita.edu</strong></div>
              </div>
              <Link
                to="/login"
                state={{ preselectedRole: 'coordinator' }}
                style={{
                  display: 'block',
                  backgroundColor: '#00ffff',
                  color: '#05070e',
                  padding: '0.85rem',
                  fontFamily: 'Cinzel, serif',
                  fontWeight: 'bold',
                  fontSize: '0.9rem',
                  textDecoration: 'none',
                  letterSpacing: '1px',
                  boxShadow: '0 0 15px rgba(0, 240, 255, 0.4)',
                  textAlign: 'center'
                }}
              >
                SIGN IN AS COORDINATOR
              </Link>
            </div>
          )}

          <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: '#94a3b8' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#d4af37', fontWeight: 'bold', textDecoration: 'none' }}>
              Sign in
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
