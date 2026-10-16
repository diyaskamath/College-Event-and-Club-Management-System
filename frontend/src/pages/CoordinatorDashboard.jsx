import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import {
  ShieldCheck,
  Calendar,
  Users,
  Plus,
  Send,
  CheckCircle,
  Clock,
  Edit,
  ArrowRight,
  ClipboardList,
} from 'lucide-react';

export default function CoordinatorDashboard() {
  const { user } = useAuth();
  const { showToast } = useNotification();

  const [assignedClubs, setAssignedClubs] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal: Create Event
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    kind: 'regular',
    category: 'Technology',
    eventType: 'Workshop',
    clubId: '',
    academicBlock: 'Academic Block 1',
    venue: 'Seminar Hall A',
    startsAt: '',
    endsAt: '',
    registrationDeadline: '',
    capacity: 40,
    waitlistEnabled: true,
    requiresApproval: false,
    status: 'published',
  });
  const [submitting, setSubmitting] = useState(false);

  // Modal: Attendance
  const [attendanceModalOpen, setAttendanceModalOpen] = useState(false);
  const [currentEventForAttendance, setCurrentEventForAttendance] = useState(null);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [savingAttendance, setSavingAttendance] = useState(false);

  const loadData = async () => {
    try {
      const [clubsRes, eventsRes] = await Promise.all([
        api.get('/me/assigned-clubs'),
        api.get('/events?limit=50'),
      ]);
      setAssignedClubs(clubsRes.clubs || []);
      setEvents(eventsRes.events || []);
      if (clubsRes.clubs && clubsRes.clubs.length > 0 && !newEvent.clubId) {
        setNewEvent((prev) => ({ ...prev, clubId: clubsRes.clubs[0].id }));
      }
    } catch (err) {
      showToast('Failed to load coordinator data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    if (!newEvent.title || !newEvent.description || !newEvent.startsAt || !newEvent.endsAt || !newEvent.venue) {
      showToast('Please fill out all required fields', 'warning');
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        ...newEvent,
        clubId: newEvent.clubId ? Number(newEvent.clubId) : null,
        capacity: Number(newEvent.capacity) || 40,
        startsAt: new Date(newEvent.startsAt).toISOString(),
        endsAt: new Date(newEvent.endsAt).toISOString(),
        registrationDeadline: newEvent.registrationDeadline ? new Date(newEvent.registrationDeadline).toISOString() : null,
      };
      await api.post('/events', payload);
      showToast('Event created successfully!', 'success');
      setCreateModalOpen(false);
      loadData();
    } catch (err) {
      showToast(err.message || 'Failed to create event', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const openAttendanceModal = async (ev) => {
    setCurrentEventForAttendance(ev);
    setAttendanceModalOpen(true);
    try {
      const data = await api.get(`/events/${ev.id}/attendance`);
      setAttendanceRecords(data.attendance || []);
    } catch (err) {
      showToast(err.message || 'Failed to load attendance list', 'error');
    }
  };

  const toggleStudentAttendance = (regId) => {
    setAttendanceRecords((prev) =>
      prev.map((r) => (r.registration_id === regId ? { ...r, attended: !r.attended } : r))
    );
  };

  const handleSaveAttendance = async () => {
    if (!currentEventForAttendance) return;
    setSavingAttendance(true);
    try {
      const payload = {
        attendance: attendanceRecords.map((r) => ({
          registrationId: r.registration_id,
          attended: Boolean(r.attended),
        })),
      };
      await api.put(`/events/${currentEventForAttendance.id}/attendance`, payload);
      showToast('Attendance recorded successfully', 'success');
      setAttendanceModalOpen(false);
    } catch (err) {
      showToast(err.message || 'Failed to record attendance', 'error');
    } finally {
      setSavingAttendance(false);
    }
  };

  return (
    <div style={{ padding: '2.5rem 0 4rem' }}>
      <div className="container">
        {/* Header */}
        <div className="card" style={{ padding: '2rem', marginBottom: '2rem', background: 'linear-gradient(135deg, rgba(217, 119, 6, 0.08) 0%, rgba(136, 19, 55, 0.04) 100%)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#D97706', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Coordinator Portal
              </span>
              <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', fontWeight: 700, color: '#0F172A', marginTop: '0.25rem' }}>
                Club Operations Dashboard
              </h1>
              <p style={{ color: '#64748B', fontSize: '0.9rem', marginTop: '0.2rem' }}>
                Logged in as: <strong>{user?.name}</strong> ({user?.email})
              </p>
            </div>

            <button className="btn btn-primary" onClick={() => setCreateModalOpen(true)}>
              <Plus size={16} />
              <span>Create New Event</span>
            </button>
          </div>
        </div>

        {/* Assigned Clubs Section */}
        <div style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldCheck size={20} color="var(--theme-primary)" />
            <span>My Assigned Clubs ({assignedClubs.length})</span>
          </h2>

          {loading ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#94A3B8' }}>Loading assignments...</div>
          ) : assignedClubs.length === 0 ? (
            <div className="card" style={{ padding: '2rem', textAlign: 'center', color: '#64748B' }}>
              No clubs currently assigned to your account. Contact an administrator for assignment.
            </div>
          ) : (
            <div className="grid-3">
              {assignedClubs.map((club) => (
                <div key={club.id} className="card">
                  <Badge variant="primary">{club.category}</Badge>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0.75rem 0 0.5rem' }}>{club.name}</h3>
                  <div style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: '1rem' }}>
                    Members: <strong>{club.member_count || 0}</strong>
                  </div>
                  <Link to={`/clubs/${club.slug || club.id}`} className="btn btn-secondary btn-sm" style={{ width: '100%', justifyContent: 'space-between' }}>
                    <span>Manage Club & Members</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Manage Events Section */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Calendar size={20} color="var(--theme-primary)" />
              <span>Campus Events & Registrations</span>
            </h2>
          </div>

          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Event Title</th>
                  <th>Club / Organizer</th>
                  <th>Date & Venue</th>
                  <th>Registrations</th>
                  <th>Status</th>
                  <th>Coordinator Actions</th>
                </tr>
              </thead>
              <tbody>
                {events.map((ev) => (
                  <tr key={ev.id}>
                    <td style={{ fontWeight: 600 }}>
                      <Link to={`/events/${ev.slug || ev.id}`} style={{ color: 'var(--theme-primary)' }}>
                        {ev.title}
                      </Link>
                    </td>
                    <td>{ev.club_name || ev.organizer_name}</td>
                    <td style={{ fontSize: '0.85rem' }}>
                      <div>{new Date(ev.starts_at).toLocaleDateString()}</div>
                      <div style={{ color: '#64748B', fontSize: '0.75rem' }}>{ev.venue}</div>
                    </td>
                    <td>{ev.registered_count || 0} / {ev.capacity || 'Open'}</td>
                    <td>
                      <span className="badge badge-primary">{ev.status}</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <Link
                          to={`/events/${ev.slug || ev.id}`}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
                        >
                          Review Regs
                        </Link>
                        <button
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
                          onClick={() => openAttendanceModal(ev)}
                        >
                          Attendance
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Create Event Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Schedule New Campus Event"
        maxWidth="650px"
      >
        <form onSubmit={handleCreateEvent}>
          <div className="form-group">
            <label className="form-label">Event Title *</label>
            <input
              type="text"
              required
              className="form-input"
              value={newEvent.title}
              onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
              placeholder="e.g., Autonomous Robotics Showcase"
            />
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Organizing Club</label>
              <select
                className="form-select"
                value={newEvent.clubId}
                onChange={(e) => setNewEvent({ ...newEvent, clubId: e.target.value })}
              >
                {assignedClubs.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                className="form-select"
                value={newEvent.category}
                onChange={(e) => setNewEvent({ ...newEvent, category: e.target.value })}
              >
                <option value="Technology">Technology</option>
                <option value="Arts">Arts</option>
                <option value="Literature">Literature</option>
                <option value="Media & Film">Media & Film</option>
                <option value="Performing Arts">Performing Arts</option>
                <option value="Communication">Communication</option>
                <option value="Business">Business</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Description *</label>
            <textarea
              required
              rows={3}
              className="form-textarea"
              value={newEvent.description}
              onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
              placeholder="Provide a comprehensive description of the event..."
            />
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Academic Block</label>
              <input
                type="text"
                className="form-input"
                value={newEvent.academicBlock}
                onChange={(e) => setNewEvent({ ...newEvent, academicBlock: e.target.value })}
                placeholder="Academic Block 1"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Venue Location *</label>
              <input
                type="text"
                required
                className="form-input"
                value={newEvent.venue}
                onChange={(e) => setNewEvent({ ...newEvent, venue: e.target.value })}
                placeholder="Seminar Hall 2"
              />
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Starts At *</label>
              <input
                type="datetime-local"
                required
                className="form-input"
                value={newEvent.startsAt}
                onChange={(e) => setNewEvent({ ...newEvent, startsAt: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Ends At *</label>
              <input
                type="datetime-local"
                required
                className="form-input"
                value={newEvent.endsAt}
                onChange={(e) => setNewEvent({ ...newEvent, endsAt: e.target.value })}
              />
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Max Capacity</label>
              <input
                type="number"
                min={1}
                className="form-input"
                value={newEvent.capacity}
                onChange={(e) => setNewEvent({ ...newEvent, capacity: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Registration Deadline</label>
              <input
                type="datetime-local"
                className="form-input"
                value={newEvent.registrationDeadline}
                onChange={(e) => setNewEvent({ ...newEvent, registrationDeadline: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setCreateModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Creating Event...' : 'Publish Event'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Attendance Modal */}
      <Modal
        isOpen={attendanceModalOpen}
        onClose={() => setAttendanceModalOpen(false)}
        title={`Record Attendance: ${currentEventForAttendance?.title || ''}`}
        maxWidth="650px"
      >
        {attendanceRecords.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#94A3B8' }}>
            No registered attendees found for this event.
          </div>
        ) : (
          <div>
            <p style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: '1rem' }}>
              Check attendees who were present. Changes will be recorded in the student participation history.
            </p>
            <div className="table-container" style={{ maxHeight: '350px', overflowY: 'auto' }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Attended?</th>
                    <th>Student Name</th>
                    <th>Email</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceRecords.map((rec) => (
                    <tr key={rec.registration_id}>
                      <td>
                        <input
                          type="checkbox"
                          checked={Boolean(rec.attended)}
                          onChange={() => toggleStudentAttendance(rec.registration_id)}
                          style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                        />
                      </td>
                      <td style={{ fontWeight: 600 }}>{rec.user_name}</td>
                      <td>{rec.user_email}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
              <button className="btn btn-secondary" onClick={() => setAttendanceModalOpen(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleSaveAttendance} disabled={savingAttendance}>
                {savingAttendance ? 'Saving...' : 'Save Attendance Records'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
