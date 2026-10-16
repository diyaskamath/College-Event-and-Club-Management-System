import React from 'react';
import { Link } from 'react-router-dom';
import { Users, UserCheck, ArrowRight, ShieldCheck } from 'lucide-react';
import Badge from './Badge';

export default function ClubCard({ club }) {
  if (!club) return null;

  return (
    <div className="card card-hover" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.875rem' }}>
        <Badge variant="primary">{club.category || 'General'}</Badge>
        {club.is_demo ? (
          <span style={{ fontSize: '0.7rem', color: '#B45309', background: '#FEF3C7', padding: '0.15rem 0.45rem', borderRadius: '4px', fontWeight: 600 }}>
            Demo Club
          </span>
        ) : null}
      </div>

      <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem', lineHeight: 1.35 }}>
        <Link to={`/clubs/${club.slug || club.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
          {club.name}
        </Link>
      </h3>

      <p style={{ color: '#64748B', fontSize: '0.875rem', lineHeight: 1.5, marginBottom: '1.25rem', flex: 1, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
        {club.description}
      </p>

      <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.825rem', color: '#64748B' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Users size={15} color="var(--theme-primary)" />
          <span style={{ fontWeight: 600, color: '#1E293B' }}>{club.member_count || 0}</span> members
        </div>

        {club.is_member ? (
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#15803D', fontWeight: 600, fontSize: '0.8rem' }}>
            <UserCheck size={14} /> Joined
          </span>
        ) : club.coordinator_name ? (
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#475569', fontSize: '0.75rem' }}>
            <ShieldCheck size={13} /> {club.coordinator_name}
          </span>
        ) : null}
      </div>

      <div style={{ marginTop: '1.25rem' }}>
        <Link
          to={`/clubs/${club.slug || club.id}`}
          className="btn btn-secondary btn-sm"
          style={{ width: '100%', justifyContent: 'space-between' }}
        >
          <span>Explore Club</span>
          <ArrowRight size={15} />
        </Link>
      </div>
    </div>
  );
}
