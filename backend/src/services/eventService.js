'use strict';
/**
 * Events: browsing, management, lifecycle, registration (transactional), attendance, feedback, reports.
 * Lifecycle (state machine): draft -> published -> registration_closed -> ongoing -> completed, plus cancelled.
 */
const { query, withTransaction, likeEscape } = require('../db');
const notifications = require('./notificationService');
const lifecycle = require('./lifecycleService');
const { mapEvent } = require('./mappers');
const { assignedClubIds, canManageEvent, assertCanManageEvent, assertCanManageClub } = require('./permissions');
const { audit } = require('../utils/audit');
const { notFound, conflict, forbidden, badRequest } = require('../utils/errors');

const PUBLIC_STATUSES = ['published', 'registration_closed', 'ongoing', 'completed', 'cancelled'];
const UPCOMING_STATUSES = ['published', 'registration_closed', 'ongoing'];
const ACTIVE_REG = ['confirmed', 'pending', 'waitlisted'];

const TRANSITIONS = {
  draft: ['published', 'cancelled'],
  published: ['registration_closed', 'ongoing', 'cancelled'],
  registration_closed: ['published', 'ongoing', 'cancelled'],
  ongoing: ['completed', 'cancelled'],
  completed: [],
  cancelled: [],
};

const slugify = (s) => s.toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 110);

function eventSelect(userId) {
  return `
  SELECT e.*, cl.slug AS club_slug, cl.name AS club_name, ca.name AS campus_name, ca.slug AS campus_slug, ca.timezone AS campus_timezone,
    ft.slug AS theme_slug, ft.name AS theme_name,
    (SELECT COUNT(*) FROM event_registrations r WHERE r.event_id=e.id AND r.status IN ('confirmed','pending')) AS occupied,
    (SELECT COUNT(*) FROM event_registrations r WHERE r.event_id=e.id AND r.status='waitlisted') AS waitlist_count
    ${userId ? `,
    mr.id AS my_reg_id, mr.status AS my_reg_status, mr.cycle AS my_reg_cycle,
    (CASE WHEN mr.status='waitlisted' THEN (SELECT COUNT(*) FROM event_registrations w WHERE w.event_id=e.id AND w.status='waitlisted'
        AND (w.waitlisted_at < mr.waitlisted_at OR (w.waitlisted_at = mr.waitlisted_at AND w.id <= mr.id))) END) AS my_waitlist_position,
    (SELECT COUNT(*) FROM saved_events s WHERE s.user_id=? AND s.event_id=e.id) AS is_saved` : ''}
  FROM events e
  LEFT JOIN clubs cl ON cl.id=e.club_id
  JOIN campuses ca ON ca.id=e.campus_id
  LEFT JOIN festival_themes ft ON ft.id=e.festival_theme_id
  ${userId ? 'LEFT JOIN event_registrations mr ON mr.event_id=e.id AND mr.user_id=?' : ''}`;
}

async function fetchEvents(where, params, user, { order = 'e.starts_at ASC', limit = 200 } = {}) {
  const uid = user ? user.id : null;
  const sql = `${eventSelect(uid)} WHERE ${where.length ? where.join(' AND ') : '1=1'} ORDER BY ${order} LIMIT ?`;
  const rows = await query(sql, [...(uid ? [uid, uid] : []), ...params, limit]);
  const now = new Date();
  return rows.map((r) => mapEvent(r, now));
}

async function getRow(idOrSlug, conn = null) {
  const isId = /^\d+$/.test(String(idOrSlug));
  const rows = await query(`SELECT * FROM events WHERE ${isId ? 'id' : 'slug'}=?`, [idOrSlug], conn);
  if (!rows.length) throw notFound('Event not found.', 'event_not_found');
  return rows[0];
}

// ---- browsing -------------------------------------------------------------------------------
async function list(filters, user) {
  await lifecycle.ensureFresh();
  const where = [];
  const params = [];
  const manage = filters.scope === 'manage';

  if (manage) {
    if (!user || !['coordinator', 'admin'].includes(user.role)) throw forbidden();
    const ids = await assignedClubIds(user);
    if (ids !== null) {
      if (!ids.length) return [];
      where.push(`e.club_id IN (${ids.map(() => '?').join(',')})`);
      params.push(...ids);
    }
  }

  const when = filters.when || 'upcoming';
  if (when === 'upcoming') {
    where.push(`e.status IN (${UPCOMING_STATUSES.map(() => '?').join(',')})`);
    params.push(...UPCOMING_STATUSES);
  } else if (when === 'completed') {
    where.push("e.status='completed'");
  } else if (when === 'cancelled') {
    where.push("e.status='cancelled'");
  } else if (!manage) {
    where.push(`e.status IN (${PUBLIC_STATUSES.map(() => '?').join(',')})`);
    params.push(...PUBLIC_STATUSES);
  }
  if (!manage && when === 'draft') throw forbidden();
  if (manage && when === 'draft') where.push("e.status='draft'");

  if (filters.search) {
    const like = `%${likeEscape(filters.search)}%`;
    where.push('(e.title LIKE ? OR e.description LIKE ? OR e.organizer_name LIKE ? OR e.venue LIKE ? OR cl.name LIKE ?)');
    params.push(like, like, like, like, like);
  }
  if (filters.category) {
    where.push('e.category=?');
    params.push(filters.category);
  }
  if (filters.campusId) {
    where.push('e.campus_id=?');
    params.push(filters.campusId);
  }
  if (filters.kind) {
    where.push('e.kind=?');
    params.push(filters.kind);
  }
  if (filters.clubId) {
    where.push('e.club_id=?');
    params.push(filters.clubId);
  }
  return fetchEvents(where, params, user, { order: when === 'completed' ? 'e.starts_at DESC' : 'e.starts_at ASC', limit: filters.limit || 200 });
}

async function categories() {
  const rows = await query("SELECT DISTINCT category FROM events WHERE status <> 'draft' ORDER BY category");
  return rows.map((r) => r.category);
}

async function detail(idOrSlug, user) {
  await lifecycle.ensureFresh();
  const row = await getRow(idOrSlug);
  const manager = user ? await canManageEvent(user, row) : false;
  if (row.status === 'draft' && !manager) throw notFound('Event not found.', 'event_not_found');
  const [event] = await fetchEvents(['e.id=?'], [row.id], user, { limit: 1 });
  const announcements = await query(
    `SELECT a.id, a.title, a.body, a.created_at, u.name AS author_name FROM announcements a LEFT JOIN users u ON u.id=a.author_id
     WHERE a.event_id=? ORDER BY a.created_at DESC, a.id DESC LIMIT 20`,
    [row.id],
  );
  let myAttendance = null;
  let myFeedback = null;
  if (user) {
    const a = await query('SELECT status FROM attendance WHERE event_id=? AND user_id=?', [row.id, user.id]);
    myAttendance = a.length ? a[0].status : null;
    const f = await query('SELECT rating, comments, created_at FROM feedback WHERE event_id=? AND user_id=?', [row.id, user.id]);
    myFeedback = f.length ? { rating: f[0].rating, comments: f[0].comments, createdAt: f[0].created_at } : null;
  }
  return {
    ...event,
    announcements: announcements.map((a) => ({ id: a.id, title: a.title, body: a.body, createdAt: a.created_at, authorName: a.author_name })),
    canManage: manager,
    myAttendance,
    myFeedback,
    feedbackEligible: !!user && row.status === 'completed' && myAttendance === 'present' && !myFeedback,
    allowedTransitions: manager ? TRANSITIONS[row.status] : [],
  };
}

// ---- create / update -----------------------------------------------------------------------
function checkSchedule({ startsAt, endsAt, registrationDeadline }) {
  if (endsAt <= startsAt) throw badRequest('invalid_schedule', 'The end time must be after the start time.');
  if (registrationDeadline > startsAt) throw badRequest('invalid_deadline', 'The registration deadline must be on or before the start time.');
}

async function uniqueSlug(base) {
  let slug = base || 'event';
  let i = 1;
  while ((await query('SELECT 1 FROM events WHERE slug=?', [slug])).length) {
    i += 1;
    slug = `${base}-${i}`;
  }
  return slug;
}

async function create(user, input) {
  if (input.kind === 'festival' || input.festivalThemeId) {
    if (user.role !== 'admin') throw forbidden('Only Admins can create festival events.', 'admin_only');
  }
  let club = null;
  if (input.clubId) {
    club = (await query('SELECT * FROM clubs WHERE id=? AND is_active=1', [input.clubId]))[0];
    if (!club) throw notFound('Club not found.', 'club_not_found');
    await assertCanManageClub(user, input.clubId);
  } else if (user.role !== 'admin') {
    throw forbidden('Coordinators must create events for one of their assigned clubs.', 'club_required');
  }
  const campusId = input.campusId || (await query('SELECT id FROM campuses WHERE is_active=1 ORDER BY id LIMIT 1'))[0]?.id;
  if (!campusId || !(await query('SELECT 1 FROM campuses WHERE id=? AND is_active=1', [campusId])).length) throw badRequest('invalid_campus', 'Choose a valid campus.');
  if (input.festivalThemeId && !(await query('SELECT 1 FROM festival_themes WHERE id=?', [input.festivalThemeId])).length) throw badRequest('invalid_theme', 'Unknown festival theme.');
  checkSchedule(input);
  if (input.endsAt <= new Date()) throw badRequest('invalid_schedule', 'Event must end in the future.');

  const slug = await uniqueSlug(slugify(input.title));
  const res = await query(
    `INSERT INTO events (slug,title,description,kind,category,event_type,club_id,organizer_name,campus_id,academic_block,venue,venue_is_placeholder,
       starts_at,ends_at,registration_deadline,capacity,waitlist_enabled,requires_approval,status,festival_theme_id,is_demo,created_by)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,'draft',?,0,?)`,
    [
      slug, input.title, input.description, input.kind || 'regular', input.category, input.eventType || null, input.clubId || null,
      input.organizerName || (club ? club.name : 'Amrita Connect'), campusId, input.academicBlock || null, input.venue || null,
      input.venuePlaceholder ? 1 : 0, input.startsAt, input.endsAt, input.registrationDeadline, input.capacity,
      input.waitlistEnabled === false ? 0 : 1, input.requiresApproval ? 1 : 0, input.festivalThemeId || null, user.id,
    ],
  );
  await audit(user.id, 'event.create', { entityType: 'event', entityId: res.insertId, metadata: { title: input.title } });
  return detail(res.insertId, user);
}

const FIELD_MAP = {
  title: 'title', description: 'description', category: 'category', eventType: 'event_type', organizerName: 'organizer_name',
  campusId: 'campus_id', academicBlock: 'academic_block', venue: 'venue', startsAt: 'starts_at', endsAt: 'ends_at',
  registrationDeadline: 'registration_deadline', capacity: 'capacity', waitlistEnabled: 'waitlist_enabled', requiresApproval: 'requires_approval',
};
const CHANGE_NOTIFY_FIELDS = ['title', 'campusId', 'academicBlock', 'venue', 'startsAt', 'endsAt', 'registrationDeadline'];

async function update(user, eventId, input) {
  const result = await withTransaction(async (tx) => {
    const ev = (await tx.q('SELECT * FROM events WHERE id=? FOR UPDATE', [eventId]))[0];
    if (!ev) throw notFound('Event not found.', 'event_not_found');
    await assertCanManageEvent(user, ev);
    if (['completed', 'cancelled'].includes(ev.status)) throw conflict('event_locked', `A ${ev.status} event can no longer be edited.`);
    if ((input.kind !== undefined || input.festivalThemeId !== undefined) && user.role !== 'admin') throw forbidden('Only Admins can change festival settings.', 'admin_only');

    const merged = {
      startsAt: input.startsAt || new Date(ev.starts_at),
      endsAt: input.endsAt || new Date(ev.ends_at),
      registrationDeadline: input.registrationDeadline || new Date(ev.registration_deadline),
    };
    checkSchedule(merged);

    if (input.capacity !== undefined) {
      const occ = (await tx.q("SELECT COUNT(*) c FROM event_registrations WHERE event_id=? AND status IN ('confirmed','pending')", [eventId]))[0].c;
      if (input.capacity < occ) throw conflict('capacity_below_registrations', `Capacity cannot be lower than the ${occ} current registrations.`);
    }
    if (input.campusId && !(await tx.q('SELECT 1 FROM campuses WHERE id=? AND is_active=1', [input.campusId])).length) throw badRequest('invalid_campus', 'Choose a valid campus.');

    const sets = [];
    const params = [];
    const changed = [];
    for (const [k, col] of Object.entries(FIELD_MAP)) {
      if (input[k] === undefined) continue;
      let v = input[k];
      if (typeof v === 'boolean') v = v ? 1 : 0;
      sets.push(`${col}=?`);
      params.push(v);
      changed.push(k);
    }
    if (input.venuePlaceholder !== undefined) {
      sets.push('venue_is_placeholder=?');
      params.push(input.venuePlaceholder ? 1 : 0);
    } else if (input.venue !== undefined || input.academicBlock !== undefined) {
      sets.push('venue_is_placeholder=0'); // admin/coordinator-entered venue supersedes the placeholder
    }
    if (input.kind !== undefined) { sets.push('kind=?'); params.push(input.kind); }
    if (input.festivalThemeId !== undefined) { sets.push('festival_theme_id=?'); params.push(input.festivalThemeId); }
    if (input.isDemo !== undefined) {
      if (user.role !== 'admin') throw forbidden('Only Admins can change the demo-data flag.', 'admin_only');
      sets.push('is_demo=?');
      params.push(input.isDemo ? 1 : 0);
    }
    if (!sets.length) throw badRequest('nothing_to_update', 'No changes supplied.');
    sets.push('version=version+1');
    await tx.q(`UPDATE events SET ${sets.join(', ')} WHERE id=?`, [...params, eventId]);

    const version = ev.version + 1;
    const notifyWorthy = changed.some((f) => CHANGE_NOTIFY_FIELDS.includes(f));
    if (notifyWorthy && ['published', 'registration_closed', 'ongoing'].includes(ev.status)) {
      const regs = await tx.q("SELECT user_id FROM event_registrations WHERE event_id=? AND status IN ('confirmed','pending','waitlisted')", [eventId]);
      const fieldsText = changed.filter((f) => CHANGE_NOTIFY_FIELDS.includes(f)).join(', ');
      for (const r of regs) {
        await notifications.notify(tx, {
          userId: r.user_id,
          type: 'event_changed',
          category: 'event_updates',
          title: `Event updated: ${input.title || ev.title}`,
          body: `Details changed (${fieldsText}). Please review the latest schedule and venue.`,
          link: `/events/${ev.slug}`,
          dedupeKey: `event_update:${eventId}:${version}`,
        });
      }
    }
    if (input.capacity !== undefined && ['published', 'registration_closed'].includes(ev.status)) {
      await promoteWaitlist(tx, { ...ev, capacity: input.capacity });
    }
    await audit(user.id, 'event.update', { entityType: 'event', entityId: eventId, metadata: { fields: changed } });
    return true;
  });
  return result && detail(eventId, user);
}

async function transition(user, eventId, { to, reason }) {
  await withTransaction(async (tx) => {
    const ev = (await tx.q('SELECT * FROM events WHERE id=? FOR UPDATE', [eventId]))[0];
    if (!ev) throw notFound('Event not found.', 'event_not_found');
    await assertCanManageEvent(user, ev);
    if (!TRANSITIONS[ev.status].includes(to)) {
      throw conflict('invalid_transition', `An event cannot move from "${ev.status}" to "${to}". Allowed: ${TRANSITIONS[ev.status].join(', ') || 'none'}.`);
    }
    const now = new Date();
    if (to === 'published') {
      if (new Date(ev.ends_at) <= now) throw badRequest('invalid_schedule', 'Cannot publish an event that has already ended.');
      if (new Date(ev.registration_deadline) <= now) throw badRequest('deadline_passed', 'Update the registration deadline to a future time before (re)opening registration.');
      if (new Date(ev.starts_at) <= now) throw badRequest('invalid_schedule', 'Update the schedule: the start time has already passed.');
    }
    await tx.q('UPDATE events SET status=?, cancel_reason=?, version=version+1 WHERE id=?', [to, to === 'cancelled' ? reason || null : ev.cancel_reason, eventId]);

    if (to === 'cancelled') {
      const regs = await tx.q("SELECT user_id FROM event_registrations WHERE event_id=? AND status IN ('confirmed','pending','waitlisted')", [eventId]);
      for (const r of regs) {
        await notifications.notify(tx, {
          userId: r.user_id,
          type: 'event_cancelled',
          category: 'event_updates',
          transactional: true,
          title: `Event cancelled: ${ev.title}`,
          body: reason ? `The organizers cancelled this event. Reason: ${reason}` : 'The organizers cancelled this event.',
          link: `/events/${ev.slug}`,
          dedupeKey: `event_cancelled:${eventId}`,
        });
      }
    }
    if (to === 'published' && ev.status === 'registration_closed') await promoteWaitlist(tx, ev);
    await audit(user.id, `event.${to}`, { entityType: 'event', entityId: eventId, metadata: { from: ev.status, reason: reason || undefined } });
  });
  return detail(eventId, user);
}

// ---- registration ---------------------------------------------------------------------------
async function promoteWaitlist(tx, ev) {
  const promoted = [];
  for (;;) {
    const occ = (await tx.q("SELECT COUNT(*) c FROM event_registrations WHERE event_id=? AND status IN ('confirmed','pending')", [ev.id]))[0].c;
    if (occ >= ev.capacity) break;
    const w = (await tx.q("SELECT * FROM event_registrations WHERE event_id=? AND status='waitlisted' ORDER BY waitlisted_at ASC, id ASC LIMIT 1 FOR UPDATE", [ev.id]))[0];
    if (!w) break;
    const status = ev.requires_approval ? 'pending' : 'confirmed';
    await tx.q('UPDATE event_registrations SET status=?, waitlisted_at=NULL WHERE id=?', [status, w.id]);
    await notifications.notify(tx, {
      userId: w.user_id,
      type: 'registration_promoted',
      category: 'event_updates',
      transactional: true,
      title: `You're in: ${ev.title}`,
      body: status === 'confirmed' ? 'A seat opened up and your waitlisted registration is now confirmed.' : 'A seat opened up. Your registration now awaits coordinator approval.',
      link: `/events/${ev.slug}`,
      dedupeKey: `reg_promoted:${w.id}:${w.cycle}`,
    });
    promoted.push(w.user_id);
  }
  return promoted;
}

async function register(user, eventId) {
  if (user.role !== 'student') throw forbidden('Only students can register for events.', 'students_only');
  const outcome = await withTransaction(async (tx) => {
    // Lock the event row: serialises concurrent registrations for the same event (capacity safety).
    const ev = (await tx.q('SELECT * FROM events WHERE id=? FOR UPDATE', [eventId]))[0];
    if (!ev) throw notFound('Event not found.', 'event_not_found');
    const now = new Date();
    if (ev.status === 'draft') throw notFound('Event not found.', 'event_not_found');
    if (ev.status === 'cancelled') throw conflict('event_cancelled', 'This event has been cancelled.');
    if (ev.status !== 'published') throw conflict('registration_closed', 'Registration is closed for this event.');
    if (now >= new Date(ev.registration_deadline)) throw conflict('deadline_passed', 'The registration deadline has passed.');

    const existing = (await tx.q('SELECT * FROM event_registrations WHERE event_id=? AND user_id=? FOR UPDATE', [eventId, user.id]))[0];
    if (existing && ACTIVE_REG.includes(existing.status)) throw conflict('already_registered', 'You are already registered for this event.');
    if (existing && existing.status === 'rejected') throw conflict('registration_rejected', 'Your registration for this event was declined by the organizers.');

    const occupied = (await tx.q("SELECT COUNT(*) c FROM event_registrations WHERE event_id=? AND status IN ('confirmed','pending')", [eventId]))[0].c;
    let status = ev.requires_approval ? 'pending' : 'confirmed';
    if (occupied >= ev.capacity) {
      if (!ev.waitlist_enabled) throw conflict('event_full', 'This event is full.');
      status = 'waitlisted';
    }
    let regId;
    let cycle;
    if (existing) {
      cycle = existing.cycle + 1;
      regId = existing.id;
      await tx.q('UPDATE event_registrations SET status=?, cycle=?, registered_at=UTC_TIMESTAMP(), waitlisted_at=?, cancelled_at=NULL WHERE id=?', [status, cycle, status === 'waitlisted' ? new Date() : null, regId]);
    } else {
      cycle = 1;
      try {
        const res = await tx.q('INSERT INTO event_registrations (event_id,user_id,status,waitlisted_at) VALUES (?,?,?,?)', [eventId, user.id, status, status === 'waitlisted' ? new Date() : null]);
        regId = res.insertId;
      } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') throw conflict('already_registered', 'You are already registered for this event.');
        throw err;
      }
    }

    const copy = {
      confirmed: ['registration_confirmed', `Registration confirmed: ${ev.title}`, `You're registered for ${ev.title}. Keep an eye on updates from the organizers.`],
      pending: ['registration_pending', `Registration received: ${ev.title}`, 'Your registration is awaiting approval from the coordinator. You will be notified once it is reviewed.'],
      waitlisted: ['registration_waitlisted', `Waitlisted: ${ev.title}`, 'The event is full, so you have been added to the waitlist. You will be notified automatically if a seat opens up.'],
    }[status];
    await notifications.notify(tx, {
      userId: user.id,
      type: copy[0],
      category: 'event_updates',
      transactional: true,
      title: copy[1],
      body: copy[2],
      link: `/events/${ev.slug}`,
      dedupeKey: `reg:${regId}:${cycle}:${status}`,
    });
    return { registrationId: regId, status, eventId };
  });
  const [event] = await fetchEvents(['e.id=?'], [eventId], user, { limit: 1 });
  return { ...outcome, event };
}

async function cancelRegistration(user, eventId) {
  await withTransaction(async (tx) => {
    const ev = (await tx.q('SELECT * FROM events WHERE id=? FOR UPDATE', [eventId]))[0];
    if (!ev) throw notFound('Event not found.', 'event_not_found');
    const reg = (await tx.q('SELECT * FROM event_registrations WHERE event_id=? AND user_id=? FOR UPDATE', [eventId, user.id]))[0];
    if (!reg || !ACTIVE_REG.includes(reg.status)) throw conflict('not_registered', 'You do not have an active registration for this event.');
    if (!['published', 'registration_closed'].includes(ev.status) || new Date() >= new Date(ev.starts_at)) {
      throw conflict('cancellation_not_permitted', 'Registrations can no longer be cancelled for this event.');
    }
    const heldSeat = reg.status === 'confirmed' || reg.status === 'pending';
    await tx.q("UPDATE event_registrations SET status='cancelled', cancelled_at=UTC_TIMESTAMP(), waitlisted_at=NULL WHERE id=?", [reg.id]);
    await notifications.notify(tx, {
      userId: user.id,
      type: 'registration_cancelled',
      category: 'event_updates',
      transactional: true,
      title: `Registration cancelled: ${ev.title}`,
      body: 'Your registration was cancelled. You can register again while registration is open.',
      link: `/events/${ev.slug}`,
      dedupeKey: `reg_cancel:${reg.id}:${reg.cycle}`,
    });
    if (heldSeat) await promoteWaitlist(tx, ev);
  });
  const [event] = await fetchEvents(['e.id=?'], [eventId], user, { limit: 1 });
  return { cancelled: true, event };
}

// ---- manager views -------------------------------------------------------------------------
async function registrations(user, eventId, { status } = {}) {
  const ev = await getRow(eventId);
  await assertCanManageEvent(user, ev);
  const rows = await query(
    `SELECT r.id, r.status, r.registered_at, r.waitlisted_at, u.id AS user_id, u.name, u.email, u.department, u.year_of_study, a.status AS attendance
     FROM event_registrations r JOIN users u ON u.id=r.user_id LEFT JOIN attendance a ON a.event_id=r.event_id AND a.user_id=r.user_id
     WHERE r.event_id=? ${status ? 'AND r.status=?' : ''}
     ORDER BY FIELD(r.status,'pending','confirmed','waitlisted','rejected','cancelled'), r.registered_at ASC`,
    status ? [eventId, status] : [eventId],
  );
  return rows.map((r) => ({
    id: r.id, status: r.status, registeredAt: r.registered_at, attendance: r.attendance,
    user: { id: r.user_id, name: r.name, email: r.email, department: r.department, yearOfStudy: r.year_of_study },
  }));
}

async function reviewRegistration(user, eventId, regId, action) {
  await withTransaction(async (tx) => {
    const ev = (await tx.q('SELECT * FROM events WHERE id=? FOR UPDATE', [eventId]))[0];
    if (!ev) throw notFound('Event not found.', 'event_not_found');
    await assertCanManageEvent(user, ev);
    const reg = (await tx.q('SELECT * FROM event_registrations WHERE id=? AND event_id=? FOR UPDATE', [regId, eventId]))[0];
    if (!reg) throw notFound('Registration not found.', 'registration_not_found');
    if (reg.status !== 'pending') throw conflict('not_pending', 'Only pending registrations can be approved or rejected.');
    if (['completed', 'cancelled'].includes(ev.status)) throw conflict('event_locked', 'This event is closed.');
    const approve = action === 'approve';
    await tx.q('UPDATE event_registrations SET status=? WHERE id=?', [approve ? 'confirmed' : 'rejected', regId]);
    await notifications.notify(tx, {
      userId: reg.user_id,
      type: approve ? 'registration_approved' : 'registration_rejected',
      category: 'event_updates',
      transactional: true,
      title: approve ? `Registration approved: ${ev.title}` : `Registration declined: ${ev.title}`,
      body: approve ? 'The coordinator approved your registration. See you there!' : 'The coordinator was unable to approve your registration.',
      link: `/events/${ev.slug}`,
      dedupeKey: `reg_review:${regId}:${reg.cycle}`,
    });
    if (!approve && ['published', 'registration_closed'].includes(ev.status)) await promoteWaitlist(tx, ev);
    await audit(user.id, `registration.${action}`, { entityType: 'event_registration', entityId: regId, metadata: { eventId } });
  });
  return { id: regId, status: action === 'approve' ? 'confirmed' : 'rejected' };
}

async function attendanceList(user, eventId) {
  const ev = await getRow(eventId);
  await assertCanManageEvent(user, ev);
  const rows = await query(
    `SELECT u.id AS user_id, u.name, u.email, a.status AS attendance FROM event_registrations r JOIN users u ON u.id=r.user_id
     LEFT JOIN attendance a ON a.event_id=r.event_id AND a.user_id=r.user_id WHERE r.event_id=? AND r.status='confirmed' ORDER BY u.name`,
    [eventId],
  );
  return { eventStatus: ev.status, attendanceOpen: ['ongoing', 'completed'].includes(ev.status), attendees: rows.map((r) => ({ userId: r.user_id, name: r.name, email: r.email, attendance: r.attendance })) };
}

async function recordAttendance(user, eventId, entries) {
  return withTransaction(async (tx) => {
    const ev = (await tx.q('SELECT * FROM events WHERE id=? FOR UPDATE', [eventId]))[0];
    if (!ev) throw notFound('Event not found.', 'event_not_found');
    await assertCanManageEvent(user, ev);
    if (!['ongoing', 'completed'].includes(ev.status)) throw conflict('attendance_not_open', 'Attendance can only be recorded once the event is ongoing or completed.');
    let saved = 0;
    for (const e of entries) {
      const reg = (await tx.q("SELECT id FROM event_registrations WHERE event_id=? AND user_id=? AND status='confirmed'", [eventId, e.userId]))[0];
      if (!reg) throw badRequest('not_a_confirmed_attendee', `User ${e.userId} does not have a confirmed registration for this event.`);
      await tx.q(
        'INSERT INTO attendance (event_id,user_id,status,marked_by) VALUES (?,?,?,?) ON DUPLICATE KEY UPDATE status=VALUES(status), marked_by=VALUES(marked_by), marked_at=UTC_TIMESTAMP()',
        [eventId, e.userId, e.status, user.id],
      );
      saved += 1;
    }
    await audit(user.id, 'attendance.record', { entityType: 'event', entityId: eventId, metadata: { count: saved } });
    return { saved };
  });
}

async function submitFeedback(user, eventId, { rating, comments }) {
  const ev = await getRow(eventId);
  if (ev.status !== 'completed') throw conflict('feedback_not_open', 'Feedback opens once the event is completed.');
  const att = await query("SELECT 1 FROM attendance WHERE event_id=? AND user_id=? AND status='present'", [eventId, user.id]);
  if (!att.length) throw forbidden('Feedback is available to students whose attendance was recorded for this event.', 'not_eligible_for_feedback');
  try {
    await query('INSERT INTO feedback (event_id,user_id,rating,comments) VALUES (?,?,?,?)', [eventId, user.id, rating, comments || null]);
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') throw conflict('feedback_exists', 'You have already submitted feedback for this event.');
    throw err;
  }
  return { submitted: true };
}

async function feedbackList(user, eventId) {
  const ev = await getRow(eventId);
  await assertCanManageEvent(user, ev);
  const rows = await query('SELECT f.rating, f.comments, f.created_at, u.name FROM feedback f JOIN users u ON u.id=f.user_id WHERE f.event_id=? ORDER BY f.created_at DESC', [eventId]);
  const avg = rows.length ? rows.reduce((s, r) => s + r.rating, 0) / rows.length : null;
  return { count: rows.length, averageRating: avg === null ? null : Math.round(avg * 100) / 100, items: rows.map((r) => ({ rating: r.rating, comments: r.comments, createdAt: r.created_at, studentName: r.name })) };
}

async function report(user, eventId) {
  const ev = await getRow(eventId);
  await assertCanManageEvent(user, ev);
  const counts = await query('SELECT status, COUNT(*) c FROM event_registrations WHERE event_id=? GROUP BY status', [eventId]);
  const byStatus = Object.fromEntries(counts.map((c) => [c.status, Number(c.c)]));
  const att = await query('SELECT status, COUNT(*) c FROM attendance WHERE event_id=? GROUP BY status', [eventId]);
  const attBy = Object.fromEntries(att.map((c) => [c.status, Number(c.c)]));
  const fb = await feedbackList(user, eventId);
  const confirmed = byStatus.confirmed || 0;
  return {
    event: { id: ev.id, title: ev.title, status: ev.status, startsAt: ev.starts_at, capacity: ev.capacity },
    registrations: { confirmed, pending: byStatus.pending || 0, waitlisted: byStatus.waitlisted || 0, cancelled: byStatus.cancelled || 0, rejected: byStatus.rejected || 0 },
    fillRate: Math.round(((confirmed + (byStatus.pending || 0)) / ev.capacity) * 1000) / 10,
    attendance: { present: attBy.present || 0, absent: attBy.absent || 0, unrecorded: Math.max(0, confirmed - (attBy.present || 0) - (attBy.absent || 0)), rate: confirmed ? Math.round(((attBy.present || 0) / confirmed) * 1000) / 10 : null },
    feedback: { count: fb.count, averageRating: fb.averageRating },
    generatedAt: new Date(),
  };
}

const csvCell = (v) => {
  let s = v === null || v === undefined ? '' : String(v);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`; // neutralise spreadsheet formula injection
  return `"${s.replace(/"/g, '""')}"`;
};

async function reportCsv(user, eventId) {
  const ev = await getRow(eventId);
  await assertCanManageEvent(user, ev);
  const regs = await registrations(user, eventId);
  const lines = [['Name', 'Email', 'Department', 'Year', 'Registration status', 'Registered at (UTC)', 'Attendance'].map(csvCell).join(',')];
  for (const r of regs) {
    lines.push([r.user.name, r.user.email, r.user.department, r.user.yearOfStudy, r.status, new Date(r.registeredAt).toISOString(), r.attendance || 'not recorded'].map(csvCell).join(','));
  }
  return { filename: `${ev.slug}-attendees.csv`, content: lines.join('\r\n') };
}

async function postAnnouncement(user, eventId, { title, body }) {
  return withTransaction(async (tx) => {
    const ev = (await tx.q('SELECT * FROM events WHERE id=? FOR UPDATE', [eventId]))[0];
    if (!ev) throw notFound('Event not found.', 'event_not_found');
    await assertCanManageEvent(user, ev);
    if (ev.status === 'draft') throw conflict('event_not_published', 'Publish the event before sending announcements.');
    const res = await tx.q('INSERT INTO announcements (club_id,event_id,author_id,title,body) VALUES (?,?,?,?,?)', [ev.club_id, eventId, user.id, title, body]);
    const regs = await tx.q("SELECT user_id FROM event_registrations WHERE event_id=? AND status IN ('confirmed','pending','waitlisted')", [eventId]);
    let notified = 0;
    for (const r of regs) {
      const n = await notifications.notify(tx, {
        userId: r.user_id, type: 'event_announcement', category: 'announcements',
        title: `${ev.title}: ${title}`, body: body.slice(0, 300), link: `/events/${ev.slug}`, dedupeKey: `announce:${res.insertId}`,
      });
      if (n.created) notified += 1;
    }
    await audit(user.id, 'event.announcement', { entityType: 'event', entityId: eventId, metadata: { announcementId: res.insertId } });
    return { id: res.insertId, notified };
  });
}

// ---- student views --------------------------------------------------------------------------
async function save(user, eventId, saved) {
  const ev = await getRow(eventId);
  if (ev.status === 'draft') throw notFound('Event not found.', 'event_not_found');
  if (saved) await query('INSERT IGNORE INTO saved_events (user_id,event_id) VALUES (?,?)', [user.id, eventId]);
  else await query('DELETE FROM saved_events WHERE user_id=? AND event_id=?', [user.id, eventId]);
  return { saved };
}

async function mySaved(user) {
  await lifecycle.ensureFresh();
  return fetchEvents(["e.id IN (SELECT event_id FROM saved_events WHERE user_id=?)", "e.status <> 'draft'"], [user.id], user, { order: 'e.starts_at ASC' });
}

async function myRegistrations(user) {
  await lifecycle.ensureFresh();
  return fetchEvents(["mr.status IN ('confirmed','pending','waitlisted')", "e.status IN ('published','registration_closed','ongoing','cancelled')"], [], user, { order: 'e.starts_at ASC' });
}

/** Participation history: completed events the student was confirmed for, with attendance & feedback state. */
async function myHistory(user) {
  await lifecycle.ensureFresh();
  const events = await fetchEvents(["mr.status='confirmed'", "e.status='completed'"], [], user, { order: 'e.starts_at DESC' });
  if (!events.length) return [];
  const ids = events.map((e) => e.id);
  const att = await query(`SELECT event_id, status FROM attendance WHERE user_id=? AND event_id IN (${ids.map(() => '?').join(',')})`, [user.id, ...ids]);
  const fb = await query(`SELECT event_id, rating, comments FROM feedback WHERE user_id=? AND event_id IN (${ids.map(() => '?').join(',')})`, [user.id, ...ids]);
  const attMap = new Map(att.map((a) => [a.event_id, a.status]));
  const fbMap = new Map(fb.map((f) => [f.event_id, f]));
  return events.map((e) => ({
    event: e,
    attendance: attMap.get(e.id) || null,
    feedback: fbMap.has(e.id) ? { rating: fbMap.get(e.id).rating, comments: fbMap.get(e.id).comments } : null,
    feedbackEligible: attMap.get(e.id) === 'present' && !fbMap.has(e.id),
  }));
}

module.exports = {
  TRANSITIONS, list, categories, detail, create, update, transition, register, cancelRegistration, registrations, reviewRegistration,
  attendanceList, recordAttendance, submitFeedback, feedbackList, report, reportCsv, postAnnouncement, save, mySaved, myRegistrations, myHistory,
  promoteWaitlist,
};
