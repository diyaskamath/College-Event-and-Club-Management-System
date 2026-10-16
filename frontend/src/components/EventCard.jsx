import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users, Clock, Sparkles } from 'lucide-react';
import Badge from './Badge';

export default function EventCard({ event }) {
  if (!event) return null;

  const isFestival = event.kind === 'festival';
  const startDate = event.starts_at ? new Date(event.starts_at) : null;
  const isPlaceholder = event.venue_is_placeholder || event.is_demo;

  const formattedDate = startDate
    ? startDate.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
    : 'Date TBD';
  const formattedTime = startDate
    ? startDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    : '';

  return (
    <div className={`card card-hover ${isFestival ? 'card-festival' : ''}`} style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.875rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          {isFestival ? (
            <Badge variant="festival" icon={Sparkles}>
              Festival Event
            </Badge>
          ) : (
            <Badge variant="primary">
              {event.category || 'Event'}
            </Badge>
          )}
          {event.event_type && (
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748B', background: '#F1F5F9', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
              {event.event_type}
            </span>
          )}
        </div>
        {isPlaceholder && (
          <span style={{ fontSize: '0.7rem', color: '#B45309', background: '#FEF3C7', padding: '0.15rem 0.45rem', borderRadius: '4px', fontWeight: 600 }}>
            Demo Data
          </span>
        )}
      </div>

      <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem', lineHeight: 1.35 }}>
        <Link to={`/events/${event.slug || event.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
          {event.title}
        </Link>
      </h3>

      <p style={{ color: '#64748B', fontSize: '0.875rem', lineHeight: 1.5, marginBottom: '1.25rem', flex: 1, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
        {event.description}
      </p>

      <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.825rem', color: '#475569' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Calendar size={15} color="var(--theme-primary)" />
          <span>{formattedDate} {formattedTime && `• ${formattedTime}`}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <MapPin size={15} color="#D97706" />
          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {event.venue || 'Venue to be confirmed'} {event.academic_block ? `(${event.academic_block})` : ''}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#64748B' }}>
            <Users size={14} />
            <span>Capacity: {event.capacity || 'Open'}</span>
          </div>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: event.club_name ? 'var(--theme-primary)' : '#64748B' }}>
            {event.club_name || event.organizer_name || 'Amrita Campus'}
          </span>
        </div>
      </div>

      <div style={{ marginTop: '1.25rem' }}>
        <Link
          to={`/events/${event.slug || event.id}`}
          className={`btn ${isFestival ? 'btn-accent' : 'btn-outline'} btn-sm`}
          style={{ width: '100%' }}
        >
          View Details & Register
        </Link>
      </div>
    </div>
  );
}
