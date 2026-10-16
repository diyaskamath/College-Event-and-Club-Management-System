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
