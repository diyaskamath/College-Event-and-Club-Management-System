import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import {
  Calendar,
  MapPin,
  Sparkles,
  BookOpen,
  Film,
  Trophy,
  Cpu,
  ChevronRight,
  Compass,
  ArrowRight
} from 'lucide-react';

const defaultClubs = [
  {
    id: 1,
    name: 'The Book Club',
    slug: 'book-club',
    category: 'Literature & Philosophy',
    description: 'A sanctuary for readers, creative writing circles, and intellectual book debriefs.',
    gradient: 'linear-gradient(135deg, #881337 0%, #E11D48 100%)',
    icon: BookOpen
  },
  {
    id: 2,
    name: 'Film & Cinema Club',
    slug: 'film-club',
    category: 'Media & Filmmaking',
    description: 'Screening cinematic masterpieces, filmmaking workshops, and cinematography critique.',
    gradient: 'linear-gradient(135deg, #0D9488 0%, #14B8A6 100%)',
    icon: Film
  },
  {
    id: 3,
    name: 'Sports Club',
    slug: 'sports-club',
    category: 'Athletics & Fitness',
    description: 'Inter-batch tournaments, badminton leagues, cricket championships, and athletic spirit.',
    gradient: 'linear-gradient(135deg, #B45309 0%, #F59E0B 100%)',
    icon: Trophy
  },
  {
    id: 4,
    name: 'IoT & Robotics Club',
    slug: 'iot-club',
    category: 'Hardware & Innovation',
    description: 'Arduino hacks, microcontrollers, automated drones, and sensor-driven engineering.',
    gradient: 'linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%)',
    icon: Cpu
  }
];

const defaultEvents = [
  {
    id: 1,
    title: 'Dussera Cultural Night',
    slug: 'dussera',
    kind: 'festival',
    venue: 'AB2 Ground',
    date: '2026-10-20',
    time: '9:00 AM onwards',
    accent: '#881337',
    badgeText: 'FESTIVAL OF VICTORY',
    highlight: 'Morning Puja at 9 AM // Grand Pandhal Lunch at 1 PM'
  },
  {
    id: 2,
    title: 'Diwali Lights & Rangoli',
    slug: 'diwali',
    kind: 'festival',
    venue: 'Main Campus Pandhal',
    date: '2026-11-08',
    time: '5:00 PM - 11:00 PM',
    accent: '#b45309',
    badgeText: 'FESTIVAL OF LIGHTS',
    highlight: 'Diyas & Crackers (5-8 PM) // Music & Dance Celebration (9-11 PM)'
  }
];

export default function HomePage() {
  const [clubs, setClubs] = useState(defaultClubs);
  const [events, setEvents] = useState(defaultEvents);

  useEffect(() => {
    async function loadData() {
      try {
        const clubsRes = await api.get('/clubs?limit=10');
        const items = clubsRes.items || clubsRes.clubs || [];
        if (items.length > 0) {
          const matched = defaultClubs.map(def => {
            const found = items.find(c => c.slug === def.slug || c.name.toLowerCase().includes(def.slug.split('-')[0]));
            return found ? { ...def, id: found.id, name: found.name || def.name } : def;
          });
          setClubs(matched);
        }
      } catch (err) {
        console.log('Using fallback club data');
      }

      try {
        const eventsRes = await api.get('/events?limit=10');
        const items = eventsRes.items || eventsRes.events || [];
        if (items.length > 0) {
          const matched = defaultEvents.map(def => {
            const found = items.find(e => e.slug?.includes(def.slug) || e.title?.toLowerCase().includes(def.slug));
            return found ? { ...def, id: found.id, title: found.title || def.title, venue: found.venue || def.venue } : def;
          });
          setEvents(matched);
        }
      } catch (err) {
        console.log('Using fallback event data');
      }
    }
    loadData();
  }, []);

  const scrollToExplore = (e) => {
    if (e) e.preventDefault();
    const target = document.getElementById('explore-section');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div style={{ width: '100%', minHeight: '100vh', margin: 0, padding: 0, backgroundColor: '#05070e', color: '#ffffff' }}>
      
      {/* =========================================================================
          HERO SECTION: Full-screen background using public/campus-bg.jpg
          with INVISIBLE clickable Link buttons mapping to mockup coordinates
         ========================================================================= */}
      <section style={{
        width: '100vw',
        height: '100vh',
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: '#000000'
      }}>
        
        {/* Background Image stretched exactly to screen size */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundImage: "url('/campus-bg.jpg')",
          backgroundSize: '100% 100%',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          zIndex: 0
        }} />

        {/* ===================================================
            INVISIBLE CLICKABLE BUTTONS (Exact Mockup Layout)
           =================================================== */}

        {/* --- TOP NAVIGATION BAR --- */}
        {/* Home */}
        <Link
          to="/"
          style={{ position: 'absolute', top: '4.5%', left: '42%', width: '5%', height: '4%', opacity: 0, cursor: 'pointer', zIndex: 10 }}
          title="Home"
        >
          Home
        </Link>

        {/* Events */}
        <Link
          to="/events"
          style={{ position: 'absolute', top: '4.5%', left: '47.5%', width: '6%', height: '4%', opacity: 0, cursor: 'pointer', zIndex: 10 }}
          title="Events"
        >
          Events
        </Link>

        {/* Clubs */}
        <Link
          to="/clubs"
          style={{ position: 'absolute', top: '4.5%', left: '54%', width: '5%', height: '4%', opacity: 0, cursor: 'pointer', zIndex: 10 }}
          title="Clubs"
        >
          Clubs
        </Link>

        {/* Campus Life */}
        <Link
          to="/campus-life"
          style={{ position: 'absolute', top: '4.5%', left: '60%', width: '9%', height: '4%', opacity: 0, cursor: 'pointer', zIndex: 10 }}
          title="Campus Life"
        >
          Campus Life
        </Link>

        {/* Notices -> scrolls to events/notices section */}
        <a
          href="#explore-section"
          onClick={scrollToExplore}
          style={{ position: 'absolute', top: '4.5%', left: '69%', width: '6%', height: '4%', opacity: 0, cursor: 'pointer', zIndex: 10 }}
          title="Notices"
        >
          Notices
        </a>

        {/* About */}
        <Link
          to="/about"
          style={{ position: 'absolute', top: '4.5%', left: '75.5%', width: '5%', height: '4%', opacity: 0, cursor: 'pointer', zIndex: 10 }}
          title="About"
        >
          About
        </Link>

        {/* Top Right LOG IN */}
        <Link
          to="/login"
          style={{ position: 'absolute', top: '4%', left: '81%', width: '8%', height: '5%', opacity: 0, cursor: 'pointer', zIndex: 10 }}
          title="LOG IN"
        >
          LOG IN
        </Link>

        {/* Top Right SIGN UP */}
        <Link
          to="/register"
          style={{ position: 'absolute', top: '4%', left: '89.5%', width: '9%', height: '5%', opacity: 0, cursor: 'pointer', zIndex: 10 }}
          title="SIGN UP"
        >
          SIGN UP
        </Link>

        {/* --- HERO ACTION BUTTON --- */}
        {/* LET'S GET STARTED Button -> navigates to / and scrolls smoothly down to Events/Clubs */}
        <a
          href="#explore-section"
          onClick={scrollToExplore}
          style={{
            position: 'absolute',
            bottom: '24%',
            left: '9%',
            width: '26%',
            height: '8%',
            opacity: 0,
            cursor: 'pointer',
            zIndex: 10
          }}
          title="Let's Get Started"
        >
          Let's Get Started
        </a>

        {/* --- BOTTOM NAVIGATION BAR --- */}
        {/* Bottom Events Button */}
        <Link
          to="/events"
          style={{
            position: 'absolute',
            bottom: '7.5%',
            left: '8%',
            width: '8%',
            height: '5%',
            opacity: 0,
            cursor: 'pointer',
            zIndex: 10
          }}
          title="Events"
        >
          Events
        </Link>

        {/* Bottom Clubs Button */}
        <Link
          to="/clubs"
          style={{
            position: 'absolute',
            bottom: '7.5%',
            left: '20%',
            width: '8%',
            height: '5%',
            opacity: 0,
            cursor: 'pointer',
            zIndex: 10
          }}
          title="Clubs"
        >
          Clubs
        </Link>

        {/* Bottom Explore Button -> /campus-life */}
        <Link
          to="/campus-life"
          style={{
            position: 'absolute',
            bottom: '7.5%',
            left: '35%',
            width: '12%',
            height: '5%',
            opacity: 0,
            cursor: 'pointer',
            zIndex: 10
          }}
          title="Explore"
        >
          Explore
        </Link>

      </section>

      {/* =========================================================================
          IMPORTANT ADDITION: SCROLLABLE LIST OF ALL CLUBS & FESTIVAL EVENTS
         ========================================================================= */}
      <section id="explore-section" style={{
        padding: '5rem 3rem 6rem 3rem',
        backgroundColor: '#090d18',
        backgroundImage: `
          radial-gradient(circle at 10% 20%, rgba(212, 175, 55, 0.1) 0%, transparent 40%),
          radial-gradient(circle at 90% 80%, rgba(136, 19, 55, 0.15) 0%, transparent 45%),
          linear-gradient(180deg, #05070e 0%, #0d1222 50%, #080a14 100%)
        `,
        borderTop: '2px solid rgba(212, 175, 55, 0.3)',
        position: 'relative'
      }}>

        <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
          
          {/* Section Header */}
          <div style={{ textAlign: 'center', marginBottom: '4.5rem' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: 'rgba(212, 175, 55, 0.15)',
              border: '1px solid rgba(212, 175, 55, 0.4)',
              color: '#d4af37',
              padding: '0.4rem 1.2rem',
              borderRadius: '20px',
              fontFamily: 'Cinzel, serif',
              fontSize: '0.85rem',
              fontWeight: 'bold',
              letterSpacing: '1px',
              marginBottom: '1rem'
            }}>
              <Sparkles size={16} /> CAMPUS HIGHLIGHTS // AMRITA CONNECT
            </div>
            
            <h2 style={{
              fontFamily: 'Cinzel, serif',
              fontSize: '3rem',
              color: '#ffffff',
              margin: '0 0 1rem 0',
              textShadow: '0 0 20px rgba(212, 175, 55, 0.3)'
            }}>
              CELEBRATIONS & STUDENT GUILDS
            </h2>
            <p style={{
              fontSize: '1.2rem',
              color: '#cbd5e1',
              maxWidth: '750px',
              margin: '0 auto',
              lineHeight: '1.7'
            }}>
              Immerse yourself in upcoming campus festivals and active student clubs across Amrita Coimbatore. Click any card to view schedules, coordinators, and enroll.
            </p>
          </div>

          {/* ----------------------------------------------------
              FEATURED FESTIVALS (Dussera & Diwali)
             ---------------------------------------------------- */}
          <div style={{ marginBottom: '5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
              <div>
                <span style={{ color: '#d4af37', fontFamily: 'monospace', letterSpacing: '2px', fontSize: '0.85rem', fontWeight: 'bold' }}>
                  // OFFICIAL SCHEDULE
                </span>
                <h3 style={{ fontFamily: 'Cinzel, serif', fontSize: '2.2rem', margin: '0.3rem 0 0 0', color: '#f8fafc' }}>
                  Upcoming Campus Festivals
                </h3>
              </div>
              <Link
                to="/events"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  color: '#d4af37',
                  textDecoration: 'none',
                  fontFamily: 'Cinzel, serif',
                  fontWeight: 'bold',
                  fontSize: '1rem',
                  borderBottom: '2px solid #d4af37',
                  paddingBottom: '2px'
                }}
              >
                View Full Event Calendar <ArrowRight size={18} />
              </Link>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
              gap: '2.5rem'
            }}>
              {events.map((event) => (
                <Link
                  to={`/events/${event.slug}`}
                  key={event.id}
                  style={{ textDecoration: 'none' }}
                >
                  <div
                    style={{
                      backgroundColor: 'rgba(15, 23, 42, 0.85)',
                      border: '2px solid rgba(212, 175, 55, 0.4)',
                      padding: '2.5rem',
                      borderRadius: '0px',
                      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
                      transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                      position: 'relative',
                      overflow: 'hidden',
                      height: '100%',
                      boxSizing: 'border-box'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-10px)';
                      e.currentTarget.style.borderColor = '#d4af37';
                      e.currentTarget.style.boxShadow = '0 20px 45px rgba(212, 175, 55, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.4)';
                      e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.5)';
                    }}
                  >
                    <div style={{
                      display: 'inline-block',
                      backgroundColor: event.accent,
                      color: '#ffffff',
                      fontSize: '0.75rem',
                      fontFamily: 'Cinzel, serif',
                      fontWeight: 'bold',
                      letterSpacing: '1px',
                      padding: '0.35rem 0.9rem',
                      marginBottom: '1.2rem'
                    }}>
                      {event.badgeText}
                    </div>

                    <h4 style={{
                      fontFamily: 'Cinzel, serif',
                      fontSize: '2rem',
                      color: '#ffffff',
                      margin: '0 0 1rem 0',
                      letterSpacing: '1px'
                    }}>
                      {event.title}
                    </h4>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', color: '#cbd5e1', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <Calendar size={18} color="#d4af37" />
                        <span><strong>Date:</strong> {event.date} ({event.time})</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <MapPin size={18} color="#d4af37" />
                        <span><strong>Venue:</strong> {event.venue}</span>
                      </div>
                    </div>

                    <div style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      borderLeft: '3px solid #d4af37',
                      padding: '0.8rem 1rem',
                      fontSize: '0.9rem',
                      color: '#fef08a',
                      marginBottom: '1.8rem'
                    }}>
                      {event.highlight}
                    </div>

                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      color: '#d4af37',
                      fontFamily: 'Cinzel, serif',
                      fontWeight: 'bold',
                      fontSize: '0.95rem'
                    }}>
                      View Festival Details & Itinerary <ChevronRight size={18} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* ----------------------------------------------------
              FEATURED CLUBS (The 4 Clubs: Book, Film, Sports, IoT)
             ---------------------------------------------------- */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
              <div>
                <span style={{ color: '#00ffff', fontFamily: 'monospace', letterSpacing: '2px', fontSize: '0.85rem', fontWeight: 'bold' }}>
                  // STUDENT SOCIETIES
                </span>
                <h3 style={{ fontFamily: 'Cinzel, serif', fontSize: '2.2rem', margin: '0.3rem 0 0 0', color: '#f8fafc' }}>
                  Active Campus Clubs & Guilds
                </h3>
              </div>
              <Link
                to="/clubs"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  color: '#00ffff',
                  textDecoration: 'none',
                  fontFamily: 'Cinzel, serif',
                  fontWeight: 'bold',
                  fontSize: '1rem',
                  borderBottom: '2px solid #00ffff',
                  paddingBottom: '2px'
                }}
              >
                Explore All Clubs <ArrowRight size={18} />
              </Link>
            </div>

            {/* Spotify-style 4-column Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '1.8rem'
            }}>
              {clubs.map((club) => {
                const IconComponent = club.icon || BookOpen;
                return (
                  <Link
                    to={`/clubs/${club.slug}`}
                    key={club.id}
                    style={{ textDecoration: 'none' }}
                  >
                    <div
                      style={{
                        background: club.gradient,
                        borderRadius: '0px',
                        padding: '2rem 1.8rem',
                        height: '260px',
                        position: 'relative',
                        overflow: 'hidden',
                        transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                        cursor: 'pointer',
                        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.4)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-10px)';
                        e.currentTarget.style.boxShadow = '0 20px 45px rgba(0, 0, 0, 0.6)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.4)';
                      }}
                    >
                      <div style={{
                        position: 'absolute',
                        top: '-50%',
                        left: '-50%',
                        width: '200%',
                        height: '200%',
                        background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 60%)',
                        opacity: 0.8,
                        pointerEvents: 'none'
                      }} />

                      <div style={{ position: 'relative', zIndex: 2 }}>
                        <span style={{
                          fontSize: '0.75rem',
                          textTransform: 'uppercase',
                          letterSpacing: '1px',
                          color: 'rgba(255, 255, 255, 0.85)',
                          fontWeight: 'bold',
                          display: 'block',
                          marginBottom: '0.4rem'
                        }}>
                          {club.category}
                        </span>
                        <h4 style={{
                          fontFamily: 'Cinzel, serif',
                          fontSize: '1.75rem',
                          fontWeight: '700',
                          color: '#ffffff',
                          margin: 0,
                          lineHeight: '1.2',
                          textShadow: '2px 2px 8px rgba(0,0,0,0.6)'
                        }}>
                          {club.name}
                        </h4>
                      </div>

                      <div style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{
                          fontSize: '0.85rem',
                          color: '#ffffff',
                          fontFamily: 'Cinzel, serif',
                          fontWeight: 'bold',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                          backgroundColor: 'rgba(0, 0, 0, 0.3)',
                          padding: '0.4rem 0.8rem',
                          backdropFilter: 'blur(4px)'
                        }}>
                          Enroll Now <ChevronRight size={14} />
                        </span>
                      </div>

                      {/* Large tilted background watermark icon */}
                      <div style={{
                        position: 'absolute',
                        bottom: '-25px',
                        right: '-20px',
                        transform: 'rotate(20deg)',
                        opacity: 0.3,
                        pointerEvents: 'none',
                        zIndex: 1
                      }}>
                        <IconComponent size={140} color="#ffffff" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Quick Nav Card to Campus Life & About */}
          <div style={{
            marginTop: '5rem',
            backgroundColor: 'rgba(15, 23, 42, 0.7)',
            border: '1px solid rgba(212, 175, 55, 0.3)',
            padding: '2.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1.5rem'
          }}>
            <div>
              <h3 style={{ fontFamily: 'Cinzel, serif', fontSize: '1.8rem', color: '#ffffff', margin: 0 }}>
                Explore the 3D Holographic Campus Map
              </h3>
              <p style={{ color: '#94a3b8', margin: '0.5rem 0 0 0', fontSize: '1rem' }}>
                Interact with our isometric 3D blueprint to locate Main Block, ECE Block, Central Library, and AB2 Ground.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <Link
                to="/campus-life"
                style={{
                  backgroundColor: '#0284c7',
                  color: '#ffffff',
                  padding: '0.8rem 1.8rem',
                  fontFamily: 'Cinzel, serif',
                  fontWeight: 'bold',
                  textDecoration: 'none',
                  fontSize: '0.95rem',
                  boxShadow: '0 0 15px rgba(2, 132, 199, 0.5)'
                }}
              >
                Launch 3D Map
              </Link>
              <Link
                to="/about"
                style={{
                  backgroundColor: 'transparent',
                  color: '#d4af37',
                  border: '1px solid #d4af37',
                  padding: '0.8rem 1.8rem',
                  fontFamily: 'Cinzel, serif',
                  fontWeight: 'bold',
                  textDecoration: 'none',
                  fontSize: '0.95rem'
                }}
              >
                About Portal
              </Link>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
}