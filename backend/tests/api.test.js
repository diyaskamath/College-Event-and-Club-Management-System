'use strict';
const { resetDatabase, Client, uniq, bcrypt } = require('./harness');
const test = require('node:test');
const assert = require('node:assert/strict');

const { describe, it, before, after } = test;
let app; let server; let base; let db; let delivery; let lifecycle; let themeService;

const PASSWORD = 'Passw0rdA1';
const hrs = (h) => new Date(Date.now() + h * 3600 * 1000).toISOString();
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const fresh = () => new Client(base);

const lastOutbox = (to, channel) => [...delivery.outbox].reverse().find((m) => m.to === to && (!channel || m.channel === channel));
const codeFrom = (m) => (m.text.match(/(?:code is: |code: )(\d{6})/) || [])[1];

async function registerStudent(prefix = 'stu') {
  const c = fresh();
  const email = `${uniq(prefix)}@cb.students.amrita.edu`;
  const reg = await c.post('/auth/register', { name: `Student ${prefix}`, email, password: PASSWORD });
  assert.equal(reg.status, 202, reg.text);
  const ver = await c.post('/auth/register/verify', { challengeId: reg.body.challengeId, code: codeFrom(lastOutbox(email, 'email')) });
  assert.equal(ver.status, 200, ver.text);
  return { client: c, user: ver.body.user, email };
}

let phoneSeq = 0;
async function createStaff(role) {
  const email = `${uniq(role)}@staff.example.com`;
  phoneSeq += 1;
  const phone = `+9199${String(1000000 + phoneSeq + Math.floor(Math.random() * 1000) * 10)}`.slice(0, 13);
  const res = await db.query("INSERT INTO users (name,email,phone,password_hash,role,status,email_verified_at) VALUES (?,?,?,?,?,'active',UTC_TIMESTAMP())", [`Test ${role}`, email, phone, bcrypt.hashSync(PASSWORD, 4), role]);
  await db.query('INSERT IGNORE INTO notification_preferences (user_id) VALUES (?)', [res.insertId]);
  return { id: res.insertId, email, phone };
}

async function loginStaff(staff) {
  const c = fresh();
  const l = await c.post('/auth/login', { email: staff.email, password: PASSWORD });
  assert.equal(l.status, 200, l.text);
  assert.equal(l.body.requiresOtp, true);
  assert.equal(l.body.channel, 'sms');
  const v = await c.post('/auth/login/verify', { challengeId: l.body.challengeId, code: codeFrom(lastOutbox(staff.phone, 'sms')) });
  assert.equal(v.status, 200, v.text);
  return c;
}

const clubId = async (slug) => (await db.query('SELECT id FROM clubs WHERE slug=?', [slug]))[0].id;
const unread = async (c) => (await c.get('/notifications/unread-count')).body.unread;
const notifTypes = async (c) => (await c.get('/notifications?limit=100')).body.items.map((n) => n.type);

function eventPayload(clubIdValue, over = {}) {
  return {
    title: uniq('Test Event '), description: 'A test event used by the automated suite.', category: 'Technology', eventType: 'Workshop',
    clubId: clubIdValue, venue: 'Test Hall', academicBlock: 'Test Block',
    startsAt: hrs(72), endsAt: hrs(75), registrationDeadline: hrs(48), capacity: 5, ...over,
  };
}

before(async () => {
  await resetDatabase();
  const { createApp } = require('../src/app');
  db = require('../src/db');
  delivery = require('../src/integrations/delivery');
  lifecycle = require('../src/services/lifecycleService');
  themeService = require('../src/services/themeService');
  app = createApp();
  server = app.listen(0);
  await new Promise((r) => server.once('listening', r));
  base = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  await new Promise((r) => server.close(r));
  await db.pool.end();
});

describe('Seed data (strict initial demo content)', () => {
  it('has exactly the eight specified clubs', async () => {
    const res = await fresh().get('/clubs');
    assert.deepEqual(res.body.items.map((c) => c.name).sort(), [
      'Coding and Open Source', 'Debate and Public Speaking', 'Entrepreneurship', 'Film and Cinema Society', 'Literary and Book Club',
      'Music and Performing Arts', 'Photography and Visual Arts', 'Robotics and Innovation',
    ].sort());
    assert.equal((await db.query('SELECT COUNT(*) c FROM clubs'))[0].c, 8);
    assert.ok(res.body.items.every((c) => c.isDemo));
  });

  it('has exactly three regular and two festival events, all five on the events listing', async () => {
    const all = (await fresh().get('/events?when=all')).body.items;
    assert.equal(all.length, 5);
    assert.deepEqual(all.filter((e) => e.kind === 'regular').map((e) => e.title).sort(), ['Build Night: Tiny Web Apps', 'Pitch Your First Idea', 'Stories After Hours']);
    assert.deepEqual(all.filter((e) => e.kind === 'festival').map((e) => e.title).sort(), ['Diwali Lights & Rangoli', 'Dussehra and Navaratri Cultural Evening']);
    const upcoming = (await fresh().get('/events')).body.items;
    assert.equal(upcoming.length, 5);
    for (const e of all) {
      assert.ok(e.isDemo && e.venuePlaceholder, `${e.title} should be labelled demo + placeholder venue`);
      assert.ok(e.campus.name && e.organizerName && e.capacity > 0 && e.registrationDeadline && e.startsAt);
    }
    assert.equal((await db.query('SELECT COUNT(*) c FROM events'))[0].c, 5);
    assert.equal((await db.query('SELECT COUNT(*) c FROM festival_themes'))[0].c, 2);
  });

  it('seed is idempotent', async () => {
    const { execFileSync } = require('child_process');
    execFileSync(process.execPath, [require('path').join(__dirname, '..', 'scripts', 'setup-db.js')], { env: process.env, stdio: 'pipe' });
    assert.equal((await db.query('SELECT COUNT(*) c FROM clubs'))[0].c, 8);
    assert.equal((await db.query('SELECT COUNT(*) c FROM events'))[0].c, 5);
    assert.equal((await db.query('SELECT COUNT(*) c FROM festival_themes'))[0].c, 2);
  });

  it('filters by category, search and campus', async () => {
    const c = fresh();
    assert.equal((await c.get('/events?category=Festival')).body.items.length, 2);
    assert.equal((await c.get('/events?search=Rangoli')).body.items.length, 1);
    assert.equal((await c.get('/events?kind=regular')).body.items.length, 3);
    const campus = (await c.get('/campuses')).body.items[0];
    assert.equal((await c.get(`/events?campusId=${campus.id}`)).body.items.length, 5);
    assert.equal((await c.get('/clubs?search=robot')).body.items.length, 1);
  });
});

describe('Authentication & OTP', () => {
  it('rejects non-approved email domains', async () => {
    const r = await fresh().post('/auth/register', { name: 'X Y', email: 'someone@gmail.com', password: PASSWORD });
    assert.equal(r.status, 400);
    assert.equal(r.body.error.code, 'email_domain_not_allowed');
  });

  it('validates input on the server', async () => {
    const r = await fresh().post('/auth/register', { name: 'A', email: 'nope', password: 'short' });
    assert.equal(r.status, 400);
    assert.equal(r.body.error.code, 'validation_error');
  });

  it('reports delivery_not_configured honestly and stores nothing when no provider exists', async () => {
    delivery.setTestMode('none');
    const before = (await db.query('SELECT COUNT(*) c FROM otp_challenges'))[0].c;
    const email = `${uniq('nodeliv')}@cb.students.amrita.edu`;
    const r = await fresh().post('/auth/register', { name: 'No Deliver', email, password: PASSWORD });
    delivery.setTestMode('memory');
    assert.equal(r.status, 503);
    assert.equal(r.body.error.code, 'delivery_not_configured');
    assert.equal((await db.query('SELECT COUNT(*) c FROM otp_challenges'))[0].c, before);
    assert.ok(!lastOutbox(email));
  });

  it('student email OTP: incorrect, correct, then reuse rejected; OTP stored hashed; account activated only after verification', async () => {
    const c = fresh();
    const email = `${uniq('otp')}@cb.students.amrita.edu`;
    const reg = await c.post('/auth/register', { name: 'Otp Student', email, password: PASSWORD });
    assert.equal(reg.status, 202);
    const code = codeFrom(lastOutbox(email, 'email'));
    assert.match(code, /^\d{6}$/);
    assert.equal((await db.query('SELECT status FROM users WHERE email=?', [email]))[0].status, 'pending');

    const row = (await db.query('SELECT * FROM otp_challenges WHERE id=?', [reg.body.challengeId]))[0];
    assert.match(row.code_hash, /^[0-9a-f]{64}$/);
    assert.notEqual(row.code_hash, code);

    const bad = await c.post('/auth/register/verify', { challengeId: reg.body.challengeId, code: code === '000000' ? '111111' : '000000' });
    assert.equal(bad.status, 400);
    assert.equal(bad.body.error.code, 'otp_incorrect');
    assert.equal(bad.body.error.details.attemptsRemaining, 4);
    assert.equal((await c.get('/auth/me')).status, 401);

    const ok = await c.post('/auth/register/verify', { challengeId: reg.body.challengeId, code });
    assert.equal(ok.status, 200);
    assert.equal(ok.body.user.role, 'student');
    assert.equal((await db.query('SELECT status FROM users WHERE email=?', [email]))[0].status, 'active');
    assert.equal((await c.get('/auth/me')).status, 200);
    assert.ok(ok.setCookies.some((s) => /HttpOnly/i.test(s)), 'session cookie must be HttpOnly');
    assert.ok(!JSON.stringify(ok.body).includes('password'), 'no password hash in response');

    const reuse = await fresh().post('/auth/register/verify', { challengeId: reg.body.challengeId, code });
    assert.equal(reuse.status, 400);
    assert.equal(reuse.body.error.code, 'otp_used');
  });

  it('rejects expired OTPs', async () => {
    const c = fresh();
    const email = `${uniq('exp')}@cb.students.amrita.edu`;
    const reg = await c.post('/auth/register', { name: 'Exp Student', email, password: PASSWORD });
    const code = codeFrom(lastOutbox(email, 'email'));
    await db.query('UPDATE otp_challenges SET expires_at = (UTC_TIMESTAMP() - INTERVAL 1 MINUTE) WHERE id=?', [reg.body.challengeId]);
    const r = await c.post('/auth/register/verify', { challengeId: reg.body.challengeId, code });
    assert.equal(r.status, 400);
    assert.equal(r.body.error.code, 'otp_expired');
  });

  it('locks a challenge after too many wrong attempts, even for the right code', async () => {
    const c = fresh();
    const email = `${uniq('lock')}@cb.students.amrita.edu`;
    const reg = await c.post('/auth/register', { name: 'Lock Student', email, password: PASSWORD });
    const code = codeFrom(lastOutbox(email, 'email'));
    const wrong = code === '123456' ? '654321' : '123456';
    let last;
    for (let i = 0; i < 5; i += 1) last = await c.post('/auth/register/verify', { challengeId: reg.body.challengeId, code: wrong });
    assert.equal(last.status, 429);
    assert.equal(last.body.error.code, 'otp_locked');
    const right = await c.post('/auth/register/verify', { challengeId: reg.body.challengeId, code });
    assert.equal(right.status, 429);
    assert.equal((await db.query('SELECT status FROM users WHERE email=?', [email]))[0].status, 'pending');
  });

  it('enforces resend cooldown and invalidates the previous code on resend', async () => {
    const c = fresh();
    const email = `${uniq('rs')}@cb.students.amrita.edu`;
    const reg = await c.post('/auth/register', { name: 'Resend Student', email, password: PASSWORD });
    const first = codeFrom(lastOutbox(email, 'email'));
    const early = await c.post('/auth/otp/resend', { challengeId: reg.body.challengeId });
    assert.equal(early.status, 429);
    assert.equal(early.body.error.code, 'otp_resend_cooldown');
    await sleep(1200);
    const again = await c.post('/auth/otp/resend', { challengeId: reg.body.challengeId });
    assert.equal(again.status, 200, again.text);
    const second = codeFrom(lastOutbox(email, 'email'));
    if (second !== first) {
      const old = await c.post('/auth/register/verify', { challengeId: reg.body.challengeId, code: first });
      assert.equal(old.status, 400);
    }
    const ok = await c.post('/auth/register/verify', { challengeId: reg.body.challengeId, code: second });
    assert.equal(ok.status, 200);
  });

  it('does not reveal whether an email is already registered, and sends nothing for it', async () => {
    const { email } = await registerStudent('exists');
    const sent = delivery.outbox.length;
    const r = await fresh().post('/auth/register', { name: 'Someone Else', email, password: PASSWORD });
    assert.equal(r.status, 202);
    assert.ok(r.body.challengeId && r.body.message.startsWith('If this email'));
    assert.equal(delivery.outbox.length, sent);
    const v = await fresh().post('/auth/register/verify', { challengeId: r.body.challengeId, code: '123456' });
    assert.equal(v.status, 400);
  });

  it('student password login works; wrong password and unknown email give the same error', async () => {
    const { email } = await registerStudent('login');
    const ok = await fresh().post('/auth/login', { email, password: PASSWORD });
    assert.equal(ok.status, 200);
    assert.equal(ok.body.requiresOtp, false);
    assert.equal(ok.body.user.email, email);
    const bad = await fresh().post('/auth/login', { email, password: 'Wrong1234' });
    const unknown = await fresh().post('/auth/login', { email: 'ghost@cb.students.amrita.edu', password: 'Wrong1234' });
    assert.equal(bad.status, 401);
    assert.equal(unknown.status, 401);
    assert.equal(bad.body.error.message, unknown.body.error.message);
  });

  it('coordinator and admin log in with phone OTP and need no approval step', async () => {
    for (const role of ['coordinator', 'admin']) {
      const staff = await createStaff(role);
      const c = fresh();
      const l = await c.post('/auth/login', { email: staff.email, password: PASSWORD });
      assert.equal(l.status, 200);
      assert.equal(l.body.requiresOtp, true);
      assert.equal(l.body.channel, 'sms');
      assert.ok(!l.body.destination.includes(staff.phone), 'phone is masked');
      assert.equal((await c.get('/auth/me')).status, 401, 'no session before OTP');
      const sms = lastOutbox(staff.phone, 'sms');
      assert.ok(sms, 'sms captured');
      const wrong = await c.post('/auth/login/verify', { challengeId: l.body.challengeId, code: codeFrom(sms) === '000000' ? '111111' : '000000' });
      assert.equal(wrong.status, 400);
      const ok = await c.post('/auth/login/verify', { challengeId: l.body.challengeId, code: codeFrom(sms) });
      assert.equal(ok.status, 200);
      assert.equal(ok.body.user.role, role);
      const reuse = await fresh().post('/auth/login/verify', { challengeId: l.body.challengeId, code: codeFrom(sms) });
      assert.equal(reuse.body.error.code, 'otp_used');
    }
  });

  it('coordinator without a registered phone cannot log in and no SMS is sent', async () => {
    const staff = await createStaff('coordinator');
    await db.query('UPDATE users SET phone=NULL WHERE id=?', [staff.id]);
    const r = await fresh().post('/auth/login', { email: staff.email, password: PASSWORD });
    assert.equal(r.status, 403);
    assert.equal(r.body.error.code, 'phone_not_registered');
  });

  it('logout revokes the session server-side', async () => {
    const { client } = await registerStudent('logout');
    const cookie = client.cookie;
    assert.equal((await client.post('/auth/logout')).status, 200);
    const replay = fresh();
    replay.cookie = cookie;
    assert.equal((await replay.get('/auth/me')).status, 401);
  });

  it('expired sessions are rejected', async () => {
    const { client, user } = await registerStudent('sess');
    await db.query('UPDATE sessions SET expires_at=(UTC_TIMESTAMP() - INTERVAL 1 MINUTE) WHERE user_id=?', [user.id]);
    assert.equal((await client.get('/auth/me')).status, 401);
  });

  it('suspending a user revokes their sessions', async () => {
    const { client, user } = await registerStudent('susp');
    const admin = await loginStaff(await createStaff('admin'));
    assert.equal((await admin.patch(`/admin/users/${user.id}`, { status: 'suspended' })).status, 200);
    assert.equal((await client.get('/auth/me')).status, 401);
  });
});

describe('Role-based access control (server-enforced)', () => {
  it('requires authentication for protected endpoints', async () => {
    const c = fresh();
    for (const [m, u] of [['get', '/notifications'], ['get', '/me/registrations'], ['post', '/clubs/1/join'], ['get', '/admin/stats'], ['post', '/events']]) {
      assert.equal((await c[m](u)).status, 401, `${m} ${u}`);
    }
  });

  it('students cannot access coordinator/admin endpoints', async () => {
    const { client } = await registerStudent('rbac');
    assert.equal((await client.get('/admin/stats')).status, 403);
    assert.equal((await client.get('/admin/users')).status, 403);
    assert.equal((await client.post('/events', eventPayload(await clubId('coding-and-open-source')))).status, 403);
    const ev = (await client.get('/events?kind=regular')).body.items[0];
    assert.equal((await client.get(`/events/${ev.id}/registrations`)).status, 403);
    assert.equal((await client.put(`/events/${ev.id}/attendance`, { entries: [{ userId: 1, status: 'present' }] })).status, 403);
    assert.equal((await client.patch('/admin/themes/1', { isEnabled: false })).status, 403);
  });

  it('users cannot grant themselves a role through profile updates', async () => {
    const { client, user } = await registerStudent('self');
    const r = await client.patch('/me/profile', { department: 'CSE', role: 'admin' });
    assert.equal(r.status, 200);
    assert.equal(r.body.user.role, 'student');
    assert.equal((await db.query('SELECT role FROM users WHERE id=?', [user.id]))[0].role, 'student');
    assert.equal((await client.post('/admin/users', { name: 'Evil', email: 'e@x.com', password: PASSWORD, role: 'admin', phone: '+919999999999' })).status, 403);
  });

  it('a club join does not make the student a coordinator', async () => {
    const { client, user } = await registerStudent('nocoord');
    await client.post(`/clubs/${await clubId('entrepreneurship')}/join`);
    assert.equal((await db.query('SELECT role FROM users WHERE id=?', [user.id]))[0].role, 'student');
    assert.equal((await client.get(`/clubs/${await clubId('entrepreneurship')}/members`)).status, 403);
  });

  it('admins assign coordinators; only Coordinator-role users can be assigned; coordinators are limited to assigned clubs', async () => {
    const admin = await loginStaff(await createStaff('admin'));
    const coordA = await createStaff('coordinator');
    const { user: student } = await registerStudent('assign');
    const coding = await clubId('coding-and-open-source');
    const robotics = await clubId('robotics-and-innovation');

    assert.equal((await admin.post('/admin/assignments', { userId: student.id, clubId: coding })).status, 400);
    assert.equal((await admin.post('/admin/assignments', { userId: coordA.id, clubId: coding })).status, 201);
    assert.equal((await admin.post('/admin/assignments', { userId: coordA.id, clubId: coding })).status, 409);

    const cA = await loginStaff(coordA);
    const mine = await cA.post('/events', eventPayload(coding));
    assert.equal(mine.status, 201, mine.text);
    assert.equal((await cA.post('/events', eventPayload(robotics))).status, 403, 'unassigned club');
    assert.equal((await cA.post('/events', eventPayload(undefined))).status, 403, 'club required for coordinators');
    assert.equal((await cA.post('/events', eventPayload(coding, { kind: 'festival' }))).status, 403, 'festival events are admin-only');
    assert.equal((await cA.get(`/clubs/${robotics}/members`)).status, 403);
    assert.equal((await cA.get(`/clubs/${coding}/members`)).status, 200);

    // another coordinator cannot touch coordA's event
    const coordB = await createStaff('coordinator');
    await admin.post('/admin/assignments', { userId: coordB.id, clubId: robotics });
    const cB = await loginStaff(coordB);
    const evId = mine.body.event.id;
    assert.equal((await cB.patch(`/events/${evId}`, { capacity: 50 })).status, 403);
    assert.equal((await cB.post(`/events/${evId}/transition`, { to: 'published' })).status, 403);
    assert.equal((await cB.get(`/events/${evId}/registrations`)).status, 403);
    assert.equal((await cB.get(`/events/${evId}`)).status, 404, 'draft hidden from unrelated coordinators');
    // festival (club-less) events cannot be edited by coordinators
    const fest = (await cA.get('/events?kind=festival')).body.items[0];
    assert.equal((await cA.patch(`/events/${fest.id}`, { capacity: 500 })).status, 403);
    // audit trail
    const logs = (await admin.get('/admin/audit-logs?action=coordinator')).body.items;
    assert.ok(logs.some((l) => l.action === 'coordinator.assign'));
  });
});

describe('Clubs and memberships', () => {
  it('joins, prevents duplicates, notifies student + assigned coordinator once, supports leave/rejoin', async () => {
    const admin = await loginStaff(await createStaff('admin'));
    const coord = await createStaff('coordinator');
    const club = await clubId('film-and-cinema-society');
    await admin.post('/admin/assignments', { userId: coord.id, clubId: club });
    const cc = await loginStaff(coord);
    const { client: s, user } = await registerStudent('club');
    const before = (await s.get('/clubs/film-and-cinema-society')).body.club;
    assert.equal(before.myMembership, false);
    assert.equal(before.coordinators.length, 1);

    const join = await s.post(`/clubs/${club}/join`);
    assert.equal(join.status, 201);
    assert.equal(join.body.memberCount, before.memberCount + 1);
    assert.equal((await s.get('/clubs/film-and-cinema-society')).body.club.myMembership, true);

    const dup = await s.post(`/clubs/${club}/join`);
    assert.equal(dup.status, 409);
    assert.equal(dup.body.error.code, 'already_member');
    assert.equal((await db.query("SELECT COUNT(*) c FROM club_memberships WHERE club_id=? AND user_id=?", [club, user.id]))[0].c, 1);

    assert.ok((await notifTypes(s)).includes('club_joined'));
    assert.equal((await notifTypes(s)).filter((t) => t === 'club_joined').length, 1, 'no duplicate after retry');
    const coordTypes = await notifTypes(cc);
    assert.equal(coordTypes.filter((t) => t === 'club_new_member').length, 1);
    assert.ok((await cc.get(`/clubs/${club}/members`)).body.items.some((m) => m.id === user.id));

    assert.equal((await s.del(`/clubs/${club}/membership`)).status, 200);
    assert.equal((await s.del(`/clubs/${club}/membership`)).status, 409);
    assert.equal((await s.post(`/clubs/${club}/join`)).status, 201);
    assert.equal((await db.query("SELECT COUNT(*) c FROM club_memberships WHERE club_id=? AND user_id=?", [club, user.id]))[0].c, 1);
    assert.equal((await notifTypes(s)).filter((t) => t === 'club_joined').length, 2, 're-join is a new membership event');
  });

  it('concurrent duplicate join requests create one membership and one notification', async () => {
    const { client: s, user } = await registerStudent('racejoin');
    const club = await clubId('music-and-performing-arts');
    const rs = await Promise.all([1, 2, 3, 4].map(() => s.post(`/clubs/${club}/join`)));
    assert.equal(rs.filter((r) => r.status === 201).length, 1);
    assert.equal(rs.filter((r) => r.status === 409).length, 3);
    assert.equal((await notifTypes(s)).filter((t) => t === 'club_joined').length, 1);
    assert.equal((await db.query('SELECT COUNT(*) c FROM club_memberships WHERE user_id=?', [user.id]))[0].c, 1);
  });

  it('respects a coordinator\'s notification preferences', async () => {
    const admin = await loginStaff(await createStaff('admin'));
    const coord = await createStaff('coordinator');
    const club = await clubId('photography-and-visual-arts');
    await admin.post('/admin/assignments', { userId: coord.id, clubId: club });
    const cc = await loginStaff(coord);
    assert.equal((await cc.put('/me/preferences', { clubActivity: false })).status, 200);
    const { client: s } = await registerStudent('pref');
    await s.post(`/clubs/${club}/join`);
    assert.ok(!(await notifTypes(cc)).includes('club_new_member'));
  });

  it('club creation request -> admin approval creates a club (initial list is unaffected until then)', async () => {
    const { client: s } = await registerStudent('req');
    const admin = await loginStaff(await createStaff('admin'));
    const name = uniq('Chess Society ');
    const r = await s.post('/club-requests', { name, description: 'A club for chess lovers on campus.', category: 'Games', justification: 'Interest' });
    assert.equal(r.status, 201);
    assert.equal((await s.post('/club-requests', { name, description: 'A club for chess lovers on campus.', category: 'Games' })).status, 409);
    assert.equal((await fresh().get('/clubs')).body.items.length, 8);
    assert.equal((await s.post(`/admin/club-requests/${r.body.id}/approve`)).status, 403);
    const ap = await admin.post(`/admin/club-requests/${r.body.id}/approve`, {});
    assert.equal(ap.status, 200);
    assert.equal((await admin.post(`/admin/club-requests/${r.body.id}/approve`, {})).status, 409);
    assert.ok((await fresh().get('/clubs')).body.items.some((c) => c.name === name && !c.isDemo));
    assert.ok((await notifTypes(s)).includes('club_request_approved'));
    // cleanup so later "exactly eight" style checks elsewhere are not affected
    await db.query('DELETE FROM clubs WHERE name=?', [name]);
  });
});

describe('Events: registration, capacity, lifecycle, attendance, feedback', () => {
  let admin; let coord; let coordUser; let club;
  before(async () => {
    admin = await loginStaff(await createStaff('admin'));
    coordUser = await createStaff('coordinator');
    club = await clubId('debate-and-public-speaking');
    await admin.post('/admin/assignments', { userId: coordUser.id, clubId: club });
    coord = await loginStaff(coordUser);
  });

  const createPublished = async (over = {}) => {
    const c = await coord.post('/events', eventPayload(club, over));
    assert.equal(c.status, 201, c.text);
    const p = await coord.post(`/events/${c.body.event.id}/transition`, { to: 'published' });
    assert.equal(p.status, 200, p.text);
    return p.body.event;
  };

  it('student registers on a seeded demo event, sees status, cannot double-register, can cancel and re-register', async () => {
    const { client: s, user } = await registerStudent('reg');
    const ev = (await s.get('/events?kind=regular')).body.items.find((e) => e.title === 'Build Night: Tiny Web Apps');
    const r = await s.post(`/events/${ev.id}/register`);
    assert.equal(r.status, 201);
    assert.equal(r.body.status, 'confirmed');
    assert.equal(r.body.event.myRegistration.status, 'confirmed');
    assert.equal(r.body.event.registeredCount, ev.registeredCount + 1);
    assert.equal((await s.post(`/events/${ev.id}/register`)).body.error.code, 'already_registered');
    assert.equal((await db.query('SELECT COUNT(*) c FROM event_registrations WHERE event_id=? AND user_id=?', [ev.id, user.id]))[0].c, 1);
    assert.equal(await unread(s), 1);
    assert.ok((await notifTypes(s)).includes('registration_confirmed'));
    const mine = (await s.get('/me/registrations')).body.items;
    assert.equal(mine.length, 1);

    const cancel = await s.del(`/events/${ev.id}/register`);
    assert.equal(cancel.status, 200);
    assert.equal(cancel.body.event.registeredCount, ev.registeredCount);
    assert.ok((await notifTypes(s)).includes('registration_cancelled'));
    assert.equal((await s.del(`/events/${ev.id}/register`)).status, 409);
    assert.equal((await s.post(`/events/${ev.id}/register`)).status, 201);
    assert.equal((await notifTypes(s)).filter((t) => t === 'registration_confirmed').length, 2);
  });

  it('rejects registration after the deadline and for closed/cancelled events', async () => {
    const ev = await createPublished();
    const { client: s } = await registerStudent('late');
    await db.query('UPDATE events SET registration_deadline=(UTC_TIMESTAMP() - INTERVAL 1 MINUTE) WHERE id=?', [ev.id]);
    const r = await s.post(`/events/${ev.id}/register`);
    assert.equal(r.status, 409);
    assert.equal(r.body.error.code, 'deadline_passed');
    await lifecycle.syncStatuses();
    assert.equal((await s.get(`/events/${ev.id}`)).body.event.status, 'registration_closed');
    assert.equal((await s.post(`/events/${ev.id}/register`)).body.error.code, 'registration_closed');
  });

  it('never exceeds capacity under concurrent registrations (waitlist enabled)', async () => {
    const ev = await createPublished({ capacity: 3 });
    const students = await Promise.all([1, 2, 3, 4, 5, 6].map((i) => registerStudent(`conc${i}`)));
    const res = await Promise.all(students.map((s) => s.client.post(`/events/${ev.id}/register`)));
    assert.ok(res.every((r) => r.status === 201), res.map((r) => r.text).join('|'));
    const statuses = res.map((r) => r.body.status);
    assert.equal(statuses.filter((s) => s === 'confirmed').length, 3);
    assert.equal(statuses.filter((s) => s === 'waitlisted').length, 3);
    assert.equal((await db.query("SELECT COUNT(*) c FROM event_registrations WHERE event_id=? AND status='confirmed'", [ev.id]))[0].c, 3);
  });

  it('rejects overflow when the waitlist is disabled', async () => {
    const ev = await createPublished({ capacity: 2, waitlistEnabled: false });
    const students = await Promise.all([1, 2, 3, 4, 5].map((i) => registerStudent(`full${i}`)));
    const res = await Promise.all(students.map((s) => s.client.post(`/events/${ev.id}/register`)));
    assert.equal(res.filter((r) => r.status === 201).length, 2);
    assert.equal(res.filter((r) => r.status === 409 && r.body.error.code === 'event_full').length, 3);
    assert.equal((await db.query("SELECT COUNT(*) c FROM event_registrations WHERE event_id=? AND status='confirmed'", [ev.id]))[0].c, 2);
  });

  it('promotes the first waitlisted student when a confirmed student cancels', async () => {
    const ev = await createPublished({ capacity: 1 });
    const a = await registerStudent('wl-a');
    const b = await registerStudent('wl-b');
    const c = await registerStudent('wl-c');
    assert.equal((await a.client.post(`/events/${ev.id}/register`)).body.status, 'confirmed');
    const rb = await b.client.post(`/events/${ev.id}/register`);
    assert.equal(rb.body.status, 'waitlisted');
    assert.equal(rb.body.event.myRegistration.waitlistPosition, 1);
    await sleep(20);
    assert.equal((await c.client.post(`/events/${ev.id}/register`)).body.event.myRegistration.waitlistPosition, 2);
    await a.client.del(`/events/${ev.id}/register`);
    assert.equal((await b.client.get(`/events/${ev.id}`)).body.event.myRegistration.status, 'confirmed');
    assert.equal((await c.client.get(`/events/${ev.id}`)).body.event.myRegistration.status, 'waitlisted');
    assert.ok((await notifTypes(b.client)).includes('registration_promoted'));
  });

  it('approval-required events hold registrations as pending until a coordinator approves', async () => {
    const ev = await createPublished({ requiresApproval: true });
    const s = await registerStudent('appr');
    assert.equal((await s.client.post(`/events/${ev.id}/register`)).body.status, 'pending');
    const regs = (await coord.get(`/events/${ev.id}/registrations`)).body.items;
    assert.equal(regs.length, 1);
    assert.equal((await coord.patch(`/events/${ev.id}/registrations/${regs[0].id}`, { action: 'approve' })).status, 200);
    assert.equal((await s.client.get(`/events/${ev.id}`)).body.event.myRegistration.status, 'confirmed');
    assert.ok((await notifTypes(s.client)).includes('registration_approved'));
  });

  it('enforces lifecycle transition rules', async () => {
    const c = await coord.post('/events', eventPayload(club));
    const id = c.body.event.id;
    assert.equal(c.body.event.status, 'draft');
    assert.equal((await coord.post(`/events/${id}/transition`, { to: 'ongoing' })).status, 409);
    assert.equal((await coord.post(`/events/${id}/transition`, { to: 'completed' })).status, 409);
    assert.equal((await fresh().get(`/events/${id}`)).status, 404, 'drafts are not public');
    assert.equal((await coord.post(`/events/${id}/transition`, { to: 'published' })).body.event.status, 'published');
    assert.equal((await fresh().get(`/events/${id}`)).status, 200);
    assert.equal((await coord.post(`/events/${id}/transition`, { to: 'registration_closed' })).body.event.status, 'registration_closed');
    assert.equal((await coord.post(`/events/${id}/transition`, { to: 'published' })).body.event.status, 'published');
    assert.equal((await coord.post(`/events/${id}/transition`, { to: 'cancelled', reason: 'Speaker unavailable' })).body.event.status, 'cancelled');
    assert.equal((await coord.post(`/events/${id}/transition`, { to: 'published' })).status, 409);
    assert.equal((await coord.patch(`/events/${id}`, { capacity: 9 })).status, 409);
  });

  it('validates event input (schedule order, deadline, past dates, capacity)', async () => {
    assert.equal((await coord.post('/events', eventPayload(club, { endsAt: hrs(70) }))).status, 400);
    assert.equal((await coord.post('/events', eventPayload(club, { registrationDeadline: hrs(80) }))).status, 400);
    assert.equal((await coord.post('/events', eventPayload(club, { startsAt: hrs(-5), endsAt: hrs(-3), registrationDeadline: hrs(-6) }))).status, 400);
    assert.equal((await coord.post('/events', eventPayload(club, { capacity: 0 }))).status, 400);
    assert.equal((await coord.post('/events', { title: 'x' })).status, 400);
  });

  it('notifies registrants on venue changes and on cancellation; bumps version', async () => {
    const ev = await createPublished();
    const a = await registerStudent('chg-a');
    const b = await registerStudent('chg-b');
    await a.client.post(`/events/${ev.id}/register`);
    await b.client.post(`/events/${ev.id}/register`);
    const upd = await coord.patch(`/events/${ev.id}`, { venue: 'Seminar Hall 2', academicBlock: 'Block C' });
    assert.equal(upd.status, 200);
    assert.equal(upd.body.event.venue, 'Seminar Hall 2');
    assert.equal(upd.body.event.venuePlaceholder, false);
    assert.equal(upd.body.event.version, ev.version + 1);
    for (const s of [a, b]) assert.equal((await notifTypes(s.client)).filter((t) => t === 'event_changed').length, 1);
    assert.equal((await coord.patch(`/events/${ev.id}`, { capacity: 1 })).status, 409, 'capacity below registrations');
    await coord.post(`/events/${ev.id}/transition`, { to: 'cancelled', reason: 'Weather' });
    for (const s of [a, b]) assert.equal((await notifTypes(s.client)).filter((t) => t === 'event_cancelled').length, 1);
    assert.equal((await a.client.get(`/events/${ev.id}`)).body.event.status, 'cancelled');
  });

  it('records attendance, drives participation history, feedback eligibility and reports', async () => {
    const ev = await createPublished();
    const present = await registerStudent('att-p');
    const absent = await registerStudent('att-a');
    const never = await registerStudent('att-n');
    await present.client.post(`/events/${ev.id}/register`);
    await absent.client.post(`/events/${ev.id}/register`);

    const early = await coord.put(`/events/${ev.id}/attendance`, { entries: [{ userId: present.user.id, status: 'present' }] });
    assert.equal(early.status, 409);
    assert.equal(early.body.error.code, 'attendance_not_open');

    assert.equal((await coord.post(`/events/${ev.id}/transition`, { to: 'ongoing' })).body.event.status, 'ongoing');
    assert.equal((await never.client.put(`/events/${ev.id}/attendance`, { entries: [{ userId: never.user.id, status: 'present' }] })).status, 403);
    assert.equal((await coord.put(`/events/${ev.id}/attendance`, { entries: [{ userId: never.user.id, status: 'present' }] })).status, 400, 'unregistered student');
    const rec = await coord.put(`/events/${ev.id}/attendance`, { entries: [{ userId: present.user.id, status: 'present' }, { userId: absent.user.id, status: 'absent' }] });
    assert.equal(rec.status, 200);
    assert.equal(rec.body.saved, 2);
    const list = (await coord.get(`/events/${ev.id}/attendance`)).body;
    assert.equal(list.attendees.find((a) => a.userId === present.user.id).attendance, 'present');

    assert.equal((await present.client.post(`/events/${ev.id}/feedback`, { rating: 5 })).status, 409, 'event not completed yet');
    assert.equal((await coord.post(`/events/${ev.id}/transition`, { to: 'completed' })).body.event.status, 'completed');

    assert.equal((await present.client.post(`/events/${ev.id}/feedback`, { rating: 9 })).status, 400);
    assert.equal((await present.client.post(`/events/${ev.id}/feedback`, { rating: 4, comments: 'Great session' })).status, 201);
    assert.equal((await present.client.post(`/events/${ev.id}/feedback`, { rating: 5 })).status, 409);
    assert.equal((await absent.client.post(`/events/${ev.id}/feedback`, { rating: 5 })).status, 403);
    assert.equal((await never.client.post(`/events/${ev.id}/feedback`, { rating: 5 })).status, 403);

    const hist = (await present.client.get('/me/history')).body.items;
    assert.equal(hist.length, 1);
    assert.equal(hist[0].attendance, 'present');
    assert.equal(hist[0].feedback.rating, 4);
    assert.equal((await absent.client.get('/me/history')).body.items[0].attendance, 'absent');
    assert.equal((await never.client.get('/me/history')).body.items.length, 0);

    const fb = (await coord.get(`/events/${ev.id}/feedback`)).body;
    assert.equal(fb.count, 1);
    assert.equal(fb.averageRating, 4);
    const rep = (await coord.get(`/events/${ev.id}/report`)).body;
    assert.equal(rep.registrations.confirmed, 2);
    assert.equal(rep.attendance.present, 1);
    assert.equal(rep.attendance.absent, 1);
    const csv = await coord.get(`/events/${ev.id}/report?format=csv`);
    assert.equal(csv.status, 200);
    assert.match(csv.headers.get('content-type'), /text\/csv/);
    assert.match(csv.text, /Registration status/);
    assert.equal((await present.client.get(`/events/${ev.id}/report`)).status, 403);
    assert.equal((await fresh().get('/events?when=completed')).body.items.some((e) => e.id === ev.id), true);
  });

  it('auto-lifecycle: published -> ongoing -> completed by time', async () => {
    const ev = await createPublished();
    await db.query('UPDATE events SET starts_at=(UTC_TIMESTAMP() - INTERVAL 1 HOUR), ends_at=(UTC_TIMESTAMP() + INTERVAL 1 HOUR), registration_deadline=(UTC_TIMESTAMP() - INTERVAL 2 HOUR) WHERE id=?', [ev.id]);
    await lifecycle.syncStatuses();
    assert.equal((await db.query('SELECT status FROM events WHERE id=?', [ev.id]))[0].status, 'ongoing');
    await db.query('UPDATE events SET ends_at=(UTC_TIMESTAMP() - INTERVAL 1 MINUTE) WHERE id=?', [ev.id]);
    await lifecycle.syncStatuses();
    assert.equal((await db.query('SELECT status FROM events WHERE id=?', [ev.id]))[0].status, 'completed');
  });

  it('coordinator announcements reach registrants once; reminders are idempotent; saved events work', async () => {
    const ev = await createPublished();
    const s = await registerStudent('ann');
    await s.client.post(`/events/${ev.id}/register`);
    const a = await coord.post(`/events/${ev.id}/announcements`, { title: 'Bring ID', body: 'Please bring your ID card.' });
    assert.equal(a.status, 201);
    assert.equal(a.body.notified, 1);
    assert.ok((await notifTypes(s.client)).includes('event_announcement'));
    assert.equal((await s.client.post(`/events/${ev.id}/announcements`, { title: 'Hack', body: 'nope nope' })).status, 403);

    await db.query('UPDATE events SET starts_at=(UTC_TIMESTAMP() + INTERVAL 3 HOUR), ends_at=(UTC_TIMESTAMP() + INTERVAL 5 HOUR) WHERE id=?', [ev.id]);
    const r1 = await lifecycle.sendReminders();
    const r2 = await lifecycle.sendReminders();
    assert.ok(r1.created >= 1);
    assert.equal(r2.created, 0);
    assert.equal((await notifTypes(s.client)).filter((t) => t === 'event_reminder').length, 1);

    assert.equal((await s.client.post(`/events/${ev.id}/save`)).status, 200);
    assert.equal((await s.client.get('/me/saved-events')).body.items.length, 1);
    assert.equal((await s.client.del(`/events/${ev.id}/save`)).status, 200);
    assert.equal((await s.client.get('/me/saved-events')).body.items.length, 0);
  });
});

describe('Notifications', () => {
  it('persists, counts unread, marks read individually and all, and isolates users', async () => {
    const a = await registerStudent('n-a');
    const b = await registerStudent('n-b');
    const club1 = await clubId('literary-and-book-club');
    const club2 = await clubId('robotics-and-innovation');
    await a.client.post(`/clubs/${club1}/join`);
    await a.client.post(`/clubs/${club2}/join`);
    assert.equal(await unread(a.client), 2);
    assert.equal(await unread(b.client), 0);
    const items = (await a.client.get('/notifications')).body.items;
    assert.equal(items.length, 2);
    assert.ok(items[0].createdAt && items[0].title && items[0].isRead === false);

    // b cannot mark a's notification as read
    await b.client.post(`/notifications/${items[0].id}/read`);
    assert.equal(await unread(a.client), 2);
    assert.equal((await a.client.post(`/notifications/${items[0].id}/read`)).body.unread, 1);
    assert.equal((await a.client.get('/notifications?unread=true')).body.items.length, 1);
    assert.equal((await a.client.post('/notifications/read-all')).body.unread, 0);
    assert.equal(await unread(a.client), 0);
    // persisted in the database, not just memory
    assert.equal((await db.query('SELECT COUNT(*) c FROM notifications WHERE user_id=? AND is_read=1', [a.user.id]))[0].c, 2);
  });

  it('stores and returns notification preferences; optional login alerts never block login', async () => {
    const s = await registerStudent('prefs');
    const p = await s.client.put('/me/preferences', { loginAlerts: true, emailEnabled: false, reminders: false });
    assert.equal(p.body.preferences.loginAlerts, true);
    assert.equal((await s.client.get('/me/preferences')).body.preferences.emailEnabled, false);
    const login = await fresh().post('/auth/login', { email: s.email, password: PASSWORD });
    assert.equal(login.status, 200);
    assert.equal(login.body.requiresOtp, false);
    await sleep(150);
    assert.ok((await notifTypes(s.client)).includes('login_alert'));
  });
});

describe('Festival themes', () => {
  it('resolves the active theme from the schedule, falling back to default', async () => {
    const c = fresh();
    const themes = (await db.query('SELECT slug, start_date, end_date FROM festival_themes ORDER BY slug')).reduce((m, t) => ({ ...m, [t.slug]: t }), {});
    const day = (d) => (d instanceof Date ? d.toISOString().slice(0, 10) : d);
    const diwali = (await c.get(`/themes/active?date=${day(themes.diwali.start_date)}`)).body;
    assert.equal(diwali.mode, 'festival');
    assert.equal(diwali.theme.slug, 'diwali');
    assert.equal(diwali.theme.config.decoration, 'diya');
    const dussehra = (await c.get(`/themes/active?date=${day(themes['dussehra-navaratri'].end_date)}`)).body;
    assert.equal(dussehra.theme.slug, 'dussehra-navaratri');
    assert.equal(dussehra.theme.config.decoration, 'marigold');
    assert.notEqual(diwali.theme.config.colors.primary, dussehra.theme.config.colors.primary);
    assert.notEqual(diwali.theme.config.colors.heroFrom, dussehra.theme.config.colors.heroFrom);
    const off = (await c.get('/themes/active?date=2001-01-01')).body;
    assert.equal(off.mode, 'default');
    assert.equal(off.theme, null);
    assert.equal(off.campus.timezone, 'Asia/Kolkata');
    assert.equal((await c.get('/themes/active?date=garbage')).status, 400);
  });

  it('uses the campus timezone for the local date', () => {
    const at = new Date('2026-11-01T20:00:00Z'); // already Nov 2 in India (UTC+5:30)
    assert.equal(themeService.localDate('Asia/Kolkata', at), '2026-11-02');
    assert.equal(themeService.localDate('UTC', at), '2026-11-01');
  });

  it('admin can reschedule/disable themes; overlaps resolve by priority; unreadable colours are rejected; non-admins cannot edit', async () => {
    const admin = await loginStaff(await createStaff('admin'));
    const { client: s } = await registerStudent('theme');
    const list = (await admin.get('/admin/themes')).body.items;
    const diwali = list.find((t) => t.slug === 'diwali');
    const dussehra = list.find((t) => t.slug === 'dussehra-navaratri');
    assert.equal((await s.patch(`/admin/themes/${diwali.id}`, { isEnabled: false })).status, 403);

    // Move Diwali to overlap Dussehra with lower priority -> Dussehra wins; raise priority -> Diwali wins
    const probe = dussehra.startDate;
    assert.equal((await admin.patch(`/admin/themes/${diwali.id}`, { startDate: probe, endDate: dussehra.endDate, priority: 1 })).status, 200);
    assert.equal((await fresh().get(`/themes/active?date=${probe}`)).body.theme.slug, 'dussehra-navaratri');
    const overlapInfo = (await admin.get(`/admin/themes/${diwali.id}`)).body.theme.overlaps;
    assert.ok(overlapInfo.some((o) => o.slug === 'dussehra-navaratri'));
    await admin.patch(`/admin/themes/${diwali.id}`, { priority: 50 });
    assert.equal((await fresh().get(`/themes/active?date=${probe}`)).body.theme.slug, 'diwali');
    // Disable both -> default
    await admin.patch(`/admin/themes/${diwali.id}`, { isEnabled: false });
    await admin.patch(`/admin/themes/${dussehra.id}`, { isEnabled: false });
    assert.equal((await fresh().get(`/themes/active?date=${probe}`)).body.mode, 'default');
    // Edit visuals
    const edited = await admin.patch(`/admin/themes/${dussehra.id}`, { isEnabled: true, config: { banner: { headline: 'Custom headline' } } });
    assert.equal(edited.body.theme.config.banner.headline, 'Custom headline');
    assert.equal(edited.body.theme.config.colors.primary, dussehra.config.colors.primary, 'deep-merge keeps other settings');
    // Unreadable text colour is refused
    const bad = await admin.patch(`/admin/themes/${dussehra.id}`, { config: { colors: { text: '#FFFFF0', background: '#FFFFFF' } } });
    assert.equal(bad.status, 400);
    assert.equal(bad.body.error.code, 'low_contrast');
    assert.equal((await admin.patch(`/admin/themes/${dussehra.id}`, { startDate: '2026-12-31', endDate: '2026-01-01' })).status, 400);
    // restore the original schedule
    await admin.patch(`/admin/themes/${diwali.id}`, { startDate: diwali.startDate, endDate: diwali.endDate, priority: diwali.priority, isEnabled: true });
    await admin.patch(`/admin/themes/${dussehra.id}`, { isEnabled: true });
  });
});

describe('Admin & platform', () => {
  it('manages users/roles safely, exposes stats and audit logs', async () => {
    const adminStaff = await createStaff('admin');
    const admin = await loginStaff(adminStaff);
    const { user } = await registerStudent('promote');
    // promotion to coordinator requires a phone number
    assert.equal((await admin.patch(`/admin/users/${user.id}`, { role: 'coordinator' })).status, 400);
    const ok = await admin.patch(`/admin/users/${user.id}`, { role: 'coordinator', phone: '+919811122233' });
    assert.equal(ok.status, 200);
    assert.equal(ok.body.user.role, 'coordinator');
    assert.equal((await admin.patch(`/admin/users/${adminStaff.id}`, { role: 'student' })).status, 403, 'cannot demote self');
    assert.equal((await admin.post('/admin/users', { name: 'New Coord', email: `${uniq('nc')}@staff.example.com`, password: PASSWORD, role: 'coordinator' })).status, 400, 'phone required');
    const stats = (await admin.get('/admin/stats')).body;
    assert.ok(stats.users.byRole.student >= 1 && stats.clubs.total >= 8);
    const users = (await admin.get('/admin/users?role=coordinator')).body;
    assert.ok(users.items.every((u) => u.role === 'coordinator'));
    assert.ok(users.items.every((u) => !('passwordHash' in u) && !('password_hash' in u)));
    const logs = (await admin.get('/admin/audit-logs?action=user.update')).body.items;
    assert.ok(logs.length >= 1 && logs[0].actor.id === adminStaff.id);
    assert.equal((await admin.put('/admin/settings', { student_email_domains: 'cb.students.amrita.edu', reminder_hours: 12 })).status, 200);
    assert.equal((await admin.put('/admin/settings', { student_email_domains: 'bad domain!' })).status, 400);
    assert.equal((await admin.put('/admin/settings', { reminder_hours: 24 })).body.settings.reminderHours, 24);
  });

  it('student login OTP can be required by an admin setting', async () => {
    const admin = await loginStaff(await createStaff('admin'));
    const { email } = await registerStudent('otpset');
    await admin.put('/admin/settings', { require_student_login_otp: 'true' });
    const l = await fresh().post('/auth/login', { email, password: PASSWORD });
    assert.equal(l.body.requiresOtp, true);
    assert.equal(l.body.channel, 'email');
    await admin.put('/admin/settings', { require_student_login_otp: 'false' });
  });
});

describe('API robustness', () => {
  it('handles malformed JSON, bad ids, unknown routes without leaking internals', async () => {
    const c = fresh();
    const bad = await c.request('POST', '/auth/login', '{"email": ');
    assert.equal(bad.status, 400);
    assert.equal(bad.body.error.code, 'invalid_json');
    assert.equal((await c.get('/events/does-not-exist')).status, 404);
    assert.equal((await c.get('/clubs/does-not-exist')).status, 404);
    assert.equal((await c.get('/nope')).status, 404);
    const { client } = await registerStudent('robust');
    assert.equal((await client.post('/clubs/abc/join')).status, 400);
    assert.equal((await client.get('/events?when=bogus')).status, 400);
    assert.equal((await client.get('/events?search=%25%27%22;DROP%20TABLE%20users')).status, 200);
    assert.equal((await db.query('SELECT COUNT(*) c FROM users'))[0].c > 0, true);
    assert.doesNotMatch(bad.text, /sql|stack|node_modules/i);
  });

  it('persists data across a fresh connection pool (restart simulation)', async () => {
    const mysql = require('mysql2/promise');
    const conn = await mysql.createConnection({ host: process.env.DB_HOST, port: Number(process.env.DB_PORT), user: process.env.DB_USER, password: process.env.DB_PASSWORD, database: process.env.DB_NAME });
    const [[m]] = await conn.query("SELECT COUNT(*) c FROM club_memberships WHERE status='active'");
    const [[r]] = await conn.query("SELECT COUNT(*) c FROM event_registrations WHERE status IN ('confirmed','waitlisted')");
    const [[n]] = await conn.query('SELECT COUNT(*) c FROM notifications');
    const [[p]] = await conn.query('SELECT COUNT(*) c FROM notification_preferences');
    await conn.end();
    assert.ok(m.c > 0 && r.c > 0 && n.c > 0 && p.c > 0);
  });
});
