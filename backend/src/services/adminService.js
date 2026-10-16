'use strict';
const bcrypt = require('bcryptjs');
const config = require('../config');
const { query, withTransaction, likeEscape, parseJson } = require('../db');
const notifications = require('./notificationService');
const authService = require('./authService');
const { mapUser, mapClub } = require('./mappers');
const { audit } = require('../utils/audit');
const { notFound, conflict, forbidden, badRequest } = require('../utils/errors');

// ---- users ---------------------------------------------------------------------------------
async function listUsers({ search, role, status, page = 1, pageSize = 20 }) {
  const where = [];
  const params = [];
  if (search) {
    where.push('(u.name LIKE ? OR u.email LIKE ?)');
    const like = `%${likeEscape(search)}%`;
    params.push(like, like);
  }
  if (role) { where.push('u.role=?'); params.push(role); }
  if (status) { where.push('u.status=?'); params.push(status); }
  const w = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const total = (await query(`SELECT COUNT(*) c FROM users u ${w}`, params))[0].c;
  const rows = await query(`SELECT u.* FROM users u ${w} ORDER BY u.created_at DESC, u.id DESC LIMIT ? OFFSET ?`, [...params, pageSize, (page - 1) * pageSize]);
  return { total, page, pageSize, items: rows.map(mapUser) };
}

async function phoneInUse(phone, exceptUserId) {
  return (await query("SELECT 1 FROM users WHERE phone=? AND id<>? AND role IN ('coordinator','admin')", [phone, exceptUserId || 0])).length > 0;
}

async function createUser(admin, { name, email, phone, password, role }) {
  if (role !== 'student' && !phone) throw badRequest('phone_required', 'Coordinators and Admins need a registered phone number for OTP login.');
  if (phone && role !== 'student' && (await phoneInUse(phone))) throw conflict('phone_in_use', 'This phone number is already registered to another Coordinator/Admin.');
  if ((await query('SELECT 1 FROM users WHERE email=?', [email])).length) throw conflict('email_in_use', 'A user with this email already exists.');
  const hash = await bcrypt.hash(password, config.auth.bcryptRounds);
  const res = await query(
    "INSERT INTO users (name,email,phone,password_hash,role,status,email_verified_at,campus_id) VALUES (?,?,?,?,?,'active',UTC_TIMESTAMP(),(SELECT id FROM campuses ORDER BY id LIMIT 1))",
    [name, email, phone || null, hash, role],
  );
  await notifications.ensurePreferences(res.insertId);
  await audit(admin.id, 'user.create', { entityType: 'user', entityId: res.insertId, metadata: { role, email } });
  return mapUser((await query('SELECT * FROM users WHERE id=?', [res.insertId]))[0]);
}

async function updateUser(admin, userId, input) {
  const target = (await query('SELECT * FROM users WHERE id=?', [userId]))[0];
  if (!target) throw notFound('User not found.', 'user_not_found');
  if (target.id === admin.id && (input.role !== undefined || input.status !== undefined)) {
    throw forbidden('You cannot change your own role or status.', 'self_modification');
  }
  const role = input.role || target.role;
  const phone = input.phone !== undefined ? input.phone : target.phone;
  if (role !== 'student' && !phone) throw badRequest('phone_required', 'A registered phone number is required for Coordinators and Admins.');
  if (phone && role !== 'student' && (await phoneInUse(phone, userId))) throw conflict('phone_in_use', 'This phone number is already registered to another Coordinator/Admin.');

  await withTransaction(async (tx) => {
    await tx.q('UPDATE users SET role=?, status=?, phone=?, name=? WHERE id=?', [role, input.status || target.status, phone, input.name || target.name, userId]);
    if (role !== 'coordinator') await tx.q('DELETE FROM coordinator_assignments WHERE user_id=?', [userId]);
    if (input.role && input.role !== target.role) {
      await notifications.notify(tx, {
        userId, type: 'role_changed', category: 'admin_activity', transactional: true,
        title: 'Your account role changed', body: `An administrator changed your role to ${role}.`, link: '/profile',
        dedupeKey: `role:${userId}:${Date.now()}`,
      });
    }
  });
  if ((input.status && input.status !== 'active') || (input.role && input.role !== target.role)) await authService.revokeAllSessions(userId);
  await audit(admin.id, 'user.update', { entityType: 'user', entityId: userId, metadata: { from: { role: target.role, status: target.status }, to: { role, status: input.status || target.status } } });
  return mapUser((await query('SELECT * FROM users WHERE id=?', [userId]))[0]);
}

// ---- coordinator assignments -------------------------------------------------------------------
async function listAssignments() {
  const rows = await query(
    `SELECT a.id, a.created_at, u.id AS user_id, u.name, u.email, c.id AS club_id, c.name AS club_name
     FROM coordinator_assignments a JOIN users u ON u.id=a.user_id JOIN clubs c ON c.id=a.club_id ORDER BY c.name, u.name`,
  );
  return rows.map((r) => ({ id: r.id, createdAt: r.created_at, user: { id: r.user_id, name: r.name, email: r.email }, club: { id: r.club_id, name: r.club_name } }));
}

async function assign(admin, { userId, clubId }) {
  const user = (await query('SELECT * FROM users WHERE id=?', [userId]))[0];
  if (!user) throw notFound('User not found.', 'user_not_found');
  if (user.role !== 'coordinator' || user.status !== 'active') throw badRequest('not_a_coordinator', 'Only active users with the Coordinator role can be assigned to a club. Change their role first.');
  const club = (await query('SELECT * FROM clubs WHERE id=?', [clubId]))[0];
  if (!club) throw notFound('Club not found.', 'club_not_found');
  try {
    const res = await query('INSERT INTO coordinator_assignments (user_id,club_id,assigned_by) VALUES (?,?,?)', [userId, clubId, admin.id]);
    await notifications.notify(null, {
      userId, type: 'coordinator_assigned', category: 'admin_activity', transactional: true,
      title: `You are now Coordinator of ${club.name}`, body: 'You can now manage this club\'s members, events, attendance and announcements.',
      link: '/coordinator', dedupeKey: `assign:${res.insertId}`,
    });
    await audit(admin.id, 'coordinator.assign', { entityType: 'club', entityId: clubId, metadata: { userId } });
    return { id: res.insertId };
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') throw conflict('already_assigned', 'This coordinator is already assigned to that club.');
    throw err;
  }
}

async function unassign(admin, assignmentId) {
  const a = (await query('SELECT * FROM coordinator_assignments WHERE id=?', [assignmentId]))[0];
  if (!a) throw notFound('Assignment not found.', 'assignment_not_found');
  await query('DELETE FROM coordinator_assignments WHERE id=?', [assignmentId]);
  await audit(admin.id, 'coordinator.unassign', { entityType: 'club', entityId: a.club_id, metadata: { userId: a.user_id } });
  return { removed: true };
}

// ---- statistics, audit, campuses ----------------------------------------------------------------
async function stats() {
  const one = async (sql) => Number((await query(sql))[0].c);
  const roles = await query("SELECT role, COUNT(*) c FROM users WHERE status='active' GROUP BY role");
  const events = await query('SELECT status, COUNT(*) c FROM events GROUP BY status');
  const regs = await query('SELECT status, COUNT(*) c FROM event_registrations GROUP BY status');
  return {
    users: { byRole: Object.fromEntries(roles.map((r) => [r.role, Number(r.c)])), pending: await one("SELECT COUNT(*) c FROM users WHERE status='pending'"), suspended: await one("SELECT COUNT(*) c FROM users WHERE status='suspended'") },
    clubs: { total: await one('SELECT COUNT(*) c FROM clubs WHERE is_active=1'), activeMemberships: await one("SELECT COUNT(*) c FROM club_memberships WHERE status='active'"), pendingRequests: await one("SELECT COUNT(*) c FROM club_requests WHERE status='pending'") },
    events: { total: await one('SELECT COUNT(*) c FROM events'), byStatus: Object.fromEntries(events.map((r) => [r.status, Number(r.c)])) },
    registrations: Object.fromEntries(regs.map((r) => [r.status, Number(r.c)])),
    attendance: { present: await one("SELECT COUNT(*) c FROM attendance WHERE status='present'") },
    feedback: { count: await one('SELECT COUNT(*) c FROM feedback') },
    notifications: { total: await one('SELECT COUNT(*) c FROM notifications'), unread: await one('SELECT COUNT(*) c FROM notifications WHERE is_read=0') },
  };
}

async function auditLogs({ page = 1, pageSize = 25, action, actorId }) {
  const where = [];
  const params = [];
  if (action) { where.push('l.action LIKE ?'); params.push(`${likeEscape(action)}%`); }
  if (actorId) { where.push('l.actor_id=?'); params.push(actorId); }
  const w = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const total = (await query(`SELECT COUNT(*) c FROM audit_logs l ${w}`, params))[0].c;
  const rows = await query(
    `SELECT l.*, u.name AS actor_name FROM audit_logs l LEFT JOIN users u ON u.id=l.actor_id ${w} ORDER BY l.id DESC LIMIT ? OFFSET ?`,
    [...params, pageSize, (page - 1) * pageSize],
  );
  return {
    total, page, pageSize,
    items: rows.map((r) => ({ id: r.id, action: r.action, actor: r.actor_id ? { id: r.actor_id, name: r.actor_name } : null, entityType: r.entity_type, entityId: r.entity_id, metadata: parseJson(r.metadata), ip: r.ip, createdAt: r.created_at })),
  };
}

const mapCampus = (r) => ({ id: r.id, slug: r.slug, name: r.name, city: r.city, timezone: r.timezone, isActive: !!r.is_active, isDemo: !!r.is_demo });

async function listCampuses({ includeInactive = false } = {}) {
  const rows = await query(`SELECT * FROM campuses ${includeInactive ? '' : 'WHERE is_active=1'} ORDER BY id`);
  return rows.map(mapCampus);
}

async function createCampus(admin, { slug, name, city, timezone }) {
  try {
    new Intl.DateTimeFormat('en-CA', { timeZone: timezone });
  } catch (_) {
    throw badRequest('invalid_timezone', 'Unknown IANA timezone.');
  }
  try {
    const res = await query('INSERT INTO campuses (slug,name,city,timezone) VALUES (?,?,?,?)', [slug, name, city || null, timezone]);
    await audit(admin.id, 'campus.create', { entityType: 'campus', entityId: res.insertId, metadata: { slug } });
    return mapCampus((await query('SELECT * FROM campuses WHERE id=?', [res.insertId]))[0]);
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') throw conflict('campus_exists', 'A campus with this slug already exists.');
    throw err;
  }
}

async function updateCampus(admin, id, { name, city, timezone, isActive }) {
  const c = (await query('SELECT * FROM campuses WHERE id=?', [id]))[0];
  if (!c) throw notFound('Campus not found.', 'campus_not_found');
  if (timezone) {
    try { new Intl.DateTimeFormat('en-CA', { timeZone: timezone }); } catch (_) { throw badRequest('invalid_timezone', 'Unknown IANA timezone.'); }
  }
  await query('UPDATE campuses SET name=?, city=?, timezone=?, is_active=? WHERE id=?', [name ?? c.name, city ?? c.city, timezone ?? c.timezone, isActive === undefined ? c.is_active : isActive ? 1 : 0, id]);
  await audit(admin.id, 'campus.update', { entityType: 'campus', entityId: id });
  return mapCampus((await query('SELECT * FROM campuses WHERE id=?', [id]))[0]);
}

module.exports = { listUsers, createUser, updateUser, listAssignments, assign, unassign, stats, auditLogs, listCampuses, createCampus, updateCampus, mapClub };
