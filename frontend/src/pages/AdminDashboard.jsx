import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { useTheme } from '../context/ThemeContext';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import {
  ShieldAlert,
  Users,
  Calendar,
  Sparkles,
  Palette,
  CheckCircle,
  XCircle,
  Settings,
  Flame,
  Sun,
  Eye,
  Edit,
  UserCheck,
} from 'lucide-react';

export default function AdminDashboard() {
  const { user } = useAuth();
  const { showToast } = useNotification();
  const { refreshTheme } = useTheme();

  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [clubRequests, setClubRequests] = useState([]);
  const [themes, setThemes] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Theme edit modal
  const [themeModalOpen, setThemeModalOpen] = useState(false);
  const [editingTheme, setEditingTheme] = useState(null);
  const [themeForm, setThemeForm] = useState({
    name: '',
    startDate: '',
    endDate: '',
    isEnabled: true,
  });

  // Assign coordinator modal
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [assignForm, setAssignForm] = useState({ userId: '', clubId: '' });

  const loadAdminData = async () => {
    try {
      const [statsRes, usersRes, reqRes, themesRes, assignRes, clubsRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users?limit=50'),
        api.get('/admin/club-requests'),
        api.get('/admin/themes'),
        api.get('/admin/assignments'),
        api.get('/clubs'),
      ]);

      setStats(statsRes.stats);
      setUsers(usersRes.users || []);
      setClubRequests(reqRes.requests || []);
      setThemes(themesRes.themes || []);
      setAssignments(assignRes.assignments || []);
      setClubs(clubsRes.clubs || []);
    } catch (err) {
      showToast('Failed to load administrative console', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleReviewClubRequest = async (requestId, decision) => {
    const note = prompt(`Enter review note for ${decision}:`, decision === 'approve' ? 'Approved for official campus catalog' : 'Does not meet guidelines');
    if (note === null) return;
    try {
      if (decision === 'approve') {
        await api.post(`/admin/club-requests/${requestId}/approve`, { note });
        showToast('Club request approved and club created!', 'success');
      } else {
        await api.post(`/admin/club-requests/${requestId}/reject`, { note });
        showToast('Club request rejected', 'info');
      }
      loadAdminData();
    } catch (err) {
      showToast(err.message || 'Review action failed', 'error');
    }
  };

  const handleToggleUserStatus = async (targetUser) => {
    const newStatus = targetUser.status === 'active' ? 'suspended' : 'active';
    try {
      await api.patch(`/admin/users/${targetUser.id}`, { status: newStatus });
      showToast(`User status updated to ${newStatus}`, 'success');
      setUsers((prev) =>
        prev.map((u) => (u.id === targetUser.id ? { ...u, status: newStatus } : u))
      );
    } catch (err) {
      showToast(err.message || 'Failed to update user', 'error');
    }
  };

  const handleChangeUserRole = async (targetUser, newRole) => {
    try {
      await api.patch(`/admin/users/${targetUser.id}`, { role: newRole });
      showToast(`User role updated to ${newRole}`, 'success');
      setUsers((prev) =>
        prev.map((u) => (u.id === targetUser.id ? { ...u, role: newRole } : u))
      );
    } catch (err) {
      showToast(err.message || 'Failed to update user role', 'error');
    }
  };

  const openThemeEdit = (theme) => {
    setEditingTheme(theme);
    setThemeForm({
      name: theme.name,
      startDate: theme.start_date ? theme.start_date.split('T')[0] : '',
      endDate: theme.end_date ? theme.end_date.split('T')[0] : '',
      isEnabled: Boolean(theme.is_enabled),
    });
    setThemeModalOpen(true);
  };

  const handleSaveTheme = async (e) => {
    e.preventDefault();
    if (!editingTheme) return;
    try {
      await api.patch(`/admin/themes/${editingTheme.id}`, {
        name: themeForm.name,
        startDate: themeForm.startDate,
        endDate: themeForm.endDate,
        isEnabled: Boolean(themeForm.isEnabled),
      });
      showToast('Festival theme settings updated', 'success');
      setThemeModalOpen(false);
      await refreshTheme();
      loadAdminData();
    } catch (err) {
      showToast(err.message || 'Failed to update theme', 'error');
    }
  };

  const handleAssignCoordinator = async (e) => {
    e.preventDefault();
    if (!assignForm.userId || !assignForm.clubId) {
      showToast('Select both a user and a club', 'warning');
      return;
    }
    try {
      await api.post('/admin/assignments', {
        userId: Number(assignForm.userId),
        clubId: Number(assignForm.clubId),
      });
      showToast('Coordinator assigned successfully', 'success');
      setAssignModalOpen(false);
      loadAdminData();
    } catch (err) {
      showToast(err.message || 'Assignment failed', 'error');
    }
  };

  const handleUnassign = async (id) => {
    if (!window.confirm('Remove this coordinator assignment?')) return;
    try {
      await api.delete(`/admin/assignments/${id}`);
      showToast('Assignment removed', 'info');
      loadAdminData();
    } catch (err) {
      showToast(err.message || 'Removal failed', 'error');
    }
  };

  // Preview Theme live in current session
  const previewThemeLive = (theme) => {
    const root = document.documentElement;
    if (theme && theme.config && theme.config.colors) {
      const { colors } = theme.config;
      root.style.setProperty('--theme-primary', colors.primary);
      root.style.setProperty('--theme-accent', colors.accent);
      root.style.setProperty('--theme-bg', colors.background);
      root.style.setProperty('--theme-surface', colors.surface);
      root.style.setProperty('--theme-text', colors.text);
      root.style.setProperty('--theme-hero-from', colors.heroFrom);
      root.style.setProperty('--theme-hero-to', colors.heroTo);
      showToast(`Previewing "${theme.name}" theme visuals!`, 'info');
    }
  };

  const resetThemeToLive = () => {
    refreshTheme();
    showToast('Theme visuals reset to current schedule', 'info');
  };

  return (
    <div style={{ padding: '2.5rem 0 4rem' }}>
      <div className="container">
        {/* Header */}
        <div className="card" style={{ padding: '2rem', marginBottom: '2rem', background: 'linear-gradient(135deg, rgba(136, 19, 55, 0.08) 0%, rgba(15, 23, 42, 0.05) 100%)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--theme-primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                University Central Administration
              </span>
              <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', fontWeight: 700, color: '#0F172A', marginTop: '0.25rem' }}>
                Admin Control Console
              </h1>
              <p style={{ color: '#64748B', fontSize: '0.9rem', marginTop: '0.2rem' }}>
                Manage festival themes, coordinator assignments, student roles, and club proposals.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="btn btn-secondary btn-sm" onClick={resetThemeToLive}>
                Reset Visual Theme
              </button>
            </div>
          </div>

          {/* Stats Bar */}
          {stats && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginTop: '1.5rem', borderTop: '1px solid #E2E8F0', paddingTop: '1.25rem' }}>
              <div style={{ background: '#FFFFFF', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '0.8rem', color: '#64748B' }}>Total Registered Users</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0F172A' }}>{stats.total_users || 0}</div>
              </div>
              <div style={{ background: '#FFFFFF', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '0.8rem', color: '#64748B' }}>Active Clubs</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--theme-primary)' }}>{stats.total_clubs || 0}</div>
              </div>
              <div style={{ background: '#FFFFFF', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '0.8rem', color: '#64748B' }}>Published Events</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#D97706' }}>{stats.total_events || 0}</div>
              </div>
              <div style={{ background: '#FFFFFF', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '0.8rem', color: '#64748B' }}>Student Registrations</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#15803D' }}>{stats.total_registrations || 0}</div>
              </div>
            </div>
          )}
        </div>

        {/* Admin Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--theme-border)', marginBottom: '1.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
          <button
            className={`btn btn-sm ${activeTab === 'overview' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('overview')}
          >
            <Sparkles size={15} />
            <span>Festival Calendar & Themes ({themes.length})</span>
          </button>
          <button
            className={`btn btn-sm ${activeTab === 'requests' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('requests')}
          >
            <CheckCircle size={15} />
            <span>Club Creation Proposals ({clubRequests.filter((r) => r.status === 'pending').length} Pending)</span>
          </button>
          <button
            className={`btn btn-sm ${activeTab === 'coordinators' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('coordinators')}
          >
            <UserCheck size={15} />
            <span>Coordinator Assignments ({assignments.length})</span>
          </button>
          <button
            className={`btn btn-sm ${activeTab === 'users' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('users')}
          >
            <Users size={15} />
            <span>User Accounts ({users.length})</span>
          </button>
        </div>

        {/* TAB 1: Festival Calendar & Theme Manager (KEY REQUIREMENT) */}
        {activeTab === 'overview' && (
          <div>
            <div style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#0F172A' }}>
                Festival Theme Calendar & Visual Configuration
              </h2>
              <p style={{ color: '#64748B', fontSize: '0.9rem' }}>
                Configure dates for Diwali (warm gold, orange, diyas) and Dussehra/Navaratri (vibrant magenta, violet, marigolds). Themes activate automatically when campus date falls in range.
              </p>
            </div>

            <div className="grid-2">
              {themes.map((th) => (
                <div key={th.id} className="card" style={{ borderLeft: `5px solid ${th.slug === 'diwali' ? '#F59E0B' : '#EC4899'}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {th.slug === 'diwali' ? <Flame size={18} color="#F59E0B" /> : <Sparkles size={18} color="#EC4899" />}
                      <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{th.name}</h3>
                    </div>
                    <span className={`badge ${th.is_enabled ? 'badge-success' : 'badge-danger'}`}>
                      {th.is_enabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>

                  <p style={{ fontSize: '0.875rem', color: '#64748B', lineHeight: 1.5, marginBottom: '1rem' }}>
                    {th.description}
                  </p>

                  <div style={{ background: '#F8FAFC', padding: '0.75rem', borderRadius: 'var(--radius-md)', fontSize: '0.825rem', color: '#475569', marginBottom: '1.25rem' }}>
                    <div>
                      <strong>Calendar Window:</strong> {new Date(th.start_date).toLocaleDateString()} &mdash; {new Date(th.end_date).toLocaleDateString()}
                    </div>
                    <div style={{ marginTop: '0.35rem' }}>
                      <strong>Motif & Glow:</strong> {th.config?.decoration || 'festive'} (Glow factor: {th.config?.glow || 0.5})
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button className="btn btn-secondary btn-sm" onClick={() => openThemeEdit(th)}>
                      <Edit size={14} />
                      <span>Edit Dates</span>
                    </button>
                    <button className="btn btn-outline btn-sm" onClick={() => previewThemeLive(th)}>
                      <Eye size={14} />
                      <span>Preview Theme</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: Club Proposals Queue */}
        {activeTab === 'requests' && (
          <div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '1rem' }}>
              Student Club Proposals ({clubRequests.length})
            </h2>

            {clubRequests.length === 0 ? (
              <div className="card" style={{ padding: '3rem', textAlign: 'center', color: '#94A3B8' }}>
                No club proposals found.
              </div>
            ) : (
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Proposed Club Name</th>
                      <th>Category</th>
                      <th>Requested By</th>
                      <th>Description</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clubRequests.map((req) => (
                      <tr key={req.id}>
                        <td style={{ fontWeight: 700 }}>{req.name}</td>
                        <td>{req.category}</td>
                        <td>{req.requester_name || `User #${req.user_id}`}</td>
                        <td style={{ maxWidth: '300px', fontSize: '0.85rem' }}>{req.description}</td>
                        <td>
                          <span className={`badge ${req.status === 'approved' ? 'badge-success' : req.status === 'rejected' ? 'badge-danger' : 'badge-warning'}`}>
                            {req.status}
                          </span>
                        </td>
                        <td>
                          {req.status === 'pending' ? (
                            <div style={{ display: 'flex', gap: '0.4rem' }}>
                              <button
                                className="btn btn-primary btn-sm"
                                style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
                                onClick={() => handleReviewClubRequest(req.id, 'approve')}
                              >
                                Approve
                              </button>
                              <button
                                className="btn btn-secondary btn-sm"
                                style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem', color: '#EF4444' }}
                                onClick={() => handleReviewClubRequest(req.id, 'reject')}
                              >
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span style={{ fontSize: '0.75rem', color: '#64748B' }}>Reviewed</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: Coordinator Assignments */}
        {activeTab === 'coordinators' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 700 }}>Club Coordinator Assignments</h2>
              <button className="btn btn-primary btn-sm" onClick={() => setAssignModalOpen(true)}>
                Assign New Coordinator
              </button>
            </div>

            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Coordinator</th>
                    <th>Email</th>
                    <th>Assigned Club</th>
                    <th>Assigned At</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {assignments.map((asgn) => (
                    <tr key={asgn.id}>
                      <td style={{ fontWeight: 600 }}>{asgn.user_name}</td>
                      <td>{asgn.user_email}</td>
                      <td>
                        <strong>{asgn.club_name}</strong>
                      </td>
                      <td style={{ color: '#64748B', fontSize: '0.85rem' }}>{new Date(asgn.created_at).toLocaleDateString()}</td>
                      <td>
                        <button
                          className="btn btn-secondary btn-sm"
                          style={{ color: '#EF4444', padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
                          onClick={() => handleUnassign(asgn.id)}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: Users & Roles */}
        {activeTab === 'users' && (
          <div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '1rem' }}>
              User Accounts & Role Permissions
            </h2>

            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Amrita Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Controls</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td style={{ fontWeight: 600 }}>{u.name}</td>
                      <td>{u.email}</td>
                      <td>
                        <select
                          className="form-select"
                          style={{ padding: '0.2rem 0.5rem', fontSize: '0.8rem', width: 'auto' }}
                          value={u.role}
                          onChange={(e) => handleChangeUserRole(u, e.target.value)}
                        >
                          <option value="student">Student</option>
                          <option value="coordinator">Coordinator</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td>
                        <span className={`badge ${u.status === 'active' ? 'badge-success' : u.status === 'suspended' ? 'badge-danger' : 'badge-warning'}`}>
                          {u.status}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem', color: u.status === 'active' ? '#EF4444' : '#15803D' }}
                          onClick={() => handleToggleUserStatus(u)}
                        >
                          {u.status === 'active' ? 'Suspend' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Edit Theme Dates Modal */}
      <Modal
        isOpen={themeModalOpen}
        onClose={() => setThemeModalOpen(false)}
        title={`Configure ${editingTheme?.name || 'Festival Theme'}`}
      >
        <form onSubmit={handleSaveTheme}>
          <div className="form-group">
            <label className="form-label">Theme Name</label>
            <input
              type="text"
              required
              className="form-input"
              value={themeForm.name}
              onChange={(e) => setThemeForm({ ...themeForm, name: e.target.value })}
            />
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Active Start Date</label>
              <input
                type="date"
                required
                className="form-input"
                value={themeForm.startDate}
                onChange={(e) => setThemeForm({ ...themeForm, startDate: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Active End Date</label>
              <input
                type="date"
                required
                className="form-input"
                value={themeForm.endDate}
                onChange={(e) => setThemeForm({ ...themeForm, endDate: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input
              type="checkbox"
              id="isEnabledCheck"
              checked={themeForm.isEnabled}
              onChange={(e) => setThemeForm({ ...themeForm, isEnabled: e.target.checked })}
              style={{ width: '18px', height: '18px' }}
            />
            <label htmlFor="isEnabledCheck" className="form-label" style={{ margin: 0, cursor: 'pointer' }}>
              Theme enabled in festival calendar
            </label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setThemeModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save Festival Schedule
            </button>
          </div>
        </form>
      </Modal>

      {/* Assign Coordinator Modal */}
      <Modal
        isOpen={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        title="Assign Club Coordinator"
      >
        <form onSubmit={handleAssignCoordinator}>
          <div className="form-group">
            <label className="form-label">Select Staff / User</label>
            <select
              required
              className="form-select"
              value={assignForm.userId}
              onChange={(e) => setAssignForm({ ...assignForm, userId: e.target.value })}
            >
              <option value="">-- Choose User --</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.email}) &mdash; {u.role}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Assign to Club</label>
            <select
              required
              className="form-select"
              value={assignForm.clubId}
              onChange={(e) => setAssignForm({ ...assignForm, clubId: e.target.value })}
            >
              <option value="">-- Choose Club --</option>
              {clubs.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.category})
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setAssignModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save Assignment
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
