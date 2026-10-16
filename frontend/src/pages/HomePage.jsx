import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import EventCard from '../components/EventCard';
import ClubCard from '../components/ClubCard';
import FestivalBanner from '../components/FestivalBanner';
import { Sparkles, Calendar, Users, ArrowRight, Compass, ShieldCheck, Flame } from 'lucide-react';

export default function HomePage() {
  const [regularEvents, setRegularEvents] = useState([]);
  const [festivalEvents, setFestivalEvents] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [eventsData, clubsData] = await Promise.all([
          api.get('/events?limit=20'),
          api.get('/clubs?limit=20'),
        ]);

        const allEvents = eventsData.events || [];
        setRegularEvents(allEvents.filter((e) => e.kind === 'regular'));
        setFestivalEvents(allEvents.filter((e) => e.kind === 'festival'));
        setClubs(clubsData.clubs || []);
      } catch (err) {
        console.error('Failed to load homepage data', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div>
      {/* Demo Disclaimer Top Bar */}
      <div className="demo-disclaimer">
        <strong>Notice:</strong> This web application is a student Software Engineering project. All clubs, schedules, venues, and coordinator details shown are demonstration data.
      </div>

      {/* Dynamic Festival Hero Banner if festival active */}
      <FestivalBanner />

      {/* Main Hero Section */}
      <section style={{ background: 'linear-gradient(180deg, rgba(136, 19, 55, 0.04) 0%, transparent 100%)', padding: '4.5rem 0 3.5rem', borderBottom: '1px solid var(--theme-border)' }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: '850px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#FFFFFF', border: '1px solid var(--theme-border)', padding: '0.4rem 1rem', borderRadius: '9999px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--theme-primary)', marginBottom: '1.25rem', boxShadow: 'var(--shadow-sm)' }}>
            <Sparkles size={16} />
            <span>Official University Club & Event Platform</span>
          </div>

          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '3rem', fontWeight: 700, lineHeight: 1.15, color: '#0F172A', marginBottom: '1.25rem', letterSpacing: '-0.02em' }}>
            Discover campus life, connect with clubs, and never miss an event.
          </h1>

          <p style={{ fontSize: '1.15rem', color: '#64748B', lineHeight: 1.6, marginBottom: '2rem' }}>
            Amrita Connect brings together student clubs, technical hackathons, cultural festivals, and campus leadership into a single, seamless university portal.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Link to="/events" className="btn btn-primary btn-lg">
              <Calendar size={18} />
              <span>Explore All Events</span>
            </Link>
            <Link to="/clubs" className="btn btn-secondary btn-lg">
              <Users size={18} />
              <span>Browse 8 Campus Clubs</span>
            </Link>
          </div>
        </div>
      </section>

      {/* SECTION 1: Dedicated Festival Events (STRICT REQUIREMENT: Separated from regular events) */}
      <section style={{ padding: '4rem 0', background: 'linear-gradient(180deg, rgba(245, 158, 11, 0.04) 0%, rgba(236, 72, 153, 0.03) 100%)', borderBottom: '1px solid var(--theme-border)' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#B45309', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.35rem' }}>
                <Flame size={18} />
                <span>Campus Cultural Celebrations</span>
              </div>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', fontWeight: 700, color: '#0F172A' }}>
                Dedicated Festival Events
              </h2>
              <p style={{ color: '#64748B', fontSize: '0.95rem', marginTop: '0.25rem' }}>
                Special campus-wide cultural traditions featuring dynamic seasonal themes and university-wide celebrations.
              </p>
            </div>
            <Link to="/events?kind=festival" className="btn btn-accent btn-sm">
              <span>View All Festivals</span>
              <ArrowRight size={15} />
            </Link>
          </div>

          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#94A3B8' }}>Loading festival events...</div>
          ) : (
            <div className="grid-2">
              {festivalEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* SECTION 2: Regular Events (STRICT REQUIREMENT: Separated section) */}
      <section style={{ padding: '4rem 0', borderBottom: '1px solid var(--theme-border)' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--theme-primary)', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.35rem' }}>
                <Calendar size={18} />
                <span>Club Activities & Workshops</span>
              </div>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', fontWeight: 700, color: '#0F172A' }}>
                Regular Campus Events
              </h2>
              <p style={{ color: '#64748B', fontSize: '0.95rem', marginTop: '0.25rem' }}>
                Technical workshops, literary circles, and entrepreneurship pitch sessions organized by student clubs.
              </p>
            </div>
            <Link to="/events?kind=regular" className="btn btn-secondary btn-sm">
              <span>View All Regular Events</span>
              <ArrowRight size={15} />
            </Link>
          </div>

          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#94A3B8' }}>Loading regular events...</div>
          ) : (
            <div className="grid-3">
              {regularEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* SECTION 3: Exactly Eight Clubs Directory Preview */}
      <section style={{ padding: '4rem 0', background: '#F8FAFC' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--theme-primary)', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.35rem' }}>
                <Users size={18} />
                <span>Student Communities</span>
              </div>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', fontWeight: 700, color: '#0F172A' }}>
                Campus Clubs & Societies
              </h2>
              <p style={{ color: '#64748B', fontSize: '0.95rem', marginTop: '0.25rem' }}>
                Explore the eight active student clubs across technology, arts, literature, and leadership.
              </p>
            </div>
            <Link to="/clubs" className="btn btn-primary btn-sm">
              <span>View All 8 Clubs</span>
              <ArrowRight size={15} />
            </Link>
          </div>

          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#94A3B8' }}>Loading clubs...</div>
          ) : (
            <div className="grid-4">
              {clubs.map((club) => (
                <ClubCard key={club.id} club={club} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
