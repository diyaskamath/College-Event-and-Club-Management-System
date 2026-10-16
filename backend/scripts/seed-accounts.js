'use strict';
/**
 * Creates the initial Admin (and optionally a demo Coordinator) from environment variables.
 * Idempotent: existing accounts (matched by email) are never modified.
 *
 *   SEED_ADMIN_EMAIL, SEED_ADMIN_NAME, SEED_ADMIN_PHONE (E.164), SEED_ADMIN_PASSWORD (optional - random if omitted)
 *   SEED_COORDINATOR_EMAIL, SEED_COORDINATOR_NAME, SEED_COORDINATOR_PHONE, SEED_COORDINATOR_PASSWORD (all optional)
 *
 * A random password is printed ONCE when it is generated. Nothing is hard-coded here.
 */
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const config = require('../src/config');
const { pool, query } = require('../src/db');

const E164 = /^\+[1-9]\d{7,14}$/;

async function ensureUser({ email, name, phone, password, role }) {
  const existing = await query('SELECT id FROM users WHERE email=?', [email.toLowerCase()]);
  if (existing.length) {
    console.log(`- ${role} ${email} already exists (left unchanged).`);
    return existing[0].id;
  }
  if (!E164.test(phone || '')) throw new Error(`${role}: phone must be E.164 (e.g. +919876543210).`);
  let generated = false;
  if (!password) {
    password = `${crypto.randomBytes(9).toString('base64url')}a1`;
    generated = true;
  }
  const hash = await bcrypt.hash(password, config.auth.bcryptRounds);
  const res = await query(
    "INSERT INTO users (name,email,phone,password_hash,role,status,email_verified_at,campus_id) VALUES (?,?,?,?,?,'active',UTC_TIMESTAMP(),(SELECT id FROM campuses ORDER BY id LIMIT 1))",
    [name, email.toLowerCase(), phone, hash, role],
  );
  await query('INSERT IGNORE INTO notification_preferences (user_id) VALUES (?)', [res.insertId]);
  console.log(`- created ${role} ${email}${generated ? `  (generated password, shown once: ${password})` : ''}`);
  return res.insertId;
}

async function main() {
  const e = process.env;
  if (e.SEED_ADMIN_EMAIL) {
    await ensureUser({ email: e.SEED_ADMIN_EMAIL, name: e.SEED_ADMIN_NAME || 'Platform Admin', phone: e.SEED_ADMIN_PHONE, password: e.SEED_ADMIN_PASSWORD, role: 'admin' });
  } else {
    console.log('- SEED_ADMIN_EMAIL not set: no admin created. Nobody will be able to use the Admin dashboard until you create one.');
  }
  if (e.SEED_COORDINATOR_EMAIL) {
    const id = await ensureUser({ email: e.SEED_COORDINATOR_EMAIL, name: e.SEED_COORDINATOR_NAME || 'Demo Coordinator', phone: e.SEED_COORDINATOR_PHONE, password: e.SEED_COORDINATOR_PASSWORD, role: 'coordinator' });
    for (const slug of ['coding-and-open-source', 'literary-and-book-club', 'entrepreneurship']) {
      await query('INSERT IGNORE INTO coordinator_assignments (user_id, club_id) SELECT ?, id FROM clubs WHERE slug=?', [id, slug]);
    }
    console.log('  assigned demo coordinator to: Coding and Open Source, Literary and Book Club, Entrepreneurship');
  }
}

main()
  .catch((err) => {
    console.error('Account seeding failed:', err.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
