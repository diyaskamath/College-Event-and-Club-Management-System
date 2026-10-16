import React, { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import {
  Bell,
  Menu,
  X,
  User,
  LogOut,
  Calendar,
  Compass,
  LayoutDashboard,
  Shield,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, isCoordinator, isAdmin, logout } = useAuth();
  const { unreadCount, notifications, fetchNotifications, markAsRead, markAllAsRead } = useNotification();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const notifRef = useRef(null);
  const navigate = useNavigate();

  // Close notification dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotifDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleBellClick = () => {
    const nextState = !notifDropdownOpen;
    setNotifDropdownOpen(nextState);
    if (nextState) {
      fetchNotifications({ limit: 10 });
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const getDashboardPath = () => {
    if (isAdmin) return '/admin';
    if (isCoordinator) return '/coordinator';
    return '/dashboard';
  };

  return (
    <header className="site-header">
      <div className="container">
        <nav className="navbar">
          {/* Logo / Brand */}
          <Link to="/" className="nav-brand">
            <div className="nav-brand-logo">A</div>
            <div>
              <span>Amrita Connect</span>
              <span style={{ display: 'block', fontSize: '0.65rem', fontWeight: 600, color: '#64748B', letterSpacing: '0.04em' }}>
                CECMS PORTAL
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <ul className={`nav-links ${mobileMenuOpen ? 'open' : ''}`}>
            <li>
              <NavLink to="/" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setMobileMenuOpen(false)}>
                Home
              </NavLink>
            </li>
            <li>
              <NavLink to="/clubs" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setMobileMenuOpen(false)}>
                Clubs
              </NavLink>
            </li>
            <li>
              <NavLink to="/events" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setMobileMenuOpen(false)}>
                Events
              </NavLink>
            </li>

            {isAuthenticated && (
              <li>
                <NavLink to={getDashboardPath()} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setMobileMenuOpen(false)}>
                  Dashboard
                </NavLink>
              </li>
            )}
          </ul>

          {/* Right Action buttons */}
          <div className="nav-actions">
            {isAuthenticated ? (
              <>
                {/* Persistent Notification Bell */}
                <div style={{ position: 'relative' }} ref={notifRef}>
                  <button
                    className="notif-bell-btn"
                    onClick={handleBellClick}
                    aria-label={`Notifications, ${unreadCount} unread`}
                  >
                    <Bell size={20} />
                    {unreadCount > 0 && <span className="notif-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>}
                  </button>

                  {/* Dropdown Box */}
                  {notifDropdownOpen && (
                    <div className="notif-dropdown">
                      <div className="notif-header">
                        <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Notifications</span>
                        {unreadCount > 0 && (
                          <button
                            onClick={markAllAsRead}
                            style={{ fontSize: '0.75rem', color: 'var(--theme-primary)', fontWeight: 600 }}
                          >
                            Mark all read
                          </button>
                        )}
                      </div>

                      <div className="notif-list">
                        {notifications.length === 0 ? (
                          <div style={{ padding: '2rem 1rem', textAlign: 'center', color: '#94A3B8', fontSize: '0.85rem' }}>
                            No notifications yet
                          </div>
                        ) : (
                          notifications.map((n) => (
                            <div
                              key={n.id}
                              className={`notif-item ${!n.is_read ? 'unread' : ''}`}
                              onClick={() => !n.is_read && markAsRead(n.id)}
                            >
                              <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '0.825rem', fontWeight: n.is_read ? 500 : 700, color: '#1E293B' }}>
                                  {n.title}
                                </div>
                                <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.2rem' }}>
                                  {n.body}
                                </div>
                                <div style={{ fontSize: '0.7rem', color: '#94A3B8', marginTop: '0.35rem' }}>
                                  {new Date(n.created_at).toLocaleString()}
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* User Info / Role & Logout */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Link
                    to={getDashboardPath()}
                    className="btn btn-secondary btn-sm"
                    style={{ padding: '0.4rem 0.75rem' }}
                  >
                    <User size={15} />
                    <span style={{ maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {user.name.split(' ')[0]}
                    </span>
                    <span style={{ fontSize: '0.65rem', background: 'rgba(0,0,0,0.06)', padding: '0.1rem 0.35rem', borderRadius: '4px', textTransform: 'uppercase', fontWeight: 700 }}>
                      {user.role}
                    </span>
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="btn btn-secondary btn-sm"
                    title="Sign Out"
                    aria-label="Sign Out"
                    style={{ padding: '0.4rem' }}
                  >
                    <LogOut size={16} />
                  </button>
                </div>
              </>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Link to="/login" className="btn btn-secondary btn-sm">
                  Sign In
                </Link>
                <Link to="/register" className="btn btn-primary btn-sm">
                  Register
                </Link>
              </div>
            )}

            {/* Mobile Hamburger toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{ display: 'flex', padding: '0.5rem', color: '#475569' }}
              className="mobile-toggle"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
}
