import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Compass, Heart, Mountain, Sparkles, BookOpen, Users, Calendar, Award } from 'lucide-react';

export default function AboutPage() {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0a0d14',
      backgroundImage: `
        radial-gradient(circle at 10% 20%, rgba(212, 175, 55, 0.15) 0%, transparent 40%),
        radial-gradient(circle at 90% 70%, rgba(136, 19, 55, 0.2) 0%, transparent 45%),
        linear-gradient(180deg, #090e17 0%, #16152b 50%, #0d0b14 100%)
      `,
      color: '#f8fafc',
      fontFamily: 'Lato, sans-serif',
      paddingTop: '6rem',
      paddingBottom: '4rem',
      position: 'relative',
      overflowX: 'hidden'
    }}>

      {/* Floating Sparkle Accents */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1, overflow: 'hidden' }}>
        <span style={{ position: 'absolute', top: '12%', left: '8%', fontSize: '2.5rem', opacity: 0.6, filter: 'drop-shadow(0 0 10px #d4af37)' }}>✨</span>
        <span style={{ position: 'absolute', top: '25%', right: '12%', fontSize: '3rem', opacity: 0.5, filter: 'drop-shadow(0 0 12px #f43f5e)' }}>🌸</span>
        <span style={{ position: 'absolute', bottom: '20%', left: '10%', fontSize: '2.5rem', opacity: 0.4, filter: 'drop-shadow(0 0 10px #38bdf8)' }}>🍃</span>
        <span style={{ position: 'absolute', bottom: '15%', right: '15%', fontSize: '2.8rem', opacity: 0.5, filter: 'drop-shadow(0 0 10px #eab308)' }}>🪔</span>
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 2rem', position: 'relative', zIndex: 10 }}>
        
        {/* Navigation & Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3.5rem' }}>
          <Link
            to="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.6rem',
              backgroundColor: 'rgba(212, 175, 55, 0.1)',
              color: '#d4af37',
              border: '1px solid #d4af37',
              padding: '0.7rem 1.6rem',
              fontFamily: 'Cinzel, serif',
              fontWeight: 'bold',
              textDecoration: 'none',
              boxShadow: '0 0 15px rgba(212, 175, 55, 0.2)',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#d4af37';
              e.currentTarget.style.color = '#000000';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(212, 175, 55, 0.1)';
              e.currentTarget.style.color = '#d4af37';
            }}
          >
            <ArrowLeft size={18} /> Back to Home
          </Link>

          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            padding: '0.4rem 1.2rem',
            borderRadius: '20px',
            color: '#cbd5e1',
            fontSize: '0.85rem',
            fontWeight: '600',
            letterSpacing: '1px'
          }}>
            <Sparkles size={16} color="#d4af37" /> AMRITA CONNECT // ARCHIVES
          </div>
        </div>

        {/* Hero Title Section */}
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h1 style={{
            fontFamily: 'Cinzel, serif',
            fontSize: '3.5rem',
            color: '#f8fafc',
            margin: '0 0 1rem 0',
            letterSpacing: '2px',
            textShadow: '0 0 25px rgba(212, 175, 55, 0.4)'
          }}>
            ABOUT <span style={{ color: '#d4af37' }}>AMRITA CONNECT</span>
          </h1>
          <p style={{
            fontSize: '1.25rem',
            maxWidth: '750px',
            margin: '0 auto',
            color: '#cbd5e1',
            lineHeight: '1.8'
          }}>
            The unified digital campus guild connecting students, faculty mentors, and university communities across Amrita Vishwa Vidyapeetham, Coimbatore.
          </p>
        </div>

        {/* 3 Main Pillars Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '2rem',
          marginBottom: '4rem'
        }}>
          {/* Card 1: Our Mission */}
          <div style={{
            backgroundColor: 'rgba(20, 24, 38, 0.85)',
            border: '1px solid rgba(212, 175, 55, 0.35)',
            padding: '2.5rem 2rem',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
            position: 'relative'
          }}>
            <div style={{
              width: '54px',
              height: '54px',
              backgroundColor: 'rgba(212, 175, 55, 0.15)',
              border: '1px solid #d4af37',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1.5rem',
              color: '#d4af37'
            }}>
              <Compass size={28} />
            </div>
            <h2 style={{ fontFamily: 'Cinzel, serif', fontSize: '1.6rem', color: '#ffffff', margin: '0 0 1rem 0' }}>
              The Purpose
            </h2>
            <p style={{ color: '#cbd5e1', lineHeight: '1.7', fontSize: '1rem', margin: 0 }}>
              Amrita Connect bridges student life, clubs, and campus events into one seamless ecosystem. Whether enrolling into technical guilds, participating in debates, or securing entry passes to festivals, everything is instantaneous and verified.
            </p>
          </div>

          {/* Card 2: Coimbatore Campus */}
          <div style={{
            backgroundColor: 'rgba(20, 24, 38, 0.85)',
            border: '1px solid rgba(136, 19, 55, 0.5)',
            padding: '2.5rem 2rem',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
            position: 'relative'
          }}>
            <div style={{
              width: '54px',
              height: '54px',
              backgroundColor: 'rgba(136, 19, 55, 0.2)',
              border: '1px solid #f43f5e',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1.5rem',
              color: '#f43f5e'
            }}>
              <Mountain size={28} />
            </div>
            <h2 style={{ fontFamily: 'Cinzel, serif', fontSize: '1.6rem', color: '#ffffff', margin: '0 0 1rem 0' }}>
              The Coimbatore Sanctuary
            </h2>
            <p style={{ color: '#cbd5e1', lineHeight: '1.7', fontSize: '1rem', margin: 0 }}>
              Nestled at the serene foothills of the Western Ghats in Ettimadai, our campus is famed for cool mountain breezes, peacocks wandering across lush greens, panoramic amphitheaters, and cutting-edge research blocks that awaken creativity.
            </p>
          </div>

          {/* Card 3: Culture & Unity */}
          <div style={{
            backgroundColor: 'rgba(20, 24, 38, 0.85)',
            border: '1px solid rgba(56, 189, 248, 0.35)',
            padding: '2.5rem 2rem',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
            position: 'relative'
          }}>
            <div style={{
              width: '54px',
              height: '54px',
              backgroundColor: 'rgba(56, 189, 248, 0.15)',
              border: '1px solid #38bdf8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1.5rem',
              color: '#38bdf8'
            }}>
              <Heart size={28} />
            </div>
            <h2 style={{ fontFamily: 'Cinzel, serif', fontSize: '1.6rem', color: '#ffffff', margin: '0 0 1rem 0' }}>
              Celebration & Heritage
            </h2>
            <p style={{ color: '#cbd5e1', lineHeight: '1.7', fontSize: '1rem', margin: 0 }}>
              From the thunderous drums and sacred pujas of Dussera to the sparkling diyas and joyful fireworks of Diwali, Amrita Connect celebrates unity in diversity, fostering bonds that last well beyond college years.
            </p>
          </div>
        </div>

        {/* Scenic Highlight Banner */}
        <div style={{
          backgroundColor: 'rgba(15, 20, 32, 0.95)',
          border: '2px solid #d4af37',
          padding: '3rem',
          boxShadow: '0 15px 40px rgba(0, 0, 0, 0.6), inset 0 0 30px rgba(212, 175, 55, 0.1)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: '1.5rem'
        }}>
          <span style={{ fontSize: '3rem' }}>🌿 🏛️ ⛰️</span>
          <h2 style={{
            fontFamily: 'Cinzel, serif',
            fontSize: '2.2rem',
            color: '#d4af37',
            margin: 0,
            letterSpacing: '1px'
          }}>
            "Education for Life, and Education for Living"
          </h2>
          <p style={{
            maxWidth: '800px',
            fontSize: '1.15rem',
            color: '#e2e8f0',
            lineHeight: '1.8',
            margin: 0
          }}>
            Amrita Vishwa Vidyapeetham inspires learners to combine intellectual rigor with profound human values. Explore our active clubs, register for upcoming festivals, and immerse yourself in campus life.
          </p>

          <div style={{
            display: 'flex',
            gap: '1.5rem',
            marginTop: '1rem',
            flexWrap: 'wrap',
            justifyContent: 'center'
          }}>
            <Link
              to="/clubs"
              style={{
                backgroundColor: '#d4af37',
                color: '#1a1008',
                padding: '0.9rem 2rem',
                fontFamily: 'Cinzel, serif',
                fontWeight: 'bold',
                textDecoration: 'none',
                fontSize: '1rem',
                boxShadow: '0 4px 20px rgba(212, 175, 55, 0.4)'
              }}
            >
              Browse Campus Clubs
            </Link>
            <Link
              to="/events"
              style={{
                backgroundColor: 'transparent',
                color: '#ffffff',
                border: '2px solid #ffffff',
                padding: '0.9rem 2rem',
                fontFamily: 'Cinzel, serif',
                fontWeight: 'bold',
                textDecoration: 'none',
                fontSize: '1rem'
              }}
            >
              Upcoming Events
            </Link>
            <Link
              to="/campus-life"
              style={{
                backgroundColor: '#0284c7',
                color: '#ffffff',
                border: 'none',
                padding: '0.9rem 2rem',
                fontFamily: 'Cinzel, serif',
                fontWeight: 'bold',
                textDecoration: 'none',
                fontSize: '1rem',
                boxShadow: '0 4px 20px rgba(2, 132, 199, 0.4)'
              }}
            >
              3D Campus Blueprint
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
