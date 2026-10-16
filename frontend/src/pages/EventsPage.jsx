import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/client';
import EventCard from '../components/EventCard';
import { Search, Filter, Calendar, Sparkles, AlertCircle } from 'lucide-react';

export default function EventsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialKind = searchParams.get('kind') || 'all';

  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [kindFilter, setKindFilter] = useState(initialKind);
  const [categoryFilter, setCategoryFilter] = useState('');

  useEffect(() => {
    async function loadEvents() {
      try {
        const [eventsRes, catRes] = await Promise.all([
          api.get('/events?limit=50'),
          api.get('/events/categories'),
        ]);
        setEvents(eventsRes.events || []);
        setCategories(catRes.categories || []);
      } catch (err) {
        console.error('Failed to load events', err);
      } finally {
        setLoading(false);
      }
    }
    loadEvents();
  }, []);

  const handleKindChange = (k) => {
    setKindFilter(k);
    if (k === 'all') {
      searchParams.delete('kind');
    } else {
      searchParams.set('kind', k);
    }
    setSearchParams(searchParams);
  };

  const filteredEvents = events.filter((e) => {
    const matchesSearch =
      !search ||
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      (e.description && e.description.toLowerCase().includes(search.toLowerCase())) ||
      (e.venue && e.venue.toLowerCase().includes(search.toLowerCase()));

    const matchesKind =
      kindFilter === 'all' ||
      (kindFilter === 'festival' && e.kind === 'festival') ||
      (kindFilter === 'regular' && e.kind === 'regular');

    const matchesCategory = !categoryFilter || e.category === categoryFilter;

    return matchesSearch && matchesKind && matchesCategory;
  });

  return (
    <div style={{ padding: '2.5rem 0 4rem' }}>
      <div className="container">
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--theme-primary)', fontWeight: 700, fontSize: '0.825rem', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.35rem' }}>
            <Calendar size={16} />
            <span>Campus Schedule</span>
          </div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', fontWeight: 700, color: '#0F172A' }}>
            Events & Festivals
          </h1>
          <p style={{ color: '#64748B', fontSize: '1rem', marginTop: '0.35rem' }}>
            Displaying all 5 specified campus events — 3 regular workshops and 2 dedicated festival cultural evenings.
          </p>
        </div>

        {/* Filter / Search Bar */}
        <div className="card" style={{ padding: '1.25rem', marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Top row: search & kinds */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
                <Search size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                <input
                  type="text"
                  placeholder="Search events by title, venue, or keywords..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: '2.25rem' }}
                />
              </div>

              {/* Kind Filter buttons */}
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  className={`btn btn-sm ${kindFilter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => handleKindChange('all')}
                >
                  All Events ({events.length})
                </button>
                <button
                  className={`btn btn-sm ${kindFilter === 'regular' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => handleKindChange('regular')}
                >
                  Regular Events (3)
                </button>
                <button
                  className={`btn btn-sm ${kindFilter === 'festival' ? 'btn-accent' : 'btn-secondary'}`}
                  onClick={() => handleKindChange('festival')}
                >
                  <Sparkles size={14} />
                  <span>Festivals (2)</span>
                </button>
              </div>
            </div>

            {/* Bottom row: Categories */}
            {categories.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', borderTop: '1px solid #F1F5F9', paddingTop: '0.75rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748B' }}>Category:</span>
                <button
                  className={`btn btn-sm ${!categoryFilter ? 'btn-secondary' : ''}`}
                  style={{ padding: '0.2rem 0.6rem', fontSize: '0.75rem' }}
                  onClick={() => setCategoryFilter('')}
                >
                  All
                </button>
                {categories.map((c) => (
                  <button
                    key={c}
                    className={`btn btn-sm ${categoryFilter === c ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ padding: '0.2rem 0.6rem', fontSize: '0.75rem' }}
                    onClick={() => setCategoryFilter(c)}
                  >
                    {c}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Events Grid */}
        {loading ? (
          <div style={{ padding: '4rem', textAlign: 'center', color: '#94A3B8' }}>Loading events...</div>
        ) : filteredEvents.length === 0 ? (
          <div className="card" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
            <AlertCircle size={40} color="#94A3B8" style={{ margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1E293B', marginBottom: '0.5rem' }}>No events found</h3>
            <p style={{ color: '#64748B', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              No events matched your selected filter criteria.
            </p>
            <button className="btn btn-secondary btn-sm" onClick={() => { setSearch(''); setKindFilter('all'); setCategoryFilter(''); }}>
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid-3">
            {filteredEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
