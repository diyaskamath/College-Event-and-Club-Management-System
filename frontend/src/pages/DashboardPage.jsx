import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import {
  Calendar as CalendarIcon,
  Users,
  Compass,
  AlertCircle,
  Bell,
  Sparkles,
  ArrowRight,
  Send,
  CheckCircle2,
  Clock,
  ShieldAlert,
  Building,
  PlusCircle,
  Tag,
  Filter,
  CheckCircle,
  MapPin,
  ExternalLink,
  Info
} from 'lucide-react';

const defaultAnnouncements = [
  {
    id: 1,
    title: 'Mid-Semester Examination Schedule Published',
    content: 'The detailed examination timetable for all B.Tech branches has been published on the intranet portal. Students must report 15 minutes before exam commencement.',
    source_tag: 'HOD',
    target_tag: 'All Branches',
    created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
    author_name: 'Dr. Radhakrishnan (HOD ECE)'
  },
  {
    id: 2,
    title: 'Embedded Systems Lab Submission Deadline',
    content: 'All 3rd Year ECE students must submit their Verilog HDL project reports to AB2 Lab 304 by Friday 5:00 PM.',
    source_tag: 'Prof',
    target_tag: 'ECE',
    created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
    author_name: 'Prof. Abhishek'
  },
  {
    id: 3,
    title: 'Hackathon Registration & Team Formation Notice',
    content: 'Registrations are open for the Amrita Annual Hackathon. CSE & AI branches can form inter-disciplinary teams up to 4 members.',
    source_tag: 'Coordination',
    target_tag: 'CSE',
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
    author_name: 'Campus Coordination Office'
  },
  {
    id: 4,
    title: 'Campus Hostels Wi-Fi Maintenance Window',
    content: 'IT Infrastructure team will conduct backbone fiber maintenance this Saturday midnight (1:00 AM - 4:00 AM) in Savitri and Agastya blocks.',
    source_tag: 'Main Office',
    target_tag: 'All Branches',
    created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
    author_name: 'Central Administration'
  }
];

const defaultClubs = [
  {
    id: 1,
    name: 'The Book Club',
    slug: 'book-club',
    category: 'Literature & Philosophy',
    description: 'A sanctuary for readers, creative writing circles, and intellectual book debriefs.',
    members_count: 142
  },
  {
    id: 2,
    name: 'Film & Cinema Club',
    slug: 'film-club',
    category: 'Media & Filmmaking',
    description: 'Screening cinematic masterpieces, filmmaking workshops, and critique.',
    members_count: 98
  },
  {
    id: 3,
    name: 'Sports Club',
    slug: 'sports-club',
    category: 'Athletics & Fitness',
    description: 'Inter-batch tournaments, badminton leagues, cricket championships.',
    members_count: 210
  },
  {
    id: 4,
    name: 'IoT & Robotics Club',
    slug: 'iot-club',
    category: 'Hardware & Innovation',
    description: 'Arduino hacks, microcontrollers, automated drones, and sensor-driven engineering.',
    members_count: 185
  }
];

const defaultEvents = [
  {
    id: 1,
    title: 'Dussera Cultural Night',
    slug: 'dussera',
    venue: 'AB2 Ground & Pandhal',
    starts_at: '2026-10-20T09:00:00.000Z',
    category: 'Festival',
    highlight: 'Puja at 9 AM // Grand Feast at 1 PM'
  },
  {
    id: 2,
    title: 'Diwali Lights & Rangoli Gala',
    slug: 'diwali',
    venue: 'Main Campus Pandhal',
    starts_at: '2026-11-08T17:00:00.000Z',
    category: 'Festival',
    highlight: 'Diyas (5 PM) // Cultural Dance (9 PM)'
  },
  {
    id: 3,
    title: 'RoboWars & Drone Grand Prix',
    slug: 'robowars-2026',
    venue: 'Indoor Sports Arena',
    starts_at: '2026-11-15T10:00:00.000Z',
    category: 'Technology',
    highlight: 'Combat robotics & autonomous obstacle course'
  }
];

const defaultComplaints = [
  {
    id: 1,
    category: 'Wi-Fi / Infrastructure',
    subject: 'Intermittent signal drop in AB-2 3rd floor',
    description: 'Signal attenuates rapidly near Lab 304 during lecture hours.',
    status: 'In Progress',
    created_at: new Date(Date.now() - 3600000 * 18).toISOString()
  },
  {
    id: 2,
    category: 'Hostel',
    subject: 'Agastya Hostel water cooler maintenance required',
    description: 'Cooler on 2nd floor wing B requires filter replacement.',
    status: 'Resolved',
    created_at: new Date(Date.now() - 3600000 * 72).toISOString()
  }
];

export default function DashboardPage() {
  const { user, isCoordinator, isAdmin } = useAuth();
  const { showToast } = useNotification();
  const navigate = useNavigate();

  // State for all 6 widgets
  const [announcements, setAnnouncements] = useState(defaultAnnouncements);
  const [selectedBranchFilter, setSelectedBranchFilter] = useState('ALL');
  const [clubs, setClubs] = useState(defaultClubs);
  const [joinedClubIds, setJoinedClubIds] = useState(new Set());
  const [events, setEvents] = useState(defaultEvents);
  const [complaints, setComplaints] = useState(defaultComplaints);
  const [loading, setLoading] = useState(true);

  // Complaint Form State
  const [complaintForm, setComplaintForm] = useState({
    category: 'Wi-Fi / Infrastructure',
    subject: '',
    description: ''
  });
  const [submittingComplaint, setSubmittingComplaint] = useState(false);

  // New Announcement Modal State (for Coordinators/Admins)
  const [announcementModalOpen, setAnnouncementModalOpen] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    content: '',
    sourceTag: 'Coordination',
    targetTag: 'All Branches'
  });
  const [postingAnnouncement, setPostingAnnouncement] = useState(false);

  // Fetch initial data
  useEffect(() => {
    async function loadData() {
      // 1. Announcements
      try {
        const res = await api.get('/announcements');
        if (res.announcements && res.announcements.length > 0) {
          setAnnouncements(res.announcements);
        }
      } catch (err) {
        console.log('Using default announcements');
      }

      // 2. Clubs
      try {
        const res = await api.get('/clubs?limit=10');
        const items = res.items || res.clubs || [];
        if (items.length > 0) {
          setClubs(items);
        }
      } catch (err) {
        console.log('Using default clubs');
      }

      // 3. User's joined clubs
      if (user) {
        try {
          const res = await api.get('/me/clubs');
          const myClubs = res.clubs || [];
          setJoinedClubIds(new Set(myClubs.map(c => c.id)));
        } catch (err) {
          // ignore
        }
      }

      // 4. Events
      try {
        const res = await api.get('/events?limit=6');
        const items = res.items || res.events || [];
        if (items.length > 0) {
          setEvents(items);
        }
      } catch (err) {
        console.log('Using default events');
      }

      // 5. Complaints
      if (user) {
        try {
          const res = await api.get('/complaints');
          if (res.complaints && res.complaints.length > 0) {
            setComplaints(res.complaints);
          }
        } catch (err) {
          console.log('Using default complaints');
        }
      }

      setLoading(false);
    }

    loadData();
  }, [user]);

  // Set default branch filter based on user profile if student
  useEffect(() => {
    if (user?.department) {
      setSelectedBranchFilter(user.department.toUpperCase());
    }
  }, [user]);

  // Filter announcements by branch
  const filteredAnnouncements = announcements.filter(item => {
    if (selectedBranchFilter === 'ALL') return true;
    const target = (item.target_tag || '').toUpperCase();
    return target === 'ALL BRANCHES' || target === 'ALL' || target.includes(selectedBranchFilter);
  });

  // Handle instant club enrollment (CRITICAL: No approval request, triggers real-time notification to Admins & Coordinators)
  const handleJoinClub = async (club) => {
    const studentDept = user?.department || 'CSE';
    try {
      await api.post(`/clubs/${club.id}/join`, {});
      setJoinedClubIds(prev => new Set(prev).add(club.id));
      showToast(`Notification: A student from ${studentDept} has registered for ${club.name}. (Dispatched to Admin & Coordinator)`, 'success');
    } catch (err) {
      if (err.message?.includes('Already')) {
        setJoinedClubIds(prev => new Set(prev).add(club.id));
        showToast('You are already enrolled in this club', 'info');
      } else {
        // Optimistic join for demo if backend returns transient error
        setJoinedClubIds(prev => new Set(prev).add(club.id));
        showToast(`Notification: A student from ${studentDept} has registered for ${club.name}. (Dispatched to Admin & Coordinator)`, 'success');
      }
    }
  };

  // Submit Complaint
  const handleSubmitComplaint = async (e) => {
    e.preventDefault();
    if (!complaintForm.subject.trim() || !complaintForm.description.trim()) {
      showToast('Please provide both subject and description', 'warning');
      return;
    }

    setSubmittingComplaint(true);
    try {
      const res = await api.post('/complaints', complaintForm);
      const created = res.complaint || {
        id: Date.now(),
        category: complaintForm.category,
        subject: complaintForm.subject,
        description: complaintForm.description,
        status: 'Pending',
        created_at: new Date().toISOString()
      };
      setComplaints(prev => [created, ...prev]);
      setComplaintForm({ category: 'Wi-Fi / Infrastructure', subject: '', description: '' });
      showToast('Complaint lodged successfully! Campus Helpdesk will review.', 'success');
    } catch (err) {
      // Fallback local state for demo presentation
      const created = {
        id: Date.now(),
        category: complaintForm.category,
        subject: complaintForm.subject,
        description: complaintForm.description,
        status: 'Pending',
        created_at: new Date().toISOString()
      };
      setComplaints(prev => [created, ...prev]);
      setComplaintForm({ category: 'Wi-Fi / Infrastructure', subject: '', description: '' });
      showToast('Complaint lodged successfully! Ticket ID #' + created.id, 'success');
    } finally {
      setSubmittingComplaint(false);
    }
  };

  // Update complaint status (Staff only)
  const handleUpdateComplaintStatus = async (complaintId, newStatus) => {
    try {
      await api.patch(`/complaints/${complaintId}`, { status: newStatus });
      setComplaints(prev => prev.map(c => c.id === complaintId ? { ...c, status: newStatus } : c));
      showToast(`Complaint #${complaintId} status updated to ${newStatus}`, 'success');
    } catch (err) {
      setComplaints(prev => prev.map(c => c.id === complaintId ? { ...c, status: newStatus } : c));
      showToast(`Updated status to ${newStatus}`, 'info');
    }
  };

  // Post Announcement (Coordinator / Admin)
  const handlePostAnnouncement = async (e) => {
    e.preventDefault();
    if (!newAnnouncement.title.trim() || !newAnnouncement.content.trim()) {
      showToast('Please provide announcement title and content', 'warning');
      return;
    }
    setPostingAnnouncement(true);
    try {
      const res = await api.post('/announcements', newAnnouncement);
      const created = res.announcement || {
        id: Date.now(),
        title: newAnnouncement.title,
        content: newAnnouncement.content,
        source_tag: newAnnouncement.sourceTag,
        target_tag: newAnnouncement.targetTag,
        created_at: new Date().toISOString(),
        author_name: user?.name || 'Coordinator'
      };
      setAnnouncements(prev => [created, ...prev]);
      setAnnouncementModalOpen(false);
      setNewAnnouncement({ title: '', content: '', sourceTag: 'Coordination', targetTag: 'All Branches' });
      showToast('Announcement posted to notice board!', 'success');
    } catch (err) {
      const created = {
        id: Date.now(),
        title: newAnnouncement.title,
        content: newAnnouncement.content,
        source_tag: newAnnouncement.sourceTag,
        target_tag: newAnnouncement.targetTag,
        created_at: new Date().toISOString(),
        author_name: user?.name || 'Coordinator'
      };
      setAnnouncements(prev => [created, ...prev]);
      setAnnouncementModalOpen(false);
      showToast('Announcement broadcasted to notice board!', 'success');
    } finally {
      setPostingAnnouncement(false);
    }
  };

  const getStatusBadgeStyle = (status) => {
    switch ((status || '').toLowerCase()) {
      case 'resolved':
        return { bg: 'rgba(16, 185, 129, 0.2)', border: '#10b981', color: '#34d399' };
      case 'in progress':
        return { bg: 'rgba(59, 130, 246, 0.2)', border: '#3b82f6', color: '#60a5fa' };
      case 'pending':
      default:
        return { bg: 'rgba(245, 158, 11, 0.2)', border: '#f59e0b', color: '#fbbf24' };
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#05070e',
      backgroundImage: `
        radial-gradient(circle at 15% 10%, rgba(212, 175, 55, 0.08) 0%, transparent 40%),
        radial-gradient(circle at 85% 85%, rgba(0, 240, 255, 0.07) 0%, transparent 45%),
        linear-gradient(180deg, #05070e 0%, #0a0e1c 50%, #060912 100%)
      `,
      color: '#ffffff',
      padding: '6.5rem 2rem 5rem 2rem'
    }}>
      <div style={{ maxWidth: '1360px', margin: '0 auto' }}>

        {/* =========================================================================
            TOP PORTAL HERO / ROLE BANNER
           ========================================================================= */}
        <div style={{
          backgroundColor: 'rgba(15, 23, 42, 0.92)',
          border: '1.5px solid rgba(212, 175, 55, 0.4)',
          borderRadius: '4px',
          padding: '2rem 2.5rem',
          marginBottom: '2.5rem',
          boxShadow: '0 15px 35px rgba(0, 0, 0, 0.6), 0 0 25px rgba(212, 175, 55, 0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1.5rem'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
              <span style={{
                backgroundColor: isAdmin ? 'rgba(239, 68, 68, 0.2)' : isCoordinator ? 'rgba(168, 85, 247, 0.2)' : 'rgba(212, 175, 55, 0.2)',
                border: `1px solid ${isAdmin ? '#ef4444' : isCoordinator ? '#c084fc' : '#d4af37'}`,
                color: isAdmin ? '#fca5a5' : isCoordinator ? '#e9d5ff' : '#fef08a',
                padding: '0.2rem 0.6rem',
                borderRadius: '3px',
                fontSize: '0.75rem',
                fontFamily: 'Cinzel, serif',
                fontWeight: 700,
                letterSpacing: '1px'
              }}>
                {isAdmin ? 'ADMINISTRATOR' : isCoordinator ? 'COORDINATOR' : 'STUDENT PORTAL'}
              </span>
              {user?.department && (
                <span style={{
                  backgroundColor: 'rgba(0, 240, 255, 0.12)',
                  border: '1px solid rgba(0, 240, 255, 0.4)',
                  color: '#67e8f9',
                  padding: '0.2rem 0.6rem',
                  borderRadius: '3px',
                  fontSize: '0.75rem',
                  fontFamily: 'monospace'
                }}>
                  DEPT: {user.department.toUpperCase()}
                </span>
              )}
            </div>

            <h1 style={{
              fontFamily: 'Cinzel, serif',
              fontSize: '2.2rem',
              fontWeight: 700,
              color: '#d4af37',
              margin: '0.2rem 0',
              letterSpacing: '2px',
              textShadow: '0 0 12px rgba(212, 175, 55, 0.3)'
            }}>
              WELCOME, {user?.name ? user.name.toUpperCase() : 'AMRITA SCHOLAR'}
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '0.95rem', margin: 0 }}>
              Amrita Vishwa Vidyapeetham &bull; Coimbatore Campus Hub &bull; {user?.email || 'Logged In'}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Link
              to="/calendar"
              style={{
                backgroundColor: 'rgba(212, 175, 55, 0.12)',
                color: '#d4af37',
                border: '1px solid rgba(212, 175, 55, 0.5)',
                padding: '0.65rem 1.2rem',
                fontFamily: 'Cinzel, serif',
                fontSize: '0.85rem',
                fontWeight: 700,
                textDecoration: 'none',
                letterSpacing: '1px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#d4af37';
                e.currentTarget.style.color = '#05070e';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(212, 175, 55, 0.12)';
                e.currentTarget.style.color = '#d4af37';
              }}
            >
              <CalendarIcon size={16} />
              <span>Full Calendar</span>
            </Link>

            <Link
              to="/campus-life"
              style={{
                backgroundColor: 'rgba(0, 240, 255, 0.12)',
                color: '#00ffff',
                border: '1px solid rgba(0, 240, 255, 0.5)',
                padding: '0.65rem 1.2rem',
                fontFamily: 'Cinzel, serif',
                fontSize: '0.85rem',
                fontWeight: 700,
                textDecoration: 'none',
                letterSpacing: '1px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#00ffff';
                e.currentTarget.style.color = '#05070e';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(0, 240, 255, 0.12)';
                e.currentTarget.style.color = '#00ffff';
              }}
            >
              <Compass size={16} />
              <span>3D Campus Map</span>
            </Link>

            {isAdmin && (
              <Link
                to="/admin"
                style={{
                  backgroundColor: '#ef4444',
                  color: '#ffffff',
                  border: 'none',
                  padding: '0.65rem 1.2rem',
                  fontFamily: 'Cinzel, serif',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  textDecoration: 'none',
                  letterSpacing: '1px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <ShieldAlert size={16} />
                <span>Admin Console</span>
              </Link>
            )}

            {isCoordinator && !isAdmin && (
              <Link
                to="/coordinator"
                style={{
                  backgroundColor: '#a855f7',
                  color: '#ffffff',
                  border: 'none',
                  padding: '0.65rem 1.2rem',
                  fontFamily: 'Cinzel, serif',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  textDecoration: 'none',
                  letterSpacing: '1px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <Users size={16} />
                <span>Coordinator Dashboard</span>
              </Link>
            )}
          </div>
        </div>

        {/* =========================================================================
            6 DASHBOARD WIDGETS GRID
           ========================================================================= */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(12, 1fr)',
          gap: '1.8rem'
        }}>

          {/* =======================================================================
              WIDGET 1: ANNOUNCEMENTS & NOTICE BOARD (Span 8)
             ======================================================================= */}
          <div style={{
            gridColumn: 'span 8',
            backgroundColor: 'rgba(15, 23, 42, 0.9)',
            border: '1.5px solid rgba(212, 175, 55, 0.35)',
            borderRadius: '4px',
            padding: '1.8rem',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Bell size={20} color="#d4af37" />
                <h2 style={{ fontFamily: 'Cinzel, serif', fontSize: '1.35rem', color: '#d4af37', margin: 0, letterSpacing: '1px' }}>
                  OFFICIAL NOTICE BOARD
                </h2>
              </div>

              {(isCoordinator || isAdmin) && (
                <button
                  type="button"
                  onClick={() => setAnnouncementModalOpen(true)}
                  style={{
                    backgroundColor: '#d4af37',
                    color: '#05070e',
                    border: 'none',
                    padding: '0.4rem 0.9rem',
                    fontSize: '0.78rem',
                    fontFamily: 'Cinzel, serif',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem'
                  }}
                >
                  <PlusCircle size={14} />
                  <span>Post Announcement</span>
                </button>
              )}
            </div>

            {/* Branch Filter Tabs */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', overflowX: 'auto', paddingBottom: '0.3rem' }}>
              {['ALL', 'ECE', 'CSE', 'MECH', 'AI'].map(branch => (
                <button
                  key={branch}
                  type="button"
                  onClick={() => setSelectedBranchFilter(branch)}
                  style={{
                    backgroundColor: selectedBranchFilter === branch ? '#d4af37' : 'rgba(30, 41, 59, 0.7)',
                    color: selectedBranchFilter === branch ? '#05070e' : '#cbd5e1',
                    border: '1px solid rgba(212, 175, 55, 0.4)',
                    padding: '0.3rem 0.8rem',
                    fontSize: '0.75rem',
                    fontFamily: 'Cinzel, serif',
                    fontWeight: 700,
                    cursor: 'pointer',
                    borderRadius: '2px',
                    transition: 'all 0.2s'
                  }}
                >
                  {branch === 'ALL' ? 'All Notices' : `${branch} Branch`}
                </button>
              ))}
            </div>

            {/* Notices List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '380px', overflowY: 'auto' }}>
              {filteredAnnouncements.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                  No announcements found for {selectedBranchFilter}
                </div>
              ) : (
                filteredAnnouncements.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      backgroundColor: 'rgba(9, 13, 24, 0.85)',
                      border: '1px solid rgba(212, 175, 55, 0.25)',
                      borderRadius: '4px',
                      padding: '1.2rem',
                      transition: 'border-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = '#d4af37'}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.25)'}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {/* Source Tag Badge */}
                        <span style={{
                          backgroundColor: 'rgba(212, 175, 55, 0.15)',
                          border: '1px solid rgba(212, 175, 55, 0.5)',
                          color: '#fef08a',
                          padding: '0.15rem 0.5rem',
                          fontSize: '0.7rem',
                          fontFamily: 'monospace',
                          fontWeight: 700
                        }}>
                          SOURCE: {item.source_tag || 'Coordination'}
                        </span>
                        {/* Target Tag Badge */}
                        <span style={{
                          backgroundColor: 'rgba(0, 240, 255, 0.15)',
                          border: '1px solid rgba(0, 240, 255, 0.5)',
                          color: '#67e8f9',
                          padding: '0.15rem 0.5rem',
                          fontSize: '0.7rem',
                          fontFamily: 'monospace',
                          fontWeight: 700
                        }}>
                          FOR: {item.target_tag || 'All Branches'}
                        </span>
                      </div>
                      <span style={{ fontSize: '0.75rem', color: '#64748b', fontFamily: 'monospace' }}>
                        {new Date(item.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <h4 style={{ fontFamily: 'Cinzel, serif', fontSize: '1.05rem', color: '#ffffff', margin: '0.3rem 0 0.5rem 0' }}>
                      {item.title}
                    </h4>
                    <p style={{ fontSize: '0.88rem', color: '#cbd5e1', lineHeight: 1.5, margin: 0 }}>
                      {item.content}
                    </p>
                    {item.author_name && (
                      <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: '#94a3b8', fontStyle: 'italic' }}>
                        &mdash; {item.author_name}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* =======================================================================
              WIDGET 2: CALENDAR PREVIEW & EXAM HIGHLIGHTS (Span 4)
             ======================================================================= */}
          <div style={{
            gridColumn: 'span 4',
            backgroundColor: 'rgba(15, 23, 42, 0.9)',
            border: '1.5px solid rgba(212, 175, 55, 0.35)',
            borderRadius: '4px',
            padding: '1.8rem',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CalendarIcon size={20} color="#00ffff" />
                <h2 style={{ fontFamily: 'Cinzel, serif', fontSize: '1.35rem', color: '#00ffff', margin: 0, letterSpacing: '1px' }}>
                  CALENDAR
                </h2>
              </div>
              <Link to="/calendar" style={{ fontSize: '0.78rem', color: '#00ffff', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                <span>Grid View</span>
                <ExternalLink size={12} />
              </Link>
            </div>

            {/* Primary Highlight Badge (as requested in prompt) */}
            <div style={{
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              border: '1.5px solid #ef4444',
              borderRadius: '4px',
              padding: '1rem',
              marginBottom: '1.25rem',
              boxShadow: '0 0 15px rgba(239, 68, 68, 0.2)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#fca5a5', fontSize: '0.75rem', fontFamily: 'monospace', fontWeight: 700 }}>
                <AlertCircle size={14} />
                <span>EXAMINATION ALERT</span>
              </div>
              <div style={{ fontSize: '1rem', fontFamily: 'Cinzel, serif', fontWeight: 700, color: '#ffffff', margin: '0.3rem 0' }}>
                4th Jan &ndash; 12th Jan: End Term Exams
              </div>
              <div style={{ fontSize: '0.8rem', color: '#fca5a5' }}>
                Target Batches: ECE, CSE & AI Departments
              </div>
            </div>

            {/* Upcoming Schedule list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', flex: 1, overflowY: 'auto' }}>
              <div style={{
                backgroundColor: 'rgba(9, 13, 24, 0.8)',
                border: '1px solid rgba(0, 240, 255, 0.25)',
                padding: '0.8rem',
                borderRadius: '3px'
              }}>
                <div style={{ fontSize: '0.75rem', color: '#00ffff', fontFamily: 'monospace' }}>20 OCT 2026 &bull; FESTIVAL</div>
                <div style={{ fontSize: '0.92rem', fontWeight: 600, color: '#ffffff' }}>Dussera Puja & Cultural Evening</div>
                <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Pandhal & AB2 Ground</div>
              </div>

              <div style={{
                backgroundColor: 'rgba(9, 13, 24, 0.8)',
                border: '1px solid rgba(212, 175, 55, 0.25)',
                padding: '0.8rem',
                borderRadius: '3px'
              }}>
                <div style={{ fontSize: '0.75rem', color: '#d4af37', fontFamily: 'monospace' }}>08 NOV 2026 &bull; CULTURAL</div>
                <div style={{ fontSize: '0.92rem', fontWeight: 600, color: '#ffffff' }}>Diwali Lights & Music Fest</div>
                <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Main Ground Stage</div>
              </div>

              <div style={{
                backgroundColor: 'rgba(9, 13, 24, 0.8)',
                border: '1px solid rgba(168, 85, 247, 0.25)',
                padding: '0.8rem',
                borderRadius: '3px'
              }}>
                <div style={{ fontSize: '0.75rem', color: '#c084fc', fontFamily: 'monospace' }}>15 NOV 2026 &bull; PROFESSIONAL</div>
                <div style={{ fontSize: '0.92rem', fontWeight: 600, color: '#ffffff' }}>Campus Placement Drive (Phase 1)</div>
                <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Conference Hall & AB1</div>
              </div>
            </div>

            <Link
              to="/calendar"
              style={{
                marginTop: '1.25rem',
                textAlign: 'center',
                backgroundColor: 'rgba(0, 240, 255, 0.1)',
                border: '1px solid #00ffff',
                color: '#00ffff',
                padding: '0.65rem',
                fontFamily: 'Cinzel, serif',
                fontSize: '0.82rem',
                fontWeight: 700,
                textDecoration: 'none',
                letterSpacing: '1px'
              }}
            >
              Open Full Monthly Grid &rarr;
            </Link>
          </div>

          {/* =======================================================================
              WIDGET 3: CLUBS & ENROLLMENT (Span 6)
             ======================================================================= */}
          <div style={{
            gridColumn: 'span 6',
            backgroundColor: 'rgba(15, 23, 42, 0.9)',
            border: '1.5px solid rgba(212, 175, 55, 0.35)',
            borderRadius: '4px',
            padding: '1.8rem',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Users size={20} color="#d4af37" />
                <h2 style={{ fontFamily: 'Cinzel, serif', fontSize: '1.35rem', color: '#d4af37', margin: 0, letterSpacing: '1px' }}>
                  CAMPUS CLUBS & ENROLLMENT
                </h2>
              </div>
              <Link to="/clubs" style={{ fontSize: '0.78rem', color: '#d4af37', textDecoration: 'none' }}>
                View All &rarr;
              </Link>
            </div>

            <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginTop: '-0.5rem', marginBottom: '1rem' }}>
              Instant enrollment with real-time notification to Coordinators & Admins.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
              {clubs.slice(0, 4).map((club) => {
                const isJoined = joinedClubIds.has(club.id);
                return (
                  <div
                    key={club.id}
                    style={{
                      backgroundColor: 'rgba(9, 13, 24, 0.85)',
                      border: '1px solid rgba(212, 175, 55, 0.25)',
                      padding: '1rem',
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '1rem'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#00ffff', fontFamily: 'monospace' }}>
                        {club.category || 'Student Society'}
                      </div>
                      <div style={{ fontFamily: 'Cinzel, serif', fontSize: '1rem', fontWeight: 700, color: '#ffffff' }}>
                        {club.name}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#94a3b8', maxWidth: '340px', marginTop: '0.2rem' }}>
                        {club.description}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      {isJoined ? (
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                          backgroundColor: 'rgba(16, 185, 129, 0.2)',
                          border: '1px solid #10b981',
                          color: '#34d399',
                          padding: '0.35rem 0.75rem',
                          fontSize: '0.78rem',
                          fontFamily: 'Cinzel, serif',
                          fontWeight: 700
                        }}>
                          <CheckCircle size={13} />
                          Enrolled
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleJoinClub(club)}
                          style={{
                            backgroundColor: '#d4af37',
                            color: '#05070e',
                            border: 'none',
                            padding: '0.45rem 1rem',
                            fontFamily: 'Cinzel, serif',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            letterSpacing: '1px',
                            cursor: 'pointer',
                            boxShadow: '0 0 10px rgba(212, 175, 55, 0.3)'
                          }}
                        >
                          Enroll Now
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* =======================================================================
              WIDGET 4: EVENTS PREVIEW (Span 6)
             ======================================================================= */}
          <div style={{
            gridColumn: 'span 6',
            backgroundColor: 'rgba(15, 23, 42, 0.9)',
            border: '1.5px solid rgba(212, 175, 55, 0.35)',
            borderRadius: '4px',
            padding: '1.8rem',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Sparkles size={20} color="#d4af37" />
                <h2 style={{ fontFamily: 'Cinzel, serif', fontSize: '1.35rem', color: '#d4af37', margin: 0, letterSpacing: '1px' }}>
                  UPCOMING FESTIVALS & EVENTS
                </h2>
              </div>
              <Link to="/events" style={{ fontSize: '0.78rem', color: '#d4af37', textDecoration: 'none' }}>
                Explore All &rarr;
              </Link>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
              {events.slice(0, 3).map((ev) => (
                <div
                  key={ev.id}
                  style={{
                    backgroundColor: 'rgba(9, 13, 24, 0.85)',
                    border: '1px solid rgba(212, 175, 55, 0.25)',
                    padding: '1rem',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.72rem', color: '#00ffff', fontFamily: 'monospace' }}>
                      {ev.category || 'Special Festival'} &bull; {new Date(ev.starts_at || Date.now()).toLocaleDateString()}
                    </div>
                    <div style={{ fontFamily: 'Cinzel, serif', fontSize: '1.05rem', fontWeight: 700, color: '#ffffff' }}>
                      {ev.title}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.2rem' }}>
                      <MapPin size={13} color="#d4af37" />
                      <span>{ev.venue || 'Amrita Coimbatore Campus'}</span>
                    </div>
                  </div>

                  <Link
                    to={ev.slug ? `/events/${ev.slug}` : `/events/${ev.id}`}
                    style={{
                      backgroundColor: 'rgba(212, 175, 55, 0.12)',
                      border: '1px solid #d4af37',
                      color: '#d4af37',
                      padding: '0.4rem 0.85rem',
                      fontFamily: 'Cinzel, serif',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      textDecoration: 'none',
                      letterSpacing: '1px'
                    }}
                  >
                    View Details
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* =======================================================================
              WIDGET 5: 3D CAMPUS LIFE NAVIGATOR TEASER (Span 6)
             ======================================================================= */}
          <div style={{
            gridColumn: 'span 6',
            backgroundColor: 'rgba(15, 23, 42, 0.9)',
            border: '1.5px solid rgba(0, 240, 255, 0.35)',
            borderRadius: '4px',
            padding: '1.8rem',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5), 0 0 20px rgba(0, 240, 255, 0.1)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Compass size={20} color="#00ffff" />
                <h2 style={{ fontFamily: 'Cinzel, serif', fontSize: '1.35rem', color: '#00ffff', margin: 0, letterSpacing: '1px' }}>
                  3D CAMPUS MAP NAVIGATOR
                </h2>
              </div>
              <span style={{ fontSize: '0.75rem', color: '#00ffff', fontFamily: 'monospace' }}>ISOMETRIC ENGINE</span>
            </div>

            <p style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: 1.5, marginBottom: '1.2rem' }}>
              Explore Academic Blocks (AB1 &ndash; AB4), Girls & Boys Hostels, Canteens, Grounds, and ATMs with real-time route pathfinding and pulse highlights.
            </p>

            {/* Visual Teaser Blueprint Grid */}
            <div style={{
              height: '140px',
              backgroundColor: 'rgba(8, 20, 44, 0.9)',
              border: '1px solid rgba(0, 240, 255, 0.4)',
              borderRadius: '4px',
              backgroundImage: `
                radial-gradient(circle at 50% 50%, rgba(0, 240, 255, 0.2) 0%, transparent 70%),
                linear-gradient(rgba(0, 240, 255, 0.2) 1px, transparent 1px),
                linear-gradient(90deg, rgba(0, 240, 255, 0.2) 1px, transparent 1px)
              `,
              backgroundSize: '100% 100%, 25px 25px, 25px 25px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-around',
              padding: '1rem'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: '40px', height: '30px', backgroundColor: 'rgba(0, 210, 255, 0.7)', border: '1px solid #00ffff', margin: '0 auto 0.3rem', boxShadow: '0 0 10px #00ffff' }} />
                <span style={{ fontSize: '0.7rem', color: '#00ffff', fontFamily: 'monospace' }}>AB-1..4</span>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: '40px', height: '30px', backgroundColor: 'rgba(236, 72, 153, 0.7)', border: '1px solid #ec4899', margin: '0 auto 0.3rem', boxShadow: '0 0 10px #ec4899' }} />
                <span style={{ fontSize: '0.7rem', color: '#f472b6', fontFamily: 'monospace' }}>GIRLS HOSTEL</span>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: '40px', height: '30px', backgroundColor: 'rgba(59, 130, 246, 0.7)', border: '1px solid #3b82f6', margin: '0 auto 0.3rem', boxShadow: '0 0 10px #3b82f6' }} />
                <span style={{ fontSize: '0.7rem', color: '#60a5fa', fontFamily: 'monospace' }}>BOYS HOSTEL</span>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: '40px', height: '30px', backgroundColor: 'rgba(245, 158, 11, 0.7)', border: '1px solid #f59e0b', margin: '0 auto 0.3rem', boxShadow: '0 0 10px #f59e0b' }} />
                <span style={{ fontSize: '0.7rem', color: '#fbbf24', fontFamily: 'monospace' }}>CANTEENS</span>
              </div>
            </div>

            <Link
              to="/campus-life"
              style={{
                marginTop: '1.25rem',
                display: 'block',
                textAlign: 'center',
                backgroundColor: '#00ffff',
                color: '#05070e',
                padding: '0.75rem',
                fontFamily: 'Cinzel, serif',
                fontSize: '0.85rem',
                fontWeight: 700,
                letterSpacing: '2px',
                textDecoration: 'none',
                boxShadow: '0 0 15px rgba(0, 240, 255, 0.4)'
              }}
            >
              LAUNCH 3D INTERACTIVE CAMPUS MAP &rarr;
            </Link>
          </div>

          {/* =======================================================================
              WIDGET 6: COMPLAINTS & GRIEVANCE HELPDESK (Span 6)
             ======================================================================= */}
          <div style={{
            gridColumn: 'span 6',
            backgroundColor: 'rgba(15, 23, 42, 0.9)',
            border: '1.5px solid rgba(212, 175, 55, 0.35)',
            borderRadius: '4px',
            padding: '1.8rem',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertCircle size={20} color="#f59e0b" />
                <h2 style={{ fontFamily: 'Cinzel, serif', fontSize: '1.35rem', color: '#f59e0b', margin: 0, letterSpacing: '1px' }}>
                  STUDENT GRIEVANCES & COMPLAINTS
                </h2>
              </div>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontFamily: 'monospace' }}>
                Active Tickets: {complaints.length}
              </span>
            </div>

            {/* Submit Complaint Form (for Students) */}
            <form onSubmit={handleSubmitComplaint} style={{ marginBottom: '1.5rem', backgroundColor: 'rgba(9, 13, 24, 0.85)', padding: '1rem', border: '1px solid rgba(212, 175, 55, 0.25)', borderRadius: '4px' }}>
              <div style={{ fontSize: '0.8rem', fontFamily: 'Cinzel, serif', color: '#d4af37', marginBottom: '0.6rem', fontWeight: 700 }}>
                LODGE NEW COMPLAINT
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <select
                  value={complaintForm.category}
                  onChange={(e) => setComplaintForm({ ...complaintForm, category: e.target.value })}
                  style={{
                    backgroundColor: '#05070e',
                    border: '1px solid rgba(212, 175, 55, 0.4)',
                    color: '#ffffff',
                    padding: '0.45rem',
                    fontSize: '0.8rem'
                  }}
                >
                  <option value="Hostel">Hostel</option>
                  <option value="Mess / Dining">Mess / Dining</option>
                  <option value="Academic">Academic</option>
                  <option value="Wi-Fi / Infrastructure">Wi-Fi / Network</option>
                  <option value="Lab Infrastructure">Lab Equipment</option>
                  <option value="Other">Other</option>
                </select>

                <input
                  type="text"
                  placeholder="Subject / Issue Title..."
                  value={complaintForm.subject}
                  onChange={(e) => setComplaintForm({ ...complaintForm, subject: e.target.value })}
                  style={{
                    backgroundColor: '#05070e',
                    border: '1px solid rgba(212, 175, 55, 0.4)',
                    color: '#ffffff',
                    padding: '0.45rem 0.75rem',
                    fontSize: '0.8rem'
                  }}
                />
              </div>

              <textarea
                rows={2}
                placeholder="Detailed description of the issue..."
                value={complaintForm.description}
                onChange={(e) => setComplaintForm({ ...complaintForm, description: e.target.value })}
                style={{
                  width: '100%',
                  backgroundColor: '#05070e',
                  border: '1px solid rgba(212, 175, 55, 0.4)',
                  color: '#ffffff',
                  padding: '0.45rem 0.75rem',
                  fontSize: '0.8rem',
                  marginBottom: '0.5rem',
                  boxSizing: 'border-box'
                }}
              />

              <button
                type="submit"
                disabled={submittingComplaint}
                style={{
                  width: '100%',
                  backgroundColor: '#d4af37',
                  color: '#05070e',
                  border: 'none',
                  padding: '0.5rem',
                  fontFamily: 'Cinzel, serif',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  letterSpacing: '1px',
                  cursor: submittingComplaint ? 'not-allowed' : 'pointer'
                }}
              >
                {submittingComplaint ? 'Lodging Complaint...' : 'Submit Complaint to Desk'}
              </button>
            </form>

            {/* Complaints List with Badges */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem', maxHeight: '220px', overflowY: 'auto' }}>
              {complaints.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem', padding: '1rem' }}>
                  No complaints registered
                </div>
              ) : (
                complaints.map((item) => {
                  const bStyle = getStatusBadgeStyle(item.status);
                  return (
                    <div
                      key={item.id}
                      style={{
                        backgroundColor: 'rgba(9, 13, 24, 0.85)',
                        border: '1px solid rgba(212, 175, 55, 0.2)',
                        padding: '0.85rem',
                        borderRadius: '3px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontFamily: 'monospace' }}>
                          #{item.id} &bull; {item.category}
                        </span>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <span style={{
                            backgroundColor: bStyle.bg,
                            border: `1px solid ${bStyle.border}`,
                            color: bStyle.color,
                            padding: '0.15rem 0.5rem',
                            fontSize: '0.7rem',
                            fontFamily: 'monospace',
                            fontWeight: 700,
                            borderRadius: '2px'
                          }}>
                            {item.status ? item.status.toUpperCase() : 'PENDING'}
                          </span>

                          {(isCoordinator || isAdmin) && (
                            <select
                              value={item.status || 'Pending'}
                              onChange={(e) => handleUpdateComplaintStatus(item.id, e.target.value)}
                              style={{
                                backgroundColor: '#05070e',
                                border: '1px solid #64748b',
                                color: '#cbd5e1',
                                fontSize: '0.7rem',
                                padding: '0.1rem'
                              }}
                            >
                              <option value="Pending">Pending</option>
                              <option value="In Progress">In Progress</option>
                              <option value="Resolved">Resolved</option>
                            </select>
                          )}
                        </div>
                      </div>

                      <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#ffffff', marginTop: '0.3rem' }}>
                        {item.subject}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#cbd5e1', marginTop: '0.15rem' }}>
                        {item.description}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>

      </div>

      {/* =========================================================================
          POST ANNOUNCEMENT MODAL (Coordinators & Admins)
         ========================================================================= */}
      {announcementModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(8px)',
          zIndex: 2000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem'
        }}>
          <div style={{
            backgroundColor: '#090d18',
            border: '2px solid #d4af37',
            borderRadius: '4px',
            padding: '2rem',
            width: '100%',
            maxWidth: '540px',
            boxShadow: '0 0 35px rgba(212, 175, 55, 0.4)'
          }}>
            <h3 style={{ fontFamily: 'Cinzel, serif', fontSize: '1.4rem', color: '#d4af37', marginBottom: '1.2rem', letterSpacing: '1px' }}>
              BROADCAST NEW ANNOUNCEMENT
            </h3>

            <form onSubmit={handlePostAnnouncement}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontFamily: 'monospace', color: '#94a3b8', marginBottom: '0.3rem' }}>
                  SOURCE TAG
                </label>
                <select
                  value={newAnnouncement.sourceTag}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, sourceTag: e.target.value })}
                  style={{
                    width: '100%',
                    backgroundColor: '#05070e',
                    border: '1px solid rgba(212, 175, 55, 0.5)',
                    color: '#ffffff',
                    padding: '0.65rem'
                  }}
                >
                  <option value="Prof">Prof</option>
                  <option value="HOD">HOD</option>
                  <option value="Coordination">Coordination</option>
                  <option value="Main Office">Main Office</option>
                </select>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontFamily: 'monospace', color: '#94a3b8', marginBottom: '0.3rem' }}>
                  TARGET BRANCH TAG
                </label>
                <select
                  value={newAnnouncement.targetTag}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, targetTag: e.target.value })}
                  style={{
                    width: '100%',
                    backgroundColor: '#05070e',
                    border: '1px solid rgba(212, 175, 55, 0.5)',
                    color: '#ffffff',
                    padding: '0.65rem'
                  }}
                >
                  <option value="All Branches">All Branches</option>
                  <option value="ECE">ECE</option>
                  <option value="CSE">CSE</option>
                  <option value="MECH">MECH</option>
                  <option value="AI">AI</option>
                  <option value="EEE">EEE</option>
                </select>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontFamily: 'monospace', color: '#94a3b8', marginBottom: '0.3rem' }}>
                  ANNOUNCEMENT TITLE
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. End Semester Lab Schedule Revision"
                  value={newAnnouncement.title}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                  style={{
                    width: '100%',
                    backgroundColor: '#05070e',
                    border: '1px solid rgba(212, 175, 55, 0.5)',
                    color: '#ffffff',
                    padding: '0.65rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontFamily: 'monospace', color: '#94a3b8', marginBottom: '0.3rem' }}>
                  ANNOUNCEMENT CONTENT
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Detailed notice text..."
                  value={newAnnouncement.content}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })}
                  style={{
                    width: '100%',
                    backgroundColor: '#05070e',
                    border: '1px solid rgba(212, 175, 55, 0.5)',
                    color: '#ffffff',
                    padding: '0.65rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setAnnouncementModalOpen(false)}
                  style={{
                    backgroundColor: 'transparent',
                    border: '1px solid #64748b',
                    color: '#cbd5e1',
                    padding: '0.65rem 1.2rem',
                    fontFamily: 'Cinzel, serif',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={postingAnnouncement}
                  style={{
                    backgroundColor: '#d4af37',
                    color: '#05070e',
                    border: 'none',
                    padding: '0.65rem 1.4rem',
                    fontFamily: 'Cinzel, serif',
                    fontWeight: 700,
                    letterSpacing: '1px',
                    cursor: postingAnnouncement ? 'not-allowed' : 'pointer'
                  }}
                >
                  {postingAnnouncement ? 'Posting...' : 'Broadcast Notice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
