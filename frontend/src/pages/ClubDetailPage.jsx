import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import EventCard from '../components/EventCard';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import {
  Users,
  Calendar,
  Bell,
  UserCheck,
  UserPlus,
  UserMinus,
  ShieldCheck,
  ArrowLeft,
  Send,
  Sparkles,
} from 'lucide-react';

export default function ClubDetailPage() {
  const { idOrSlug } = useParams();
  const { user, isAuthenticated, isCoordinator, isAdmin } = useAuth();
  const { showToast } = useNotification();

  const [club, setClub] = useState(null);
  const [events, setEvents] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Announcement modal for coordinators/admin
  const [announcementModalOpen, setAnnouncementModalOpen] = useState(false);
  const [announcementForm, setAnnouncementForm] = useState({ title: '', body: '' });

  // Members modal for staff
  const [membersModalOpen, setMembersModalOpen] = useState(false);
  const [membersList, setMembersList] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(false);

  const loadClub = useCallback(async () => {
    try {
      const data = await api.get(`/clubs/${idOrSlug}`);
      setClub(data.club);
      setEvents(data.events || []);
      setAnnouncements(data.announcements || []);
    } catch (err) {
      showToast(err.message || 'Failed to load club details', 'error');
    } finally {
      setLoading(false);
    }
  }, [idOrSlug, showToast]);

  useEffect(() => {
    loadClub();
  }, [loadClub]);

  const handleJoin = async () => {
    if (!isAuthenticated) {
      showToast('Please sign in to join this club', 'info');
      return;
    }
    setActionLoading(true);
    try {
      await api.post(`/clubs/${club.id}/join`);
      showToast(`Welcome! You have joined ${club.name}`, 'success');
      setClub((prev) => ({
        ...prev,
        is_member: 1,
        member_count: (prev.member_count || 0) + 1,
      }));
    } catch (err) {
      showToast(err.message || 'Unable to join club', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleLeave = async () => {
    if (!window.confirm(`Are you sure you want to leave ${club.name}?`)) return;
    setActionLoading(true);
    try {
      await api.delete(`/clubs/${club.id}/membership`);
      showToast(`You have left ${club.name}`, 'info');
      setClub((prev) => ({
        ...prev,
        is_member: 0,
        member_count: Math.max(0, (prev.member_count || 0) - 1),
      }));
    } catch (err) {
      showToast(err.message || 'Unable to leave club', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePostAnnouncement = async (e) => {
    e.preventDefault();
    if (!announcementForm.title || !announcementForm.body) return;
    try {
      await api.post(`/clubs/${club.id}/announcements`, announcementForm);
      showToast('Club announcement posted successfully', 'success');
      setAnnouncementModalOpen(false);
      setAnnouncementForm({ title: '', body: '' });
      loadClub();
    } catch (err) {
      showToast(err.message || 'Failed to post announcement', 'error');
    }
  };

  const openMembersList = async () => {
    setMembersModalOpen(true);
    setLoadingMembers(true);
    try {
      const data = await api.get(`/clubs/${club.id}/members`);
      setMembersList(data.members || []);
    } catch (err) {
      showToast(err.message || 'Failed to load member roster', 'error');
    } finally {
      setLoadingMembers(false);
    }
  };

  if (loading) {
    return <div className="container" style={{ padding: '5rem 0', textAlign: 'center', color: '#94A3B8' }}>Loading club details...</div>;
  }

  if (!club) {
    return (
      <div className="container" style={{ padding: '5rem 0', textAlign: 'center' }}>
        <h2>Club not found</h2>
        <Link to="/clubs" className="btn btn-secondary" style={{ marginTop: '1rem' }}>
          Back to Directory
        </Link>
      </div>
    );
  }

  const isClubStaff = isAdmin || isCoordinator;

  return (
    <div style={{ padding: '2rem 0 4rem' }}>
      <div className="container">
        {/* Back breadcrumb */}
        <Link to="/clubs" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#64748B', fontSize: '0.875rem', fontWeight: 600, marginBottom: '1.5rem' }}>
          <ArrowLeft size={16} />
          <span>Back to All Clubs</span>
        </Link>

        {/* Club Header Banner */}
        <div className="card" style={{ padding: '2.5rem', marginBottom: '2.5rem', position: 'relative', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem' }}>
            <div style={{ flex: 1, minWidth: '280px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                <Badge variant="primary">{club.category}</Badge>
                {club.is_demo ? (
                  <span style={{ fontSize: '0.7rem', color: '#B45309', background: '#FEF3C7', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: 600 }}>
                    Demo Organization
                  </span>
                ) : null}
              </div>

              <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', fontWeight: 700, color: '#0F172A', marginBottom: '1rem', lineHeight: 1.2 }}>
                {club.name}
              </h1>

              <p style={{ fontSize: '1.05rem', color: '#475569', lineHeight: 1.6, maxWidth: '750px', marginBottom: '1.5rem' }}>
                {club.description}
              </p>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap', fontSize: '0.9rem', color: '#64748B' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Users size={18} color="var(--theme-primary)" />
                  <span><strong>{club.member_count || 0}</strong> Registered Members</span>
                </div>

                {club.coordinator_name ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <ShieldCheck size={18} color="#15803D" />
                    <span>Faculty / Student Coordinator: <strong>{club.coordinator_name}</strong></span>
                  </div>
                ) : (
                  <span style={{ fontSize: '0.85rem', color: '#94A3B8' }}>(Coordinator assignment pending)</span>
                )}
              </div>
            </div>

            {/* Actions: Join / Leave & Staff Controls */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', minWidth: '180px' }}>
              {club.is_member ? (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#15803D', fontWeight: 700, fontSize: '0.9rem', background: '#DCFCE7', padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)' }}>
                    <UserCheck size={18} />
                    <span>Active Member</span>
                  </div>
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={handleLeave}
                    disabled={actionLoading}
                    style={{ borderColor: '#EF4444', color: '#EF4444' }}
                  >
                    <UserMinus size={15} />
                    <span>Leave Club</span>
                  </button>
                </>
              ) : (
                <button
                  className="btn btn-primary"
                  onClick={handleJoin}
                  disabled={actionLoading}
                >
                  <UserPlus size={18} />
                  <span>Join This Club</span>
                </button>
              )}

              {isClubStaff && (
                <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <button className="btn btn-secondary btn-sm" onClick={openMembersList}>
                    <Users size={14} />
                    <span>View Member Roster</span>
                  </button>
                  <button className="btn btn-secondary btn-sm" onClick={() => setAnnouncementModalOpen(true)}>
                    <Send size={14} />
                    <span>Post Announcement</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content Tabs / Sections: Events & Announcements */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
          {/* Associated Events */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <Calendar size={20} color="var(--theme-primary)" />
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700 }}>Associated Events ({events.length})</h2>
            </div>

            {events.length === 0 ? (
              <div className="card" style={{ padding: '3rem', textAlign: 'center', color: '#94A3B8' }}>
                No events currently scheduled for this club.
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.25rem' }}>
                {events.map((e) => (
                  <EventCard key={e.id} event={e} />
                ))}
              </div>
            )}
          </div>

          {/* Announcements Feed */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <Bell size={20} color="var(--theme-primary)" />
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700 }}>Announcements</h2>
            </div>

            {announcements.length === 0 ? (
              <div className="card" style={{ padding: '2rem', textAlign: 'center', color: '#94A3B8', fontSize: '0.9rem' }}>
                No announcements posted yet.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {announcements.map((a) => (
                  <div key={a.id} className="card" style={{ padding: '1.25rem' }}>
                    <div style={{ fontWeight: 700, fontSize: '1rem', color: '#0F172A', marginBottom: '0.35rem' }}>
                      {a.title}
                    </div>
                    <p style={{ fontSize: '0.875rem', color: '#475569', lineHeight: 1.5, marginBottom: '0.75rem' }}>
                      {a.body}
                    </p>
                    <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                      Posted on {new Date(a.created_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Post Announcement Modal */}
      <Modal
        isOpen={announcementModalOpen}
        onClose={() => setAnnouncementModalOpen(false)}
        title={`Post Announcement for ${club.name}`}
      >
        <form onSubmit={handlePostAnnouncement}>
          <div className="form-group">
            <label className="form-label">Announcement Title *</label>
            <input
              type="text"
              required
              className="form-input"
              value={announcementForm.title}
              onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })}
              placeholder="e.g., Weekly Reading Session moved to Hall 3"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Announcement Content *</label>
            <textarea
              required
              rows={4}
              className="form-textarea"
              value={announcementForm.body}
              onChange={(e) => setAnnouncementForm({ ...announcementForm, body: e.target.value })}
              placeholder="Provide details to all club members..."
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setAnnouncementModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Post Announcement
            </button>
          </div>
        </form>
      </Modal>

      {/* View Member Roster Modal */}
      <Modal
        isOpen={membersModalOpen}
        onClose={() => setMembersModalOpen(false)}
        title={`Member Roster — ${club.name}`}
        maxWidth="650px"
      >
        {loadingMembers ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#94A3B8' }}>Loading member roster...</div>
        ) : membersList.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#94A3B8' }}>No members registered yet.</div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Amrita Email</th>
                  <th>Joined Date</th>
                </tr>
              </thead>
              <tbody>
                {membersList.map((m) => (
                  <tr key={m.id || m.user_id}>
                    <td style={{ fontWeight: 600 }}>{m.user_name || m.name}</td>
                    <td>{m.user_email || m.email}</td>
                    <td style={{ color: '#64748B' }}>{new Date(m.joined_at || m.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Modal>
    </div>
  );
}
