'use strict';
const { query } = require('../db');
const { asyncHandler } = require('../utils/http');
const { badRequest, notFound, forbidden } = require('../utils/errors');
const clubService = require('../services/clubService');

// ---- ANNOUNCEMENTS -------------------------------------------------------------
exports.listAnnouncements = asyncHandler(async (req, res) => {
  const user = req.user;
  let rows;
  if (user && (user.role === 'coordinator' || user.role === 'admin')) {
    rows = await query(
      `SELECT a.*, u.name as author_name, u.role as author_role, c.name as club_name
       FROM announcements a
       LEFT JOIN users u ON u.id = a.author_id
       LEFT JOIN clubs c ON c.id = a.club_id
       ORDER BY a.created_at DESC LIMIT 50`
    );
  } else {
    const dept = (user && user.department) || (req.query.branch) || null;
    if (dept && dept !== 'All Branches' && dept !== 'All') {
      rows = await query(
        `SELECT a.*, u.name as author_name, u.role as author_role, c.name as club_name
         FROM announcements a
         LEFT JOIN users u ON u.id = a.author_id
         LEFT JOIN clubs c ON c.id = a.club_id
         WHERE a.target_tag = 'All Branches' OR a.target_tag LIKE ?
         ORDER BY a.created_at DESC LIMIT 50`,
        [`%${dept}%`]
      );
    } else {
      rows = await query(
        `SELECT a.*, u.name as author_name, u.role as author_role, c.name as club_name
         FROM announcements a
         LEFT JOIN users u ON u.id = a.author_id
         LEFT JOIN clubs c ON c.id = a.club_id
         ORDER BY a.created_at DESC LIMIT 50`
      );
    }
  }

  const mapped = rows.map(r => ({
    id: r.id,
    title: r.title,
    body: r.body,
    content: r.body,          // frontend uses .content
    source_tag: r.source_tag || 'Coordination',
    sourceTag: r.source_tag || 'Coordination',
    target_tag: r.target_tag || 'All Branches',
    targetTag: r.target_tag || 'All Branches',
    author_name: r.author_name || 'Amrita Administration',
    authorName: r.author_name || 'Amrita Administration',
    authorRole: r.author_role || 'Staff',
    clubName: r.club_name || null,
    created_at: r.created_at,
    createdAt: r.created_at
  }));
  res.json({ items: mapped, announcements: mapped });
});

exports.createAnnouncement = asyncHandler(async (req, res) => {
  const { title, sourceTag, targetTag, clubId } = req.body;
  // Accept both 'body' (API standard) and 'content' (dashboard form) field names
  const body = req.body.body || req.body.content;
  if (!title || !body) throw badRequest('missing_fields', 'Title and body/content are required.');

  const resDb = await query(
    `INSERT INTO announcements (author_id, title, body, source_tag, target_tag, club_id)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [req.user.id, title.trim(), body.trim(), sourceTag || 'Coordination', targetTag || 'All Branches', clubId || null]
  );

  res.status(201).json({
    id: resDb.insertId,
    title,
    body,
    content: body,
    source_tag: sourceTag || 'Coordination',
    target_tag: targetTag || 'All Branches',
    sourceTag: sourceTag || 'Coordination',
    targetTag: targetTag || 'All Branches',
    author_name: req.user.name,
    created_at: new Date().toISOString(),
    createdAt: new Date().toISOString()
  });
});

// ---- COMPLAINTS ----------------------------------------------------------------
exports.listComplaints = asyncHandler(async (req, res) => {
  const user = req.user;
  let rows;
  if (user.role === 'coordinator' || user.role === 'admin') {
    rows = await query(
      `SELECT c.*, u.name as student_name, u.email as student_email, u.department as student_dept, u.phone as student_phone
       FROM complaints c
       JOIN users u ON u.id = c.user_id
       ORDER BY c.created_at DESC LIMIT 100`
    );
  } else {
    rows = await query(
      `SELECT c.*, u.name as student_name, u.email as student_email, u.department as student_dept
       FROM complaints c
       JOIN users u ON u.id = c.user_id
       WHERE c.user_id = ?
       ORDER BY c.created_at DESC`,
      [user.id]
    );
  }

  const mapped = rows.map(r => ({
    id: r.id,
    userId: r.user_id,
    studentName: r.student_name,
    studentEmail: r.student_email,
    studentDept: r.student_dept || r.branch || 'All Branches',
    studentPhone: r.student_phone || null,
    title: r.title,
    subject: r.title,
    description: r.description,
    category: r.category,
    branch: r.branch,
    status: r.status,
    adminResponse: r.admin_response,
    createdAt: r.created_at,
    updatedAt: r.updated_at
  }));
  res.json({ items: mapped, complaints: mapped });
});

exports.createComplaint = asyncHandler(async (req, res) => {
  // Accept both 'title' (API standard) and 'subject' (dashboard form) field names
  const { description, category, branch } = req.body;
  const title = req.body.title || req.body.subject;
  if (!title || !description) throw badRequest('missing_fields', 'Title/subject and description are required.');

  const resDb = await query(
    `INSERT INTO complaints (user_id, title, description, category, branch, status)
     VALUES (?, ?, ?, ?, ?, 'Pending')`,
    [req.user.id, title.trim(), description.trim(), category || 'Academic', branch || req.user.department || 'All Branches']
  );

  res.status(201).json({
    id: resDb.insertId,
    title,
    subject: title,
    description,
    category: category || 'Academic',
    branch: branch || 'All Branches',
    status: 'Pending',
    createdAt: new Date().toISOString()
  });
});

exports.updateComplaint = asyncHandler(async (req, res) => {
  const complaintId = Number(req.params.id);
  const { status, adminResponse } = req.body;

  const rows = await query('SELECT * FROM complaints WHERE id=?', [complaintId]);
  if (!rows.length) throw notFound('complaint_not_found', 'Complaint not found.');
  const existing = rows[0];

  await query(
    `UPDATE complaints SET status=?, admin_response=?, resolved_by=? WHERE id=?`,
    [status || existing.status, adminResponse !== undefined ? adminResponse : existing.admin_response, req.user.id, complaintId]
  );

  res.json({ success: true, complaintId, status: status || existing.status });
});

// ---- REAL-TIME CLUB MANAGEMENT (COORDINATOR & ADMIN) ---------------------------
exports.createClubRealtime = asyncHandler(async (req, res) => {
  const { name, description, category } = req.body;
  if (!name || !description || !category) throw badRequest('missing_fields', 'Name, description, and category are required.');

  const created = await clubService.adminCreate(req.user, { name, description, category });
  res.status(201).json({ club: created });
});

exports.deleteClubRealtime = asyncHandler(async (req, res) => {
  const clubId = Number(req.params.id);
  const rows = await query('SELECT * FROM clubs WHERE id=?', [clubId]);
  if (!rows.length) throw notFound('club_not_found', 'Club not found.');
  const existing = rows[0];

  await query('UPDATE clubs SET is_active=0 WHERE id=?', [clubId]);
  res.json({ success: true, deletedClubId: clubId, name: existing.name });
});

// ---- CALENDAR SCHEDULE EVENTS --------------------------------------------------
exports.getCalendarSchedule = asyncHandler(async (_req, res) => {
  // Combine academic schedule with festival & regular events
  const dbEvents = await query(
    `SELECT id, slug, title, description, kind, category, starts_at, ends_at, venue
     FROM events WHERE status IN ('published', 'ongoing') ORDER BY starts_at ASC`
  );

  const academicEvents = [
    {
      id: 'acad-1',
      title: 'End Term Exams (For ECE/CSE)',
      startDate: '2026-01-04',
      endDate: '2026-01-12',
      type: 'Academic',
      description: 'Odd Semester End-Term Examinations across Academic Blocks AB-1, AB-2, and AB-3.',
      targetBranches: 'ECE, CSE',
      venue: 'AB1, AB2, AB3 Exam Halls'
    },
    {
      id: 'acad-2',
      title: 'Mid-Term Lab Practical Evaluations',
      startDate: '2026-10-28',
      endDate: '2026-10-31',
      type: 'Academic',
      description: 'Continuous assessment lab tests for 2nd and 3rd year engineering batches.',
      targetBranches: 'All Branches',
      venue: 'Respective Department Labs'
    },
    {
      id: 'prof-1',
      title: 'Campus Placement & Mock Interview Drive',
      startDate: '2026-11-15',
      endDate: '2026-11-18',
      type: 'Professional',
      description: 'Technical & HR mock interviews conducted by alumni working in Tier-1 software & core firms.',
      targetBranches: 'All Branches',
      venue: 'Conference Hall & AB3 Audi'
    },
    {
      id: 'prof-2',
      title: 'Robotics & AI Innovation Summit',
      startDate: '2026-11-25',
      endDate: '2026-11-26',
      type: 'Professional',
      description: 'Paper presentations, hardware prototyping showcases, and keynote lectures by industry leaders.',
      targetBranches: 'AI, CSE, ECE, Mech',
      venue: 'AB-4 Central Auditorium'
    }
  ];

  const mappedDbEvents = dbEvents.map(e => ({
    id: `ev-${e.id}`,
    title: e.title,
    startDate: e.starts_at ? new Date(e.starts_at).toISOString().split('T')[0] : '',
    endDate: e.ends_at ? new Date(e.ends_at).toISOString().split('T')[0] : '',
    type: e.kind === 'festival' ? 'Academic' : 'Professional',
    description: e.description,
    targetBranches: 'All Branches',
    venue: e.venue || 'Campus Venue',
    slug: e.slug
  }));

  res.json({
    items: [...academicEvents, ...mappedDbEvents]
  });
});
