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
const { AppError, unauthorized, forbidden, badRequest } = require('../utils/errors');

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

async function register({ name, email, password, campusId }, req) {
  const typed = await settings.getTyped();
  const domain = email.split('@')[1];
  if (!typed.studentEmailDomains.includes(domain)) {
    throw badRequest('email_domain_not_allowed', `Registration is limited to approved Amrita student email addresses (${typed.studentEmailDomains.map((d) => `@${d}`).join(', ')}).`);
  }
  const hash = await bcrypt.hash(password, config.auth.bcryptRounds);
  const existing = (await query('SELECT * FROM users WHERE email=?', [email]))[0];

  let userId;
  if (!existing) {
    const res = await query(
      "INSERT INTO users (name,email,password_hash,role,status,campus_id) VALUES (?,?,?,'student','pending',?)",
      [name, email, hash, campusId || null],
    );
    userId = res.insertId;
    await notifications.ensurePreferences(userId);
  } else if (existing.status === 'pending' && existing.role === 'student') {
    // Unverified, abandoned registration: refresh details and issue a new code.
    await query('UPDATE users SET name=?, password_hash=?, campus_id=? WHERE id=?', [name, hash, campusId || null, existing.id]);
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

const GENERIC_REGISTER_MESSAGE = 'If this email address can be registered, a verification code has been sent to it. Check your Outlook inbox.';

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
  await audit(user.id, 'auth.register_verified', { entityType: 'user', entityId: user.id, ip: req.ip });
  return finishLogin(user, req, res);
}

async function login({ email, password }, req, res) {
  const user = (await query('SELECT * FROM users WHERE email=?', [email]))[0];
  const ok = await bcrypt.compare(password, user ? user.password_hash : DUMMY_HASH);
  if (!user || !ok) {
    await audit(user ? user.id : null, 'auth.login_failed', { entityType: 'user', entityId: user ? user.id : null, ip: req.ip, metadata: user ? null : { reason: 'unknown_email' } });
    throw unauthorized('Incorrect email or password.', 'invalid_credentials');
  }
  if (user.status === 'suspended') throw forbidden('This account has been suspended. Contact an administrator.', 'account_suspended');

  if (user.status === 'pending') {
    // Password is correct but the email was never verified: continue verification.
    const challenge = await otp.issue({ userId: user.id, purpose: 'register', channel: 'email', destination: user.email });
    return { requiresOtp: true, purpose: 'register', ...challenge };
  }

  const typed = await settings.getTyped();
  if (user.role === 'student') {
    if (!typed.requireStudentLoginOtp) return { requiresOtp: false, user: await finishLogin(user, req, res) };
    const challenge = await otp.issue({ userId: user.id, purpose: 'login', channel: 'email', destination: user.email });
    return { requiresOtp: true, purpose: 'login', ...challenge };
  }

  // Coordinator / Admin: OTP to their registered phone number, then immediate login (no approval step).
  if (!user.phone) {
    throw new AppError(403, 'phone_not_registered', 'No phone number is registered for this account. Contact the platform administrator.');
  }
  const challenge = await otp.issue({ userId: user.id, purpose: 'login', channel: 'sms', destination: user.phone });
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
