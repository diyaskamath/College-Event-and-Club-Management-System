import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Shield, BookOpen, Sparkles } from 'lucide-react';

export default function Footer() {
  return (
    <footer style={{ background: '#0F172A', color: '#94A3B8', padding: '3.5rem 0 2rem', marginTop: '4rem', borderTop: '1px solid #1E293B' }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '2.5rem', marginBottom: '3rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#FFFFFF', fontWeight: 800, fontSize: '1.2rem', marginBottom: '1rem' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'var(--theme-primary)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem' }}>
                A
              </div>
              <span>Amrita Connect</span>
            </div>
            <p style={{ fontSize: '0.875rem', lineHeight: 1.6, color: '#94A3B8' }}>
              College Event & Club Management System (CECMS). Designed for students, coordinators, and administrators at Amrita Vishwa Vidyapeetham.
            </p>
          </div>

          <div>
            <h4 style={{ color: '#FFFFFF', fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem' }}>Quick Links</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.875rem' }}>
              <li><Link to="/" style={{ color: '#94A3B8', transition: 'color 150ms' }}>Home</Link></li>
              <li><Link to="/clubs" style={{ color: '#94A3B8', transition: 'color 150ms' }}>Clubs Directory (8 Clubs)</Link></li>
              <li><Link to="/events" style={{ color: '#94A3B8', transition: 'color 150ms' }}>Events & Festivals</Link></li>
              <li><Link to="/login" style={{ color: '#94A3B8', transition: 'color 150ms' }}>Student & Staff Portal</Link></li>
            </ul>
          </div>

          <div>
            <h4 style={{ color: '#FFFFFF', fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem' }}>Festivals & Culture</h4>
            <p style={{ fontSize: '0.85rem', lineHeight: 1.6, color: '#94A3B8', marginBottom: '0.75rem' }}>
              Features automatic seasonal themes:
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.825rem' }}>
              <span style={{ color: '#F59E0B' }}>• Diwali Lights & Rangoli</span>
              <span style={{ color: '#EC4899' }}>• Dussehra & Navaratri Cultural Evening</span>
            </div>
          </div>

          <div>
            <h4 style={{ color: '#FFFFFF', fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem' }}>Demonstration Notice</h4>
            <p style={{ fontSize: '0.8rem', lineHeight: 1.5, color: '#94A3B8' }}>
              This system is built as a 3rd-year Software Engineering Semester Project. All clubs, schedules, venues, and coordinator details are demo placeholders until officially verified.
            </p>
          </div>
        </div>

        <div style={{ borderTop: '1px solid #1E293B', paddingTop: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', fontSize: '0.8rem' }}>
          <span>&copy; {new Date().getFullYear()} Amrita Connect — CECMS. All rights reserved.</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            Built with React, Express, MySQL & Care for Amrita Students
          </span>
        </div>
      </div>
    </footer>
  );
}
