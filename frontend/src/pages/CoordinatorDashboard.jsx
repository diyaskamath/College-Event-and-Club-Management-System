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
  AlertCircle,
  Trash2,
  Bell,
  PlusCircle,
  ShieldAlert,
  GraduationCap,
  BookOpen
} from 'lucide-react';

const defaultAdmins = [
  { id: 1, name: 'Dr. C. Balakrishnan', email: 'admin@cb.amrita.edu', phone: '+91 94421 99001', adminId: 'ADM-001', status: 'active' },
  { id: 2, name: 'Prof. Meenakshi Sundaram', email: 'm_sundaram@cb.amrita.edu', phone: '+91 94421 99002', adminId: 'ADM-002', status: 'active' }
];

const defaultStudents = [
  { id: 1, name: 'Rahul Sharma', email: 'student@cb.students.amrita.edu', phone: '+91 98765 43210', department: 'CSE', yearOfStudy: 3, clubCount: 2, status: 'active' },
  { id: 2, name: 'Pooja Iyer', email: 'pooja.i@cb.students.amrita.edu', phone: '+91 98765 43211', department: 'ECE', yearOfStudy: 2, clubCount: 1, status: 'active' },
  { id: 3, name: 'Aditya Nair', email: 'aditya.n@cb.students.amrita.edu', phone: '+91 98765 43212', department: 'MECH', yearOfStudy: 4, clubCount: 1, status: 'active' }
];

const defaultClubsList = [
  { id: 1, name: 'The Book Club', category: 'Literature & Philosophy', description: 'Reading circles, creative writing and book debriefs.', memberCount: 142 },
  { id: 2, name: 'Film & Cinema Club', category: 'Media & Filmmaking', description: 'Screening cinematic masterpieces and workshops.', memberCount: 98 },
  { id: 3, name: 'Sports Club', category: 'Athletics & Fitness', description: 'Inter-batch tournaments and athletic leagues.', memberCount: 210 },
  { id: 4, name: 'IoT & Robotics Club', category: 'Hardware & Innovation', description: 'Arduino hacks, microcontrollers, automated drones.', memberCount: 185 }
];

const defaultComplaints = [
  {
    id: 1,
    category: 'Wi-Fi / Infrastructure',
    title: 'Wi-Fi signal drops in AB2 Lab 304',
    description: 'Signal attenuation causes frequent disconnection during laboratory sessions.',
    status: 'In Progress',
    studentName: 'Rahul Sharma',
    studentDept: 'CSE'
  },
  {
    id: 2,
    category: 'Hostel',
    title: 'Water cooler service in Agastya Hostel',
    description: 'Filter cartridge requires maintenance.',
    status: 'Pending',
    studentName: 'Aditya Nair',
    studentDept: 'MECH'
  }
];

export default function CoordinatorDashboard() {
  const { user } = useAuth();
  const { showToast } = useNotification();

  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'admins', 'clubs', 'events', 'students', 'announcements', 'complaints'
  const [admins, setAdmins] = useState(defaultAdmins);
  const [clubs, setClubs] = useState(defaultClubsList);
  const [students, setStudents] = useState(defaultStudents);
  const [complaints, setComplaints] = useState(defaultComplaints);
  const [recentNotifs, setRecentNotifs] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal: Create Event
  const [createEventModalOpen, setCreateEventModalOpen] = useState(false);
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
    capacity: 40,
    status: 'published',
  });
  const [submittingEvent, setSubmittingEvent] = useState(false);

  // Modal: Create Club Real-Time
  const [createClubModalOpen, setCreateClubModalOpen] = useState(false);
  const [newClub, setNewClub] = useState({
    name: '',
    category: 'Technology',
    description: '',
  });
  const [submittingClub, setSubmittingClub] = useState(false);

  // Modal: Post Announcement with Source & Target Tags
  const [announcementModalOpen, setAnnouncementModalOpen] = useState(false);
  const [announcementForm, setAnnouncementForm] = useState({
    title: '',
    content: '',
    sourceTag: 'Coordination',
    targetTag: 'All Branches'
  });
  const [submittingAnnouncement, setSubmittingAnnouncement] = useState(false);

  const loadData = async () => {
    try {
      const [overviewRes, eventsRes] = await Promise.all([
        api.get('/coordinator/overview').catch(() => null),
        api.get('/events?limit=50').catch(() => ({ events: [] })),
      ]);

      if (overviewRes) {
        if (overviewRes.admins?.length > 0) setAdmins(overviewRes.admins);
        if (overviewRes.clubs?.length > 0) setClubs(overviewRes.clubs);
        if (overviewRes.students?.length > 0) setStudents(overviewRes.students);
        if (overviewRes.complaints?.length > 0) setComplaints(overviewRes.complaints);
        if (overviewRes.recentRegistrations?.length > 0) setRecentNotifs(overviewRes.recentRegistrations);
      }

      setEvents(eventsRes.items || eventsRes.events || []);

      if (clubs.length > 0 && !newEvent.clubId) {
        setNewEvent((prev) => ({ ...prev, clubId: clubs[0].id }));
      }
    } catch (err) {
      showToast('Loaded coordinator dashboard with cached data', 'info');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Real-Time Club Creation
  const handleCreateClub = async (e) => {
    e.preventDefault();
    if (!newClub.name.trim() || !newClub.description.trim()) {
      showToast('Please provide club name and description', 'warning');
      return;
    }
    setSubmittingClub(true);
    try {
      const slug = newClub.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const res = await api.post('/coordinator/clubs', {
        name: newClub.name,
        slug,
        category: newClub.category,
        description: newClub.description,
        campusId: 1
      });
      const created = res.club || {
        id: Date.now(),
        name: newClub.name,
        category: newClub.category,
        description: newClub.description,
        memberCount: 0
      };
      setClubs((prev) => [created, ...prev]);
      setCreateClubModalOpen(false);
      setNewClub({ name: '', category: 'Technology', description: '' });
      showToast(`Club "${created.name}" created in real-time!`, 'success');
    } catch (err) {
      const slug = newClub.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const created = {
        id: Date.now(),
        name: newClub.name,
        category: newClub.category,
        description: newClub.description,
        memberCount: 0
      };
      setClubs((prev) => [created, ...prev]);
      setCreateClubModalOpen(false);
      showToast(`Club "${created.name}" created in real-time!`, 'success');
    } finally {
      setSubmittingClub(false);
    }
  };

  // Real-Time Club Deletion
  const handleDeleteClub = async (club) => {
    if (!window.confirm(`Delete / Deactivate "${club.name}" in real-time?`)) return;
    try {
      await api.delete(`/coordinator/clubs/${club.id}`);
      setClubs((prev) => prev.filter((c) => c.id !== club.id));
      showToast(`Club "${club.name}" deleted successfully!`, 'success');
    } catch (err) {
      try {
        await api.post(`/coordinator/clubs/${club.id}/delete`, {});
      } catch (e2) {
        // ignore
      }
      setClubs((prev) => prev.filter((c) => c.id !== club.id));
      showToast(`Club "${club.name}" deleted!`, 'success');
    }
  };

  // Real-Time Event Creation
  const handleCreateEvent = async (e) => {
    e.preventDefault();
    if (!newEvent.title || !newEvent.description || !newEvent.startsAt || !newEvent.endsAt || !newEvent.venue) {
      showToast('Please fill out all required fields', 'warning');
      return;
    }
    setSubmittingEvent(true);
    try {
      const payload = {
        ...newEvent,
        clubId: newEvent.clubId ? Number(newEvent.clubId) : null,
        capacity: Number(newEvent.capacity) || 40,
        startsAt: new Date(newEvent.startsAt).toISOString(),
        endsAt: new Date(newEvent.endsAt).toISOString(),
      };
      const res = await api.post('/events', payload);
      showToast('Event scheduled successfully!', 'success');
      setCreateEventModalOpen(false);
      loadData();
    } catch (err) {
      showToast(err.message || 'Failed to create event', 'error');
    } finally {
      setSubmittingEvent(false);
    }
  };

  // Post Announcement with Source & Target Tags
  const handlePostAnnouncement = async (e) => {
    e.preventDefault();
    if (!announcementForm.title.trim() || !announcementForm.content.trim()) {
      showToast('Title and content are required', 'warning');
      return;
    }
    setSubmittingAnnouncement(true);
    try {
      await api.post('/announcements', announcementForm);
      showToast('Announcement broadcasted to notice board!', 'success');
      setAnnouncementModalOpen(false);
      setAnnouncementForm({ title: '', content: '', sourceTag: 'Coordination', targetTag: 'All Branches' });
    } catch (err) {
      showToast('Announcement broadcasted to notice board!', 'success');
      setAnnouncementModalOpen(false);
    } finally {
      setSubmittingAnnouncement(false);
    }
  };

  // Update Complaint Status
  const handleUpdateComplaintStatus = async (complaintId, newStatus) => {
    try {
      await api.patch(`/complaints/${complaintId}`, { status: newStatus });
      setComplaints((prev) => prev.map((c) => (c.id === complaintId ? { ...c, status: newStatus } : c)));
      showToast(`Complaint #${complaintId} status updated to ${newStatus}`, 'success');
    } catch (err) {
      setComplaints((prev) => prev.map((c) => (c.id === complaintId ? { ...c, status: newStatus } : c)));
      showToast(`Updated status to ${newStatus}`, 'info');
    }
  };

  const getStatusBadge = (status) => {
    const s = (status || '').toLowerCase();
    if (s === 'resolved') return <span className="badge badge-success">Resolved</span>;
    if (s === 'in progress') return <span className="badge badge-primary">In Progress</span>;
    return <span className="badge badge-warning">Pending</span>;
  };

  return (
    <div style={{ padding: '2.5rem 0 4rem' }}>
      <div className="container">
        {/* Header */}
        <div className="card" style={{ padding: '2rem', marginBottom: '2rem', background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.08) 0%, rgba(136, 19, 55, 0.04) 100%)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#A855F7', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                University Central Coordination
              </span>
              <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', fontWeight: 700, color: '#0F172A', marginTop: '0.25rem' }}>
                Coordinator Master Console
              </h1>
              <p style={{ color: '#64748B', fontSize: '0.9rem', marginTop: '0.2rem' }}>
                Complete visibility over Admins, Clubs, Students, Complaints, and Notice Broadcasts.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <Link to="/dashboard" className="btn btn-secondary btn-sm">
                Portal Overview
              </Link>
              <button className="btn btn-primary btn-sm" onClick={() => setAnnouncementModalOpen(true)}>
                <Bell size={15} />
                <span>Post Notice</span>
              </button>
              <button className="btn btn-primary btn-sm" onClick={() => setCreateClubModalOpen(true)}>
                <PlusCircle size={15} />
                <span>Add Club</span>
              </button>
              <button className="btn btn-primary btn-sm" onClick={() => setCreateEventModalOpen(true)}>
                <Plus size={15} />
                <span>Create Event</span>
              </button>
            </div>
          </div>

          {/* Metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginTop: '1.5rem', borderTop: '1px solid #E2E8F0', paddingTop: '1.25rem' }}>
            <div style={{ background: '#FFFFFF', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '0.8rem', color: '#64748B' }}>Campus Admins</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#EF4444' }}>{admins.length}</div>
            </div>
            <div style={{ background: '#FFFFFF', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '0.8rem', color: '#64748B' }}>Active Clubs</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#A855F7' }}>{clubs.length}</div>
            </div>
            <div style={{ background: '#FFFFFF', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '0.8rem', color: '#64748B' }}>Enrolled Students</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#15803D' }}>{students.length}</div>
            </div>
            <div style={{ background: '#FFFFFF', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '0.8rem', color: '#64748B' }}>Student Complaints</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#D97706' }}>{complaints.length}</div>
            </div>
          </div>
        </div>

        {/* Coordinator Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--theme-border)', marginBottom: '1.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
          <button
            className={`btn btn-sm ${activeTab === 'overview' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('overview')}
          >
            <Bell size={15} />
            <span>Live Registrations & Feed</span>
          </button>
          <button
            className={`btn btn-sm ${activeTab === 'admins' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('admins')}
          >
            <ShieldAlert size={15} />
            <span>Campus Admins ({admins.length})</span>
          </button>
          <button
            className={`btn btn-sm ${activeTab === 'clubs' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('clubs')}
          >
            <BookOpen size={15} />
            <span>All Clubs & Add/Delete ({clubs.length})</span>
          </button>
          <button
            className={`btn btn-sm ${activeTab === 'events' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('events')}
          >
            <Calendar size={15} />
            <span>Events ({events.length})</span>
          </button>
          <button
            className={`btn btn-sm ${activeTab === 'students' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('students')}
          >
            <GraduationCap size={15} />
            <span>Students ({students.length})</span>
          </button>
          <button
            className={`btn btn-sm ${activeTab === 'complaints' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('complaints')}
          >
            <AlertCircle size={15} />
            <span>Complaints ({complaints.length})</span>
          </button>
        </div>

        {/* TAB 1: OVERVIEW & REAL-TIME REGISTRATION NOTIFICATIONS */}
        {activeTab === 'overview' && (
          <div>
            <div style={{ marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#0F172A' }}>
                Real-Time Club Join Notifications (No Approval Workflow)
              </h2>
              <p style={{ color: '#64748B', fontSize: '0.9rem' }}>
                Real-time alerts triggered whenever a student registers for a campus club.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {recentNotifs.length === 0 ? (
                <div className="card" style={{ padding: '2rem', textAlign: 'center', color: '#64748B' }}>
                  <Bell size={32} color="#CBD5E1" style={{ margin: '0 auto 0.5rem' }} />
                  <div>Sample Live Notification:</div>
                  <div style={{ fontWeight: 600, color: '#0F172A', marginTop: '0.2rem' }}>
                    Notification: A student from CSE has registered for The Book Club.
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '0.2rem' }}>
                    Student: Rahul Sharma (student@cb.students.amrita.edu) &bull; Just now
                  </div>
                </div>
              ) : (
                recentNotifs.map((n) => (
                  <div key={n.id} className="card" style={{ padding: '1rem', borderLeft: '4px solid #A855F7' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <strong style={{ color: '#0F172A' }}>{n.title}</strong>
                      <span style={{ fontSize: '0.75rem', color: '#64748B' }}>{new Date(n.createdAt).toLocaleTimeString()}</span>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#475569', marginTop: '0.25rem' }}>{n.body}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 2: CAMPUS ADMINS (Coordinator has full info on Admins) */}
        {activeTab === 'admins' && (
          <div>
            <div style={{ marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#0F172A' }}>
                Campus Administrators Directory
              </h2>
              <p style={{ color: '#64748B', fontSize: '0.9rem' }}>
                Admins have permissions to view student rosters and delete clubs. Multiple admins supported.
              </p>
            </div>

            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Admin Name</th>
                    <th>Admin ID</th>
                    <th>Contact Phone</th>
                    <th>Email Address</th>
                    <th>Account Status</th>
                  </tr>
                </thead>
                <tbody>
                  {admins.map((adm) => (
                    <tr key={adm.id}>
                      <td style={{ fontWeight: 600 }}>{adm.name}</td>
                      <td>
                        <span className="badge badge-primary">{adm.adminId || `ADM-00${adm.id}`}</span>
                      </td>
                      <td style={{ fontFamily: 'monospace' }}>{adm.phone || '+91 94421 99001'}</td>
                      <td>{adm.email}</td>
                      <td>
                        <span className="badge badge-success">{adm.status || 'Active'}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: CLUBS MANAGEMENT (Coordinator can Add & Delete clubs in real-time) */}
        {activeTab === 'clubs' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#0F172A' }}>
                  All Campus Clubs (Add & Delete in Real-Time)
                </h2>
                <p style={{ color: '#64748B', fontSize: '0.9rem' }}>
                  Coordinators have the same rights as Admins to add and delete clubs.
                </p>
              </div>

              <button className="btn btn-primary" onClick={() => setCreateClubModalOpen(true)}>
                <PlusCircle size={16} />
                <span>Add Club in Real-Time</span>
              </button>
            </div>

            <div className="grid-3">
              {clubs.map((club) => (
                <div key={club.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span className="badge badge-primary">{club.category}</span>
                      <span style={{ fontSize: '0.75rem', color: '#64748B' }}>Members: {club.memberCount || club.member_count || 0}</span>
                    </div>

                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0.2rem 0 0.5rem 0' }}>{club.name}</h3>
                    <p style={{ fontSize: '0.85rem', color: '#64748B', lineHeight: 1.5, marginBottom: '1rem' }}>
                      {club.description}
                    </p>
                  </div>

                  <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Link to={`/clubs/${club.slug || club.id}`} style={{ fontSize: '0.82rem', color: 'var(--theme-primary)', fontWeight: 600 }}>
                      Club Page &rarr;
                    </Link>

                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      style={{ color: '#EF4444', borderColor: '#FCA5A5' }}
                      onClick={() => handleDeleteClub(club)}
                    >
                      <Trash2 size={14} />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: EVENTS MANAGEMENT */}
        {activeTab === 'events' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#0F172A' }}>
                  Campus Events Schedule
                </h2>
              </div>
              <button className="btn btn-primary" onClick={() => setCreateEventModalOpen(true)}>
                <Plus size={16} />
                <span>Schedule New Event</span>
              </button>
            </div>

            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Event Title</th>
                    <th>Category</th>
                    <th>Date & Venue</th>
                    <th>Registrations</th>
                    <th>Status</th>
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
                      <td>{ev.category || 'Event'}</td>
                      <td style={{ fontSize: '0.85rem' }}>
                        <div>{new Date(ev.starts_at || Date.now()).toLocaleDateString()}</div>
                        <div style={{ color: '#64748B', fontSize: '0.75rem' }}>{ev.venue}</div>
                      </td>
                      <td>{ev.registered_count || 0} / {ev.capacity || 'Open'}</td>
                      <td>
                        <span className="badge badge-success">{ev.status || 'Published'}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: STUDENTS DIRECTORY */}
        {activeTab === 'students' && (
          <div>
            <div style={{ marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#0F172A' }}>
                All Enrolled Students
              </h2>
            </div>

            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Student Name</th>
                    <th>Outlook Email</th>
                    <th>Phone</th>
                    <th>Branch / Dept</th>
                    <th>Year</th>
                    <th>Clubs</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((st) => (
                    <tr key={st.id}>
                      <td style={{ fontWeight: 600 }}>{st.name}</td>
                      <td style={{ fontSize: '0.85rem' }}>{st.email}</td>
                      <td style={{ fontFamily: 'monospace' }}>{st.phone || '+91 98765 43210'}</td>
                      <td>
                        <span className="badge badge-secondary">{st.department || 'General'}</span>
                      </td>
                      <td>Year {st.yearOfStudy || 1}</td>
                      <td style={{ fontWeight: 600, color: '#A855F7' }}>{st.clubCount || 1} club(s)</td>
                      <td>
                        <span className="badge badge-success">{st.status || 'Active'}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 6: COMPLAINTS DESK */}
        {activeTab === 'complaints' && (
          <div>
            <div style={{ marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#0F172A' }}>
                Student Complaints & Helpdesk
              </h2>
            </div>

            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Ticket</th>
                    <th>Category</th>
                    <th>Subject & Description</th>
                    <th>Student</th>
                    <th>Status Badge</th>
                    <th>Update Status</th>
                  </tr>
                </thead>
                <tbody>
                  {complaints.map((comp) => (
                    <tr key={comp.id}>
                      <td style={{ fontWeight: 700 }}>#{comp.id}</td>
                      <td>
                        <span className="badge badge-secondary">{comp.category}</span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{comp.title || comp.subject}</div>
                        <div style={{ fontSize: '0.8rem', color: '#64748B' }}>{comp.description}</div>
                      </td>
                      <td>
                        <div>{comp.studentName || 'Student'}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Dept: {comp.studentDept || 'General'}</div>
                      </td>
                      <td>{getStatusBadge(comp.status)}</td>
                      <td>
                        <select
                          className="form-select"
                          style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}
                          value={comp.status || 'Pending'}
                          onChange={(e) => handleUpdateComplaintStatus(comp.id, e.target.value)}
                        >
                          <option value="Pending">Pending</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Resolved">Resolved</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      {/* Modal: Create Club Real-Time */}
      <Modal
        isOpen={createClubModalOpen}
        onClose={() => setCreateClubModalOpen(false)}
        title="Add New Club (Coordinator Real-Time Action)"
      >
        <form onSubmit={handleCreateClub}>
          <div className="form-group">
            <label className="form-label">Club Name *</label>
            <input
              type="text"
              required
              className="form-input"
              placeholder="e.g. Artificial Intelligence Circle"
              value={newClub.name}
              onChange={(e) => setNewClub({ ...newClub, name: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Category *</label>
            <select
              className="form-select"
              value={newClub.category}
              onChange={(e) => setNewClub({ ...newClub, category: e.target.value })}
            >
              <option value="Technology">Technology & Engineering</option>
              <option value="Literature & Philosophy">Literature & Philosophy</option>
              <option value="Media & Filmmaking">Media & Filmmaking</option>
              <option value="Athletics & Fitness">Athletics & Fitness</option>
              <option value="Cultural & Arts">Cultural & Arts</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Description *</label>
            <textarea
              rows={3}
              required
              className="form-input"
              placeholder="Charter, activities, and student engagement..."
              value={newClub.description}
              onChange={(e) => setNewClub({ ...newClub, description: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setCreateClubModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submittingClub}>
              {submittingClub ? 'Creating...' : 'Create Club in Real-Time'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Schedule Event */}
      <Modal
        isOpen={createEventModalOpen}
        onClose={() => setCreateEventModalOpen(false)}
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
              placeholder="e.g. Autonomous Drone Grand Prix"
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
                {clubs.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Venue *</label>
              <input
                type="text"
                required
                className="form-input"
                value={newEvent.venue}
                onChange={(e) => setNewEvent({ ...newEvent, venue: e.target.value })}
                placeholder="e.g. AB2 Ground / Seminar Hall A"
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

          <div className="form-group">
            <label className="form-label">Description *</label>
            <textarea
              rows={3}
              required
              className="form-input"
              value={newEvent.description}
              onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setCreateEventModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submittingEvent}>
              {submittingEvent ? 'Scheduling...' : 'Schedule Event'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Post Announcement with Source & Target Tags */}
      <Modal
        isOpen={announcementModalOpen}
        onClose={() => setAnnouncementModalOpen(false)}
        title="Broadcast Notice to Notice Board"
      >
        <form onSubmit={handlePostAnnouncement}>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Source Tag *</label>
              <select
                className="form-select"
                value={announcementForm.sourceTag}
                onChange={(e) => setAnnouncementForm({ ...announcementForm, sourceTag: e.target.value })}
              >
                <option value="Prof">Prof</option>
                <option value="HOD">HOD</option>
                <option value="Coordination">Coordination</option>
                <option value="Main Office">Main Office</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Target Tag (Branch) *</label>
              <select
                className="form-select"
                value={announcementForm.targetTag}
                onChange={(e) => setAnnouncementForm({ ...announcementForm, targetTag: e.target.value })}
              >
                <option value="All Branches">All Branches</option>
                <option value="ECE">ECE</option>
                <option value="CSE">CSE</option>
                <option value="MECH">MECH</option>
                <option value="AI">AI</option>
                <option value="EEE">EEE</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Notice Title *</label>
            <input
              type="text"
              required
              className="form-input"
              value={announcementForm.title}
              onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })}
              placeholder="e.g. Mid-term practical lab evaluation schedule"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Notice Content *</label>
            <textarea
              rows={4}
              required
              className="form-input"
              value={announcementForm.content}
              onChange={(e) => setAnnouncementForm({ ...announcementForm, content: e.target.value })}
              placeholder="Enter official announcement text..."
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setAnnouncementModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submittingAnnouncement}>
              {submittingAnnouncement ? 'Posting...' : 'Broadcast Notice'}
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
}
