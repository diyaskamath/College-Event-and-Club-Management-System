import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div style={{ padding: '6rem 0', textAlign: 'center' }}>
      <div className="container" style={{ maxWidth: '500px' }}>
        <div style={{ width: '64px', height: '64px', background: 'rgba(136, 19, 55, 0.1)', color: 'var(--theme-primary)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
          <Compass size={32} />
        </div>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', fontWeight: 700, marginBottom: '0.75rem' }}>
          Page Not Found
        </h1>
        <p style={{ color: '#64748B', lineHeight: 1.6, marginBottom: '2rem' }}>
          The requested page could not be located on the Amrita Connect portal. Please check the URL or return to the homepage.
        </p>
        <Link to="/" className="btn btn-primary">
          <ArrowLeft size={16} />
          <span>Return to Homepage</span>
        </Link>
      </div>
    </div>
  );
}
