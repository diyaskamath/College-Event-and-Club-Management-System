import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import Badge from '../components/Badge';
import {
  Users,
  Calendar,
  Bookmark,
  History,
  FileQuestion,
  Bell,
  ArrowRight,
  CheckCircle,
  Clock,
  Sparkles,
} from 'lucide-react';

export default function StudentDashboard() {
  const { user } = useAuth();
  const { showToast } = useNotification();

  const [activeTab, setActiveTab] = useState('registrations');
  const [registrations, setRegistrations] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [savedEvents, setSavedEvents] = useState([]);
  const [history, setHistory] = useState([]);
  const [clubRequests, setClubRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [regRes, clubsRes, savedRes, historyRes, reqRes] = await Promise.all([
          api.get('/me/registrations'),
          api.get('/me/clubs'),
          api.get('/me/saved-events'),
          api.get('/me/history'),
          api.get('/me/club-requests'),
        ]);

        setRegistrations(regRes.registrations || []);
        setClubs(clubsRes.clubs || []);
        setSavedEvents(savedRes.events || []);
        setHistory(historyRes.history || []);
        setClubRequests(reqRes.requests || []);
      } catch (err) {
        showToast('Failed to load dashboard data', 'error');
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, [showToast]);

  return (
    <div style={{ padding: '2.5rem 0 4rem' }}>
      <div className="container">
        {/* Welcome Header */}
        <div className="card" style={{ padding: '2rem', marginBottom: '2rem', background: 'linear-gradient(135deg, rgba(136, 19, 55, 0.05) 0%, rgba(217, 119, 6, 0.05) 100%)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--theme-primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Student Portal
              </span>
              <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', fontWeight: 700, color: '#0F172A', marginTop: '0.25rem' }}>
                Welcome back, {user?.name}!
              </h1>
              <p style={{ color: '#64748B', fontSize: '0.9rem', marginTop: '0.2rem' }}>
                Amrita Email: <strong>{user?.email}</strong> &bull; Campus: <strong>Coimbatore</strong>
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <Link to="/events" className="btn btn-primary btn-sm">
                <Calendar size={15} />
                <span>Browse Events</span>
              </Link>
              <Link to="/clubs" className="btn btn-secondary btn-sm">
                <Users size={15} />
                <span>Explore Clubs</span>
              </Link>
            </div>
          </div>

          {/* Quick Metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginTop: '1.5rem', borderTop: '1px solid #E2E8F0', paddingTop: '1.25rem' }}>
            <div style={{ background: '#FFFFFF', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '0.8rem', color: '#64748B' }}>Registered Events</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0F172A', marginTop: '0.2rem' }}>{registrations.length}</div>
            </div>
            <div style={{ background: '#FFFFFF', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '0.8rem', color: '#64748B' }}>Joined Clubs</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--theme-primary)', marginTop: '0.2rem' }}>{clubs.length}</div>
            </div>
            <div style={{ background: '#FFFFFF', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '0.8rem', color: '#64748B' }}>Saved Bookmarks</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#D97706', marginTop: '0.2rem' }}>{savedEvents.length}</div>
            </div>
            <div style={{ background: '#FFFFFF', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '0.8rem', color: '#64748B' }}>Attended Sessions</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#15803D', marginTop: '0.2rem' }}>{history.length}</div>
            </div>
          </div>
        </div>

        {/* Dashboard Navigation Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--theme-border)', marginBottom: '1.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
          <button
            className={`btn btn-sm ${activeTab === 'registrations' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('registrations')}
          >
            <Calendar size={15} />
            <span>My Registrations ({registrations.length})</span>
          </button>
          <button
            className={`btn btn-sm ${activeTab === 'clubs' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('clubs')}
          >
            <Users size={15} />
            <span>Joined Clubs ({clubs.length})</span>
          </button>
          <button
            className={`btn btn-sm ${activeTab === 'saved' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('saved')}
          >
            <Bookmark size={15} />
            <span>Saved Events ({savedEvents.length})</span>
          </button>
          <button
            className={`btn btn-sm ${activeTab === 'history' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('history')}
          >
            <History size={15} />
            <span>Participation History ({history.length})</span>
          </button>
          <button
            className={`btn btn-sm ${activeTab === 'requests' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('requests')}
          >
            <FileQuestion size={15} />
            <span>Club Proposals ({clubRequests.length})</span>
          </button>
        </div>

        {/* Tab Content */}
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#94A3B8' }}>Loading dashboard details...</div>
        ) : (
          <div>
            {/* Tab: Registrations */}
            {activeTab === 'registrations' && (
              <div>
                {registrations.length === 0 ? (
                  <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
                    <Calendar size={36} color="#94A3B8" style={{ margin: '0 auto 1rem' }} />
                    <h3>No event registrations yet</h3>
                    <p style={{ color: '#64748B', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
                      Explore campus workshops and cultural festivals to register.
                    </p>
                    <Link to="/events" className="btn btn-primary btn-sm">Explore Events</Link>
                  </div>
                ) : (
                  <div className="table-container">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Event Title</th>
                          <th>Category</th>
                          <th>Venue</th>
                          <th>Starts At</th>
                          <th>Status</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {registrations.map((r) => (
                          <tr key={r.id}>
                            <td style={{ fontWeight: 600 }}>
                              <Link to={`/events/${r.event_slug || r.event_id}`} style={{ color: 'var(--theme-primary)' }}>
                                {r.event_title}
                              </Link>
                            </td>
                            <td>{r.category || 'General'}</td>
                            <td>{r.venue}</td>
                            <td>{new Date(r.starts_at).toLocaleDateString()}</td>
                            <td>
                              <span className={`badge ${r.status === 'approved' ? 'badge-success' : r.status === 'registered' ? 'badge-primary' : 'badge-warning'}`}>
                                {r.status}
                              </span>
                            </td>
                            <td>
                              <Link to={`/events/${r.event_slug || r.event_id}`} className="btn btn-secondary btn-sm" style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}>
                                View Details
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Tab: Joined Clubs */}
            {activeTab === 'clubs' && (
              <div>
                {clubs.length === 0 ? (
                  <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
                    <Users size={36} color="#94A3B8" style={{ margin: '0 auto 1rem' }} />
                    <h3>You haven&apos;t joined any clubs yet</h3>
                    <p style={{ color: '#64748B', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
                      Browse the 8 active campus clubs to join discussions and workshops.
                    </p>
                    <Link to="/clubs" className="btn btn-primary btn-sm">Browse 8 Clubs</Link>
                  </div>
                ) : (
                  <div className="grid-3">
                    {clubs.map((c) => (
                      <div key={c.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <div>
                          <Badge variant="primary">{c.category}</Badge>
                          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0.75rem 0 0.5rem' }}>{c.name}</h3>
                          <p style={{ fontSize: '0.85rem', color: '#64748B', lineHeight: 1.5, marginBottom: '1rem' }}>
                            {c.description}
                          </p>
                        </div>
                        <Link to={`/clubs/${c.slug || c.id}`} className="btn btn-secondary btn-sm">
                          <span>Open Club Portal</span>
                          <ArrowRight size={14} />
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tab: Saved Events */}
            {activeTab === 'saved' && (
              <div>
                {savedEvents.length === 0 ? (
                  <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
                    <Bookmark size={36} color="#94A3B8" style={{ margin: '0 auto 1rem' }} />
                    <h3>No saved bookmarks</h3>
                    <p style={{ color: '#64748B', fontSize: '0.9rem' }}>
                      Bookmark events to keep track of deadlines and upcoming schedules.
                    </p>
                  </div>
                ) : (
                  <div className="grid-3">
                    {savedEvents.map((e) => (
                      <div key={e.id} className="card">
                        <Badge variant="primary">{e.category}</Badge>
                        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0.5rem 0' }}>{e.title}</h3>
                        <p style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: '1rem' }}>{e.description}</p>
                        <Link to={`/events/${e.slug || e.id}`} className="btn btn-outline btn-sm" style={{ width: '100%' }}>
                          View Event
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tab: History */}
            {activeTab === 'history' && (
              <div>
                {history.length === 0 ? (
                  <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
                    <History size={36} color="#94A3B8" style={{ margin: '0 auto 1rem' }} />
                    <h3>No attendance records yet</h3>
                    <p style={{ color: '#64748B', fontSize: '0.9rem' }}>
                      Once club coordinators mark your attendance for completed events, records will appear here.
                    </p>
                  </div>
                ) : (
                  <div className="table-container">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Event Name</th>
                          <th>Category</th>
                          <th>Date</th>
                          <th>Attendance Verified</th>
                        </tr>
                      </thead>
                      <tbody>
                        {history.map((h) => (
                          <tr key={h.id}>
                            <td style={{ fontWeight: 600 }}>{h.event_title}</td>
                            <td>{h.category}</td>
                            <td>{new Date(h.starts_at).toLocaleDateString()}</td>
                            <td>
                              <span className="badge badge-success">Attended</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Tab: Club Proposals */}
            {activeTab === 'requests' && (
              <div>
                {clubRequests.length === 0 ? (
                  <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
                    <FileQuestion size={36} color="#94A3B8" style={{ margin: '0 auto 1rem' }} />
                    <h3>No pending club proposals</h3>
                    <p style={{ color: '#64748B', fontSize: '0.9rem', marginBottom: '1rem' }}>
                      Want to start a new student group? Submit a proposal from the clubs page.
                    </p>
                    <Link to="/clubs" className="btn btn-secondary btn-sm">Propose a Club</Link>
                  </div>
                ) : (
                  <div className="table-container">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Proposed Club</th>
                          <th>Category</th>
                          <th>Submitted Date</th>
                          <th>Review Status</th>
                          <th>Admin Notes</th>
                        </tr>
                      </thead>
                      <tbody>
                        {clubRequests.map((req) => (
                          <tr key={req.id}>
                            <td style={{ fontWeight: 600 }}>{req.name}</td>
                            <td>{req.category}</td>
                            <td>{new Date(req.created_at).toLocaleDateString()}</td>
                            <td>
                              <span className={`badge ${req.status === 'approved' ? 'badge-success' : req.status === 'rejected' ? 'badge-danger' : 'badge-warning'}`}>
                                {req.status}
                              </span>
                            </td>
                            <td style={{ color: '#64748B', fontSize: '0.85rem' }}>{req.review_note || 'Pending administrator review'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
