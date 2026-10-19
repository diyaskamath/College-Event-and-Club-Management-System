'use strict';
const { query, withTransaction, likeEscape } = require('../db');
const notifications = require('./notificationService');
const { mapClub } = require('./mappers');
const { assertCanManageClub } = require('./permissions');
const { audit } = require('../utils/audit');
const { AppError, notFound, conflict, forbidden, badRequest } = require('../utils/errors');

const slugify = (s) => s.toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 90);

const CLUB_SELECT = (userId) => `
  SELECT c.*,
    (SELECT COUNT(*) FROM club_memberships m WHERE m.club_id=c.id AND m.status='active') AS member_count,
    (SELECT COUNT(*) FROM events e WHERE e.club_id=c.id AND e.status IN ('published','registration_closed','ongoing') AND e.ends_at > UTC_TIMESTAMP()) AS upcoming_event_count
    ${userId ? ', (SELECT m2.status FROM club_memberships m2 WHERE m2.club_id=c.id AND m2.user_id=?) AS my_membership_status' : ''}
  FROM clubs c`;

async function categories() {
  const rows = await query('SELECT DISTINCT category FROM clubs WHERE is_active=1 ORDER BY category');
  return rows.map((r) => r.category);
}

async function list({ search, category }, user) {
  const where = ['c.is_active=1'];
  const params = user ? [user.id] : [];
  if (search) {
    where.push('(c.name LIKE ? OR c.description LIKE ? OR c.category LIKE ?)');
    const like = `%${likeEscape(search)}%`;
    params.push(like, like, like);
  }
  if (category) {
    where.push('c.category=?');
    params.push(category);
  }
  const rows = await query(`${CLUB_SELECT(user && user.id)} WHERE ${where.join(' AND ')} ORDER BY c.id ASC`, params);
  return rows.map(mapClub);
}

async function findRow(idOrSlug) {
  const isId = /^\d+$/.test(String(idOrSlug));
  const rows = await query(`SELECT * FROM clubs WHERE ${isId ? 'id' : 'slug'}=?`, [idOrSlug]);
  if (!rows.length) throw notFound('Club not found.', 'club_not_found');
  return rows[0];
}

async function detail(idOrSlug, user) {
  const base = await findRow(idOrSlug);
  const params = user ? [user.id, base.id] : [base.id];
  const club = mapClub((await query(`${CLUB_SELECT(user && user.id)} WHERE c.id=?`, params))[0]);
  const coordinators = await query(
    `SELECT u.id, u.name, u.email FROM coordinator_assignments a JOIN users u ON u.id=a.user_id
     WHERE a.club_id=? AND u.status='active' ORDER BY u.name`,
    [base.id],
  );
  const announcements = await query(
    `SELECT a.id, a.title, a.body, a.created_at, u.name AS author_name FROM announcements a
     LEFT JOIN users u ON u.id=a.author_id WHERE a.club_id=? AND a.event_id IS NULL ORDER BY a.created_at DESC, a.id DESC LIMIT 20`,
    [base.id],
  );
  return {
    ...club,
    coordinators: coordinators.map((c) => ({ id: c.id, name: c.name, email: c.email })),
    announcements: announcements.map((a) => ({ id: a.id, title: a.title, body: a.body, createdAt: a.created_at, authorName: a.author_name })),
    canManage: user ? (user.role === 'admin' || (await query('SELECT 1 FROM coordinator_assignments WHERE user_id=? AND club_id=?', [user.id, base.id])).length > 0) : false,
  };
}

async function join(user, clubId) {
  if (user.role !== 'student') throw forbidden('Only students can join clubs.', 'students_only');
  return withTransaction(async (tx) => {
    const club = (await tx.q('SELECT * FROM clubs WHERE id=? AND is_active=1 FOR UPDATE', [clubId]))[0];
    if (!club) throw notFound('Club not found.', 'club_not_found');

    const existing = (await tx.q('SELECT * FROM club_memberships WHERE club_id=? AND user_id=? FOR UPDATE', [clubId, user.id]))[0];
    let membershipId;
    let joinCount;
    if (existing && existing.status === 'active') throw conflict('already_member', 'You are already a member of this club.');
    if (existing) {
      await tx.q("UPDATE club_memberships SET status='active', join_count=join_count+1, joined_at=UTC_TIMESTAMP(), left_at=NULL WHERE id=?", [existing.id]);
      membershipId = existing.id;
      joinCount = existing.join_count + 1;
    } else {
      try {
        const res = await tx.q('INSERT INTO club_memberships (club_id,user_id) VALUES (?,?)', [clubId, user.id]);
        membershipId = res.insertId;
        joinCount = 1;
      } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') throw conflict('already_member', 'You are already a member of this club.');
        throw err;
      }
    }

    // Student confirmation (always) - idempotent via dedupe key
    await notifications.notify(tx, {
      userId: user.id,
      type: 'club_joined',
      category: 'club_activity',
      transactional: true,
      title: `Welcome to ${club.name}`,
      body: `You are now a member of ${club.name}. Watch this space for announcements and events.`,
      link: `/clubs/${club.slug}`,
      dedupeKey: `club_join:${membershipId}:${joinCount}`,
    });

    // Real-time notification to ALL active admins
    const admins = await tx.q("SELECT u.id FROM users u WHERE u.role='admin' AND u.status='active'");
    for (const a of admins) {
      await notifications.notify(tx, {
        userId: a.id,
        type: 'club_new_member',
        category: 'admin_activity',
        title: `Notification: Club Registration`,
        body: `Notification: A student from ${user.department || 'Unknown Dept'} has registered for ${club.name}. Student: ${user.name} (${user.email || 'No email'})`,
        link: '/admin',
        dedupeKey: `club_join_admin:${membershipId}:${joinCount}:${a.id}`,
      });
    }

    // Real-time notification to ALL active coordinators (including assigned ones)
    const coords = await tx.q("SELECT u.id FROM users u WHERE u.role='coordinator' AND u.status='active'");
    for (const c of coords) {
      await notifications.notify(tx, {
        userId: c.id,
        type: 'club_new_member',
        category: 'club_activity',
        title: `Notification: Club Registration`,
        body: `Notification: A student from ${user.department || 'Unknown Dept'} has registered for ${club.name}. Student: ${user.name} (${user.email || 'No email'})`,
        link: '/coordinator',
        dedupeKey: `club_join_coord:${membershipId}:${joinCount}:${c.id}`,
      });
    }

    const count = (await tx.q("SELECT COUNT(*) c FROM club_memberships WHERE club_id=? AND status='active'", [clubId]))[0].c;
    return { joined: true, memberCount: count };

  });
}

async function leave(user, clubId) {
  return withTransaction(async (tx) => {
    const m = (await tx.q('SELECT * FROM club_memberships WHERE club_id=? AND user_id=? FOR UPDATE', [clubId, user.id]))[0];
    if (!m || m.status !== 'active') throw conflict('not_a_member', 'You are not a member of this club.');
    await tx.q("UPDATE club_memberships SET status='left', left_at=UTC_TIMESTAMP() WHERE id=?", [m.id]);
    const club = (await tx.q('SELECT name FROM clubs WHERE id=?', [clubId]))[0];
    await notifications.notify(tx, {
      userId: user.id,
      type: 'club_left',
      category: 'club_activity',
      transactional: true,
      title: `You left ${club.name}`,
      body: `Your membership of ${club.name} has ended. You can rejoin at any time.`,
      link: '/clubs',
      dedupeKey: `club_leave:${m.id}:${m.join_count}`,
    });
    const count = (await tx.q("SELECT COUNT(*) c FROM club_memberships WHERE club_id=? AND status='active'", [clubId]))[0].c;
    return { joined: false, memberCount: count };
  });
}

async function members(user, clubId) {
  await findRow(clubId);
  await assertCanManageClub(user, clubId);
  const rows = await query(
    `SELECT u.id, u.name, u.email, u.department, u.year_of_study, m.joined_at FROM club_memberships m JOIN users u ON u.id=m.user_id
     WHERE m.club_id=? AND m.status='active' ORDER BY m.joined_at DESC`,
    [clubId],
  );
  return rows.map((r) => ({ id: r.id, name: r.name, email: r.email, department: r.department, yearOfStudy: r.year_of_study, joinedAt: r.joined_at }));
}

async function postAnnouncement(user, clubId, { title, body }) {
  const club = await findRow(clubId);
  await assertCanManageClub(user, clubId);
  return withTransaction(async (tx) => {
    const res = await tx.q('INSERT INTO announcements (club_id, author_id, title, body) VALUES (?,?,?,?)', [clubId, user.id, title, body]);
    const members = await tx.q("SELECT user_id FROM club_memberships WHERE club_id=? AND status='active'", [clubId]);
    let notified = 0;
    for (const m of members) {
      const r = await notifications.notify(tx, {
        userId: m.user_id,
        type: 'club_announcement',
        category: 'announcements',
        title: `${club.name}: ${title}`,
        body: body.slice(0, 300),
        link: `/clubs/${club.slug}`,
        dedupeKey: `announce:${res.insertId}`,
      });
      if (r.created) notified += 1;
    }
    await audit(user.id, 'club.announcement', { entityType: 'club', entityId: clubId, metadata: { announcementId: res.insertId } });
    return { id: res.insertId, notified };
  });
}

// ---- Admin: direct create / update -------------------------------------------------------
async function uniqueSlug(base, conn = null) {
  let slug = base || 'club';
  let i = 1;
  while ((await query('SELECT 1 FROM clubs WHERE slug=?', [slug], conn)).length) {
    i += 1;
    slug = `${base}-${i}`;
  }
  return slug;
}

async function adminCreate(user, { name, description, category }) {
  if ((await query('SELECT 1 FROM clubs WHERE name=?', [name])).length) throw conflict('club_exists', 'A club with this name already exists.');
  const slug = await uniqueSlug(slugify(name));
  const res = await query('INSERT INTO clubs (slug,name,description,category,campus_id,created_by,is_demo) VALUES (?,?,?,?,(SELECT id FROM campuses ORDER BY id LIMIT 1),?,0)', [slug, name, description, category, user.id]);
  await audit(user.id, 'club.create', { entityType: 'club', entityId: res.insertId, metadata: { name } });
  return detail(res.insertId, user);
}

async function adminUpdate(user, clubId, fields) {
  await findRow(clubId);
  const sets = [];
  const params = [];
  for (const [k, col] of Object.entries({ name: 'name', description: 'description', category: 'category', isActive: 'is_active' })) {
    if (fields[k] !== undefined) {
      sets.push(`${col}=?`);
      params.push(k === 'isActive' ? (fields[k] ? 1 : 0) : fields[k]);
    }
  }
  if (!sets.length) throw badRequest('nothing_to_update', 'No changes supplied.');
  try {
    await query(`UPDATE clubs SET ${sets.join(', ')} WHERE id=?`, [...params, clubId]);
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') throw conflict('club_exists', 'A club with this name already exists.');
    throw err;
  }
  await audit(user.id, 'club.update', { entityType: 'club', entityId: clubId, metadata: { fields: Object.keys(fields) } });
  return detail(clubId, user);
}

// ---- Club creation requests ----------------------------------------------------------------
async function submitRequest(user, { name, description, category, justification }) {
  if (!['student', 'coordinator'].includes(user.role)) throw forbidden('Admins can create clubs directly.', 'use_admin_create');
  if ((await query('SELECT 1 FROM clubs WHERE name=?', [name])).length) throw conflict('club_exists', 'A club with this name already exists.');
  if ((await query("SELECT 1 FROM club_requests WHERE name=? AND status='pending'", [name])).length) throw conflict('request_exists', 'A request for this club name is already pending.');
  const pending = (await query("SELECT COUNT(*) c FROM club_requests WHERE requested_by=? AND status='pending'", [user.id]))[0].c;
  if (pending >= 3) throw conflict('too_many_pending', 'You already have 3 pending club requests.');
  const res = await query('INSERT INTO club_requests (requested_by,name,description,category,justification) VALUES (?,?,?,?,?)', [user.id, name, description, category, justification || null]);

  const admins = await query("SELECT id FROM users WHERE role='admin' AND status='active'");
  for (const a of admins) {
    await notifications.notify(null, {
      userId: a.id,
      type: 'club_request_submitted',
      category: 'admin_activity',
      title: 'New club request',
      body: `${user.name} requested a new club: ${name}.`,
      link: '/admin?tab=requests',
      dedupeKey: `club_request:${res.insertId}`,
    });
  }
  await audit(user.id, 'club_request.submit', { entityType: 'club_request', entityId: res.insertId, metadata: { name } });
  return { id: res.insertId, status: 'pending' };
}

const mapRequest = (r) => ({
  id: r.id,
  name: r.name,
  description: r.description,
  category: r.category,
  justification: r.justification,
  status: r.status,
  reviewNote: r.review_note,
  reviewedAt: r.reviewed_at,
  requestedBy: r.requester_name ? { id: r.requested_by, name: r.requester_name, email: r.requester_email } : undefined,
  createdClubId: r.created_club_id,
  createdAt: r.created_at,
});

async function myRequests(user) {
  const rows = await query('SELECT * FROM club_requests WHERE requested_by=? ORDER BY created_at DESC', [user.id]);
  return rows.map(mapRequest);
}

async function adminRequests({ status }) {
  const rows = await query(
    `SELECT r.*, u.name AS requester_name, u.email AS requester_email FROM club_requests r JOIN users u ON u.id=r.requested_by
     ${status ? 'WHERE r.status=?' : ''} ORDER BY FIELD(r.status,'pending','approved','rejected'), r.created_at DESC`,
    status ? [status] : [],
  );
  return rows.map(mapRequest);
}

async function reviewRequest(admin, requestId, { decision, note }) {
  return withTransaction(async (tx) => {
    const r = (await tx.q('SELECT * FROM club_requests WHERE id=? FOR UPDATE', [requestId]))[0];
    if (!r) throw notFound('Request not found.', 'request_not_found');
    if (r.status !== 'pending') throw conflict('already_reviewed', 'This request has already been reviewed.');
    let clubId = null;
    if (decision === 'approve') {
      if ((await tx.q('SELECT 1 FROM clubs WHERE name=?', [r.name])).length) throw conflict('club_exists', 'A club with this name already exists.');
      const slug = await uniqueSlug(slugify(r.name), tx.conn);
      const res = await tx.q('INSERT INTO clubs (slug,name,description,category,campus_id,created_by,is_demo) VALUES (?,?,?,?,(SELECT id FROM campuses ORDER BY id LIMIT 1),?,0)', [slug, r.name, r.description, r.category, r.requested_by]);
      clubId = res.insertId;
    }
    await tx.q('UPDATE club_requests SET status=?, reviewed_by=?, reviewed_at=UTC_TIMESTAMP(), review_note=?, created_club_id=? WHERE id=?', [
      decision === 'approve' ? 'approved' : 'rejected',
      admin.id,
      note || null,
      clubId,
      requestId,
    ]);
    await notifications.notify(tx, {
      userId: r.requested_by,
      type: decision === 'approve' ? 'club_request_approved' : 'club_request_rejected',
      category: 'admin_activity',
      transactional: true,
      title: decision === 'approve' ? `Club approved: ${r.name}` : `Club request declined: ${r.name}`,
      body: decision === 'approve' ? 'Your club was approved. An admin will assign a coordinator.' : `Your request was not approved.${note ? ` Note: ${note}` : ''}`,
      link: decision === 'approve' ? '/clubs' : '/dashboard',
      dedupeKey: `club_request_review:${requestId}`,
    });
    await audit(admin.id, `club_request.${decision}`, { entityType: 'club_request', entityId: requestId, metadata: { clubId } });
    return { id: requestId, status: decision === 'approve' ? 'approved' : 'rejected', clubId };
  });
}

module.exports = {
  categories, list, detail, join, leave, members, postAnnouncement, adminCreate, adminUpdate,
  submitRequest, myRequests, adminRequests, reviewRequest, findRow, AppError,
};
