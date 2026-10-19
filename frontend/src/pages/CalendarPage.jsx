import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Filter,
  AlertTriangle,
  Clock,
  MapPin,
  Tag,
  BookOpen,
  Briefcase,
  Sparkles,
  ArrowLeft
} from 'lucide-react';

const defaultCalendarEvents = [
  {
    id: 1,
    title: 'End Term Exams (For ECE/CSE)',
    type: 'academic',
    startDate: '2026-01-04',
    endDate: '2026-01-12',
    venue: 'Academic Blocks AB1, AB2 & AB3',
    batch: 'B.Tech ECE, CSE & AI (All Semesters)',
    time: '09:30 AM - 12:30 PM',
    description: 'Autonomous End Semester Comprehensive Theory Examinations. Admit cards mandatory.',
    highlight: true,
    color: '#ef4444'
  },
  {
    id: 2,
    title: 'Verilog HDL Lab Practical Evaluation',
    type: 'academic',
    startDate: '2026-01-16',
    endDate: '2026-01-16',
    venue: 'AB2 Embedded Systems Lab 304',
    batch: 'B.Tech ECE 3rd Year',
    time: '01:30 PM - 04:30 PM',
    description: 'External viva voce and hardware FPGA deployment evaluation.',
    color: '#f59e0b'
  },
  {
    id: 3,
    title: 'Campus Placement Drive (Tier 1 Tech)',
    type: 'professional',
    startDate: '2026-01-18',
    endDate: '2026-01-20',
    venue: 'Central Conference Hall & AB1 Labs',
    batch: 'Final Year CSE / ECE / AI Eligible Candidates',
    time: '08:30 AM onwards',
    description: 'Full-time software engineering and core hardware role assessments and technical interviews.',
    color: '#3b82f6'
  },
  {
    id: 4,
    title: 'Autonomous Robotics Workshop & Hackathon',
    type: 'professional',
    startDate: '2026-01-24',
    endDate: '2026-01-25',
    venue: 'IoT & Robotics Makerspace (AB1)',
    batch: 'Open to All Branches',
    time: '24-Hour Continuous Hackathon',
    description: 'Hands-on ROS2, computer vision, and autonomous rover navigation challenges.',
    color: '#06b6d4'
  },
  {
    id: 5,
    title: 'Machine Learning Research Colloquium',
    type: 'professional',
    startDate: '2026-01-28',
    endDate: '2026-01-28',
    venue: 'Amrita Convocation Auditorium',
    batch: 'Faculty & Postgrad / Pre-final Year Scholars',
    time: '10:00 AM - 04:00 PM',
    description: 'Keynote lectures by IEEE fellows on Generative AI and Quantum Computing.',
    color: '#a855f7'
  },
  {
    id: 6,
    title: 'Republic Day Cultural Observance & Parade',
    type: 'academic',
    startDate: '2026-01-26',
    endDate: '2026-01-26',
    venue: 'Main Campus Sports Ground',
    batch: 'All Campus Students & Faculty',
    time: '08:00 AM - 11:00 AM',
    description: 'Flag hoisting ceremony, NCC parade, and patriotic cultural presentations.',
    color: '#10b981'
  }
];

export default function CalendarPage() {
  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL', 'academic', 'professional'
  const [currentDate, setCurrentDate] = useState(new Date(2026, 0, 1)); // Default to January 2026 for the prompt's exam date
  const [selectedDayEvents, setSelectedDayEvents] = useState([]);
  const [selectedDateStr, setSelectedDateStr] = useState('2026-01-04');
  const [calendarEvents, setCalendarEvents] = useState(defaultCalendarEvents);

  useEffect(() => {
    async function fetchCalendar() {
      try {
        const res = await api.get('/calendar/schedule');
        if (res.items && res.items.length > 0) {
          // Merge API events with standard prompt events
          setCalendarEvents(res.items);
        }
      } catch (err) {
        console.log('Using default calendar events');
      }
    }
    fetchCalendar();
  }, []);

  // Filter events by tab
  const filteredEvents = calendarEvents.filter((ev) => {
    if (activeTab === 'ALL') return true;
    return (ev.type || '').toLowerCase() === activeTab.toLowerCase();
  });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Generate calendar grid days
  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const calendarGrid = [];

  // Previous month trailing days
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const dayNum = daysInPrevMonth - i;
    calendarGrid.push({
      day: dayNum,
      isCurrentMonth: false,
      dateStr: `${year}-${String(month).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`
    });
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    calendarGrid.push({
      day: d,
      isCurrentMonth: true,
      dateStr
    });
  }

  // Next month leading days to complete full 35 or 42 grid
  const remainingCells = (7 - (calendarGrid.length % 7)) % 7;
  for (let n = 1; n <= remainingCells; n++) {
    calendarGrid.push({
      day: n,
      isCurrentMonth: false,
      dateStr: `${year}-${String(month + 2).padStart(2, '0')}-${String(n).padStart(2, '0')}`
    });
  }

  // Helper to test if an event falls on a specific date
  const getEventsForDate = (dateStr) => {
    return filteredEvents.filter((ev) => {
      const start = ev.startDate || ev.start_date;
      const end = ev.endDate || ev.end_date || start;
      return dateStr >= start && dateStr <= end;
    });
  };

  const handleSelectDay = (cell) => {
    const eventsOnDay = getEventsForDate(cell.dateStr);
    setSelectedDayEvents(eventsOnDay);
    setSelectedDateStr(cell.dateStr);
  };

  // Set initial selected day events
  useEffect(() => {
    const initEvents = getEventsForDate(selectedDateStr);
    setSelectedDayEvents(initEvents);
  }, [calendarEvents, activeTab, selectedDateStr]);

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#05070e',
      backgroundImage: `
        radial-gradient(circle at 50% 10%, rgba(212, 175, 55, 0.08) 0%, transparent 50%),
        radial-gradient(circle at 90% 80%, rgba(0, 240, 255, 0.06) 0%, transparent 40%),
        linear-gradient(180deg, #05070e 0%, #0a0f1d 50%, #060913 100%)
      `,
      color: '#ffffff',
      padding: '6.5rem 2.5rem 5rem 2.5rem'
    }}>
      <div style={{ maxWidth: '1380px', margin: '0 auto' }}>

        {/* Back Link */}
        <div style={{ marginBottom: '1.2rem' }}>
          <Link
            to="/dashboard"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              color: '#d4af37',
              textDecoration: 'none',
              fontSize: '0.9rem',
              fontFamily: 'Cinzel, serif',
              letterSpacing: '1px'
            }}
          >
            <ArrowLeft size={16} />
            <span>Back to Dashboard</span>
          </Link>
        </div>

        {/* Header Bar */}
        <div style={{
          backgroundColor: 'rgba(15, 23, 42, 0.92)',
          border: '1.5px solid rgba(212, 175, 55, 0.4)',
          borderRadius: '4px',
          padding: '1.8rem 2.5rem',
          marginBottom: '2rem',
          boxShadow: '0 15px 35px rgba(0, 0, 0, 0.6), 0 0 25px rgba(212, 175, 55, 0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1.5rem'
        }}>
          <div>
            <span style={{
              backgroundColor: 'rgba(212, 175, 55, 0.15)',
              border: '1px solid #d4af37',
              color: '#fef08a',
              padding: '0.2rem 0.6rem',
              borderRadius: '2px',
              fontSize: '0.75rem',
              fontFamily: 'monospace',
              letterSpacing: '1px'
            }}>
              AMRITA UNIVERSITY SCHOLASTIC CALENDAR
            </span>
            <h1 style={{
              fontFamily: 'Cinzel, serif',
              fontSize: '2.2rem',
              fontWeight: 700,
              color: '#d4af37',
              margin: '0.3rem 0',
              letterSpacing: '2px'
            }}>
              CAMPUS SCHEDULE & EXAMINATIONS
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '0.95rem', margin: 0 }}>
              Academic examination schedules, viva evaluations, and professional placement drives.
            </p>
          </div>

          {/* Filter Tabs: Academic vs Professional */}
          <div style={{ display: 'flex', gap: '0.5rem', backgroundColor: '#090d18', padding: '0.35rem', borderRadius: '4px', border: '1px solid rgba(212, 175, 55, 0.3)' }}>
            <button
              type="button"
              onClick={() => setActiveTab('ALL')}
              style={{
                backgroundColor: activeTab === 'ALL' ? '#d4af37' : 'transparent',
                color: activeTab === 'ALL' ? '#05070e' : '#cbd5e1',
                border: 'none',
                padding: '0.55rem 1.2rem',
                fontFamily: 'Cinzel, serif',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
                letterSpacing: '1px',
                transition: 'all 0.2s'
              }}
            >
              All Events
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('academic')}
              style={{
                backgroundColor: activeTab === 'academic' ? '#ef4444' : 'transparent',
                color: activeTab === 'academic' ? '#ffffff' : '#cbd5e1',
                border: 'none',
                padding: '0.55rem 1.2rem',
                fontFamily: 'Cinzel, serif',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
                letterSpacing: '1px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                transition: 'all 0.2s'
              }}
            >
              <BookOpen size={14} />
              <span>Academic</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('professional')}
              style={{
                backgroundColor: activeTab === 'professional' ? '#3b82f6' : 'transparent',
                color: activeTab === 'professional' ? '#ffffff' : '#cbd5e1',
                border: 'none',
                padding: '0.55rem 1.2rem',
                fontFamily: 'Cinzel, serif',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
                letterSpacing: '1px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                transition: 'all 0.2s'
              }}
            >
              <Briefcase size={14} />
              <span>Professional</span>
            </button>
          </div>
        </div>

        {/* =========================================================================
            CALENDAR GRID + DETAIL SIDEBAR LAYOUT
           ========================================================================= */}
        <div style={{ display: 'grid', gridTemplateColumns: '8fr 4fr', gap: '2rem' }}>

          {/* LEFT: MONTHLY CALENDAR GRID */}
          <div style={{
            backgroundColor: 'rgba(15, 23, 42, 0.92)',
            border: '1.5px solid rgba(212, 175, 55, 0.35)',
            borderRadius: '4px',
            padding: '1.8rem',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)'
          }}>

            {/* Month & Navigation Bar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <CalendarIcon size={24} color="#d4af37" />
                <h2 style={{
                  fontFamily: 'Cinzel, serif',
                  fontSize: '1.6rem',
                  fontWeight: 700,
                  color: '#ffffff',
                  margin: 0,
                  letterSpacing: '1px'
                }}>
                  {monthNames[month].toUpperCase()} {year}
                </h2>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  style={{
                    backgroundColor: '#090d18',
                    border: '1px solid rgba(212, 175, 55, 0.4)',
                    color: '#d4af37',
                    padding: '0.4rem 0.8rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                  title="Previous Month"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentDate(new Date(2026, 0, 1))}
                  style={{
                    backgroundColor: '#090d18',
                    border: '1px solid rgba(212, 175, 55, 0.4)',
                    color: '#cbd5e1',
                    padding: '0.4rem 0.8rem',
                    fontFamily: 'Cinzel, serif',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Jan 2026 (Exams)
                </button>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  style={{
                    backgroundColor: '#090d18',
                    border: '1px solid rgba(212, 175, 55, 0.4)',
                    color: '#d4af37',
                    padding: '0.4rem 0.8rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                  title="Next Month"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>

            {/* Days of Week Header */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: '6px',
              textAlign: 'center',
              marginBottom: '8px'
            }}>
              {daysOfWeek.map((day) => (
                <div
                  key={day}
                  style={{
                    fontFamily: 'Cinzel, serif',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    color: '#d4af37',
                    padding: '0.5rem',
                    letterSpacing: '1px'
                  }}
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Cells Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: '6px'
            }}>
              {calendarGrid.map((cell, idx) => {
                const dayEvents = getEventsForDate(cell.dateStr);
                const isSelected = selectedDateStr === cell.dateStr;
                const hasExams = dayEvents.some(e => e.title?.includes('End Term Exams'));

                return (
                  <div
                    key={idx}
                    onClick={() => handleSelectDay(cell)}
                    style={{
                      minHeight: '85px',
                      backgroundColor: isSelected
                        ? 'rgba(212, 175, 55, 0.15)'
                        : cell.isCurrentMonth
                        ? 'rgba(9, 13, 24, 0.85)'
                        : 'rgba(5, 7, 14, 0.5)',
                      border: isSelected
                        ? '2px solid #d4af37'
                        : hasExams
                        ? '1px solid rgba(239, 68, 68, 0.6)'
                        : '1px solid rgba(212, 175, 55, 0.15)',
                      borderRadius: '3px',
                      padding: '6px',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      opacity: cell.isCurrentMonth ? 1 : 0.4,
                      boxShadow: hasExams ? '0 0 10px rgba(239, 68, 68, 0.2)' : 'none',
                      position: 'relative'
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) e.currentTarget.style.borderColor = '#00ffff';
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.borderColor = hasExams ? 'rgba(239, 68, 68, 0.6)' : 'rgba(212, 175, 55, 0.15)';
                      }
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '4px'
                    }}>
                      <span style={{
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        fontFamily: 'monospace',
                        color: isSelected ? '#d4af37' : '#ffffff'
                      }}>
                        {cell.day}
                      </span>

                      {hasExams && (
                        <span style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          backgroundColor: '#ef4444',
                          boxShadow: '0 0 6px #ef4444'
                        }} />
                      )}
                    </div>

                    {/* Event chips */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                      {dayEvents.slice(0, 2).map((ev) => (
                        <div
                          key={ev.id}
                          style={{
                            fontSize: '0.68rem',
                            backgroundColor: ev.type === 'academic' ? 'rgba(239, 68, 68, 0.25)' : 'rgba(59, 130, 246, 0.25)',
                            borderLeft: `2px solid ${ev.color || (ev.type === 'academic' ? '#ef4444' : '#3b82f6')}`,
                            color: '#ffffff',
                            padding: '2px 4px',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            borderRadius: '1px'
                          }}
                          title={ev.title}
                        >
                          {ev.title}
                        </div>
                      ))}
                      {dayEvents.length > 2 && (
                        <span style={{ fontSize: '0.62rem', color: '#94a3b8' }}>
                          +{dayEvents.length - 2} more
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

          </div>

          {/* RIGHT: SELECTED DATE DETAIL DRAWER */}
          <div style={{
            backgroundColor: 'rgba(15, 23, 42, 0.92)',
            border: '1.5px solid rgba(212, 175, 55, 0.35)',
            borderRadius: '4px',
            padding: '1.8rem',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{ borderBottom: '1px solid rgba(212, 175, 55, 0.3)', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#00ffff' }}>
                SELECTED DATE AGENDA
              </div>
              <h3 style={{ fontFamily: 'Cinzel, serif', fontSize: '1.4rem', color: '#d4af37', margin: '0.2rem 0' }}>
                {selectedDateStr}
              </h3>
              <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                {selectedDayEvents.length} Event(s) Scheduled
              </div>
            </div>

            {/* List of events on selected date */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', flex: 1, overflowY: 'auto' }}>
              {selectedDayEvents.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#94a3b8' }}>
                  <CalendarIcon size={36} color="rgba(212, 175, 55, 0.3)" style={{ margin: '0 auto 0.8rem' }} />
                  <p style={{ margin: 0, fontSize: '0.9rem' }}>No events or examinations scheduled on this day.</p>
                  <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.3rem' }}>
                    Click on Jan 4 &ndash; Jan 12 to inspect the End Term Exams.
                  </p>
                </div>
              ) : (
                selectedDayEvents.map((ev) => (
                  <div
                    key={ev.id}
                    style={{
                      backgroundColor: 'rgba(9, 13, 24, 0.95)',
                      border: `1.5px solid ${ev.color || '#d4af37'}`,
                      borderRadius: '4px',
                      padding: '1.2rem',
                      boxShadow: `0 0 20px ${ev.color ? `${ev.color}22` : 'rgba(212, 175, 55, 0.15)'}`
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <span style={{
                        backgroundColor: ev.type === 'academic' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(59, 130, 246, 0.2)',
                        border: `1px solid ${ev.type === 'academic' ? '#ef4444' : '#3b82f6'}`,
                        color: ev.type === 'academic' ? '#fca5a5' : '#93c5fd',
                        padding: '0.15rem 0.5rem',
                        fontSize: '0.7rem',
                        fontFamily: 'monospace',
                        fontWeight: 700,
                        textTransform: 'uppercase'
                      }}>
                        {ev.type}
                      </span>

                      {ev.highlight && (
                        <span style={{
                          backgroundColor: 'rgba(239, 68, 68, 0.3)',
                          border: '1px solid #ef4444',
                          color: '#ffffff',
                          fontSize: '0.68rem',
                          fontFamily: 'Cinzel, serif',
                          padding: '0.15rem 0.4rem',
                          fontWeight: 700
                        }}>
                          MAJOR EXAM
                        </span>
                      )}
                    </div>

                    <h4 style={{
                      fontFamily: 'Cinzel, serif',
                      fontSize: '1.15rem',
                      color: '#ffffff',
                      margin: '0.3rem 0 0.5rem 0'
                    }}>
                      {ev.title}
                    </h4>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.82rem', color: '#cbd5e1' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Clock size={14} color="#d4af37" />
                        <span>{ev.time || 'All Day'}</span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <MapPin size={14} color="#00ffff" />
                        <span>{ev.venue || 'Amrita Campus'}</span>
                      </div>

                      {ev.batch && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <Tag size={14} color="#c084fc" />
                          <span>{ev.batch}</span>
                        </div>
                      )}
                    </div>

                    <p style={{
                      fontSize: '0.82rem',
                      color: '#94a3b8',
                      lineHeight: 1.5,
                      marginTop: '0.8rem',
                      borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                      paddingTop: '0.6rem',
                      margin: '0.8rem 0 0 0'
                    }}>
                      {ev.description}
                    </p>
                  </div>
                ))
              )}
            </div>

            {/* Quick Demo Navigation Shortcut to Exam Date */}
            <button
              type="button"
              onClick={() => {
                setCurrentDate(new Date(2026, 0, 1));
                setSelectedDateStr('2026-01-04');
              }}
              style={{
                marginTop: '1.2rem',
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid #ef4444',
                color: '#fca5a5',
                padding: '0.65rem',
                fontFamily: 'Cinzel, serif',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                letterSpacing: '1px',
                textAlign: 'center'
              }}
            >
              Jump to Jan 4 End Term Exams (ECE/CSE)
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
