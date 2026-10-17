import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  BookOpen,
  ChevronDown,
  User,
  Mail,
  Hash,
  GraduationCap,
  CheckCircle,
  Film,
  Camera,
  Clapperboard,
  Video,
  Sparkles,
  Trophy,
  Cpu,
  Zap,
  Wifi,
  Activity,
  Award
} from 'lucide-react';

export default function ClubDetailPage() {
  const { idOrSlug } = useParams();
  const slug = (idOrSlug || '').toLowerCase();
  const [showForm, setShowForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    course: '',
    rollNo: '',
    email: ''
  });

  const isFilmClub = slug.includes('film') || slug.includes('cinema');
  const isBookClub = slug.includes('book') || slug.includes('literary');
  const isSportsClub = slug.includes('sports');
  const isIotClub = slug.includes('iot') || slug.includes('robotics');

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // ==================== SPORTS CLUB THEME ====================
  if (isSportsClub) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        /* Light teal/blue gradient */
        background: 'linear-gradient(135deg, #0d9488 0%, #0284c7 50%, #38bdf8 100%)',
        position: 'relative', 
        zIndex: 100, 
        overflowX: 'hidden', 
        paddingTop: '6rem', 
        fontFamily: 'Lato, sans-serif' 
      }}>
        
        {/* Scattered Sports Equipment Emojis on the edges */}
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1, pointerEvents: 'none', overflow: 'hidden' }}>
          <span style={{ position: 'absolute', top: '12%', left: '4%', fontSize: '4.5rem', transform: 'rotate(-20deg)', filter: 'drop-shadow(2px 4px 8px rgba(0,0,0,0.3))' }}>⚽</span>
          <span style={{ position: 'absolute', top: '22%', right: '5%', fontSize: '5rem', transform: 'rotate(15deg)', filter: 'drop-shadow(2px 4px 8px rgba(0,0,0,0.3))' }}>🏀</span>
          <span style={{ position: 'absolute', top: '55%', left: '3%', fontSize: '5rem', transform: 'rotate(35deg)', filter: 'drop-shadow(2px 4px 8px rgba(0,0,0,0.3))' }}>🏏</span>
          <span style={{ position: 'absolute', bottom: '15%', right: '6%', fontSize: '4.5rem', transform: 'rotate(-15deg)', filter: 'drop-shadow(2px 4px 8px rgba(0,0,0,0.3))' }}>🏸</span>
          <span style={{ position: 'absolute', bottom: '8%', left: '15%', fontSize: '4rem', transform: 'rotate(25deg)', filter: 'drop-shadow(2px 4px 8px rgba(0,0,0,0.3))' }}>🏐</span>
          <span style={{ position: 'absolute', top: '65%', right: '12%', fontSize: '3.8rem', transform: 'rotate(-30deg)', filter: 'drop-shadow(2px 4px 8px rgba(0,0,0,0.3))' }}>🎾</span>
        </div>

        {/* Top Floating Action Buttons */}
        <button 
          onClick={() => { setShowForm(true); setSubmitted(false); }} 
          style={{ 
            position: 'fixed', 
            top: '5.5rem', 
            right: '3.5rem', 
            backgroundColor: '#0f172a', 
            color: '#ffffff', 
            border: '2px solid #38bdf8', 
            padding: '0.8rem 2rem', 
            borderRadius: '0px', 
            fontWeight: 'bold', 
            cursor: 'pointer', 
            zIndex: 30, 
            fontFamily: 'Cinzel, serif', 
            fontSize: '1rem', 
            boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1e293b'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#0f172a'}
        >
          Enroll Into This Club
        </button>

        <Link 
          to="/clubs" 
          style={{ 
            position: 'fixed', 
            top: '5.5rem', 
            left: '3.5rem', 
            color: '#0f172a', 
            backgroundColor: 'rgba(255, 255, 255, 0.9)', 
            padding: '0.6rem 1.4rem', 
            border: '2px solid #0f172a', 
            textDecoration: 'none', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem', 
            fontWeight: 'bold', 
            zIndex: 30, 
            fontFamily: 'Cinzel, serif',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
          }}
        >
          <ArrowLeft size={18} /> Back to Clubs
        </Link>

        {/* Main Content */}
        <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', textAlign: 'center', padding: '2rem' }}>
          <Trophy size={110} color="#0f172a" style={{ marginBottom: '1rem', filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.2))' }} />
          
          <h1 style={{ 
            fontFamily: 'Cinzel, serif', 
            fontSize: '4.5rem', 
            margin: 0, 
            color: '#0f172a', 
            textShadow: '2px 2px 0px rgba(255,255,255,0.8)', 
            letterSpacing: '0.1em' 
          }}>
            SPORTS CLUB
          </h1>
          
          {/* Dark high-contrast badge & subheader */}
          <div style={{
            backgroundColor: '#0f172a',
            color: '#38bdf8',
            fontFamily: 'Cinzel, serif',
            fontSize: '1.4rem',
            padding: '0.4rem 1.8rem',
            fontWeight: 'bold',
            marginTop: '0.8rem',
            letterSpacing: '2px',
            border: '2px solid #ffffff'
          }}>
            UNSTOPPABLE SPIRIT // ATHLETIC ARENA
          </div>
          
          {/* High-contrast dark text block */}
          <div style={{ 
            color: '#0f172a', 
            fontSize: '1.25rem', 
            maxWidth: '740px', 
            marginTop: '2.5rem', 
            fontWeight: 'bold', 
            backgroundColor: 'rgba(255, 255, 255, 0.9)', 
            padding: '1.5rem 2rem', 
            borderRadius: '0px', 
            border: '2px solid #0f172a',
            boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
            lineHeight: '1.7'
          }}>
            "Train like champions, break collegiate records, and forge unbreakable teamwork across basketball, cricket, football, athletics, and badminton."
          </div>

          <div style={{ display: 'flex', gap: '1.5rem', marginTop: '2rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <span style={{ backgroundColor: '#0f172a', color: '#ffffff', padding: '0.6rem 1.4rem', fontWeight: 'bold', fontSize: '1rem', border: '1px solid #ffffff' }}>
              🏟️ AB2 Ground Tournaments
            </span>
            <span style={{ backgroundColor: '#0f172a', color: '#ffffff', padding: '0.6rem 1.4rem', fontWeight: 'bold', fontSize: '1rem', border: '1px solid #ffffff' }}>
              🥇 Inter-University Cups
            </span>
            <span style={{ backgroundColor: '#0f172a', color: '#ffffff', padding: '0.6rem 1.4rem', fontWeight: 'bold', fontSize: '1rem', border: '1px solid #ffffff' }}>
              ⚡ Daily Morning Drills (6:30 AM)
            </span>
          </div>

          <button 
            onClick={() => { setShowForm(true); setSubmitted(false); }} 
            style={{ 
              marginTop: '3.5rem', 
              backgroundColor: '#0f172a', 
              color: '#ffffff', 
              border: '2px solid #38bdf8', 
              padding: '1rem 2.8rem', 
              borderRadius: '0px', 
              fontWeight: 'bold', 
              cursor: 'pointer', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.6rem', 
              boxShadow: '0 6px 25px rgba(15, 23, 42, 0.4)', 
              fontFamily: 'Cinzel, serif', 
              fontSize: '1.15rem' 
            }}
          >
            Enroll Into This Club <ChevronDown size={20} />
          </button>
        </div>
        {renderEnrollmentForm('Sports Club', '#0f172a', '#38bdf8')}
      </div>
    );
  }

  // ==================== IOT CLUB THEME ====================
  if (isIotClub) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        backgroundColor: '#050a14',
        backgroundImage: `
          radial-gradient(circle at 50% 45%, #0e2246 0%, #050a14 75%),
          linear-gradient(rgba(0, 255, 255, 0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0, 255, 255, 0.03) 1px, transparent 1px)
        `,
        backgroundSize: '100% 100%, 30px 30px, 30px 30px',
        position: 'relative', 
        zIndex: 100, 
        overflowX: 'hidden', 
        paddingTop: '6rem', 
        fontFamily: 'Lato, sans-serif' 
      }}>
        
        {/* Glowing Neon Cyan & Orange Circuit Lines */}
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1, pointerEvents: 'none', opacity: 0.75 }}>
          <div style={{ position: 'absolute', top: '22%', left: '5%', width: '90%', height: '2px', background: 'linear-gradient(90deg, transparent, #00ffff, #ff8c00, transparent)', boxShadow: '0 0 12px #00ffff' }} />
          <div style={{ position: 'absolute', top: '48%', left: '8%', width: '84%', height: '2px', background: 'linear-gradient(90deg, transparent, #ff8c00, #00ffff, transparent)', boxShadow: '0 0 12px #ff8c00' }} />
          <div style={{ position: 'absolute', top: '75%', left: '12%', width: '76%', height: '2px', background: 'linear-gradient(90deg, transparent, #00ffff, transparent)', boxShadow: '0 0 12px #00ffff' }} />
          
          {/* Vertical circuit lines */}
          <div style={{ position: 'absolute', top: '15%', left: '25%', width: '2px', height: '65%', background: 'linear-gradient(180deg, transparent, #00ffff, transparent)', boxShadow: '0 0 10px #00ffff' }} />
          <div style={{ position: 'absolute', top: '20%', right: '22%', width: '2px', height: '60%', background: 'linear-gradient(180deg, transparent, #ff8c00, transparent)', boxShadow: '0 0 10px #ff8c00' }} />

          {/* Central Glowing CPU Chip */}
          <div style={{ 
            position: 'absolute', 
            top: '44%', 
            left: '50%', 
            transform: 'translate(-50%, -50%)', 
            width: '160px', 
            height: '160px', 
            backgroundColor: 'rgba(10, 25, 55, 0.9)', 
            border: '3px solid #00ffff', 
            boxShadow: '0 0 35px #00ffff, inset 0 0 25px rgba(0, 255, 255, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: 0.4
          }}>
            <div style={{ width: '80px', height: '80px', backgroundColor: '#ff8c00', boxShadow: '0 0 30px #ff8c00', opacity: 0.7 }} />
          </div>
        </div>

        {/* Action Buttons */}
        <button 
          onClick={() => { setShowForm(true); setSubmitted(false); }} 
          style={{ 
            position: 'fixed', 
            top: '5.5rem', 
            right: '3.5rem', 
            backgroundColor: '#00ffff', 
            color: '#050a14', 
            border: '2px solid #ffffff', 
            padding: '0.8rem 2rem', 
            borderRadius: '0px', 
            fontWeight: 'bold', 
            cursor: 'pointer', 
            zIndex: 30, 
            fontFamily: 'Cinzel, serif', 
            fontSize: '1rem', 
            boxShadow: '0 0 25px rgba(0, 255, 255, 0.6)' 
          }}
        >
          Enroll Into This Club
        </button>

        <Link 
          to="/clubs" 
          style={{ 
            position: 'fixed', 
            top: '5.5rem', 
            left: '3.5rem', 
            color: '#00ffff', 
            textDecoration: 'none', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem', 
            fontWeight: 'bold', 
            zIndex: 30, 
            fontFamily: 'Cinzel, serif', 
            textShadow: '0 0 10px rgba(0, 255, 255, 0.8)',
            backgroundColor: 'rgba(5, 10, 20, 0.85)',
            padding: '0.6rem 1.4rem',
            border: '1px solid #00ffff'
          }}
        >
          <ArrowLeft size={18} /> Back to Clubs
        </Link>

        {/* Main Content */}
        <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', textAlign: 'center', padding: '2rem' }}>
          <Cpu size={110} color="#00ffff" style={{ marginBottom: '1rem', filter: 'drop-shadow(0 0 25px rgba(0, 255, 255, 0.9))' }} />
          
          <h1 style={{ 
            fontFamily: 'Cinzel, serif', 
            fontSize: '4.5rem', 
            margin: 0, 
            color: '#ffffff', 
            textShadow: '0 0 25px rgba(0, 255, 255, 0.8), 2px 2px 4px #000', 
            letterSpacing: '0.1em' 
          }}>
            IOT & ROBOTICS CLUB
          </h1>
          <h2 style={{ 
            fontFamily: 'Cinzel, serif', 
            fontSize: '2rem', 
            margin: '0.5rem 0 0 0', 
            color: '#ff8c00', 
            textShadow: '0 0 15px rgba(255, 140, 0, 0.8), 2px 2px 4px #000' 
          }}>
            Architecting The Autonomous Future
          </h2>
          
          <p style={{ 
            color: '#e0f2fe', 
            fontSize: '1.3rem', 
            maxWidth: '750px', 
            marginTop: '2rem', 
            fontWeight: '500', 
            backgroundColor: 'rgba(5, 12, 28, 0.85)', 
            padding: '1.5rem', 
            borderRadius: '0px', 
            border: '1px solid rgba(0, 255, 255, 0.4)',
            boxShadow: '0 0 25px rgba(0, 255, 255, 0.15)',
            lineHeight: '1.7'
          }}>
            "From micro-controllers and edge computing to autonomous drone swarms and smart campus sensors — we invent, wire, and deploy hardware prototypes."
          </p>

          <div style={{ display: 'flex', gap: '3rem', marginTop: '2.5rem', textShadow: '0 0 10px rgba(0, 255, 255, 0.8)' }}>
            <span style={{ color: '#00ffff', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold', fontSize: '1.2rem' }}><Zap size={24} /> Hardware Hacking</span>
            <span style={{ color: '#00ffff', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold', fontSize: '1.2rem' }}><Wifi size={24} /> Sensor Meshes</span>
            <span style={{ color: '#ff8c00', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold', fontSize: '1.2rem' }}><Activity size={24} /> Robotics Lab (ECE)</span>
          </div>

          <button 
            onClick={() => { setShowForm(true); setSubmitted(false); }} 
            style={{ 
              marginTop: '3.5rem', 
              backgroundColor: '#00ffff', 
              color: '#000000', 
              border: '2px solid #ffffff', 
              padding: '1rem 2.8rem', 
              borderRadius: '0px', 
              fontWeight: 'bold', 
              cursor: 'pointer', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem', 
              boxShadow: '0 0 25px rgba(0, 255, 255, 0.6)', 
              fontFamily: 'Cinzel, serif', 
              fontSize: '1.15rem' 
            }}
          >
            Enroll Into This Club <ChevronDown size={20} />
          </button>
        </div>
        {renderEnrollmentForm('IoT & Robotics Club', '#050a14', '#00ffff')}
      </div>
    );
  }

  // ==================== FILM CLUB THEME ====================
  if (isFilmClub) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        backgroundColor: '#0a0002', 
        backgroundImage: "url('/cinema-bg.jpg')", 
        backgroundSize: 'cover', 
        backgroundPosition: 'center', 
        backgroundAttachment: 'fixed', 
        position: 'relative', 
        zIndex: 100, 
        overflowX: 'hidden', 
        paddingTop: '6rem', 
        fontFamily: 'Lato, sans-serif' 
      }}>
        {/* Dark Red Theatre Curtain Overlay */}
        <div style={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          width: '100%', 
          height: '100%', 
          background: 'linear-gradient(180deg, rgba(20, 0, 5, 0.75) 0%, rgba(40, 2, 8, 0.65) 50%, rgba(10, 0, 2, 0.85) 100%)', 
          zIndex: 1 
        }} />

        {/* Action Buttons */}
        <button 
          onClick={() => { setShowForm(true); setSubmitted(false); }} 
          style={{ 
            position: 'fixed', 
            top: '5.5rem', 
            right: '3.5rem', 
            backgroundColor: '#d4af37', 
            color: '#1a0000', 
            border: '2px solid #ffffff', 
            padding: '0.8rem 2rem', 
            borderRadius: '0px', 
            fontWeight: 'bold', 
            cursor: 'pointer', 
            zIndex: 30, 
            fontFamily: 'Cinzel, serif', 
            fontSize: '1rem', 
            boxShadow: '0 4px 20px rgba(0,0,0,0.8)' 
          }}
        >
          Enroll Into This Club
        </button>

        <Link 
          to="/clubs" 
          style={{ 
            position: 'fixed', 
            top: '5.5rem', 
            left: '3.5rem', 
            color: '#d4af37', 
            textDecoration: 'none', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem', 
            fontWeight: 'bold', 
            zIndex: 30, 
            fontFamily: 'Cinzel, serif', 
            textShadow: '2px 2px 6px #000',
            backgroundColor: 'rgba(20, 0, 5, 0.85)',
            padding: '0.6rem 1.4rem',
            border: '1px solid #d4af37'
          }}
        >
          <ArrowLeft size={18} /> Back to Clubs
        </Link>

        {/* Main Content with High Contrast Cinematic Text */}
        <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', textAlign: 'center', padding: '2rem' }}>
          <Clapperboard size={110} color="#d4af37" style={{ marginBottom: '1rem', filter: 'drop-shadow(0 0 25px rgba(0,0,0,1))' }} />
          
          <h2 style={{ 
            fontFamily: 'Cinzel, serif', 
            fontSize: '3rem', 
            margin: 0, 
            color: '#ffffff', 
            textShadow: '3px 3px 15px #000000, 0 0 30px rgba(0,0,0,1)', 
            letterSpacing: '0.15em' 
          }}>
            WELCOME TO THE
          </h2>
          <h1 style={{ 
            fontFamily: 'Cinzel, serif', 
            fontSize: '5.5rem', 
            margin: '0.5rem 0', 
            color: '#d4af37', 
            textShadow: '4px 4px 20px #000000, 0 0 40px rgba(212, 175, 55, 0.6)', 
            letterSpacing: '0.1em', 
            lineHeight: '1.1' 
          }}>
            FILM & CINEMA CLUB
          </h1>
          
          <p style={{ 
            color: '#ffffff', 
            fontSize: '1.35rem', 
            maxWidth: '750px', 
            marginTop: '1.5rem', 
            fontStyle: 'italic', 
            textShadow: '2px 2px 10px #000000, 0 0 20px rgba(0,0,0,1)', 
            fontWeight: 'bold',
            backgroundColor: 'rgba(20, 0, 5, 0.75)',
            padding: '1.2rem 2rem',
            border: '1px solid rgba(212, 175, 55, 0.4)'
          }}>
            "Lights, Camera, Revolution! We screen world cinema, master directorial screenplay, shoot campus short films, and honor visual storytelling."
          </p>

          <div style={{ display: 'flex', gap: '3rem', marginTop: '2.5rem', textShadow: '2px 2px 8px #000' }}>
            <span style={{ color: '#d4af37', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold', fontSize: '1.2rem' }}><Camera size={24} /> Screenwriting & Direction</span>
            <span style={{ color: '#d4af37', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold', fontSize: '1.2rem' }}><Video size={24} /> Post-Production Lab</span>
            <span style={{ color: '#d4af37', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold', fontSize: '1.2rem' }}><Film size={24} /> Weekly Amphitheatre Screenings</span>
          </div>

          <button 
            onClick={() => { setShowForm(true); setSubmitted(false); }} 
            style={{ 
              marginTop: '3.5rem', 
              backgroundColor: '#d4af37', 
              color: '#1a0000', 
              border: '2px solid #ffffff', 
              padding: '1rem 2.8rem', 
              borderRadius: '0px', 
              fontWeight: 'bold', 
              cursor: 'pointer', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem', 
              boxShadow: '0 4px 25px rgba(0,0,0,0.9)', 
              fontFamily: 'Cinzel, serif', 
              fontSize: '1.15rem' 
            }}
          >
            Enroll Into This Club <ChevronDown size={20} />
          </button>
        </div>
        {renderEnrollmentForm('Film & Cinema Club', '#200005', '#d4af37')}
      </div>
    );
  }

  // ==================== BOOK CLUB THEME (SPLIT-SCREEN) ====================
  // Book Club: Split-screen (left dark wood, right cream paper). Animated floating book icons. Form pops up via Enroll.
  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(to right, #24160c 0%, #24160c 50%, #f7ecd5 50%, #f7ecd5 100%)', 
      fontFamily: 'Lato, sans-serif', 
      position: 'relative', 
      zIndex: 100, 
      overflowX: 'hidden', 
      paddingTop: '6rem' 
    }}>
      {/* Book Spine Divider Shadow in the exact middle */}
      <div style={{ 
        position: 'absolute', 
        top: 0, 
        left: '50%', 
        width: '40px', 
        height: '100%', 
        background: 'linear-gradient(to right, rgba(0,0,0,0.6), transparent, rgba(0,0,0,0.25))', 
        transform: 'translateX(-50%)', 
        zIndex: 5, 
        pointerEvents: 'none' 
      }} />

      {/* Animated Floating Book Icons */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 3, pointerEvents: 'none', overflow: 'hidden' }}>
        <span className="floating-icon" style={{ position: 'absolute', top: '15%', left: '12%', fontSize: '3rem', opacity: 0.5 }}>📖</span>
        <span className="floating-icon" style={{ position: 'absolute', top: '45%', left: '35%', fontSize: '2.5rem', opacity: 0.4, animationDelay: '1s' }}>📚</span>
        <span className="floating-icon" style={{ position: 'absolute', top: '75%', left: '8%', fontSize: '3.5rem', opacity: 0.45, animationDelay: '2s' }}>📜</span>
        <span className="floating-icon" style={{ position: 'absolute', top: '20%', right: '15%', fontSize: '3.2rem', opacity: 0.35, animationDelay: '1.5s' }}>📖</span>
        <span className="floating-icon" style={{ position: 'absolute', top: '60%', right: '28%', fontSize: '2.8rem', opacity: 0.4, animationDelay: '0.5s' }}>📚</span>
        <span className="floating-icon" style={{ position: 'absolute', bottom: '15%', right: '8%', fontSize: '3.5rem', opacity: 0.35, animationDelay: '2.5s' }}>✒️</span>
      </div>

      {/* Action Buttons */}
      <button 
        onClick={() => { setShowForm(true); setSubmitted(false); }} 
        style={{ 
          position: 'fixed', 
          top: '5.5rem', 
          right: '3.5rem', 
          backgroundColor: '#881337', 
          color: '#ffffff', 
          border: '2px solid #d4af37', 
          padding: '0.8rem 2rem', 
          borderRadius: '0px', 
          fontWeight: 'bold', 
          cursor: 'pointer', 
          zIndex: 30, 
          boxShadow: '0 4px 15px rgba(0,0,0,0.3)', 
          fontFamily: 'Cinzel, serif', 
          fontSize: '1rem' 
        }}
      >
        Enroll Into This Club
      </button>

      <Link 
        to="/clubs" 
        style={{ 
          position: 'fixed', 
          top: '5.5rem', 
          left: '3.5rem', 
          color: '#d4af37', 
          textDecoration: 'none', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.5rem', 
          fontWeight: 'bold', 
          zIndex: 30, 
          fontFamily: 'Cinzel, serif',
          backgroundColor: 'rgba(20, 10, 5, 0.85)',
          padding: '0.6rem 1.4rem',
          border: '1px solid #d4af37'
        }}
      >
        <ArrowLeft size={18} /> Back to Clubs
      </Link>

      {/* Split-Screen Layout */}
      <div style={{ display: 'flex', minHeight: '85vh', zIndex: 10, position: 'relative' }}>
        
        {/* Left Side: Dark Wood Library */}
        <div style={{ 
          flex: 1, 
          padding: '4rem 5rem', 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'center', 
          alignItems: 'flex-end', 
          textAlign: 'right', 
          color: '#f4e4bc' 
        }}>
          <BookOpen size={90} color="#d4af37" style={{ marginBottom: '1.5rem', filter: 'drop-shadow(0 0 20px rgba(212, 175, 55, 0.5))' }} />
          
          <h1 style={{ fontFamily: 'Cinzel, serif', fontSize: '4.2rem', margin: 0, textShadow: '2px 2px 6px #000', lineHeight: '1.1', color: '#fef3c7' }}>
            THE BOOK<br/>CLUB
          </h1>
          <div style={{ width: '120px', height: '3px', backgroundColor: '#d4af37', margin: '2rem 0' }} />
          <p style={{ fontSize: '1.25rem', maxWidth: '420px', color: '#d1c1a5', fontStyle: 'italic', lineHeight: '1.6' }}>
            "A reader lives a thousand lives before he dies. The man who never reads lives only one."
          </p>
          <div style={{ marginTop: '2rem', display: 'flex', gap: '0.8rem' }}>
            <span style={{ border: '1px solid #d4af37', padding: '0.4rem 1rem', fontSize: '0.85rem', color: '#d4af37', fontWeight: 'bold' }}>EST. 2018</span>
            <span style={{ border: '1px solid #d4af37', padding: '0.4rem 1rem', fontSize: '0.85rem', color: '#d4af37', fontWeight: 'bold' }}>CENTRAL LIBRARY WING</span>
          </div>
        </div>

        {/* Right Side: Cream Paper Parchment */}
        <div style={{ 
          flex: 1, 
          padding: '4rem 5rem', 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'center', 
          alignItems: 'flex-start', 
          textAlign: 'left', 
          color: '#2b1b10' 
        }}>
          <h2 style={{ fontFamily: 'Cinzel, serif', fontSize: '2.8rem', margin: 0, color: '#881337', letterSpacing: '1px' }}>
            Welcome to Our Sanctuary
          </h2>
          <p style={{ fontSize: '1.2rem', maxWidth: '450px', marginTop: '1.2rem', lineHeight: '1.7', color: '#452a18' }}>
            Immerse yourself in pages of timeless thought. From classics and philosophy to sci-fi debriefs and creative poetry slams, our community fosters lifelong literary companionships.
          </p>

          <h3 style={{ fontFamily: 'Cinzel, serif', fontSize: '1.4rem', marginTop: '2.5rem', marginBottom: '1rem', color: '#881337' }}>
            Active Literary Circles:
          </h3>
          <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap', maxWidth: '450px' }}>
            {['Classic Literature', 'Sci-Fi & Cyberpunk', 'Philosophical Debates', 'Poetry Guild', 'Creative Writing'].map(cat => (
              <span key={cat} style={{ padding: '0.5rem 1rem', border: '1px solid #881337', backgroundColor: 'rgba(136, 19, 55, 0.08)', borderRadius: '0px', fontSize: '0.9rem', fontWeight: 'bold', color: '#881337' }}>
                {cat}
              </span>
            ))}
          </div>

          <button 
            onClick={() => { setShowForm(true); setSubmitted(false); }} 
            style={{ 
              marginTop: '3.5rem', 
              backgroundColor: '#881337', 
              color: '#ffffff', 
              border: '2px solid #2b1b10', 
              padding: '1rem 2.4rem', 
              borderRadius: '0px', 
              fontWeight: 'bold', 
              cursor: 'pointer', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem', 
              boxShadow: '0 6px 20px rgba(136, 19, 55, 0.35)', 
              fontFamily: 'Cinzel, serif', 
              fontSize: '1.1rem' 
            }}
          >
            Enroll Into This Club <ChevronDown size={20} />
          </button>
        </div>

      </div>

      {renderEnrollmentForm('The Book Club', '#24160c', '#881337')}
    </div>
  );

  // ==================== REUSABLE GLASSMORPHIC ENROLLMENT FORM ====================
  // All: Need a working "Enroll Into This Club" button that opens a glassmorphic form (Full Name, Course, Roll No, College Email) with a "Back" button.
  function renderEnrollmentForm(clubTitle, themeBg, accentColor) {
    if (!showForm) return null;

    return (
      <div style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        width: '100%', 
        height: '100vh', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        backgroundColor: 'rgba(4, 8, 16, 0.85)', 
        backdropFilter: 'blur(16px)', 
        WebkitBackdropFilter: 'blur(16px)',
        zIndex: 1000,
        padding: '1.5rem',
        boxSizing: 'border-box'
      }}>
        
        <div style={{ 
          position: 'relative', 
          zIndex: 10, 
          width: '100%', 
          maxWidth: '520px' 
        }}>
          
          {/* Back button */}
          <button 
            onClick={() => setShowForm(false)} 
            style={{ 
              backgroundColor: 'transparent', 
              color: '#d4af37', 
              border: 'none', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem', 
              cursor: 'pointer', 
              fontFamily: 'Cinzel, serif', 
              fontWeight: 'bold', 
              fontSize: '1.1rem', 
              marginBottom: '1rem', 
              textShadow: '0 0 8px rgba(0,0,0,0.8)' 
            }}
          >
            <ArrowLeft size={22} /> Back
          </button>

          {submitted ? (
            <div style={{ 
              textAlign: 'center', 
              backgroundColor: 'rgba(15, 23, 42, 0.95)', 
              border: '2px solid #d4af37', 
              padding: '3.5rem 2.5rem', 
              borderRadius: '0px', 
              boxShadow: '0 20px 50px rgba(0,0,0,0.8)',
              color: '#ffffff'
            }}>
              <CheckCircle size={65} color="#22c55e" style={{ marginBottom: '1.2rem' }} />
              <h2 style={{ fontFamily: 'Cinzel, serif', fontSize: '2.2rem', color: '#d4af37', margin: '0 0 1rem 0' }}>
                Enrollment Successful!
              </h2>
              <p style={{ color: '#cbd5e1', fontSize: '1.05rem', lineHeight: '1.6', margin: '0 0 1rem 0' }}>
                Welcome aboard, <strong>{formData.fullName || 'Student'}</strong>! An authentication notification has been dispatched to <strong>{formData.email || 'your college email'}</strong>.
              </p>
              <div style={{
                backgroundColor: 'rgba(212, 175, 55, 0.1)',
                border: '1px dashed #d4af37',
                padding: '1rem',
                margin: '1.5rem 0',
                fontSize: '0.9rem',
                color: '#fef08a'
              }}>
                Club: <strong>{clubTitle}</strong><br/>
                Roll No: <strong>{formData.rollNo || 'CB.EN.U4XXXXX'}</strong><br/>
                Course: <strong>{formData.course || 'B.Tech'}</strong>
              </div>
              <button 
                onClick={() => setShowForm(false)} 
                style={{ 
                  marginTop: '1rem', 
                  padding: '0.8rem 2.5rem', 
                  backgroundColor: '#d4af37', 
                  color: '#000000', 
                  border: 'none', 
                  fontWeight: 'bold', 
                  cursor: 'pointer', 
                  fontFamily: 'Cinzel, serif',
                  fontSize: '1rem'
                }}
              >
                Close & Return
              </button>
            </div>
          ) : (
            <form 
              onSubmit={handleSubmit} 
              style={{ 
                backgroundColor: 'rgba(12, 18, 32, 0.92)', 
                border: '2px solid #d4af37', 
                padding: '2.8rem 2.2rem', 
                borderRadius: '0px', 
                width: '100%', 
                boxShadow: '0 20px 60px rgba(0,0,0,0.85), inset 0 0 25px rgba(212, 175, 55, 0.1)',
                boxSizing: 'border-box'
              }}
            >
              <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <span style={{ color: '#d4af37', fontSize: '0.8rem', fontFamily: 'monospace', letterSpacing: '2px', fontWeight: 'bold' }}>
                  // OFFICIAL GUILD REGISTRATION
                </span>
                <h2 style={{ 
                  fontFamily: 'Cinzel, serif', 
                  fontSize: '2rem', 
                  margin: '0.4rem 0 0 0', 
                  color: '#ffffff', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  gap: '0.5rem' 
                }}>
                  <Sparkles size={20} color="#d4af37" /> {clubTitle}
                </h2>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.3rem' }}>
                
                {/* Full Name */}
                <div style={{ position: 'relative' }}>
                  <User size={18} color="#d4af37" style={{ position: 'absolute', left: '16px', top: '16px' }} />
                  <input 
                    type="text" 
                    placeholder="Full Name" 
                    required 
                    value={formData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    style={{ 
                      width: '100%', 
                      padding: '1rem 1rem 1rem 3.2rem', 
                      borderRadius: '0px', 
                      border: '1px solid rgba(212, 175, 55, 0.5)', 
                      backgroundColor: 'rgba(5, 10, 20, 0.8)', 
                      color: '#ffffff', 
                      fontSize: '1rem', 
                      outline: 'none',
                      boxSizing: 'border-box'
                    }} 
                  />
                </div>

                {/* Course */}
                <div style={{ position: 'relative' }}>
                  <GraduationCap size={18} color="#d4af37" style={{ position: 'absolute', left: '16px', top: '16px' }} />
                  <input 
                    type="text" 
                    placeholder="Course (e.g. B.Tech CSE, ECE, AI)" 
                    required 
                    value={formData.course}
                    onChange={(e) => handleInputChange('course', e.target.value)}
                    style={{ 
                      width: '100%', 
                      padding: '1rem 1rem 1rem 3.2rem', 
                      borderRadius: '0px', 
                      border: '1px solid rgba(212, 175, 55, 0.5)', 
                      backgroundColor: 'rgba(5, 10, 20, 0.8)', 
                      color: '#ffffff', 
                      fontSize: '1rem', 
                      outline: 'none',
                      boxSizing: 'border-box'
                    }} 
                  />
                </div>

                {/* Roll Number */}
                <div style={{ position: 'relative' }}>
                  <Hash size={18} color="#d4af37" style={{ position: 'absolute', left: '16px', top: '16px' }} />
                  <input 
                    type="text" 
                    placeholder="Roll Number (e.g. CB.EN.U4CSE22001)" 
                    required 
                    value={formData.rollNo}
                    onChange={(e) => handleInputChange('rollNo', e.target.value)}
                    style={{ 
                      width: '100%', 
                      padding: '1rem 1rem 1rem 3.2rem', 
                      borderRadius: '0px', 
                      border: '1px solid rgba(212, 175, 55, 0.5)', 
                      backgroundColor: 'rgba(5, 10, 20, 0.8)', 
                      color: '#ffffff', 
                      fontSize: '1rem', 
                      outline: 'none',
                      boxSizing: 'border-box'
                    }} 
                  />
                </div>

                {/* College Email */}
                <div style={{ position: 'relative' }}>
                  <Mail size={18} color="#d4af37" style={{ position: 'absolute', left: '16px', top: '16px' }} />
                  <input 
                    type="email" 
                    placeholder="College Email (@cb.students.amrita.edu)" 
                    required 
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    style={{ 
                      width: '100%', 
                      padding: '1rem 1rem 1rem 3.2rem', 
                      borderRadius: '0px', 
                      border: '1px solid rgba(212, 175, 55, 0.5)', 
                      backgroundColor: 'rgba(5, 10, 20, 0.8)', 
                      color: '#ffffff', 
                      fontSize: '1rem', 
                      outline: 'none',
                      boxSizing: 'border-box'
                    }} 
                  />
                </div>

                <button 
                  type="submit" 
                  style={{ 
                    backgroundColor: '#d4af37', 
                    color: '#000000', 
                    border: 'none', 
                    padding: '1.1rem', 
                    borderRadius: '0px', 
                    fontSize: '1.1rem', 
                    fontWeight: 'bold', 
                    cursor: 'pointer', 
                    marginTop: '0.8rem', 
                    fontFamily: 'Cinzel, serif', 
                    boxShadow: '0 4px 20px rgba(212, 175, 55, 0.4)',
                    letterSpacing: '1px',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#d4af37'}
                >
                  Submit Enrollment & Verify
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    );
  }
}