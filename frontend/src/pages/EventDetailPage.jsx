import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Clock, User, Music, Sparkles, Info, Flame, Calendar, Award } from 'lucide-react';

export default function EventDetailPage() {
  const { idOrSlug } = useParams();
  const slug = (idOrSlug || '').toLowerCase();
  
  const isDussera = slug.includes('dussera') || slug.includes('dussehra') || slug.includes('navaratri');
  const isDiwali = slug.includes('diwali') || slug.includes('deepavali');

  // ==================== DUSSERA THEME ====================
  // Dussera Theme: Cream/beige background, subtle mandala borders. 
  // Details: AB2 Ground, 9 AM Puja Timings, Sanmathi (Student), Dr. Abhishek (ECE), 1 PM Lunch in Pandhal for all depts.
  if (isDussera) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        /* Cream / Beige traditional sacred background */
        background: 'linear-gradient(135deg, #fefae0 0%, #faedcd 50%, #fef8e8 100%)',
        position: 'relative', 
        zIndex: 100, 
        overflowX: 'hidden', 
        paddingTop: '6rem', 
        paddingBottom: '4rem',
        fontFamily: 'Lato, sans-serif' 
      }}>
        
        {/* Subtle Mandala Borders & Sacred Patterns */}
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1, pointerEvents: 'none', overflow: 'hidden', opacity: 0.22 }}>
          {/* Circular Mandala rings */}
          <div style={{ position: 'absolute', top: '-120px', left: '-120px', width: '500px', height: '500px', borderRadius: '50%', border: '16px double #b45309' }} />
          <div style={{ position: 'absolute', top: '-80px', left: '-80px', width: '420px', height: '420px', borderRadius: '50%', border: '8px dashed #d4af37' }} />
          
          <div style={{ position: 'absolute', bottom: '-150px', right: '-150px', width: '650px', height: '650px', borderRadius: '50%', border: '20px double #b45309' }} />
          <div style={{ position: 'absolute', bottom: '-100px', right: '-100px', width: '550px', height: '550px', borderRadius: '50%', border: '10px dashed #d4af37' }} />

          {/* Floating sacred flower icons */}
          <span style={{ position: 'absolute', top: '20%', right: '10%', fontSize: '3rem' }}>🌺</span>
          <span style={{ position: 'absolute', bottom: '25%', left: '8%', fontSize: '3.5rem' }}>🪷</span>
          <span style={{ position: 'absolute', top: '65%', right: '15%', fontSize: '2.8rem' }}>✨</span>
        </div>

        {/* Back to Events Button */}
        <Link 
          to="/events" 
          style={{ 
            position: 'fixed', 
            top: '5.5rem', 
            left: '3.5rem', 
            color: '#ffffff', 
            textDecoration: 'none', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem', 
            fontWeight: 'bold', 
            zIndex: 30, 
            fontFamily: 'Cinzel, serif', 
            backgroundColor: '#881337', 
            padding: '0.7rem 1.6rem', 
            border: '2px solid #ffffff',
            boxShadow: '0 4px 15px rgba(136, 19, 55, 0.3)'
          }}
        >
          <ArrowLeft size={18} /> Back to Events
        </Link>

        {/* Main Content Area */}
        <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', textAlign: 'center', padding: '2rem 1.5rem', maxWidth: '1100px', margin: '0 auto' }}>
          
          <div style={{ fontSize: '4.5rem', marginBottom: '0.5rem' }}>🌺</div>
          
          <h1 style={{ 
            fontFamily: 'Cinzel, serif', 
            fontSize: '4.2rem', 
            margin: 0, 
            color: '#881337', 
            textShadow: '2px 2px 4px rgba(0,0,0,0.1)', 
            letterSpacing: '0.08em',
            lineHeight: '1.15'
          }}>
            DUSSERA CULTURAL NIGHT
          </h1>
          
          <h2 style={{ 
            fontFamily: 'Cinzel, serif', 
            fontSize: '1.8rem', 
            margin: '0.8rem 0 0 0', 
            color: '#b45309',
            letterSpacing: '1px'
          }}>
            Celebrating the Victory of Light & Righteousness
          </h2>

          <p style={{
            fontSize: '1.2rem',
            color: '#4a2c1a',
            maxWidth: '780px',
            marginTop: '1.5rem',
            lineHeight: '1.7',
            fontWeight: '500'
          }}>
            Join the entire Amrita Vishwa Vidyapeetham fraternity at the AB2 Ground for the auspicious Ayudha Puja, ceremonial traditional processions, classical music recitals, and our beloved campus-wide Pandhal banquet.
          </p>

          {/* 4 Core Requirement Detail Cards */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
            gap: '1.8rem', 
            width: '100%', 
            marginTop: '3.5rem' 
          }}>
            
            {/* 1. Venue: AB2 Ground */}
            <div style={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.95)', 
              padding: '2.2rem 1.8rem', 
              border: '2px solid #d4af37', 
              boxShadow: '0 10px 25px rgba(180, 83, 9, 0.1)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}>
              <MapPin size={42} color="#881337" style={{ marginBottom: '1rem' }} />
              <h3 style={{ fontFamily: 'Cinzel, serif', fontSize: '1.4rem', margin: '0 0 0.5rem 0', color: '#2b1b10' }}>
                Venue
              </h3>
              <p style={{ fontSize: '1.35rem', fontWeight: 'bold', color: '#881337', margin: 0 }}>
                AB2 Ground
              </p>
              <span style={{ fontSize: '0.85rem', color: '#78350f', marginTop: '0.4rem' }}>Main Campus Arena</span>
            </div>

            {/* 2. Timing: 9 AM Puja Timings */}
            <div style={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.95)', 
              padding: '2.2rem 1.8rem', 
              border: '2px solid #d4af37', 
              boxShadow: '0 10px 25px rgba(180, 83, 9, 0.1)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}>
              <Clock size={42} color="#881337" style={{ marginBottom: '1rem' }} />
              <h3 style={{ fontFamily: 'Cinzel, serif', fontSize: '1.4rem', margin: '0 0 0.5rem 0', color: '#2b1b10' }}>
                Puja Timings
              </h3>
              <p style={{ fontSize: '1.35rem', fontWeight: 'bold', color: '#881337', margin: 0 }}>
                9:00 AM Onwards
              </p>
              <span style={{ fontSize: '0.85rem', color: '#78350f', marginTop: '0.4rem' }}>Morning Ayudha Puja</span>
            </div>

            {/* 3. Coordinators: Sanmathi (Student), Dr. Abhishek (ECE) */}
            <div style={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.95)', 
              padding: '2.2rem 1.8rem', 
              border: '2px solid #d4af37', 
              boxShadow: '0 10px 25px rgba(180, 83, 9, 0.1)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}>
              <User size={42} color="#881337" style={{ marginBottom: '1rem' }} />
              <h3 style={{ fontFamily: 'Cinzel, serif', fontSize: '1.4rem', margin: '0 0 0.5rem 0', color: '#2b1b10' }}>
                Coordinators
              </h3>
              <p style={{ fontSize: '1.1rem', color: '#2b1b10', margin: '0 0 0.3rem 0' }}>
                <strong>Student:</strong> <span style={{ color: '#881337' }}>Sanmathi</span>
              </p>
              <p style={{ fontSize: '1.1rem', color: '#2b1b10', margin: 0 }}>
                <strong>Faculty:</strong> <span style={{ color: '#881337' }}>Dr. Abhishek (ECE)</span>
              </p>
            </div>

            {/* 4. Special Note: 1 PM Lunch in Pandhal for all depts */}
            <div style={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.95)', 
              padding: '2.2rem 1.8rem', 
              border: '2px solid #d4af37', 
              boxShadow: '0 10px 25px rgba(180, 83, 9, 0.1)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}>
              <Info size={42} color="#881337" style={{ marginBottom: '1rem' }} />
              <h3 style={{ fontFamily: 'Cinzel, serif', fontSize: '1.4rem', margin: '0 0 0.5rem 0', color: '#2b1b10' }}>
                Special Feast Note
              </h3>
              <p style={{ fontSize: '1.15rem', fontWeight: 'bold', color: '#881337', margin: 0 }}>
                1:00 PM Grand Lunch
              </p>
              <span style={{ fontSize: '0.9rem', color: '#78350f', marginTop: '0.4rem', fontWeight: '600' }}>
                Served in Pandhal for all departments
              </span>
            </div>

          </div>

          <div style={{
            marginTop: '3.5rem',
            padding: '1.2rem 2.5rem',
            backgroundColor: '#881337',
            color: '#ffffff',
            fontFamily: 'Cinzel, serif',
            fontWeight: 'bold',
            fontSize: '1.1rem',
            letterSpacing: '1px',
            border: '2px solid #d4af37',
            boxShadow: '0 6px 20px rgba(136, 19, 55, 0.3)'
          }}>
            🙏 All students and faculty are cordially invited to seek divine blessings
          </div>

        </div>
      </div>
    );
  }

  // ==================== DIWALI THEME (LIGHT & MAGICAL) ====================
  // Diwali Theme: Magical light sunset gradient. Floating hanging diyas (🪔). 
  // Details: 5-8 PM Crackers, Pandhal Puja, Diya S Kamath (Student), Dr. Manikandan (ECE), 9-11 PM Dance/Music.
  if (isDiwali) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        /* Magical light sunset gradient */
        background: 'linear-gradient(135deg, #fff7ed 0%, #fed7aa 40%, #fbcfe8 80%, #fed7aa 100%)',
        position: 'relative', 
        zIndex: 100, 
        overflowX: 'hidden', 
        paddingTop: '6rem', 
        paddingBottom: '4rem',
        fontFamily: 'Lato, sans-serif' 
      }}>
        
        {/* Floating Hanging Diyas (🪔) & Sunset Shimmer */}
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1, pointerEvents: 'none', overflow: 'hidden' }}>
          
          {/* Hanging Diya string visual indicators */}
          <div style={{ position: 'absolute', top: 0, left: '12%', width: '1px', height: '120px', background: 'linear-gradient(to bottom, #b45309, #f59e0b)' }} />
          <div className="floating-icon" style={{ position: 'absolute', top: '110px', left: 'calc(12% - 20px)', fontSize: '3rem', filter: 'drop-shadow(0 0 15px #f59e0b)' }}>
            🪔
          </div>

          <div style={{ position: 'absolute', top: 0, left: '32%', width: '1px', height: '80px', background: 'linear-gradient(to bottom, #b45309, #f59e0b)' }} />
          <div className="floating-icon" style={{ position: 'absolute', top: '70px', left: 'calc(32% - 20px)', fontSize: '3rem', filter: 'drop-shadow(0 0 15px #f59e0b)', animationDelay: '1s' }}>
            🪔
          </div>

          <div style={{ position: 'absolute', top: 0, right: '28%', width: '1px', height: '140px', background: 'linear-gradient(to bottom, #b45309, #f59e0b)' }} />
          <div className="floating-icon" style={{ position: 'absolute', top: '130px', right: 'calc(28% - 20px)', fontSize: '3.2rem', filter: 'drop-shadow(0 0 15px #f59e0b)', animationDelay: '1.8s' }}>
            🪔
          </div>

          <div style={{ position: 'absolute', top: 0, right: '10%', width: '1px', height: '90px', background: 'linear-gradient(to bottom, #b45309, #f59e0b)' }} />
          <div className="floating-icon" style={{ position: 'absolute', top: '80px', right: 'calc(10% - 20px)', fontSize: '3rem', filter: 'drop-shadow(0 0 15px #f59e0b)', animationDelay: '0.6s' }}>
            🪔
          </div>

          {/* Sparkles */}
          <span className="sparkle-icon" style={{ position: 'absolute', top: '40%', left: '6%', fontSize: '2.5rem' }}>✨</span>
          <span className="sparkle-icon" style={{ position: 'absolute', top: '60%', right: '8%', fontSize: '3rem', animationDelay: '1.2s' }}>🎇</span>
          <span className="sparkle-icon" style={{ position: 'absolute', bottom: '15%', left: '15%', fontSize: '3.2rem', animationDelay: '0.8s' }}>🎆</span>

          {/* Glowing Rangoli Circles at the bottom */}
          <div style={{ position: 'absolute', bottom: '-80px', left: '50%', transform: 'translateX(-50%)', width: '600px', height: '300px', background: 'radial-gradient(ellipse at center, rgba(245, 158, 11, 0.25) 0%, transparent 70%)', borderRadius: '50%' }} />
          <div style={{ position: 'absolute', bottom: '-40px', left: '50%', transform: 'translateX(-50%)', width: '420px', height: '210px', border: '3px solid rgba(245, 158, 11, 0.5)', borderRadius: '50%' }} />
        </div>

        {/* Back to Events Button */}
        <Link 
          to="/events" 
          style={{ 
            position: 'fixed', 
            top: '5.5rem', 
            left: '3.5rem', 
            color: '#ffffff', 
            textDecoration: 'none', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem', 
            fontWeight: 'bold', 
            zIndex: 30, 
            fontFamily: 'Cinzel, serif', 
            backgroundColor: '#b45309', 
            padding: '0.7rem 1.6rem', 
            border: '2px solid #ffffff',
            boxShadow: '0 4px 15px rgba(180, 83, 9, 0.3)'
          }}
        >
          <ArrowLeft size={18} /> Back to Events
        </Link>

        {/* Main Content Area */}
        <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', textAlign: 'center', padding: '2rem 1.5rem', maxWidth: '1100px', margin: '0 auto' }}>
          
          <div style={{ fontSize: '4.5rem', marginBottom: '0.5rem' }}>🎆</div>
          
          <h1 style={{ 
            fontFamily: 'Cinzel, serif', 
            fontSize: '4.2rem', 
            margin: 0, 
            color: '#881337', 
            textShadow: '2px 2px 4px rgba(0,0,0,0.1)', 
            letterSpacing: '0.08em',
            lineHeight: '1.15'
          }}>
            DIWALI LIGHTS & RANGOLI
          </h1>
          
          <h2 style={{ 
            fontFamily: 'Cinzel, serif', 
            fontSize: '1.8rem', 
            margin: '0.8rem 0 0 0', 
            color: '#b45309',
            letterSpacing: '1px'
          }}>
            The Festival of Illumination, Harmony & Joy
          </h2>

          <p style={{
            fontSize: '1.2rem',
            color: '#4a2c1a',
            maxWidth: '780px',
            marginTop: '1.5rem',
            lineHeight: '1.7',
            fontWeight: '500'
          }}>
            Illuminate the evening sky with Amrita's grand Deepavali festival. Featuring mesmerizing rangoli displays, ceremonial twilight puja, community fireworks, and electric student musical recitals.
          </p>

          {/* 4 Core Requirement Detail Cards */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
            gap: '1.8rem', 
            width: '100%', 
            marginTop: '3.5rem' 
          }}>
            
            {/* 1. Crackers Timing: 5-8 PM Crackers */}
            <div style={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.95)', 
              padding: '2.2rem 1.8rem', 
              border: '2px solid #d4af37', 
              boxShadow: '0 10px 25px rgba(180, 83, 9, 0.1)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}>
              <Flame size={42} color="#b45309" style={{ marginBottom: '1rem' }} />
              <h3 style={{ fontFamily: 'Cinzel, serif', fontSize: '1.4rem', margin: '0 0 0.5rem 0', color: '#2b1b10' }}>
                Crackers Timing
              </h3>
              <p style={{ fontSize: '1.35rem', fontWeight: 'bold', color: '#b45309', margin: 0 }}>
                5:00 PM – 8:00 PM
              </p>
              <span style={{ fontSize: '0.85rem', color: '#881337', marginTop: '0.4rem', fontWeight: 'bold' }}>
                Designated Safe Arena
              </span>
            </div>

            {/* 2. Puja Venue: Pandhal Puja */}
            <div style={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.95)', 
              padding: '2.2rem 1.8rem', 
              border: '2px solid #d4af37', 
              boxShadow: '0 10px 25px rgba(180, 83, 9, 0.1)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}>
              <Sparkles size={42} color="#b45309" style={{ marginBottom: '1rem' }} />
              <h3 style={{ fontFamily: 'Cinzel, serif', fontSize: '1.4rem', margin: '0 0 0.5rem 0', color: '#2b1b10' }}>
                Puja Venue
              </h3>
              <p style={{ fontSize: '1.35rem', fontWeight: 'bold', color: '#b45309', margin: 0 }}>
                At Pandhal
              </p>
              <span style={{ fontSize: '0.85rem', color: '#881337', marginTop: '0.4rem', fontWeight: 'bold' }}>
                Deepavali Deepam Lighting
              </span>
            </div>

            {/* 3. Coordinators: Diya S Kamath (Student), Dr. Manikandan (ECE) */}
            <div style={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.95)', 
              padding: '2.2rem 1.8rem', 
              border: '2px solid #d4af37', 
              boxShadow: '0 10px 25px rgba(180, 83, 9, 0.1)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}>
              <User size={42} color="#b45309" style={{ marginBottom: '1rem' }} />
              <h3 style={{ fontFamily: 'Cinzel, serif', fontSize: '1.4rem', margin: '0 0 0.5rem 0', color: '#2b1b10' }}>
                Coordinators
              </h3>
              <p style={{ fontSize: '1.1rem', color: '#2b1b10', margin: '0 0 0.3rem 0' }}>
                <strong>Student:</strong> <span style={{ color: '#b45309' }}>Diya S Kamath</span>
              </p>
              <p style={{ fontSize: '1.1rem', color: '#2b1b10', margin: 0 }}>
                <strong>Faculty:</strong> <span style={{ color: '#b45309' }}>Dr. Manikandan (ECE)</span>
              </p>
            </div>

            {/* 4. Dance & Music: 9-11 PM Dance/Music */}
            <div style={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.95)', 
              padding: '2.2rem 1.8rem', 
              border: '2px solid #d4af37', 
              boxShadow: '0 10px 25px rgba(180, 83, 9, 0.1)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}>
              <Music size={42} color="#b45309" style={{ marginBottom: '1rem' }} />
              <h3 style={{ fontFamily: 'Cinzel, serif', fontSize: '1.4rem', margin: '0 0 0.5rem 0', color: '#2b1b10' }}>
                Dance & Music
              </h3>
              <p style={{ fontSize: '1.35rem', fontWeight: 'bold', color: '#b45309', margin: 0 }}>
                9:00 PM – 11:00 PM
              </p>
              <span style={{ fontSize: '0.85rem', color: '#881337', marginTop: '0.4rem', fontWeight: 'bold' }}>
                Main Amphitheatre Stage
              </span>
            </div>

          </div>

          <div style={{
            marginTop: '3.5rem',
            padding: '1.2rem 2.5rem',
            backgroundColor: '#b45309',
            color: '#ffffff',
            fontFamily: 'Cinzel, serif',
            fontWeight: 'bold',
            fontSize: '1.1rem',
            letterSpacing: '1px',
            border: '2px solid #d4af37',
            boxShadow: '0 6px 20px rgba(180, 83, 9, 0.3)'
          }}>
            ✨ Let's light up the campus together! Eco-friendly sparklers provided at Pandhal.
          </div>

        </div>
      </div>
    );
  }

  // Fallback if not matched
  return (
    <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#fdfbf7', color: '#1a1008', flexDirection: 'column', padding: '2rem' }}>
      <h1 style={{ fontFamily: 'Cinzel, serif', fontSize: '3rem', color: '#881337' }}>Event Not Found</h1>
      <p style={{ fontSize: '1.2rem', color: '#4a2c1a' }}>Unable to locate event with slug: <strong>{slug}</strong></p>
      <Link to="/events" style={{ color: '#ffffff', backgroundColor: '#881337', marginTop: '2rem', textDecoration: 'none', fontSize: '1.1rem', fontWeight: 'bold', padding: '0.8rem 2rem', border: '2px solid #d4af37' }}>
        ← Back to Events Calendar
      </Link>
    </div>
  );
}