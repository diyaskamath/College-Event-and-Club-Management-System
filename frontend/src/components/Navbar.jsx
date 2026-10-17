import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const location = useLocation();
  
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
      
      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
        <Link to="/" style={linkStyle('/')}>Home</Link>
        <Link to="/events" style={linkStyle('/events')}>Events</Link>
        <Link to="/clubs" style={linkStyle('/clubs')}>Clubs</Link>
        <Link to="/campus-life" style={linkStyle('/campus-life')}>Campus Life</Link>
        <Link to="/about" style={linkStyle('/about')}>About</Link>
      </div>
      
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
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
      </div>
    </nav>
  );
}