'use strict';
const adminService = require('../services/adminService');
const clubService = require('../services/clubService');
const themeService = require('../services/themeService');
const settingsService = require('../services/settingsService');
const { audit } = require('../utils/audit');
const { asyncHandler } = require('../utils/http');

const id = (req) => Number(req.params.id);

exports.stats = asyncHandler(async (_req, res) => res.json(await adminService.stats()));
exports.listUsers = asyncHandler(async (req, res) => res.json(await adminService.listUsers(req.query)));
exports.createUser = asyncHandler(async (req, res) => res.status(201).json({ user: await adminService.createUser(req.user, req.body) }));
exports.updateUser = asyncHandler(async (req, res) => res.json({ user: await adminService.updateUser(req.user, id(req), req.body) }));
exports.listAssignments = asyncHandler(async (_req, res) => res.json({ items: await adminService.listAssignments() }));
exports.assign = asyncHandler(async (req, res) => res.status(201).json(await adminService.assign(req.user, req.body)));
exports.unassign = asyncHandler(async (req, res) => res.json(await adminService.unassign(req.user, id(req))));
exports.auditLogs = asyncHandler(async (req, res) => res.json(await adminService.auditLogs(req.query)));

exports.createClub = asyncHandler(async (req, res) => res.status(201).json({ club: await clubService.adminCreate(req.user, req.body) }));
exports.updateClub = asyncHandler(async (req, res) => res.json({ club: await clubService.adminUpdate(req.user, id(req), req.body) }));
exports.clubRequests = asyncHandler(async (req, res) => res.json({ items: await clubService.adminRequests({ status: req.query.status }) }));
exports.approveRequest = asyncHandler(async (req, res) => res.json(await clubService.reviewRequest(req.user, id(req), { decision: 'approve', note: req.body.note })));
exports.rejectRequest = asyncHandler(async (req, res) => res.json(await clubService.reviewRequest(req.user, id(req), { decision: 'reject', note: req.body.note })));

exports.listThemes = asyncHandler(async (_req, res) => res.json({ items: await themeService.list() }));
exports.getTheme = asyncHandler(async (req, res) => res.json({ theme: await themeService.get(id(req)) }));
exports.createTheme = asyncHandler(async (req, res) => res.status(201).json({ theme: await themeService.create(req.user, req.body) }));
exports.updateTheme = asyncHandler(async (req, res) => res.json({ theme: await themeService.update(req.user, id(req), req.body) }));

exports.getSettings = asyncHandler(async (_req, res) => res.json({ settings: await settingsService.getTyped(), raw: await settingsService.getAll() }));
exports.updateSettings = asyncHandler(async (req, res) => {
  const settings = await settingsService.update(req.body, req.user.id);
  await audit(req.user.id, 'settings.update', { entityType: 'settings', metadata: { keys: Object.keys(req.body) }, ip: req.ip });
  res.json({ settings });
});

exports.listCampusesAdmin = asyncHandler(async (_req, res) => res.json({ items: await adminService.listCampuses({ includeInactive: true }) }));
exports.createCampus = asyncHandler(async (req, res) => res.status(201).json({ campus: await adminService.createCampus(req.user, req.body) }));
exports.updateCampus = asyncHandler(async (req, res) => res.json({ campus: await adminService.updateCampus(req.user, id(req), req.body) }));

// public
exports.listCampuses = asyncHandler(async (_req, res) => res.json({ items: await adminService.listCampuses() }));
exports.activeTheme = asyncHandler(async (req, res) => {
  const { campus, campusId, date } = req.query;
  res.json(await themeService.resolveActive({ campusSlug: campus, campusId, date }));
});

/** NEW: Enrolled Students — all students with their club memberships and event registrations */
exports.enrolledStudents = asyncHandler(async (_req, res) => {
  const { query } = require('../db');
  const students = await query(
    `SELECT u.id, u.name, u.email, u.department, u.year_of_study, u.status, u.created_at,
       (SELECT GROUP_CONCAT(c.name SEPARATOR ', ') FROM club_memberships cm JOIN clubs c ON c.id=cm.club_id WHERE cm.user_id=u.id AND cm.status='active') AS clubs_joined,
       (SELECT COUNT(*) FROM club_memberships cm WHERE cm.user_id=u.id AND cm.status='active') AS club_count,
       (SELECT COUNT(*) FROM event_registrations er WHERE er.user_id=u.id AND er.status IN ('confirmed','pending')) AS event_count
     FROM users u WHERE u.role='student' ORDER BY u.created_at DESC`,
  );
  res.json({
    items: students.map((r) => ({
      id: r.id,
      name: r.name,
      email: r.email,
      department: r.department,
      yearOfStudy: r.year_of_study,
      status: r.status,
      createdAt: r.created_at,
      clubsJoined: r.clubs_joined || '',
      clubCount: Number(r.club_count || 0),
      eventCount: Number(r.event_count || 0),
    })),
  });
});

/** NEW: Delete club — admin or coordinator can deactivate/delete a club */
exports.deleteClub = asyncHandler(async (req, res) => {
  const { query } = require('../db');
  const clubId = Number(req.params.id);
  const club = (await query('SELECT * FROM clubs WHERE id=?', [clubId]))[0];
  if (!club) {
    const { notFound } = require('../utils/errors');
    throw notFound('Club not found.', 'club_not_found');
  }
  await query('UPDATE clubs SET is_active=0 WHERE id=?', [clubId]);
  await audit(req.user.id, 'club.delete', { entityType: 'club', entityId: clubId, metadata: { name: club.name } });
  res.json({ deleted: true, clubId });
});

/** NEW: Coordinator Overview — coordinator sees all data (admins, clubs, students, complaints, notifications) */
exports.coordinatorOverview = asyncHandler(async (_req, res) => {
  const { query } = require('../db');
  const [admins, clubs, students, recentNotifs, complaints] = await Promise.all([
    query("SELECT u.id, u.name, u.email, u.phone, u.admin_id, u.status, u.created_at FROM users u WHERE u.role='admin' ORDER BY u.created_at DESC"),
    query("SELECT c.*, (SELECT COUNT(*) FROM club_memberships m WHERE m.club_id=c.id AND m.status='active') AS member_count FROM clubs c WHERE c.is_active=1 ORDER BY c.name"),
    query("SELECT u.id, u.name, u.email, u.phone, u.department, u.year_of_study, u.status, u.created_at, (SELECT COUNT(*) FROM club_memberships cm WHERE cm.user_id=u.id AND cm.status='active') AS club_count FROM users u WHERE u.role='student' ORDER BY u.created_at DESC LIMIT 100"),
    query("SELECT n.* FROM notifications n WHERE n.type='club_new_member' ORDER BY n.created_at DESC LIMIT 50"),
    query("SELECT c.*, u.name as student_name, u.email as student_email, u.department as student_dept FROM complaints c JOIN users u ON u.id = c.user_id ORDER BY c.created_at DESC LIMIT 100"),
  ]);
  res.json({
    admins: admins.map((r) => ({ id: r.id, name: r.name, email: r.email, phone: r.phone, adminId: r.admin_id, status: r.status, createdAt: r.created_at })),
    clubs: clubs.map((r) => ({ id: r.id, name: r.name, category: r.category, description: r.description, memberCount: Number(r.member_count || 0), isActive: !!r.is_active })),
    students: students.map((r) => ({ id: r.id, name: r.name, email: r.email, phone: r.phone, department: r.department, yearOfStudy: r.year_of_study, status: r.status, createdAt: r.created_at, clubCount: Number(r.club_count || 0) })),
    complaints: complaints.map((r) => ({ id: r.id, title: r.title, description: r.description, category: r.category, branch: r.branch, status: r.status, studentName: r.student_name, studentEmail: r.student_email, studentDept: r.student_dept, adminResponse: r.admin_response, createdAt: r.created_at })),
    recentRegistrations: recentNotifs.map((r) => ({ id: r.id, title: r.title, body: r.body, createdAt: r.created_at })),
  });
});

