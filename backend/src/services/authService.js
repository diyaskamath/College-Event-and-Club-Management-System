'use strict';
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config');
const { query, withTransaction } = require('../db');
const otp = require('./otpService');
const settings = require('./settingsService');
const notifications = require('./notificationService');
const { mapUser } = require('./mappers');
const { audit } = require('../utils/audit');
const { AppError, unauthorized, forbidden, badRequest, conflict } = require('../utils/errors');

// Valid bcrypt hash of a random string: used to keep login timing uniform for unknown emails.
const DUMMY_HASH = bcrypt.hashSync(crypto.randomBytes(12).toString('hex'), config.auth.bcryptRounds);

async function createSession(user, req) {
  const sid = crypto.randomUUID();
  const expires = new Date(Date.now() + config.auth.sessionHours * 3600 * 1000);
  await query('INSERT INTO sessions (id,user_id,expires_at,ip,user_agent) VALUES (?,?,?,?,?)', [
    sid,
    user.id,
    expires,
    req.ip || null,
    (req.headers['user-agent'] || '').slice(0, 255),
  ]);
  const token = jwt.sign({ sub: user.id, sid }, config.auth.jwtSecret, { algorithm: 'HS256', expiresIn: `${config.auth.sessionHours}h` });
  return { sid, token, expires };
}

function setSessionCookie(res, session) {
  res.cookie(config.auth.cookieName, session.token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: config.isProd,
    expires: session.expires,
    path: '/',
  });
}

const clearSessionCookie = (res) => res.clearCookie(config.auth.cookieName, { httpOnly: true, sameSite: 'lax', secure: config.isProd, path: '/' });

async function finishLogin(user, req, res) {
  await query('UPDATE users SET last_login_at=UTC_TIMESTAMP() WHERE id=?', [user.id]);
  const session = await createSession(user, req);
  setSessionCookie(res, session);
  await audit(user.id, 'auth.login', { entityType: 'user', entityId: user.id, ip: req.ip });
  // Optional, informational-only login alert. Never blocks or approves authentication.
  notifications
    .notify(null, {
      userId: user.id,
      type: 'login_alert',
      category: 'login_alerts',
      title: 'New login to your account',
      body: `You signed in on ${new Date().toUTCString()}. If this wasn't you, contact an administrator.`,
      link: '/notifications',
      dedupeKey: `login:${session.sid}`,
    })
    .catch((e) => console.error('[login-alert]', e.message));
  const fresh = (await query('SELECT * FROM users WHERE id=?', [user.id]))[0];
  return mapUser(fresh);
}

// ---- STUDENT REGISTRATION -----------------------------------------------------------------------
async function registerStudent({ name, email, password, campusId }, req) {
  const typed = await settings.getTyped();
  const domain = email.split('@')[1];
  if (!typed.studentEmailDomains.includes(domain)) {
    throw badRequest('email_domain_not_allowed', `Registration is limited to approved Amrita student email addresses (${typed.studentEmailDomains.map((d) => `@${d}`).join(', ')}).`);
  }
  const hash = await bcrypt.hash(password, config.auth.bcryptRounds);
  const existing = (await query('SELECT * FROM users WHERE email=?', [email]))[0];

  let userId;
  if (!existing) {
    // Safely resolve campusId — if not provided or invalid, fall back to first campus or NULL
    let safeCampusId = null;
    if (campusId) {
      const campusExists = (await query('SELECT 1 FROM campuses WHERE id=? AND is_active=1', [campusId])).length > 0;
      if (campusExists) {
        safeCampusId = campusId;
      } else {
        // Fall back to first active campus
        const firstCampus = (await query('SELECT id FROM campuses WHERE is_active=1 ORDER BY id LIMIT 1'))[0];
        safeCampusId = firstCampus ? firstCampus.id : null;
      }
    } else {
      // No campusId — use first active campus
      const firstCampus = (await query('SELECT id FROM campuses WHERE is_active=1 ORDER BY id LIMIT 1'))[0];
      safeCampusId = firstCampus ? firstCampus.id : null;
    }

    try {
      const res = await query(
        "INSERT INTO users (name,email,password_hash,role,status,campus_id) VALUES (?,?,?,'student','pending',?)",
        [name, email, hash, safeCampusId],
      );
      userId = res.insertId;
      await notifications.ensurePreferences(userId);
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        // Race condition: another request registered this email just now
        await ensureDeliveryConfigured('email');
        return { ...otp.decoy('email', email), message: GENERIC_REGISTER_MESSAGE };
      }
      throw err;
    }
  } else if (existing.status === 'pending' && existing.role === 'student') {
    // Unverified, abandoned registration: refresh details and issue a new code.
    let safeCampusId = existing.campus_id;
    if (campusId && campusId !== existing.campus_id) {
      const campusExists = (await query('SELECT 1 FROM campuses WHERE id=? AND is_active=1', [campusId])).length > 0;
      safeCampusId = campusExists ? campusId : existing.campus_id;
    }
    await query('UPDATE users SET name=?, password_hash=?, campus_id=? WHERE id=?', [name, hash, safeCampusId, existing.id]);
    userId = existing.id;
  } else {
    // Anti-enumeration: identical response shape; nothing is stored or sent.
    await ensureDeliveryConfigured('email');
    return { ...otp.decoy('email', email), message: GENERIC_REGISTER_MESSAGE };
  }
  const challenge = await otp.issue({ userId, purpose: 'register', channel: 'email', destination: email });
  await audit(userId, 'auth.register_started', { entityType: 'user', entityId: userId, ip: req.ip });
  return { ...challenge, message: GENERIC_REGISTER_MESSAGE };
}

// ---- ADMIN REGISTRATION -------------------------------------------------------------------------
async function registerAdmin({ phone, adminId, password }, req) {
  // Admin: Phone Number + ID + Password. No email required.
  if (!phone) throw badRequest('phone_required', 'Admins must provide a phone number for OTP verification.');
  if (!adminId) throw badRequest('admin_id_required', 'Admins must provide their unique admin ID.');

  const hash = await bcrypt.hash(password, config.auth.bcryptRounds);

  // Check if adminId already taken
  const existingById = (await query('SELECT * FROM users WHERE admin_id=?', [adminId]))[0];
  if (existingById && existingById.status === 'active') {
    // Anti-enumeration: send decoy (same response shape)
    await ensureDeliveryConfigured('sms');
    return { ...otp.decoy('sms', phone), message: GENERIC_ADMIN_REGISTER_MESSAGE };
  }

  // Check if phone already taken by an active admin
  const existingByPhone = (await query("SELECT * FROM users WHERE phone=? AND role='admin' AND status='active'", [phone]))[0];
  if (existingByPhone) {
    await ensureDeliveryConfigured('sms');
    return { ...otp.decoy('sms', phone), message: GENERIC_ADMIN_REGISTER_MESSAGE };
  }

  // Get first campus
  const firstCampus = (await query('SELECT id FROM campuses WHERE is_active=1 ORDER BY id LIMIT 1'))[0];
  const safeCampusId = firstCampus ? firstCampus.id : null;

  let userId;
  if (existingById && existingById.status === 'pending' && existingById.role === 'admin') {
    // Refresh pending admin
    await query('UPDATE users SET phone=?, password_hash=? WHERE id=?', [phone, hash, existingById.id]);
    userId = existingById.id;
  } else {
    try {
      const res = await query(
        "INSERT INTO users (name,phone,admin_id,password_hash,role,status,campus_id) VALUES (?,?,?,?,'admin','pending',?)",
        [`Admin-${adminId}`, phone, adminId, hash, safeCampusId],
      );
      userId = res.insertId;
      await notifications.ensurePreferences(userId);
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        await ensureDeliveryConfigured('sms');
        return { ...otp.decoy('sms', phone), message: GENERIC_ADMIN_REGISTER_MESSAGE };
      }
      throw err;
    }
  }

  const challenge = await otp.issue({ userId, purpose: 'register', channel: 'sms', destination: phone });
  await audit(userId, 'auth.register_started', { entityType: 'user', entityId: userId, ip: req.ip });
  return { ...challenge, message: GENERIC_ADMIN_REGISTER_MESSAGE };
}

// ---- COORDINATOR REGISTRATION -------------------------------------------------------------------
async function registerCoordinator({ phone, email, password }, req) {
  // Coordinator: Phone Number + Outlook Mail + Password. OTP via SMS to registered phone.
  if (!phone) throw badRequest('phone_required', 'Coordinators must provide a phone number for SMS OTP verification.');
  if (!email) throw badRequest('email_required', 'Coordinators must provide an Outlook email.');

  const hash = await bcrypt.hash(password, config.auth.bcryptRounds);
  const existingByEmail = (await query('SELECT * FROM users WHERE email=?', [email]))[0];

  // Get first campus
  const firstCampus = (await query('SELECT id FROM campuses WHERE is_active=1 ORDER BY id LIMIT 1'))[0];
  const safeCampusId = firstCampus ? firstCampus.id : null;

  let userId;
  if (!existingByEmail) {
    try {
      const res = await query(
        "INSERT INTO users (name,email,phone,password_hash,role,status,campus_id) VALUES (?,?,?,?,'coordinator','pending',?)",
        [`Coordinator`, email, phone, hash, safeCampusId],
      );
      userId = res.insertId;
      await notifications.ensurePreferences(userId);
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        await ensureDeliveryConfigured('sms');
        return { ...otp.decoy('sms', phone), message: GENERIC_COORD_REGISTER_MESSAGE };
      }
      throw err;
    }
  } else if (existingByEmail.status === 'pending' && existingByEmail.role === 'coordinator') {
    await query('UPDATE users SET phone=?, password_hash=? WHERE id=?', [phone, hash, existingByEmail.id]);
    userId = existingByEmail.id;
  } else {
    await ensureDeliveryConfigured('sms');
    return { ...otp.decoy('sms', phone), message: GENERIC_COORD_REGISTER_MESSAGE };
  }

  // Coordinator gets OTP via SMS to registered phone number
  const challenge = await otp.issue({ userId, purpose: 'register', channel: 'sms', destination: phone });
  await audit(userId, 'auth.register_started', { entityType: 'user', entityId: userId, ip: req.ip });
  return { ...challenge, message: GENERIC_COORD_REGISTER_MESSAGE };
}

// ---- UNIFIED REGISTER DISPATCHER ----------------------------------------------------------------
async function register(body, req) {
  const role = body.role || 'student';
  if (role === 'admin' || role === 'coordinator') {
    throw forbidden(
      'Administrator and Coordinator accounts cannot be self-registered. They must be provisioned by a platform administrator or via backend account seeding.',
      'role_self_registration_forbidden'
    );
  }
  return registerStudent(body, req);
}

const GENERIC_REGISTER_MESSAGE = 'If this email address is eligible, a verification code has been sent to your registered email.';
const GENERIC_ADMIN_REGISTER_MESSAGE = 'If this admin ID can be registered, a verification code has been sent to your phone number.';
const GENERIC_COORD_REGISTER_MESSAGE = 'If this account can be registered, a verification code has been sent to your phone number.';

async function ensureDeliveryConfigured(channel) {
  const delivery = require('../integrations/delivery');
  if ((channel === 'email' ? delivery.emailProviderName() : delivery.smsProviderName()) === 'none') {
    await (channel === 'email' ? delivery.sendEmail({ to: 'x', subject: '', text: '' }) : delivery.sendSms({ to: 'x', text: '' }));
  }
}

async function verifyRegistration({ challengeId, code }, req, res) {
  const challenge = await otp.verify({ challengeId, code, purpose: 'register' });
  const user = (await query('SELECT * FROM users WHERE id=?', [challenge.user_id]))[0];
  if (!user || user.status === 'suspended') throw forbidden('This account cannot be activated.', 'account_suspended');
  await query("UPDATE users SET status='active', email_verified_at=COALESCE(email_verified_at, UTC_TIMESTAMP()) WHERE id=?", [user.id]);

  // For admin users: set a default name if still using placeholder
  if (user.role === 'admin' && user.name && user.name.startsWith('Admin-')) {
    await query('UPDATE users SET name=? WHERE id=?', [`Admin ${user.admin_id}`, user.id]);
  }

  await audit(user.id, 'auth.register_verified', { entityType: 'user', entityId: user.id, ip: req.ip });
  return finishLogin(user, req, res);
}

async function login({ email, phone, adminId, password, role }, req, res) {
  // Support both email-based login (student/coordinator) and phone/adminId login (admin)
  let user = null;

  if (email) {
    user = (await query('SELECT * FROM users WHERE email=?', [email]))[0];
  } else if (adminId) {
    user = (await query("SELECT * FROM users WHERE admin_id=? AND role='admin'", [adminId]))[0];
  } else if (phone) {
    user = (await query("SELECT * FROM users WHERE phone=? AND role IN ('admin','coordinator')", [phone]))[0];
  }

  const ok = await bcrypt.compare(password, user ? user.password_hash : DUMMY_HASH);
  if (!user || !ok) {
    await audit(user ? user.id : null, 'auth.login_failed', { entityType: 'user', entityId: user ? user.id : null, ip: req.ip, metadata: user ? null : { reason: 'unknown_credentials' } });
    throw unauthorized('Incorrect credentials. Please check and try again.', 'invalid_credentials');
  }

  // Prevent role spoofing / privilege escalation from client selection
  if (role && user.role !== role) {
    await audit(user.id, 'auth.role_mismatch', { entityType: 'user', entityId: user.id, ip: req.ip, metadata: { requestedRole: role, actualRole: user.role } });
    throw unauthorized('Incorrect credentials or unauthorized role. Please check and try again.', 'invalid_credentials');
  }

  if (user.status === 'suspended') throw forbidden('This account has been suspended. Contact an administrator.', 'account_suspended');

  if (user.status === 'pending') {
    // Credentials are correct but the account was never verified: continue verification.
    if (user.role === 'admin') {
      if (!user.phone) throw badRequest('phone_not_registered', 'No phone number registered for OTP delivery.');
      const challenge = await otp.issue({ userId: user.id, purpose: 'register', channel: 'sms', destination: user.phone });
      return { requiresOtp: true, purpose: 'register', ...challenge };
    }
    if (user.role === 'coordinator') {
      if (!user.phone) throw badRequest('phone_not_registered', 'No phone number registered for OTP delivery.');
      const challenge = await otp.issue({ userId: user.id, purpose: 'register', channel: 'sms', destination: user.phone });
      return { requiresOtp: true, purpose: 'register', ...challenge };
    }
    // Student
    const challenge = await otp.issue({ userId: user.id, purpose: 'register', channel: 'email', destination: user.email });
    return { requiresOtp: true, purpose: 'register', ...challenge };
  }

  const typed = await settings.getTyped();
  if (user.role === 'student') {
    if (!typed.requireStudentLoginOtp) return { requiresOtp: false, user: await finishLogin(user, req, res) };
    const challenge = await otp.issue({ userId: user.id, purpose: 'login', channel: 'email', destination: user.email });
    return { requiresOtp: true, purpose: 'login', ...challenge };
  }

  // Coordinator: OTP via Phone Number (SMS provider)
  if (user.role === 'coordinator') {
    if (!user.phone) {
      throw forbidden('No phone number is registered for this coordinator account. Contact an administrator.', 'phone_not_registered');
    }
    const challenge = await otp.issue({ userId: user.id, purpose: 'login', channel: 'sms', destination: user.phone });
    return { requiresOtp: true, purpose: 'login', ...challenge };
  }

  // Admin: OTP via Phone Number (SMS provider)
  if (user.role === 'admin') {
    if (!user.phone) {
      throw forbidden('No phone number is registered for this account. Contact an administrator.', 'phone_not_registered');
    }
    const challenge = await otp.issue({ userId: user.id, purpose: 'login', channel: 'sms', destination: user.phone });
    return { requiresOtp: true, purpose: 'login', ...challenge };
  }
  return { requiresOtp: true, purpose: 'login', ...challenge };
}

async function verifyLogin({ challengeId, code }, req, res) {
  const challenge = await otp.verify({ challengeId, code, purpose: 'login' });
  const user = (await query('SELECT * FROM users WHERE id=?', [challenge.user_id]))[0];
  if (!user || user.status !== 'active') throw forbidden('This account cannot sign in.', 'account_suspended');
  return finishLogin(user, req, res);
}

async function logout(req, res) {
  if (req.sessionId) {
    await query('UPDATE sessions SET revoked_at=UTC_TIMESTAMP() WHERE id=? AND revoked_at IS NULL', [req.sessionId]);
    await audit(req.user.id, 'auth.logout', { entityType: 'user', entityId: req.user.id, ip: req.ip });
  }
  clearSessionCookie(res);
}

const revokeAllSessions = (userId) => query('UPDATE sessions SET revoked_at=UTC_TIMESTAMP() WHERE user_id=? AND revoked_at IS NULL', [userId]);

module.exports = { register, verifyRegistration, login, verifyLogin, logout, revokeAllSessions, withTransaction };
