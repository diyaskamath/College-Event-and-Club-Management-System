'use strict';
const { z } = require('zod');
const { phoneSchema, passwordSchema, emailSchema, isoDate } = require('../utils/http');

const optStr = (max) => z.string().trim().max(max).optional().or(z.literal('').transform(() => undefined));
const bool = z.boolean();
const hex = z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Use a 6-digit hex colour like #C2185B');
const dateOnly = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD').refine((v) => !Number.isNaN(Date.parse(`${v}T00:00:00Z`)), 'Invalid date');
const intQ = (def) => z.coerce.number().int().positive().default(def);

// ---- auth -------------------------------------------------------------------------------------
const register = z.object({ name: z.string().trim().min(2).max(120), email: emailSchema, password: passwordSchema, campusId: z.coerce.number().int().positive().optional() });
const login = z.object({ email: emailSchema, password: z.string().min(1).max(200) });
const otpVerify = z.object({ challengeId: z.string().uuid('Invalid verification session'), code: z.string().trim().regex(/^\d{6}$/, 'Enter the 6-digit code') });
const otpResend = z.object({ challengeId: z.string().uuid() });

// ---- profile / preferences ---------------------------------------------------------------------
const profile = z.object({
  name: z.string().trim().min(2).max(120).optional(),
  department: optStr(120),
  yearOfStudy: z.coerce.number().int().min(1).max(8).nullable().optional(),
  bio: optStr(500),
  campusId: z.coerce.number().int().positive().nullable().optional(),
});
const preferences = z.object({
  emailEnabled: bool.optional(), smsEnabled: bool.optional(), clubActivity: bool.optional(), eventUpdates: bool.optional(),
  announcements: bool.optional(), reminders: bool.optional(), loginAlerts: bool.optional(), adminActivity: bool.optional(),
});

// ---- clubs ---------------------------------------------------------------------------------------
const clubQuery = z.object({ search: z.string().trim().max(100).optional(), category: z.string().trim().max(60).optional() });
const clubCreate = z.object({ name: z.string().trim().min(3).max(150), description: z.string().trim().min(10).max(2000), category: z.string().trim().min(2).max(60) });
const clubUpdate = z.object({ name: z.string().trim().min(3).max(150).optional(), description: z.string().trim().min(10).max(2000).optional(), category: z.string().trim().min(2).max(60).optional(), isActive: bool.optional() });
const clubRequest = clubCreate.extend({ justification: optStr(1000) });
const requestReview = z.object({ note: optStr(500) });
const announcement = z.object({ title: z.string().trim().min(3).max(200), body: z.string().trim().min(3).max(3000) });

// ---- events --------------------------------------------------------------------------------------
const EVENT_KINDS = ['regular', 'festival'];
const eventQuery = z.object({
  search: z.string().trim().max(100).optional(), category: z.string().trim().max(60).optional(), campusId: z.coerce.number().int().positive().optional(),
  kind: z.enum(EVENT_KINDS).optional(), clubId: z.coerce.number().int().positive().optional(),
  when: z.enum(['upcoming', 'completed', 'cancelled', 'all', 'draft']).optional(), scope: z.enum(['public', 'manage']).optional(),
  limit: z.coerce.number().int().min(1).max(200).optional(),
});
const eventBase = {
  title: z.string().trim().min(3).max(200),
  description: z.string().trim().min(10).max(5000),
  category: z.string().trim().min(2).max(60),
  eventType: optStr(60),
  organizerName: optStr(190),
  campusId: z.coerce.number().int().positive().optional(),
  academicBlock: optStr(150),
  venue: optStr(190),
  venuePlaceholder: bool.optional(),
  startsAt: isoDate, endsAt: isoDate, registrationDeadline: isoDate,
  capacity: z.coerce.number().int().min(1).max(100000),
  waitlistEnabled: bool.optional(), requiresApproval: bool.optional(),
};
const eventCreate = z.object({ ...eventBase, clubId: z.coerce.number().int().positive().optional(), kind: z.enum(EVENT_KINDS).optional(), festivalThemeId: z.coerce.number().int().positive().nullable().optional() });
const eventUpdate = z.object(Object.fromEntries(Object.entries(eventBase).map(([k, v]) => [k, v.optional()]))).extend({
  kind: z.enum(EVENT_KINDS).optional(), festivalThemeId: z.coerce.number().int().positive().nullable().optional(), isDemo: bool.optional(),
});
const transition = z.object({ to: z.enum(['draft', 'published', 'registration_closed', 'ongoing', 'completed', 'cancelled']), reason: optStr(500) });
const regReview = z.object({ action: z.enum(['approve', 'reject']) });
const attendance = z.object({ entries: z.array(z.object({ userId: z.coerce.number().int().positive(), status: z.enum(['present', 'absent']) })).min(1).max(1000) });
const feedback = z.object({ rating: z.coerce.number().int().min(1).max(5), comments: optStr(1000) });
const regQuery = z.object({ status: z.enum(['pending', 'confirmed', 'waitlisted', 'cancelled', 'rejected']).optional() });

// ---- notifications ---------------------------------------------------------------------------------
const notifQuery = z.object({ limit: z.coerce.number().int().min(1).max(100).default(20), offset: z.coerce.number().int().min(0).default(0), unread: z.enum(['true', 'false']).optional() });

// ---- themes ------------------------------------------------------------------------------------------
const themeConfig = z.object({
  colors: z.object({ primary: hex, accent: hex, background: hex, surface: hex, text: hex, heroFrom: hex, heroTo: hex }).partial().optional(),
  banner: z.object({ headline: z.string().trim().max(120), subtext: z.string().trim().max(240) }).partial().optional(),
  decoration: z.enum(['diya', 'marigold', 'none']).optional(),
  glow: z.coerce.number().min(0).max(1).optional(),
});
const themeCreate = z.object({
  slug: z.string().trim().toLowerCase().regex(/^[a-z0-9-]{2,60}$/, 'Lowercase letters, numbers and dashes only'),
  name: z.string().trim().min(2).max(120), description: optStr(300),
  campusId: z.coerce.number().int().positive().nullable().optional(),
  startDate: dateOnly, endDate: dateOnly, isEnabled: bool.default(true), priority: z.coerce.number().int().min(-100).max(100).default(0),
  config: themeConfig,
}).refine((v) => v.endDate >= v.startDate, { message: 'End date must be on or after the start date', path: ['endDate'] });
const themeUpdate = z.object({
  name: z.string().trim().min(2).max(120).optional(), description: optStr(300),
  campusId: z.coerce.number().int().positive().nullable().optional(),
  startDate: dateOnly.optional(), endDate: dateOnly.optional(), isEnabled: bool.optional(), priority: z.coerce.number().int().min(-100).max(100).optional(),
  config: themeConfig.optional(),
});
const themeActiveQuery = z.object({ campus: z.string().trim().max(60).optional(), campusId: z.coerce.number().int().positive().optional(), date: dateOnly.optional() });

// ---- admin -----------------------------------------------------------------------------------------------
const userQuery = z.object({ search: z.string().trim().max(100).optional(), role: z.enum(['student', 'coordinator', 'admin']).optional(), status: z.enum(['pending', 'active', 'suspended']).optional(), page: intQ(1), pageSize: z.coerce.number().int().min(1).max(100).default(20) });
const userCreate = z.object({ name: z.string().trim().min(2).max(120), email: emailSchema, phone: phoneSchema.optional(), password: passwordSchema, role: z.enum(['student', 'coordinator', 'admin']) });
const userUpdate = z.object({ role: z.enum(['student', 'coordinator', 'admin']).optional(), status: z.enum(['active', 'suspended']).optional(), phone: phoneSchema.optional(), name: z.string().trim().min(2).max(120).optional() });
const assign = z.object({ userId: z.coerce.number().int().positive(), clubId: z.coerce.number().int().positive() });
const auditQuery = z.object({ page: intQ(1), pageSize: z.coerce.number().int().min(1).max(100).default(25), action: z.string().trim().max(80).optional(), actorId: z.coerce.number().int().positive().optional() });
const settings = z.object({
  student_email_domains: z.string().trim().max(500).regex(/^[a-z0-9.-]+(,\s*[a-z0-9.-]+)*$/i, 'Comma-separated domains, e.g. cb.students.amrita.edu').optional(),
  require_student_login_otp: z.enum(['true', 'false']).optional(),
  reminder_hours: z.coerce.number().int().min(1).max(168).transform(String).optional(),
});
const campusCreate = z.object({ slug: z.string().trim().toLowerCase().regex(/^[a-z0-9-]{2,60}$/), name: z.string().trim().min(2).max(120), city: optStr(120), timezone: z.string().trim().min(3).max(60).default('Asia/Kolkata') });
const campusUpdate = z.object({ name: z.string().trim().min(2).max(120).optional(), city: optStr(120), timezone: z.string().trim().min(3).max(60).optional(), isActive: bool.optional() });

module.exports = {
  register, login, otpVerify, otpResend, profile, preferences, clubQuery, clubCreate, clubUpdate, clubRequest, requestReview, announcement,
  eventQuery, eventCreate, eventUpdate, transition, regReview, attendance, feedback, regQuery, notifQuery,
  themeCreate, themeUpdate, themeActiveQuery, userQuery, userCreate, userUpdate, assign, auditQuery, settings, campusCreate, campusUpdate,
};
