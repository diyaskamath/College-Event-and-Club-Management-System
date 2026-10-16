'use strict';
/**
 * OTP challenges: short-lived, single-use, HMAC-hashed at rest, attempt-limited, resend-throttled.
 * A challenge is only returned to the client AFTER the code was actually handed to a delivery provider.
 */
const crypto = require('crypto');
const config = require('../config');
const { query, withTransaction } = require('../db');
const delivery = require('../integrations/delivery');
const { AppError, badRequest, tooMany } = require('../utils/errors');

const generateCode = () => crypto.randomInt(0, 1000000).toString().padStart(6, '0');
const hashCode = (challengeId, code) => crypto.createHmac('sha256', config.auth.otpPepper).update(`${challengeId}:${code}`).digest('hex');
const safeEqualHex = (a, b) => {
  const ba = Buffer.from(a, 'hex');
  const bb = Buffer.from(b, 'hex');
  return ba.length === bb.length && crypto.timingSafeEqual(ba, bb);
};

function maskDestination(channel, dest) {
  if (channel === 'email') {
    const [local, domain] = dest.split('@');
    return `${local.slice(0, 2)}${'*'.repeat(Math.max(2, local.length - 2))}@${domain}`;
  }
  return `${dest.slice(0, 3)}${'*'.repeat(Math.max(4, dest.length - 6))}${dest.slice(-3)}`;
}

async function deliverCode({ channel, destination, code, purpose }) {
  const minutes = config.otp.ttlMinutes;
  if (channel === 'email') {
    const heading = purpose === 'register' ? 'Verify your Amrita Connect account' : 'Your Amrita Connect login code';
    return delivery.sendEmail({
      to: destination,
      subject: `${code} is your Amrita Connect verification code`,
      text: `${heading}\n\nYour one-time code is: ${code}\n\nIt expires in ${minutes} minutes and can be used once. If you did not request it, ignore this email - never share this code.`,
      html: `<div style="font-family:Arial,sans-serif;max-width:480px"><h2>${heading}</h2><p>Your one-time code is:</p><p style="font-size:32px;letter-spacing:6px;font-weight:bold">${code}</p><p>It expires in ${minutes} minutes and can be used once. If you did not request it, ignore this email and never share this code.</p></div>`,
    });
  }
  return delivery.sendSms({ to: destination, text: `Amrita Connect code: ${code}. Valid ${minutes} min. Do not share it.` });
}

const toPublic = (c, providerInfo) => ({
  challengeId: c.id,
  channel: c.channel,
  destination: maskDestination(c.channel, c.destination),
  expiresAt: c.expires_at,
  resendAvailableAt: new Date(new Date(c.last_sent_at).getTime() + config.otp.resendCooldownSeconds * 1000),
  ...(providerInfo && providerInfo.provider === 'console' ? { devNotice: 'DEV MODE: the code was printed to the server console. It was NOT delivered to the recipient.' } : {}),
});

/** Create a challenge and deliver the code. Throws (and stores nothing) if delivery fails. */
async function issue({ userId, purpose, channel, destination }) {
  const provider = channel === 'email' ? delivery.emailProviderName() : delivery.smsProviderName();
  if (provider === 'none') await (channel === 'email' ? delivery.sendEmail({ to: destination, subject: '', text: '' }) : delivery.sendSms({ to: destination, text: '' })); // throws 503

  const recent = await query('SELECT COUNT(*) c FROM otp_challenges WHERE destination=? AND created_at > (UTC_TIMESTAMP() - INTERVAL 1 HOUR)', [destination]);
  if (recent[0].c >= config.otp.maxPerDestinationPerHour) {
    throw tooMany('otp_rate_limited', 'Too many verification codes were requested for this destination. Please try again later.');
  }

  const id = crypto.randomUUID();
  const code = generateCode();
  const now = new Date();
  const expires = new Date(now.getTime() + config.otp.ttlMinutes * 60000);

  // Only one live challenge per user+purpose.
  await query('UPDATE otp_challenges SET consumed_at=UTC_TIMESTAMP() WHERE user_id=? AND purpose=? AND consumed_at IS NULL', [userId, purpose]);
  await query(
    'INSERT INTO otp_challenges (id,user_id,purpose,channel,destination,code_hash,max_attempts,expires_at,last_sent_at) VALUES (?,?,?,?,?,?,?,?,?)',
    [id, userId, purpose, channel, destination, hashCode(id, code), config.otp.maxAttempts, expires, now],
  );
  let info;
  try {
    info = await deliverCode({ channel, destination, code, purpose });
  } catch (err) {
    await query('DELETE FROM otp_challenges WHERE id=?', [id]);
    throw err;
  }
  return toPublic({ id, channel, destination, expires_at: expires, last_sent_at: now }, info);
}

/**
 * Verify a code. Returns the challenge row (now consumed) on success.
 * Failure modes: otp_invalid | otp_expired | otp_used | otp_locked | otp_incorrect(attemptsRemaining)
 */
async function verify({ challengeId, code, purpose }) {
  const outcome = await withTransaction(async (tx) => {
    const rows = await tx.q('SELECT * FROM otp_challenges WHERE id=? AND purpose=? FOR UPDATE', [challengeId, purpose]);
    const c = rows[0];
    if (!c) return { error: badRequest('otp_invalid', 'Invalid or expired code. Request a new one.') };
    if (c.consumed_at) return { error: badRequest('otp_used', 'This code was already used or replaced. Request a new one if needed.') };
    if (new Date(c.expires_at) <= new Date()) return { error: badRequest('otp_expired', 'This code has expired. Request a new one.') };
    if (c.attempts >= c.max_attempts) return { error: new AppError(429, 'otp_locked', 'Too many incorrect attempts. Request a new code.') };

    if (safeEqualHex(hashCode(c.id, code), c.code_hash)) {
      await tx.q('UPDATE otp_challenges SET consumed_at=UTC_TIMESTAMP() WHERE id=?', [c.id]); // single use
      return { challenge: c };
    }
    await tx.q('UPDATE otp_challenges SET attempts=attempts+1 WHERE id=?', [c.id]);
    const remaining = c.max_attempts - (c.attempts + 1);
    return {
      error: remaining > 0
        ? badRequest('otp_incorrect', `Incorrect code. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`, { attemptsRemaining: remaining })
        : new AppError(429, 'otp_locked', 'Too many incorrect attempts. Request a new code.'),
    };
  });
  if (outcome.error) throw outcome.error;
  return outcome.challenge;
}

/** Re-send a fresh code for an existing, unconsumed challenge (respects cooldown + max resends). */
async function resend(challengeId) {
  const rows = await query('SELECT * FROM otp_challenges WHERE id=?', [challengeId]);
  const c = rows[0];
  if (!c || c.consumed_at) throw badRequest('otp_invalid', 'This verification session is no longer valid. Please start again.');
  const sinceSent = (Date.now() - new Date(c.last_sent_at).getTime()) / 1000;
  if (sinceSent < config.otp.resendCooldownSeconds) {
    const wait = Math.ceil(config.otp.resendCooldownSeconds - sinceSent);
    throw tooMany('otp_resend_cooldown', `Please wait ${wait}s before requesting another code.`, { retryAfterSeconds: wait });
  }
  if (c.resend_count >= config.otp.maxResends) throw tooMany('otp_resend_limit', 'Resend limit reached. Please start again later.');

  const recent = await query('SELECT COUNT(*) c FROM otp_challenges WHERE destination=? AND created_at > (UTC_TIMESTAMP() - INTERVAL 1 HOUR)', [c.destination]);
  if (recent[0].c >= config.otp.maxPerDestinationPerHour + config.otp.maxResends) throw tooMany('otp_rate_limited', 'Too many codes requested for this destination. Try again later.');

  const code = generateCode();
  const now = new Date();
  const expires = new Date(now.getTime() + config.otp.ttlMinutes * 60000);
  await query('UPDATE otp_challenges SET code_hash=?, attempts=0, resend_count=resend_count+1, expires_at=?, last_sent_at=? WHERE id=?', [hashCode(c.id, code), expires, now, c.id]);
  let info;
  try {
    info = await deliverCode({ channel: c.channel, destination: c.destination, code, purpose: c.purpose });
  } catch (err) {
    // restore the previous state so the older code (if still valid) keeps working
    await query('UPDATE otp_challenges SET code_hash=?, attempts=?, resend_count=?, expires_at=?, last_sent_at=? WHERE id=?', [c.code_hash, c.attempts, c.resend_count, c.expires_at, c.last_sent_at, c.id]);
    throw err;
  }
  return toPublic({ ...c, expires_at: expires, last_sent_at: now }, info);
}

/** Decoy response used when a registration targets an already-registered email (anti-enumeration). */
const decoy = (channel, destination) => ({
  challengeId: crypto.randomUUID(),
  channel,
  destination: maskDestination(channel, destination),
  expiresAt: new Date(Date.now() + config.otp.ttlMinutes * 60000),
  resendAvailableAt: new Date(Date.now() + config.otp.resendCooldownSeconds * 1000),
});

module.exports = { issue, verify, resend, decoy, maskDestination };
