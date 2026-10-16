import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Sparkles, Flame, Sun, Calendar } from 'lucide-react';

export default function FestivalBanner() {
  const { activeTheme, isFestival } = useTheme();

  if (!isFestival || !activeTheme) return null;

  const headline = activeTheme.config?.banner?.headline || `${activeTheme.name} Celebration`;
  const subtext = activeTheme.config?.banner?.subtext || activeTheme.description;
  const decoration = activeTheme.config?.decoration;

  return (
    <div className="festival-hero">
      <div className="container" style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.2)', padding: '0.35rem 1rem', borderRadius: '9999px', marginBottom: '1rem', backdropFilter: 'blur(4px)' }}>
          {decoration === 'diya' ? <Flame size={16} /> : <Sparkles size={16} />}
          <span style={{ fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            {activeTheme.name}
          </span>
        </div>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', fontWeight: 700, marginBottom: '0.75rem', letterSpacing: '-0.02em' }}>
          {headline}
        </h1>
        <p style={{ fontSize: '1.15rem', opacity: 0.9, maxWidth: '680px', margin: '0 auto 1.5rem', lineHeight: 1.6 }}>
          {subtext}
        </p>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', background: 'rgba(0,0,0,0.25)', padding: '0.4rem 1rem', borderRadius: '8px' }}>
          <Calendar size={15} />
          <span>Demo Festival Schedule: {new Date(activeTheme.start_date).toLocaleDateString()} &mdash; {new Date(activeTheme.end_date).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
}
