import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { Search, BookOpen, Film, Trophy, Cpu, ArrowLeft, Sparkles, ChevronRight } from 'lucide-react';

const backupClubs = [
  {
    id: 1,
    name: 'The Book Club',
    slug: 'book-club',
    tagline: 'Literature, Philosophy & Creative Writing',
    gradient: 'linear-gradient(135deg, #881337 0%, #E11D48 100%)',
    icon: BookOpen
  },
  {
    id: 2,
    name: 'Film & Cinema Club',
    slug: 'film-club',
    tagline: 'Cinematography, Direction & Screenplays',
    gradient: 'linear-gradient(135deg, #0D9488 0%, #14B8A6 100%)',
    icon: Film
  },
  {
    id: 3,
    name: 'Sports Club',
    slug: 'sports-club',
    tagline: 'Athletics, Tournaments & Unstoppable Spirit',
    gradient: 'linear-gradient(135deg, #B45309 0%, #F59E0B 100%)',
    icon: Trophy
  },
  {
    id: 4,
    name: 'IoT & Robotics Club',
    slug: 'iot-club',
    tagline: 'Hardware, Automation & Intelligent Systems',
    gradient: 'linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%)',
    icon: Cpu
  },
];

export default function ClubsPage() {
  const [clubs, setClubs] = useState(backupClubs);
  const [filteredClubs, setFilteredClubs] = useState(backupClubs);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function loadClubs() {
      try {
        const data = await api.get('/clubs?limit=20');
        const items = data.items || data.clubs || [];
        if (items.length > 0) {
          // Map backend clubs to the 4 core clubs
          const matched = backupClubs.map(b => {
            const found = items.find(c => 
              c.slug === b.slug || 
              c.name.toLowerCase().includes(b.slug.split('-')[0])
            );
            return found ? { ...b, id: found.id, name: found.name || b.name } : b;
          });
          setClubs(matched);
          setFilteredClubs(matched);
        }
      } catch (err) {
        console.log('Using backup club data.');
      }
    }
    loadClubs();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const result = clubs.filter(club => 
        club.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        club.tagline.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredClubs(result);
    } else {
      setFilteredClubs(clubs);
    }
  }, [searchTerm, clubs]);

  return (
    <div style={{ 
      minHeight: '100vh', 
      position: 'relative',
      fontFamily: 'Lato, sans-serif',
      padding: '7rem 4rem 4rem 4rem',
      /* Energetic, warm college gradient */
      background: 'linear-gradient(135deg, #fff7ed 0%, #fed7aa 30%, #fef3c7 70%, #ffedd5 100%)',
      overflowX: 'hidden'
    }}>
      
      {/* Optional warm college image overlay if available */}
      <div style={{
        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
        backgroundImage: "url('/clubs-bg.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        opacity: 0.18,
        zIndex: 0,
        pointerEvents: 'none'
      }} />

      {/* Floating Sparkles & Badges */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1 }}>
        <span style={{ position: 'absolute', top: '15%', left: '4%', fontSize: '2.5rem', opacity: 0.4 }}>✨</span>
        <span style={{ position: 'absolute', top: '25%', right: '5%', fontSize: '3rem', opacity: 0.3 }}>🎓</span>
        <span style={{ position: 'absolute', bottom: '15%', left: '8%', fontSize: '2.5rem', opacity: 0.4 }}>🌟</span>
        <span style={{ position: 'absolute', bottom: '25%', right: '10%', fontSize: '2.8rem', opacity: 0.3 }}>⚡</span>
      </div>

      {/* Content Wrapper */}
      <div style={{ position: 'relative', zIndex: 10, maxWidth: '1240px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
          
          <Link to="/" style={{ 
            backgroundColor: '#1a1008', 
            color: '#ffffff', 
            padding: '0.8rem 1.8rem', 
            borderRadius: '0px', 
            textDecoration: 'none', 
            fontSize: '1rem', 
            fontWeight: 'bold',
            boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
            border: '2px solid #d4af37',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontFamily: 'Cinzel, serif',
            transition: 'all 0.2s ease'
          }}>
            <ArrowLeft size={18} /> Back to Home
          </Link>
          
          <div style={{ textAlign: 'right' }}>
            <h1 style={{ 
              fontFamily: 'Cinzel, serif', 
              fontSize: '2.8rem', 
              margin: 0, 
              color: '#1a1008', 
              letterSpacing: '1px',
              textShadow: '1px 1px 3px rgba(255,255,255,0.8)' 
            }}>
              Campus Guilds & Clubs
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.4rem', color: '#b45309', fontWeight: 'bold', fontSize: '0.85rem', marginTop: '0.3rem' }}>
              <Sparkles size={16} /> OFFICIAL AMRITA COIMBATORE CLUBS
            </div>
          </div>
        </div>

        {/* Centered, Stretched Search Bar */}
        <div style={{ display: 'flex', justifyContent: 'center', width: '100%', marginBottom: '4rem' }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: '820px' }}>
            <Search size={24} style={{ position: 'absolute', left: '22px', top: '50%', transform: 'translateY(-50%)', color: '#1a1008' }} />
            <input 
              type="text" 
              placeholder="Search for a club or domain to join (e.g. Book, Film, IoT, Sports)..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ 
                width: '100%', 
                padding: '1.25rem 1.25rem 1.25rem 3.8rem', 
                borderRadius: '0px', 
                border: '2px solid #1a1008', 
                backgroundColor: 'rgba(255, 255, 255, 0.98)', 
                color: '#1a1008', 
                fontSize: '1.15rem', 
                fontWeight: 'bold', 
                outline: 'none',
                boxShadow: '0 10px 30px rgba(0,0,0,0.12)',
                boxSizing: 'border-box'
              }}
            />
          </div>
        </div>

        {/* Spotify-style Cards Grid: Exactly 4 Clubs */}
        <div>
          {filteredClubs.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              fontSize: '1.4rem', 
              color: '#1a1008', 
              fontWeight: 'bold', 
              padding: '4rem', 
              backgroundColor: 'rgba(255,255,255,0.8)', 
              border: '2px solid #1a1008' 
            }}>
              No clubs found matching "{searchTerm}".
            </div>
          ) : (
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(4, 1fr)', 
              gap: '2rem',
              width: '100%'
            }}>
              {filteredClubs.map((club) => {
                const IconComponent = club.icon || BookOpen;
                
                return (
                  <Link to={`/clubs/${club.slug}`} key={club.id} style={{ textDecoration: 'none' }}>
                    <div 
                      style={{ 
                        background: club.gradient, 
                        borderRadius: '0px', 
                        padding: '2rem 1.8rem', 
                        height: '280px', 
                        position: 'relative', 
                        overflow: 'hidden', 
                        transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)', 
                        cursor: 'pointer', 
                        boxShadow: '0 12px 24px rgba(0,0,0,0.22)', 
                        border: '2px solid rgba(255,255,255,0.2)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between'
                      }}
                      onMouseEnter={(e) => { 
                        e.currentTarget.style.transform = 'translateY(-12px)'; 
                        e.currentTarget.style.boxShadow = '0 24px 45px rgba(26, 16, 8, 0.45)'; 
                        e.currentTarget.style.borderColor = '#ffffff';
                      }}
                      onMouseLeave={(e) => { 
                        e.currentTarget.style.transform = 'translateY(0)'; 
                        e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.22)'; 
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
                      }}
                    >
                      {/* Radial Sheen overlay */}
                      <div style={{
                        position: 'absolute', top: '-50%', left: '-50%', width: '200%', height: '200%',
                        background: 'radial-gradient(circle, rgba(255,255,255,0.25) 0%, transparent 60%)',
                        opacity: 0.8, pointerEvents: 'none'
                      }} />

                      {/* Card Content Top */}
                      <div style={{ position: 'relative', zIndex: 2 }}>
                        <h3 style={{ 
                          fontFamily: 'Cinzel, serif', 
                          fontSize: '1.9rem', 
                          fontWeight: '700', 
                          margin: 0, 
                          lineHeight: '1.2',
                          textShadow: '2px 2px 8px rgba(0,0,0,0.6)',
                          color: '#ffffff'
                        }}>
                          {club.name}
                        </h3>
                        
                        <p style={{
                          color: 'rgba(255, 255, 255, 0.9)',
                          fontSize: '0.9rem',
                          marginTop: '0.8rem',
                          lineHeight: '1.4',
                          textShadow: '1px 1px 4px rgba(0,0,0,0.5)'
                        }}>
                          {club.tagline}
                        </p>
                      </div>

                      {/* Card Content Bottom */}
                      <div style={{ position: 'relative', zIndex: 2 }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                          backgroundColor: 'rgba(0, 0, 0, 0.35)',
                          color: '#ffffff',
                          fontFamily: 'Cinzel, serif',
                          fontWeight: 'bold',
                          fontSize: '0.85rem',
                          padding: '0.4rem 0.8rem',
                          backdropFilter: 'blur(5px)',
                          border: '1px solid rgba(255, 255, 255, 0.2)'
                        }}>
                          Join Guild <ChevronRight size={14} />
                        </span>
                      </div>
                      
                      {/* Giant Spotify-style Icon Watermark in bottom corner */}
                      <div style={{ 
                        position: 'absolute', 
                        bottom: '-25px', 
                        right: '-25px', 
                        transform: 'rotate(25deg)',
                        zIndex: 1,
                        opacity: 0.3
                      }}>
                        <IconComponent size={150} color="#ffffff" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}