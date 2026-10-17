import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { Search, Sparkles, Calendar, MapPin, Clock, ArrowLeft, ChevronRight } from 'lucide-react';

const backupEvents = [
  {
    id: 1,
    title: 'Dussera Cultural Night',
    slug: 'dussera',
    kind: 'festival',
    venue: 'AB2 Ground',
    date: '2026-10-20',
    time: '9:00 AM - 4:00 PM',
    description: 'Sacred Ayudha Puja, classical cultural performances, and traditional pandhal feast for all departments.',
    accent: '#881337',
    badge: 'GRAND FESTIVAL',
    tag: 'Celebration'
  },
  {
    id: 2,
    title: 'Diwali Lights & Rangoli',
    slug: 'diwali',
    kind: 'festival',
    venue: 'Main Campus Pandhal',
    date: '2026-11-08',
    time: '5:00 PM - 11:00 PM',
    description: 'Diyas lighting ceremony, vibrant rangoli competitions, eco-crackers, and late-night music & dance.',
    accent: '#b45309',
    badge: 'FESTIVAL OF LIGHTS',
    tag: 'Celebration'
  },
  {
    id: 3,
    title: 'Robotics & Hardware Hackathon',
    slug: 'robotics-hackathon',
    kind: 'regular',
    venue: 'IoT Lab, ECE Block',
    date: '2026-11-15',
    time: '10:00 AM - 5:00 PM',
    description: 'Hands-on embedded prototyping, autonomous sensors, and project exhibitions.',
    accent: '#0d9488',
    badge: 'TECHNICAL GUILD',
    tag: 'Workshop'
  },
  {
    id: 4,
    title: 'Amrita Literary & Book Debate',
    slug: 'literary-debate',
    kind: 'regular',
    venue: 'Central Library Hall',
    date: '2026-11-22',
    time: '3:00 PM - 6:00 PM',
    description: 'Philosophical symposium, book readings, and parliamentary debate challenges.',
    accent: '#4338ca',
    badge: 'LITERARY GUILD',
    tag: 'Symposium'
  }
];

export default function EventsPage() {
  const [events, setEvents] = useState(backupEvents);
  const [filteredEvents, setFilteredEvents] = useState(backupEvents);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    async function loadEvents() {
      try {
        const data = await api.get('/events?limit=20');
        const items = data.items || data.events || [];
        if (items.length > 0) {
          // Merge API items while ensuring Dussera and Diwali are first
          const dussera = items.find(e => e.slug?.includes('dussera') || e.title?.toLowerCase().includes('dussera'));
          const diwali = items.find(e => e.slug?.includes('diwali') || e.title?.toLowerCase().includes('diwali'));

          const updated = [...backupEvents];
          if (dussera) {
            updated[0] = { ...updated[0], id: dussera.id, title: dussera.title, venue: dussera.venue || updated[0].venue };
          }
          if (diwali) {
            updated[1] = { ...updated[1], id: diwali.id, title: diwali.title, venue: diwali.venue || updated[1].venue };
          }
          setEvents(updated);
          setFilteredEvents(updated);
        }
      } catch (err) {
        console.log('Using backup events data.');
      }
    }
    loadEvents();
  }, []);

  useEffect(() => {
    let result = events;
    if (filter === 'regular') result = result.filter(e => e.kind === 'regular');
    if (filter === 'festival') result = result.filter(e => e.kind === 'festival');
    
    if (searchTerm) {
      result = result.filter(e => 
        e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (e.venue && e.venue.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (e.description && e.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    setFilteredEvents(result);
  }, [searchTerm, filter, events]);

  return (
    <div style={{ 
      minHeight: '100vh', 
      position: 'relative',
      fontFamily: 'Lato, sans-serif',
      padding: '7rem 4rem 4rem 4rem',
      /* Light, magical pastel dreamscape background (pink/blue/cream) */
      background: 'linear-gradient(135deg, #fff1f2 0%, #fef3c7 25%, #e0e7ff 65%, #fdf4ff 100%)',
      overflowX: 'hidden'
    }}>
      
      {/* Floating Sparkles & Magical Anime Elements */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1, pointerEvents: 'none', overflow: 'hidden' }}>
        <span className="sparkle-icon" style={{ position: 'absolute', top: '10%', left: '5%', fontSize: '3rem', opacity: 0.7 }}>✨</span>
        <span className="sparkle-icon" style={{ position: 'absolute', top: '18%', right: '8%', fontSize: '3.5rem', opacity: 0.6, animationDelay: '1s' }}>🌸</span>
        <span className="sparkle-icon" style={{ position: 'absolute', top: '45%', left: '3%', fontSize: '2.5rem', opacity: 0.5, animationDelay: '2s' }}>⭐</span>
        <span className="sparkle-icon" style={{ position: 'absolute', bottom: '25%', left: '12%', fontSize: '3.5rem', opacity: 0.6, animationDelay: '1.5s' }}>💫</span>
        <span className="sparkle-icon" style={{ position: 'absolute', bottom: '15%', right: '6%', fontSize: '4rem', opacity: 0.6, animationDelay: '0.5s' }}>🪔</span>

        {/* Soft pastel light orbs */}
        <div style={{ position: 'absolute', top: '25%', left: '30%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(254, 215, 170, 0.35) 0%, transparent 70%)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: '20%', right: '25%', width: '450px', height: '450px', background: 'radial-gradient(circle, rgba(224, 231, 255, 0.45) 0%, transparent 70%)', borderRadius: '50%' }} />
      </div>

      <div style={{ position: 'relative', zIndex: 10, maxWidth: '1240px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3.5rem' }}>
          <Link to="/" style={{ 
            backgroundColor: '#881337', 
            color: '#ffffff', 
            padding: '0.8rem 1.8rem', 
            borderRadius: '0px', 
            textDecoration: 'none', 
            fontSize: '1rem', 
            fontWeight: 'bold', 
            boxShadow: '0 4px 15px rgba(136, 19, 55, 0.25)', 
            border: '2px solid #ffffff',
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
              textShadow: '1px 1px 3px rgba(255,255,255,0.9)' 
            }}>
              Events & Grand Festivals
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.4rem', color: '#881337', fontWeight: 'bold', fontSize: '0.85rem', marginTop: '0.3rem' }}>
              <Sparkles size={16} /> CAMPUS ITINERARY // AMRITA COIMBATORE
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div style={{ display: 'flex', justifyContent: 'center', width: '100%', marginBottom: '4rem' }}>
          <div style={{ display: 'flex', gap: '1rem', width: '100%', maxWidth: '960px', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: '1 1 450px' }}>
              <Search size={22} style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', color: '#881337' }} />
              <input 
                type="text" 
                placeholder="Search festivals or events (e.g. Dussera, Diwali, Hackathon)..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ 
                  width: '100%', 
                  padding: '1.2rem 1.2rem 1.2rem 3.5rem', 
                  borderRadius: '0px', 
                  border: '2px solid #881337', 
                  backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                  color: '#1a1008', 
                  fontSize: '1.15rem', 
                  fontWeight: 'bold', 
                  outline: 'none', 
                  boxShadow: '0 10px 25px rgba(0,0,0,0.08)',
                  boxSizing: 'border-box'
                }}
              />
            </div>
            <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
              {[
                { id: 'all', label: 'All Celebrations' },
                { id: 'festival', label: 'Festivals (Dussera & Diwali)' },
                { id: 'regular', label: 'Club Events' }
              ].map((item) => (
                <button 
                  key={item.id} 
                  onClick={() => setFilter(item.id)} 
                  style={{ 
                    padding: '1.2rem 1.8rem', 
                    borderRadius: '0px', 
                    border: '2px solid #881337', 
                    cursor: 'pointer', 
                    fontWeight: 'bold', 
                    fontFamily: 'Cinzel, serif', 
                    fontSize: '0.95rem', 
                    backgroundColor: filter === item.id ? '#881337' : 'rgba(255, 255, 255, 0.95)', 
                    color: filter === item.id ? '#ffffff' : '#1a1008', 
                    transition: 'all 0.2s ease',
                    boxShadow: filter === item.id ? '0 4px 15px rgba(136, 19, 55, 0.3)' : 'none'
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Dussera & Diwali Featured Spotlight Cards */}
        <div style={{ marginBottom: '3rem' }}>
          <div style={{
            fontSize: '0.85rem',
            fontFamily: 'Cinzel, serif',
            fontWeight: 'bold',
            color: '#881337',
            letterSpacing: '2px',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <Sparkles size={18} color="#881337" /> SPOTLIGHT CAMPUS CELEBRATIONS
          </div>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', 
            gap: '2.5rem' 
          }}>
            {filteredEvents.map((event) => (
              <Link to={`/events/${event.slug}`} key={event.id} style={{ textDecoration: 'none' }}>
                <div 
                  style={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                    border: '2px solid #d4af37', 
                    padding: '2.5rem', 
                    transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)', 
                    cursor: 'pointer', 
                    height: '100%', 
                    boxShadow: '0 12px 30px rgba(0,0,0,0.06)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxSizing: 'border-box',
                    position: 'relative'
                  }}
                  onMouseEnter={(e) => { 
                    e.currentTarget.style.transform = 'translateY(-10px)'; 
                    e.currentTarget.style.boxShadow = '0 20px 45px rgba(212, 175, 55, 0.35)'; 
                    e.currentTarget.style.borderColor = '#881337';
                  }}
                  onMouseLeave={(e) => { 
                    e.currentTarget.style.transform = 'translateY(0)'; 
                    e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,0,0,0.06)'; 
                    e.currentTarget.style.borderColor = '#d4af37';
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
                      <span style={{ 
                        backgroundColor: event.accent, 
                        color: '#ffffff', 
                        padding: '0.35rem 0.9rem', 
                        fontSize: '0.75rem', 
                        fontWeight: 'bold', 
                        letterSpacing: '1px',
                        fontFamily: 'Cinzel, serif'
                      }}>
                        {event.badge}
                      </span>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#881337', fontWeight: 'bold', fontSize: '0.9rem' }}>
                        <Calendar size={16} />
                        <span>{event.date}</span>
                      </div>
                    </div>

                    <h2 style={{ 
                      fontFamily: 'Cinzel, serif', 
                      fontSize: '2.2rem', 
                      color: '#1a1008', 
                      margin: '0 0 1rem 0',
                      lineHeight: '1.2' 
                    }}>
                      {event.title}
                    </h2>

                    <p style={{ color: '#475569', fontSize: '1.05rem', lineHeight: '1.6', margin: '0 0 1.5rem 0' }}>
                      {event.description}
                    </p>
                  </div>

                  <div>
                    <div style={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      gap: '0.4rem', 
                      padding: '1rem', 
                      backgroundColor: 'rgba(254, 243, 199, 0.4)', 
                      borderLeft: `3px solid ${event.accent}`,
                      marginBottom: '1.5rem',
                      color: '#1a1008',
                      fontSize: '0.95rem'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <MapPin size={16} color={event.accent} />
                        <strong>Venue:</strong> {event.venue}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Clock size={16} color={event.accent} />
                        <strong>Timing:</strong> {event.time}
                      </div>
                    </div>

                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between', 
                      color: event.accent, 
                      fontWeight: 'bold', 
                      fontFamily: 'Cinzel, serif',
                      fontSize: '1rem' 
                    }}>
                      <span>View Full Event Itinerary</span>
                      <ChevronRight size={18} />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}