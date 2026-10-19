'use strict';
/** Row -> API shape mappers. Never include password hashes, OTP data or secrets. */
const { parseJson } = require('../db');

const mapUser = (r) => ({
  id: r.id,
  name: r.name,
  email: r.email,
  phone: r.phone || null,
  adminId: r.admin_id || null,
  role: r.role,
  status: r.status,
  campusId: r.campus_id,
  department: r.department,
  yearOfStudy: r.year_of_study,
  bio: r.bio,
  emailVerified: !!r.email_verified_at,
  lastLoginAt: r.last_login_at,
  createdAt: r.created_at,
});

const mapClub = (r) => ({
  id: r.id,
  slug: r.slug,
  name: r.name,
  description: r.description,
  category: r.category,
  campusId: r.campus_id,
  isActive: !!r.is_active,
  isDemo: !!r.is_demo,
  memberCount: r.member_count === undefined ? undefined : Number(r.member_count),
  upcomingEventCount: r.upcoming_event_count === undefined ? undefined : Number(r.upcoming_event_count),
  myMembership: r.my_membership_status === undefined ? undefined : r.my_membership_status === 'active',
});

const mapTheme = (r) => ({
  id: r.id,
  slug: r.slug,
  name: r.name,
  description: r.description,
  campusId: r.campus_id,
  startDate: r.start_date,
  endDate: r.end_date,
  isEnabled: !!r.is_enabled,
  priority: r.priority,
  config: parseJson(r.config, {}),
  isDemo: !!r.is_demo,
});

const mapEvent = (r, now = new Date()) => {
  const occupied = Number(r.occupied || 0);
  const waitlistCount = Number(r.waitlist_count || 0);
  const seatsLeft = Math.max(0, r.capacity - occupied);
  const deadline = new Date(r.registration_deadline);
  let registrationState;
  if (r.status === 'cancelled') registrationState = 'cancelled';
  else if (r.status === 'completed') registrationState = 'completed';
  else if (r.status === 'draft') registrationState = 'draft';
  else if (r.status !== 'published' || now >= deadline) registrationState = r.status === 'ongoing' ? 'ongoing' : 'closed';
  else if (seatsLeft > 0) registrationState = 'open';
  else registrationState = r.waitlist_enabled ? 'waitlist' : 'full';

  const mine = r.my_reg_id
    ? { id: r.my_reg_id, status: r.my_reg_status, cycle: r.my_reg_cycle, waitlistPosition: r.my_waitlist_position ? Number(r.my_waitlist_position) : null }
    : null;

  return {
    id: r.id,
    slug: r.slug,
    title: r.title,
    description: r.description,
    kind: r.kind,
    category: r.category,
    eventType: r.event_type,
    club: r.club_id ? { id: r.club_id, slug: r.club_slug, name: r.club_name } : null,
    organizerName: r.organizer_name,
    campus: { id: r.campus_id, name: r.campus_name, slug: r.campus_slug, timezone: r.campus_timezone },
    academicBlock: r.academic_block,
    venue: r.venue,
    venuePlaceholder: !!r.venue_is_placeholder,
    startsAt: r.starts_at,
    endsAt: r.ends_at,
    registrationDeadline: r.registration_deadline,
    capacity: r.capacity,
    registeredCount: occupied,
    seatsLeft,
    waitlistCount,
    waitlistEnabled: !!r.waitlist_enabled,
    requiresApproval: !!r.requires_approval,
    status: r.status,
    cancelReason: r.cancel_reason,
    registrationState,
    isDemo: !!r.is_demo,
    theme: r.theme_slug ? { slug: r.theme_slug, name: r.theme_name } : null,
    version: r.version,
    myRegistration: mine,
    isSaved: r.is_saved === undefined ? undefined : !!r.is_saved,
  };
};

module.exports = { mapUser, mapClub, mapTheme, mapEvent };
