'use strict';
const jwt = require('jsonwebtoken');
const config = require('../config');
const { query } = require('../db');
const { unauthorized, forbidden } = require('../utils/errors');
const { asyncHandler } = require('../utils/http');
const { mapUser } = require('../services/mappers');

function extractToken(req) {
  if (req.cookies && req.cookies[config.auth.cookieName]) return req.cookies[config.auth.cookieName];
  const h = req.headers.authorization;
  if (h && h.startsWith('Bearer ')) return h.slice(7);
  return null;
}

/** Resolve the session + user from trusted DB records. Role is NEVER read from the token. */
async function resolveUser(req) {
  const token = extractToken(req);
  if (!token) return null;
  let payload;
  try {
    payload = jwt.verify(token, config.auth.jwtSecret, { algorithms: ['HS256'] });
  } catch (_) {
    return null;
  }
  const rows = await query(
    `SELECT u.* FROM sessions s JOIN users u ON u.id = s.user_id
     WHERE s.id=? AND s.user_id=? AND s.revoked_at IS NULL AND s.expires_at > UTC_TIMESTAMP() AND u.status='active'`,
    [payload.sid, payload.sub],
  );
  if (!rows.length) return null;
  req.sessionId = payload.sid;
  return mapUser(rows[0]);
}

const requireAuth = asyncHandler(async (req, _res, next) => {
  const user = await resolveUser(req);
  if (!user) throw unauthorized('Your session has expired. Please log in again.', 'session_expired');
  req.user = user;
  next();
});

const optionalAuth = asyncHandler(async (req, _res, next) => {
  req.user = await resolveUser(req);
  next();
});

const requireRole = (...roles) => (req, _res, next) => {
  if (!req.user) return next(unauthorized());
  if (!roles.includes(req.user.role)) return next(forbidden());
  return next();
};

module.exports = { requireAuth, optionalAuth, requireRole };
