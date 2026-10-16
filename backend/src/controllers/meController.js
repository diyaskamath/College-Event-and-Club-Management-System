'use strict';
const { query } = require('../db');
const notifications = require('../services/notificationService');
const eventService = require('../services/eventService');
const clubService = require('../services/clubService');
const { mapUser } = require('../services/mappers');
const { asyncHandler } = require('../utils/http');
const { audit } = require('../utils/audit');
const { badRequest } = require('../utils/errors');

// ---- profile ----------------------------------------------------------------------------------
exports.updateProfile = asyncHandler(async (req, res) => {
  const b = req.body;
  const map = { name: 'name', department: 'department', yearOfStudy: 'year_of_study', bio: 'bio', campusId: 'campus_id' };
  const sets = [];
  const params = [];
  for (const [k, col] of Object.entries(map)) {
    if (b[k] !== undefined) {
      sets.push(`${col}=?`);
      params.push(b[k] === '' ? null : b[k]);
    }
  }
  if (!sets.length) throw badRequest('nothing_to_update', 'No changes supplied.');
  if (b.campusId && !(await query('SELECT 1 FROM campuses WHERE id=? AND is_active=1', [b.campusId])).length) throw badRequest('invalid_campus', 'Choose a valid campus.');
  await query(`UPDATE users SET ${sets.join(', ')} WHERE id=?`, [...params, req.user.id]);
  await audit(req.user.id, 'profile.update', { entityType: 'user', entityId: req.user.id, metadata: { fields: Object.keys(b) } });
  res.json({ user: mapUser((await query('SELECT * FROM users WHERE id=?', [req.user.id]))[0]) });
});

exports.getPreferences = asyncHandler(async (req, res) => res.json({ preferences: await notifications.getPreferences(req.user.id) }));
exports.updatePreferences = asyncHandler(async (req, res) => res.json({ preferences: await notifications.updatePreferences(req.user.id, req.body) }));

// ---- notifications -------------------------------------------------------------------------------
exports.listNotifications = asyncHandler(async (req, res) => {
  const { limit, offset, unread } = req.query;
  res.json(await notifications.list(req.user.id, { limit, offset, unreadOnly: unread === 'true' }));
});
exports.unreadCount = asyncHandler(async (req, res) => res.json({ unread: await notifications.unreadCount(req.user.id) }));
exports.markRead = asyncHandler(async (req, res) => {
  await notifications.markRead(req.user.id, Number(req.params.id));
  res.json({ unread: await notifications.unreadCount(req.user.id) });
});
exports.markAllRead = asyncHandler(async (req, res) => {
  const updated = await notifications.markAllRead(req.user.id);
  res.json({ updated, unread: 0 });
});

// ---- student data ---------------------------------------------------------------------------------
exports.myClubs = asyncHandler(async (req, res) => {
  const rows = await query(
    `SELECT c.*, (SELECT COUNT(*) FROM club_memberships m2 WHERE m2.club_id=c.id AND m2.status='active') AS member_count, m.status AS my_membership_status, m.joined_at
     FROM club_memberships m JOIN clubs c ON c.id=m.club_id WHERE m.user_id=? AND m.status='active' ORDER BY m.joined_at DESC`,
    [req.user.id],
  );
  const { mapClub } = require('../services/mappers');
  res.json({ items: rows.map((r) => ({ ...mapClub(r), joinedAt: r.joined_at })) });
});
exports.myRegistrations = asyncHandler(async (req, res) => res.json({ items: await eventService.myRegistrations(req.user) }));
exports.myHistory = asyncHandler(async (req, res) => res.json({ items: await eventService.myHistory(req.user) }));
exports.mySaved = asyncHandler(async (req, res) => res.json({ items: await eventService.mySaved(req.user) }));
exports.myClubRequests = asyncHandler(async (req, res) => res.json({ items: await clubService.myRequests(req.user) }));

/** Coordinator overview: assigned clubs with member counts + upcoming events. */
exports.myAssignedClubs = asyncHandler(async (req, res) => {
  const where = req.user.role === 'admin' ? '' : 'AND c.id IN (SELECT club_id FROM coordinator_assignments WHERE user_id=?)';
  const rows = await query(
    `SELECT c.*, (SELECT COUNT(*) FROM club_memberships m WHERE m.club_id=c.id AND m.status='active') AS member_count,
       (SELECT COUNT(*) FROM events e WHERE e.club_id=c.id AND e.status IN ('published','registration_closed','ongoing')) AS upcoming_event_count
     FROM clubs c WHERE c.is_active=1 ${where} ORDER BY c.name`,
    req.user.role === 'admin' ? [] : [req.user.id],
  );
  const { mapClub } = require('../services/mappers');
  res.json({ items: rows.map(mapClub) });
});
