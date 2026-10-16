import React, { useState, useEffect } from 'react';
import api from '../api/client';
import ClubCard from '../components/ClubCard';
import Modal from '../components/Modal';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { Search, Filter, Plus, Users, Sparkles, AlertCircle } from 'lucide-react';

export default function ClubsPage() {
  const { isAuthenticated, user } = useAuth();
  const { showToast } = useNotification();

  const [clubs, setClubs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  // Club Request Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reqForm, setReqForm] = useState({ name: '', category: '', description: '', purpose: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadClubs() {
      try {
        const [clubsRes, catRes] = await Promise.all([
          api.get('/clubs'),
          api.get('/clubs/categories'),
        ]);
        setClubs(clubsRes.clubs || []);
        setCategories(catRes.categories || []);
      } catch (err) {
        showToast('Failed to load clubs directory', 'error');
      } finally {
        setLoading(false);
      }
    }
    loadClubs();
  }, [showToast]);

  const filteredClubs = clubs.filter((c) => {
    const matchesSearch =
      !search ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.description && c.description.toLowerCase().includes(search.toLowerCase()));
    const matchesCat = !selectedCategory || c.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    if (!reqForm.name || !reqForm.category || !reqForm.description) {
      showToast('Please fill out all required fields', 'warning');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/club-requests', reqForm);
      showToast('Club creation request submitted for Admin review!', 'success');
      setIsModalOpen(false);
      setReqForm({ name: '', category: '', description: '', purpose: '' });
    } catch (err) {
      showToast(err.message || 'Failed to submit request', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ padding: '2.5rem 0 4rem' }}>
      <div className="container">
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '2rem' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--theme-primary)', fontWeight: 700, fontSize: '0.825rem', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.35rem' }}>
              <Users size={16} />
              <span>Campus Communities</span>
            </div>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', fontWeight: 700, color: '#0F172A' }}>
              Clubs & Societies Directory
            </h1>
            <p style={{ color: '#64748B', fontSize: '1rem', marginTop: '0.35rem' }}>
              Showing exactly the 8 student organizations approved for Amrita university campus life.
            </p>
          </div>

          <button
            className="btn btn-outline"
            onClick={() => {
              if (!isAuthenticated) {
                showToast('Please sign in to submit a club proposal', 'info');
              } else {
                setIsModalOpen(true);
              }
            }}
          >
            <Plus size={16} />
            <span>Propose New Club</span>
          </button>
        </div>

        {/* Search & Category Filter Bar */}
        <div className="card" style={{ padding: '1rem 1.25rem', marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
              <Search size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
              <input
                type="text"
                placeholder="Search clubs by name or keywords..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="form-input"
                style={{ paddingLeft: '2.25rem' }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <Filter size={16} color="#64748B" />
              <button
                className={`btn btn-sm ${!selectedCategory ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setSelectedCategory('')}
              >
                All Categories
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  className={`btn btn-sm ${selectedCategory === cat ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Clubs Grid */}
        {loading ? (
          <div style={{ padding: '4rem', textAlign: 'center', color: '#94A3B8' }}>Loading clubs directory...</div>
        ) : filteredClubs.length === 0 ? (
          <div className="card" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
            <AlertCircle size={40} color="#94A3B8" style={{ margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1E293B', marginBottom: '0.5rem' }}>No clubs found</h3>
            <p style={{ color: '#64748B', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Try adjusting your search criteria or clear your category filter.
            </p>
            <button className="btn btn-secondary btn-sm" onClick={() => { setSearch(''); setSelectedCategory(''); }}>
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid-4">
            {filteredClubs.map((club) => (
              <ClubCard key={club.id} club={club} />
            ))}
          </div>
        )}
      </div>

      {/* Propose New Club Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Propose a New Campus Club">
        <form onSubmit={handleRequestSubmit}>
          <p style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: '1.25rem' }}>
            Submitted proposals are reviewed by University Administrators. If approved, the new club will be activated in the catalog.
          </p>

          <div className="form-group">
            <label className="form-label">Proposed Club Name *</label>
            <input
              type="text"
              required
              className="form-input"
              value={reqForm.name}
              onChange={(e) => setReqForm({ ...reqForm, name: e.target.value })}
              placeholder="e.g., Artificial Intelligence & ML Society"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Category *</label>
            <select
              required
              className="form-select"
              value={reqForm.category}
              onChange={(e) => setReqForm({ ...reqForm, category: e.target.value })}
            >
              <option value="">Select Category</option>
              <option value="Technology">Technology</option>
              <option value="Arts">Arts</option>
              <option value="Literature">Literature</option>
              <option value="Media & Film">Media & Film</option>
              <option value="Performing Arts">Performing Arts</option>
              <option value="Communication">Communication</option>
              <option value="Business">Business</option>
              <option value="Science">Science</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Brief Description *</label>
            <textarea
              required
              rows={3}
              className="form-textarea"
              value={reqForm.description}
              onChange={(e) => setReqForm({ ...reqForm, description: e.target.value })}
              placeholder="What is this club about and who should join?"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Objective & Campus Value</label>
            <textarea
              rows={2}
              className="form-textarea"
              value={reqForm.purpose}
              onChange={(e) => setReqForm({ ...reqForm, purpose: e.target.value })}
              placeholder="Explain how this benefits Amrita students..."
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Proposal'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
