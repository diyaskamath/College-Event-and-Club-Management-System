import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { LogOut, ChevronDown, LayoutDashboard, ShieldAlert, Users } from 'lucide-react';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, isAdmin, isCoordinator, logout } = useAuth();
  const { showToast } = useNotification();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const linkStyle = (path) => ({
    color: location.pathname === path ? '#d4af37' : '#ffffff',
    textDecoration: 'none',
    fontSize: '1rem',
    fontWeight: 'bold',
    fontFamily: 'Cinzel, serif',
    padding: '0.5rem 0.8rem',
    transition: 'all 0.3s ease',
    textShadow: '1px 1px 4px rgba(0,0,0,0.8)',
    borderBottom: location.pathname === path ? '2px solid #d4af37' : '2px solid transparent',
    letterSpacing: '1px'
  });

  const handleLogout = async () => {
    await logout();
    setDropdownOpen(false);
    showToast('Signed out successfully', 'info');
    navigate('/');
  };

  const getRoleBadgeColor = () => {
    if (isAdmin) return '#ef4444';
    if (isCoordinator) return '#a855f7';
    return '#d4af37';
  };

  const getRoleLabel = () => {
    if (isAdmin) return 'ADMIN';
    if (isCoordinator) return 'COORDINATOR';
    return 'STUDENT';
  };

  const getDashboardLink = () => {
    if (isAdmin) return '/admin';
    if (isCoordinator) return '/coordinator';
    return '/dashboard';
  };

  return (
    <nav style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      zIndex: 1000,
      backgroundColor: 'rgba(8, 12, 22, 0.82)',
      backdropFilter: 'blur(14px)',
      WebkitBackdropFilter: 'blur(14px)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '0.9rem 3.5rem',
      borderBottom: '1px solid rgba(212, 175, 55, 0.35)',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
      boxSizing: 'border-box'
    }}>
      {/* Logo */}
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
        <span style={{
          width: '32px',
          height: '32px',
          backgroundColor: '#d4af37',
          color: '#0a0d14',
          borderRadius: '4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: '900',
          fontFamily: 'Cinzel, serif',
          fontSize: '1.2rem',
          boxShadow: '0 0 10px rgba(212, 175, 55, 0.6)'
        }}>
          A
        </span>
        <span style={{
          fontFamily: 'Cinzel, serif',
          fontSize: '1.4rem',
          fontWeight: 'bold',
          color: '#d4af37',
          letterSpacing: '2px',
          textShadow: '0 0 10px rgba(212, 175, 55, 0.4)'
        }}>
          AMRITA CONNECT
        </span>
      </Link>

      {/* Centre Nav Links */}
      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
        <Link to="/" style={linkStyle('/')}>Home</Link>
        <Link to="/events" style={linkStyle('/events')}>Events</Link>
        <Link to="/clubs" style={linkStyle('/clubs')}>Clubs</Link>
        <Link to="/campus-life" style={linkStyle('/campus-life')}>Campus Life</Link>
        <Link to="/calendar" style={linkStyle('/calendar')}>Calendar</Link>
        <Link to="/about" style={linkStyle('/about')}>About</Link>
      </div>

      {/* Right: Auth Buttons or User Menu */}
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        {isAuthenticated && user ? (
          // Authenticated: show user menu with role
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor: 'rgba(212, 175, 55, 0.12)',
                border: `1px solid ${getRoleBadgeColor()}`,
                color: '#ffffff',
                padding: '0.4rem 0.9rem',
                borderRadius: '2px',
                cursor: 'pointer',
                fontFamily: 'Cinzel, serif',
                fontSize: '0.85rem',
                fontWeight: 700,
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(212, 175, 55, 0.22)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(212, 175, 55, 0.12)'}
            >
              {/* Role Badge */}
              <span style={{
                backgroundColor: getRoleBadgeColor(),
                color: '#ffffff',
                padding: '0.1rem 0.4rem',
                borderRadius: '2px',
                fontSize: '0.68rem',
                fontWeight: 900,
                letterSpacing: '1px'
              }}>
                {getRoleLabel()}
              </span>
              <span style={{ maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user.name?.split(' ')[0] || 'User'}
              </span>
              <ChevronDown size={14} style={{ transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div style={{
                position: 'absolute',
                top: 'calc(100% + 6px)',
                right: 0,
                width: '210px',
                backgroundColor: 'rgba(9, 13, 24, 0.98)',
                border: '1.5px solid rgba(212, 175, 55, 0.4)',
                borderRadius: '4px',
                boxShadow: '0 15px 35px rgba(0, 0, 0, 0.8)',
                zIndex: 2000,
                overflow: 'hidden'
              }}>
                {/* User info header */}
                <div style={{
                  padding: '0.85rem 1rem',
                  borderBottom: '1px solid rgba(212, 175, 55, 0.25)',
                  fontSize: '0.8rem'
                }}>
                  <div style={{ color: '#d4af37', fontFamily: 'Cinzel, serif', fontWeight: 700 }}>{user.name}</div>
                  <div style={{ color: '#94a3b8', fontSize: '0.75rem', marginTop: '0.1rem' }}>{user.email}</div>
                </div>

                {/* Dashboard link */}
                <Link
                  to="/dashboard"
                  onClick={() => setDropdownOpen(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.7rem 1rem',
                    color: '#ffffff',
                    textDecoration: 'none',
                    fontSize: '0.85rem',
                    fontFamily: 'Cinzel, serif',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(212, 175, 55, 0.12)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <LayoutDashboard size={14} color="#d4af37" />
                  <span>Campus Portal</span>
                </Link>

                {isAdmin && (
                  <Link
                    to="/admin"
                    onClick={() => setDropdownOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.7rem 1rem',
                      color: '#fca5a5',
                      textDecoration: 'none',
                      fontSize: '0.85rem',
                      fontFamily: 'Cinzel, serif',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <ShieldAlert size={14} color="#ef4444" />
                    <span>Admin Console</span>
                  </Link>
                )}

                {isCoordinator && !isAdmin && (
                  <Link
                    to="/coordinator"
                    onClick={() => setDropdownOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.7rem 1rem',
                      color: '#e9d5ff',
                      textDecoration: 'none',
                      fontSize: '0.85rem',
                      fontFamily: 'Cinzel, serif',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(168, 85, 247, 0.1)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <Users size={14} color="#a855f7" />
                    <span>Coordinator Console</span>
                  </Link>
                )}

                <Link
                  to="/calendar"
                  onClick={() => setDropdownOpen(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.7rem 1rem',
                    color: '#67e8f9',
                    textDecoration: 'none',
                    fontSize: '0.85rem',
                    fontFamily: 'Cinzel, serif',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 240, 255, 0.1)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <span style={{ fontSize: '14px' }}>📅</span>
                  <span>Academic Calendar</span>
                </Link>

                {/* Logout */}
                <div style={{ borderTop: '1px solid rgba(212, 175, 55, 0.2)' }}>
                  <button
                    type="button"
                    onClick={handleLogout}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.7rem 1rem',
                      color: '#f87171',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      fontFamily: 'Cinzel, serif',
                      textAlign: 'left',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <LogOut size={14} />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}

            {/* Overlay to close dropdown */}
            {dropdownOpen && (
              <div
                style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  width: '100vw',
                  height: '100vh',
                  zIndex: 1999
                }}
                onClick={() => setDropdownOpen(false)}
              />
            )}
          </div>
        ) : (
          // Unauthenticated: show Login / Sign Up buttons
          <>
            <Link
              to="/login"
              style={{
                color: '#e2e8f0',
                textDecoration: 'none',
                fontWeight: 'bold',
                fontSize: '0.9rem',
                fontFamily: 'Cinzel, serif',
                padding: '0.5rem 1rem',
                transition: 'color 0.2s ease',
                letterSpacing: '1px'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#d4af37'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#e2e8f0'}
            >
              LOG IN
            </Link>
            <Link
              to="/register"
              style={{
                backgroundColor: '#d4af37',
                color: '#0a0f1a',
                padding: '0.5rem 1.4rem',
                borderRadius: '0px',
                textDecoration: 'none',
                fontWeight: 'bold',
                fontSize: '0.9rem',
                fontFamily: 'Cinzel, serif',
                letterSpacing: '1px',
                boxShadow: '0 0 15px rgba(212, 175, 55, 0.35)',
                border: '1px solid #fff',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#ffffff';
                e.currentTarget.style.color = '#000000';
                e.currentTarget.style.boxShadow = '0 0 20px rgba(255, 255, 255, 0.6)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#d4af37';
                e.currentTarget.style.color = '#0a0f1a';
                e.currentTarget.style.boxShadow = '0 0 15px rgba(212, 175, 55, 0.35)';
              }}
            >
              SIGN UP
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}