'use strict';
const clubService = require('../services/clubService');
const eventService = require('../services/eventService');
const { asyncHandler } = require('../utils/http');

const id = (req) => Number(req.params.id);

// ---- clubs ---------------------------------------------------------------------------------------
exports.clubCategories = asyncHandler(async (_req, res) => res.json({ items: await clubService.categories() }));
exports.listClubs = asyncHandler(async (req, res) => res.json({ items: await clubService.list(req.query, req.user) }));
exports.clubDetail = asyncHandler(async (req, res) => res.json({ club: await clubService.detail(req.params.idOrSlug, req.user) }));
exports.joinClub = asyncHandler(async (req, res) => res.status(201).json(await clubService.join(req.user, id(req))));
exports.leaveClub = asyncHandler(async (req, res) => res.json(await clubService.leave(req.user, id(req))));
exports.clubMembers = asyncHandler(async (req, res) => res.json({ items: await clubService.members(req.user, id(req)) }));
exports.clubAnnouncement = asyncHandler(async (req, res) => res.status(201).json(await clubService.postAnnouncement(req.user, id(req), req.body)));
exports.submitClubRequest = asyncHandler(async (req, res) => res.status(201).json(await clubService.submitRequest(req.user, req.body)));

// ---- events ----------------------------------------------------------------------------------------
exports.eventCategories = asyncHandler(async (_req, res) => res.json({ items: await eventService.categories() }));
exports.listEvents = asyncHandler(async (req, res) => res.json({ items: await eventService.list(req.query, req.user) }));
exports.eventDetail = asyncHandler(async (req, res) => res.json({ event: await eventService.detail(req.params.idOrSlug, req.user) }));
exports.createEvent = asyncHandler(async (req, res) => res.status(201).json({ event: await eventService.create(req.user, req.body) }));
exports.updateEvent = asyncHandler(async (req, res) => res.json({ event: await eventService.update(req.user, id(req), req.body) }));
exports.transitionEvent = asyncHandler(async (req, res) => res.json({ event: await eventService.transition(req.user, id(req), req.body) }));
exports.register = asyncHandler(async (req, res) => res.status(201).json(await eventService.register(req.user, id(req))));
exports.cancelRegistration = asyncHandler(async (req, res) => res.json(await eventService.cancelRegistration(req.user, id(req))));
exports.registrations = asyncHandler(async (req, res) => res.json({ items: await eventService.registrations(req.user, id(req), req.query) }));
exports.reviewRegistration = asyncHandler(async (req, res) => res.json(await eventService.reviewRegistration(req.user, id(req), Number(req.params.regId), req.body.action)));
exports.attendance = asyncHandler(async (req, res) => res.json(await eventService.attendanceList(req.user, id(req))));
exports.recordAttendance = asyncHandler(async (req, res) => res.json(await eventService.recordAttendance(req.user, id(req), req.body.entries)));
exports.submitFeedback = asyncHandler(async (req, res) => res.status(201).json(await eventService.submitFeedback(req.user, id(req), req.body)));
exports.feedbackList = asyncHandler(async (req, res) => res.json(await eventService.feedbackList(req.user, id(req))));
exports.report = asyncHandler(async (req, res) => {
  if (req.query.format === 'csv') {
    const { filename, content } = await eventService.reportCsv(req.user, id(req));
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.send(`\uFEFF${content}`);
  }
  return res.json(await eventService.report(req.user, id(req)));
});
exports.eventAnnouncement = asyncHandler(async (req, res) => res.status(201).json(await eventService.postAnnouncement(req.user, id(req), req.body)));
exports.saveEvent = asyncHandler(async (req, res) => res.json(await eventService.save(req.user, id(req), true)));
exports.unsaveEvent = asyncHandler(async (req, res) => res.json(await eventService.save(req.user, id(req), false)));
