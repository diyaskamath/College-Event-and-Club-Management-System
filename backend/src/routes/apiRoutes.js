'use strict';
const express = require('express');
const v = require('../validation/schemas');
const { validate, idParam, regParam } = require('../utils/http');
const { requireAuth, optionalAuth, requireRole } = require('../middleware/auth');
const catalog = require('../controllers/catalogController');
const me = require('../controllers/meController');
const admin = require('../controllers/adminController');
const portal = require('../controllers/portalController');

const router = express.Router();
const staff = requireRole('coordinator', 'admin');
const student = requireRole('student');
const idv = validate(idParam, 'params');

// ---- public ----------------------------------------------------------------------------------------
router.get('/campuses', admin.listCampuses);
router.get('/themes/active', validate(v.themeActiveQuery, 'query'), admin.activeTheme);
router.get('/clubs/categories', catalog.clubCategories);
router.get('/clubs', optionalAuth, validate(v.clubQuery, 'query'), catalog.listClubs);
router.get('/clubs/:idOrSlug', optionalAuth, catalog.clubDetail);
router.get('/events/categories', catalog.eventCategories);
router.get('/events', optionalAuth, validate(v.eventQuery, 'query'), catalog.listEvents);
router.get('/events/:idOrSlug', optionalAuth, catalog.eventDetail);

// ---- club membership (students) & club management (coordinators of that club / admins) ------------------
router.post('/clubs/:id/join', requireAuth, student, idv, catalog.joinClub);
router.delete('/clubs/:id/membership', requireAuth, student, idv, catalog.leaveClub);
router.get('/clubs/:id/members', requireAuth, staff, idv, catalog.clubMembers);
router.post('/clubs/:id/announcements', requireAuth, staff, idv, validate(v.announcement), catalog.clubAnnouncement);
router.post('/club-requests', requireAuth, validate(v.clubRequest), catalog.submitClubRequest);

// ---- events ------------------------------------------------------------------------------------------------
router.post('/events', requireAuth, staff, validate(v.eventCreate), catalog.createEvent);
router.patch('/events/:id', requireAuth, staff, idv, validate(v.eventUpdate), catalog.updateEvent);
router.post('/events/:id/transition', requireAuth, staff, idv, validate(v.transition), catalog.transitionEvent);
router.post('/events/:id/register', requireAuth, student, idv, catalog.register);
router.delete('/events/:id/register', requireAuth, student, idv, catalog.cancelRegistration);
router.post('/events/:id/save', requireAuth, student, idv, catalog.saveEvent);
router.delete('/events/:id/save', requireAuth, student, idv, catalog.unsaveEvent);
router.post('/events/:id/feedback', requireAuth, student, idv, validate(v.feedback), catalog.submitFeedback);
router.get('/events/:id/registrations', requireAuth, staff, idv, validate(v.regQuery, 'query'), catalog.registrations);
router.patch('/events/:id/registrations/:regId', requireAuth, staff, validate(regParam, 'params'), validate(v.regReview), catalog.reviewRegistration);
router.get('/events/:id/attendance', requireAuth, staff, idv, catalog.attendance);
router.put('/events/:id/attendance', requireAuth, staff, idv, validate(v.attendance), catalog.recordAttendance);
router.get('/events/:id/feedback', requireAuth, staff, idv, catalog.feedbackList);
router.get('/events/:id/report', requireAuth, staff, idv, catalog.report);
router.post('/events/:id/announcements', requireAuth, staff, idv, validate(v.announcement), catalog.eventAnnouncement);

// ---- current user --------------------------------------------------------------------------------------------
router.patch('/me/profile', requireAuth, validate(v.profile), me.updateProfile);
router.get('/me/preferences', requireAuth, me.getPreferences);
router.put('/me/preferences', requireAuth, validate(v.preferences), me.updatePreferences);
router.get('/me/clubs', requireAuth, me.myClubs);
router.get('/me/registrations', requireAuth, me.myRegistrations);
router.get('/me/history', requireAuth, me.myHistory);
router.get('/me/saved-events', requireAuth, me.mySaved);
router.get('/me/club-requests', requireAuth, me.myClubRequests);
router.get('/me/assigned-clubs', requireAuth, staff, me.myAssignedClubs);

router.get('/notifications', requireAuth, validate(v.notifQuery, 'query'), me.listNotifications);
router.get('/notifications/unread-count', requireAuth, me.unreadCount);
router.post('/notifications/read-all', requireAuth, me.markAllRead);
router.post('/notifications/:id/read', requireAuth, idv, me.markRead);

// ---- admin ----------------------------------------------------------------------------------------------------
const adminRouter = express.Router();
adminRouter.use(requireAuth, requireRole('admin'));
adminRouter.get('/stats', admin.stats);
adminRouter.get('/users', validate(v.userQuery, 'query'), admin.listUsers);
adminRouter.post('/users', validate(v.userCreate), admin.createUser);
adminRouter.patch('/users/:id', idv, validate(v.userUpdate), admin.updateUser);
adminRouter.get('/assignments', admin.listAssignments);
adminRouter.post('/assignments', validate(v.assign), admin.assign);
adminRouter.delete('/assignments/:id', idv, admin.unassign);
adminRouter.get('/audit-logs', validate(v.auditQuery, 'query'), admin.auditLogs);
adminRouter.post('/clubs', validate(v.clubCreate), admin.createClub);
adminRouter.patch('/clubs/:id', idv, validate(v.clubUpdate), admin.updateClub);
adminRouter.get('/club-requests', admin.clubRequests);
adminRouter.post('/club-requests/:id/approve', idv, validate(v.requestReview), admin.approveRequest);
adminRouter.post('/club-requests/:id/reject', idv, validate(v.requestReview), admin.rejectRequest);
adminRouter.get('/themes', admin.listThemes);
adminRouter.get('/themes/:id', idv, admin.getTheme);
adminRouter.post('/themes', validate(v.themeCreate), admin.createTheme);
adminRouter.patch('/themes/:id', idv, validate(v.themeUpdate), admin.updateTheme);
adminRouter.get('/settings', admin.getSettings);
adminRouter.put('/settings', validate(v.settings), admin.updateSettings);
adminRouter.get('/campuses', admin.listCampusesAdmin);
adminRouter.post('/campuses', validate(v.campusCreate), admin.createCampus);
adminRouter.patch('/campuses/:id', idv, validate(v.campusUpdate), admin.updateCampus);
// ---- admin enrolled students tab (admin can see all enrolled students) ---------------------------
adminRouter.get('/enrolled-students', admin.enrolledStudents);
adminRouter.post('/clubs/:id/delete', idv, admin.deleteClub);
adminRouter.delete('/clubs/:id', idv, admin.deleteClub);

// ---- coordinator admin-level data (coordinator sees all: admins, clubs, students, complaints) --------
router.get('/coordinator/overview', requireAuth, requireRole('coordinator', 'admin'), admin.coordinatorOverview);
router.post('/coordinator/clubs', requireAuth, requireRole('coordinator', 'admin'), portal.createClubRealtime);
router.delete('/coordinator/clubs/:id', requireAuth, requireRole('coordinator', 'admin'), idv, portal.deleteClubRealtime);
router.post('/coordinator/clubs/:id/delete', requireAuth, requireRole('coordinator', 'admin'), idv, portal.deleteClubRealtime);

// ---- announcements (Notice Board) -----------------------------------------------------------------
router.get('/announcements', optionalAuth, portal.listAnnouncements);
router.post('/announcements', requireAuth, staff, portal.createAnnouncement);

// ---- complaints (Student grievances & Staff review) -----------------------------------------------
router.get('/complaints', requireAuth, portal.listComplaints);
router.post('/complaints', requireAuth, portal.createComplaint);
router.patch('/complaints/:id', requireAuth, staff, idv, portal.updateComplaint);

// ---- calendar schedule ----------------------------------------------------------------------------
router.get('/calendar/schedule', optionalAuth, portal.getCalendarSchedule);

router.use('/admin', adminRouter);

module.exports = router;

