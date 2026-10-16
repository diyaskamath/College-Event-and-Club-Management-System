import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import {
  Calendar,
  Clock,
  MapPin,
  Building,
  Users,
  CheckCircle,
  AlertCircle,
  Bookmark,
  Share2,
  ArrowLeft,
  Sparkles,
  UserCheck,
  Send,
  FileText,
  Star,
} from 'lucide-react';

export default function EventDetailPage() {
  const { idOrSlug } = useParams();
  const { user, isAuthenticated, isStudent, isCoordinator, isAdmin } = useAuth();
  const { showToast } = useNotification();

  const [event, setEvent] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  // Modals for Staff (Registrations, Attendance, Report)
  const [regModalOpen, setRegModalOpen] = useState(false);
  const [registrations, setRegistrations] = useState([]);
  const [loadingRegs, setLoadingRegs] = useState(false);

  const [attendanceModalOpen, setAttendanceModalOpen] = useState(false);
  const [attendanceList, setAttendanceList] = useState([]);

  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState('');

  const loadEvent = useCallback(async () => {
    try {
      const data = await api.get(`/events/${idOrSlug}`);
      setEvent(data.event);
      setAnnouncements(data.announcements || []);
      setSaved(!!data.event?.user_saved);
    } catch (err) {
      showToast(err.message || 'Failed to load event details', 'error');
    } finally {
      setLoading(false);
    }
  }, [idOrSlug, showToast]);

  useEffect(() => {
    loadEvent();
  }, [loadEvent]);

  const handleRegister = async () => {
    if (!isAuthenticated) {
      showToast('Please sign in with your student account to register', 'info');
      return;
    }
    setActionLoading(true);
    try {
      const res = await api.post(`/events/${event.id}/register`);
      showToast(res.message || 'Successfully registered for this event!', 'success');
      loadEvent();
    } catch (err) {
      showToast(err.message || 'Registration failed', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelRegistration = async () => {
    if (!window.confirm('Are you sure you want to cancel your registration?')) return;
    setActionLoading(true);
    try {
      await api.delete(`/events/${event.id}/register`);
      showToast('Registration cancelled', 'info');
      loadEvent();
    } catch (err) {
      showToast(err.message || 'Failed to cancel registration', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleSave = async () => {
    if (!isAuthenticated) {
      showToast('Please sign in to save events', 'info');
      return;
    }
    try {
      if (saved) {
        await api.delete(`/events/${event.id}/save`);
        setSaved(false);
        showToast('Removed from saved events', 'info');
      } else {
        await api.post(`/events/${event.id}/save`);
        setSaved(true);
        showToast('Saved to your bookmarks', 'success');
      }
    } catch (err) {
      showToast(err.message || 'Action failed', 'error');
    }
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/events/${event.id}/feedback`, {
        rating: feedbackRating,
        comment: feedbackComment,
      });
      showToast('Thank you for submitting event feedback!', 'success');
      setFeedbackModalOpen(false);
      setFeedbackComment('');
    } catch (err) {
      showToast(err.message || 'Failed to submit feedback', 'error');
    }
  };

  const openRegistrationsModal = async () => {
    setRegModalOpen(true);
    setLoadingRegs(true);
    try {
      const data = await api.get(`/events/${event.id}/registrations`);
      setRegistrations(data.registrations || []);
    } catch (err) {
      showToast(err.message || 'Failed to load registrations', 'error');
    } finally {
      setLoadingRegs(false);
    }
  };

  const handleReviewReg = async (regId, status) => {
    try {
      await api.patch(`/events/${event.id}/registrations/${regId}`, { status });
      showToast(`Registration marked as ${status}`, 'success');
      setRegistrations((prev) =>
        prev.map((r) => (r.id === regId ? { ...r, status } : r))
      );
    } catch (err) {
      showToast(err.message || 'Failed to update registration status', 'error');
    }
  };

  if (loading) {
    return <div className="container" style={{ padding: '5rem 0', textAlign: 'center', color: '#94A3B8' }}>Loading event details...</div>;
  }

  if (!event) {
    return (
      <div className="container" style={{ padding: '5rem 0', textAlign: 'center' }}>
        <h2>Event not found</h2>
        <Link to="/events" className="btn btn-secondary" style={{ marginTop: '1rem' }}>
          Back to Events
        </Link>
      </div>
    );
  }

  const isFestival = event.kind === 'festival';
  const startsAt = event.starts_at ? new Date(event.starts_at) : null;
  const endsAt = event.ends_at ? new Date(event.ends_at) : null;
  const deadline = event.registration_deadline ? new Date(event.registration_deadline) : null;
  const isStaff = isAdmin || isCoordinator;
  const userRegStatus = event.user_registration_status;

  return (
    <div style={{ padding: '2rem 0 4rem' }}>
      <div className="container">
        {/* Breadcrumb */}
        <Link to="/events" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#64748B', fontSize: '0.875rem', fontWeight: 600, marginBottom: '1.5rem' }}>
          <ArrowLeft size={16} />
          <span>Back to All Events</span>
        </Link>

        {/* Demo Data Notice */}
        <div style={{ background: '#FEF3C7', border: '1px solid #FDE68A', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#92400E' }}>
          <AlertCircle size={18} style={{ flexShrink: 0 }} />
          <span>
            <strong>Demonstration Event:</strong> All dates, academic blocks, venues, and registration capacities shown below are sample placeholder details for project evaluation.
          </span>
        </div>

        {/* Main Event Header Card */}
        <div className="card" style={{ padding: '2.5rem', marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '2rem' }}>
            <div style={{ flex: 1, minWidth: '300px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                {isFestival ? (
                  <Badge variant="festival" icon={Sparkles}>Dedicated Festival</Badge>
                ) : (
                  <Badge variant="primary">{event.category || 'Regular Event'}</Badge>
                )}
                {event.event_type && (
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569', background: '#F1F5F9', padding: '0.2rem 0.55rem', borderRadius: '4px' }}>
                    {event.event_type}
                  </span>
                )}
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#15803D', background: '#DCFCE7', padding: '0.2rem 0.55rem', borderRadius: '4px', textTransform: 'capitalize' }}>
                  {event.status || 'Published'}
                </span>
              </div>

              <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', fontWeight: 700, color: '#0F172A', marginBottom: '1rem', lineHeight: 1.25 }}>
                {event.title}
              </h1>

              <p style={{ fontSize: '1.05rem', color: '#475569', lineHeight: 1.6, marginBottom: '2rem' }}>
                {event.description}
              </p>

              {/* Metadata Key Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', padding: '1.25rem', background: '#F8FAFC', borderRadius: 'var(--radius-md)', border: '1px solid #E2E8F0' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#64748B', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                    <Calendar size={15} color="var(--theme-primary)" />
                    <span>Event Date</span>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '0.925rem', color: '#1E293B' }}>
                    {startsAt ? startsAt.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) : 'TBD'}
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#64748B', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                    <Clock size={15} color="var(--theme-primary)" />
                    <span>Time Slot</span>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '0.925rem', color: '#1E293B' }}>
                    {startsAt ? startsAt.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : 'TBD'} &mdash; {endsAt ? endsAt.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : 'TBD'}
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#64748B', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                    <Building size={15} color="#D97706" />
                    <span>Academic Block / Building</span>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '0.925rem', color: '#1E293B' }}>
                    {event.academic_block || 'Academic block placeholder'}
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#64748B', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                    <MapPin size={15} color="#D97706" />
                    <span>Venue Location</span>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '0.925rem', color: '#1E293B' }}>
                    {event.venue || 'Venue placeholder'}
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#64748B', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                    <Users size={15} color="var(--theme-primary)" />
                    <span>Capacity / Registrations</span>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '0.925rem', color: '#1E293B' }}>
                    {event.registered_count || 0} / {event.capacity || 'Open'} registered
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#64748B', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                    <Clock size={15} color="#DC2626" />
                    <span>Registration Deadline</span>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '0.925rem', color: '#DC2626' }}>
                    {deadline ? deadline.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Open'}
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar Action Box */}
            <div style={{ width: '280px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="card" style={{ padding: '1.5rem', background: '#F8FAFC' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem' }}>Organized By</h3>
                <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--theme-primary)', marginBottom: '0.5rem' }}>
                  {event.club_name ? (
                    <Link to={`/clubs/${event.club_id}`} style={{ color: 'inherit', textDecoration: 'underline' }}>
                      {event.club_name}
                    </Link>
                  ) : (
                    event.organizer_name || 'Campus Cultural Committee'
                  )}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#64748B' }}>
                  Campus: <strong>{event.campus_name || 'Coimbatore'}</strong>
                </div>

                <div style={{ borderTop: '1px solid #E2E8F0', marginTop: '1rem', paddingTop: '1rem' }}>
                  {/* Student Registration Flow */}
                  {userRegStatus ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#15803D', fontWeight: 700, fontSize: '0.9rem', background: '#DCFCE7', padding: '0.5rem', borderRadius: 'var(--radius-md)', justifyContent: 'center' }}>
                        <CheckCircle size={16} />
                        <span>Status: {userRegStatus}</span>
                      </div>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={handleCancelRegistration}
                        disabled={actionLoading}
                        style={{ color: '#EF4444' }}
                      >
                        Cancel Registration
                      </button>
                    </div>
                  ) : (
                    <button
                      className="btn btn-primary"
                      style={{ width: '100%' }}
                      onClick={handleRegister}
                      disabled={actionLoading}
                    >
                      <UserCheck size={18} />
                      <span>Register for Event</span>
                    </button>
                  )}

                  <button
                    className="btn btn-secondary btn-sm"
                    style={{ width: '100%', marginTop: '0.5rem' }}
                    onClick={handleToggleSave}
                  >
                    <Bookmark size={15} fill={saved ? 'currentColor' : 'none'} />
                    <span>{saved ? 'Saved in Bookmarks' : 'Save Event'}</span>
                  </button>

                  {userRegStatus === 'attended' || userRegStatus === 'approved' ? (
                    <button
                      className="btn btn-outline btn-sm"
                      style={{ width: '100%', marginTop: '0.5rem' }}
                      onClick={() => setFeedbackModalOpen(true)}
                    >
                      <Star size={15} />
                      <span>Submit Feedback</span>
                    </button>
                  ) : null}
                </div>
              </div>

              {/* Staff controls */}
              {isStaff && (
                <div className="card" style={{ padding: '1.25rem' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.75rem', color: '#334155' }}>
                    Coordinator Tools
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <button className="btn btn-secondary btn-sm" onClick={openRegistrationsModal}>
                      <Users size={14} />
                      <span>Review Registrations</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Event Announcements Section */}
        {announcements.length > 0 && (
          <div style={{ marginTop: '2rem' }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '1rem' }}>Event Announcements</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {announcements.map((a) => (
                <div key={a.id} className="card" style={{ padding: '1.25rem' }}>
                  <div style={{ fontWeight: 700, fontSize: '1rem', color: '#0F172A', marginBottom: '0.25rem' }}>
                    {a.title}
                  </div>
                  <p style={{ fontSize: '0.875rem', color: '#475569', lineHeight: 1.5 }}>{a.body}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Staff Review Registrations Modal */}
      <Modal
        isOpen={regModalOpen}
        onClose={() => setRegModalOpen(false)}
        title={`Registrations for ${event.title}`}
        maxWidth="750px"
      >
        {loadingRegs ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#94A3B8' }}>Loading registrations...</div>
        ) : registrations.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#94A3B8' }}>No registrations yet.</div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Amrita Email</th>
                  <th>Status</th>
                  <th>Registered At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {registrations.map((r) => (
                  <tr key={r.id}>
                    <td style={{ fontWeight: 600 }}>{r.user_name}</td>
                    <td>{r.user_email}</td>
                    <td>
                      <span className={`badge ${r.status === 'approved' ? 'badge-success' : r.status === 'rejected' ? 'badge-danger' : 'badge-warning'}`}>
                        {r.status}
                      </span>
                    </td>
                    <td style={{ color: '#64748B', fontSize: '0.8rem' }}>{new Date(r.created_at).toLocaleDateString()}</td>
                    <td>
                      {r.status === 'pending' && (
                        <div style={{ display: 'flex', gap: '0.35rem' }}>
                          <button
                            className="btn btn-primary btn-sm"
                            style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
                            onClick={() => handleReviewReg(r.id, 'approved')}
                          >
                            Approve
                          </button>
                          <button
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem', color: '#EF4444' }}
                            onClick={() => handleReviewReg(r.id, 'rejected')}
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Modal>

      {/* Student Feedback Modal */}
      <Modal
        isOpen={feedbackModalOpen}
        onClose={() => setFeedbackModalOpen(false)}
        title="Submit Event Feedback"
      >
        <form onSubmit={handleFeedbackSubmit}>
          <div className="form-group">
            <label className="form-label">Rating (1 to 5 Stars)</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setFeedbackRating(star)}
                  style={{ color: star <= feedbackRating ? '#F59E0B' : '#CBD5E1', padding: '0.25rem' }}
                >
                  <Star size={24} fill={star <= feedbackRating ? 'currentColor' : 'none'} />
                </button>
              ))}
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Comments & Experience</label>
            <textarea
              required
              rows={3}
              className="form-textarea"
              value={feedbackComment}
              onChange={(e) => setFeedbackComment(e.target.value)}
              placeholder="What did you learn or enjoy most about this session?"
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setFeedbackModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Submit Feedback
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
