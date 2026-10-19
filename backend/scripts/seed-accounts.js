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

async function ensureUser({ email, name, phone, password, role, adminId }) {
  const existing = await query('SELECT id FROM users WHERE (email IS NOT NULL AND email=?) OR (admin_id IS NOT NULL AND admin_id=?)', [email ? email.toLowerCase() : '', adminId || '']);
  if (existing.length) {
    console.log(`- ${role} ${email || adminId} already exists (left unchanged).`);
    return existing[0].id;
  }
  if (!E164.test(phone || '')) throw new Error(`${role}: phone must be E.164 (e.g. +919876543210).`);
  let generated = false;
  if (!password) {
    password = `${crypto.randomBytes(9).toString('base64url')}a1`;
    generated = true;
  }
  const hash = await bcrypt.hash(password, config.auth.bcryptRounds);
  const finalAdminId = role === 'admin' ? (adminId || 'ADM-001') : null;
  const res = await query(
    "INSERT INTO users (name,email,phone,admin_id,password_hash,role,status,email_verified_at,campus_id) VALUES (?,?,?,?,?,?,'active',UTC_TIMESTAMP(),(SELECT id FROM campuses ORDER BY id LIMIT 1))",
    [name, email ? email.toLowerCase() : null, phone, finalAdminId, hash, role],
  );
  await query('INSERT IGNORE INTO notification_preferences (user_id) VALUES (?)', [res.insertId]);
  console.log(`- created ${role} ${email || finalAdminId}${finalAdminId ? ` (Admin ID: ${finalAdminId})` : ''}${generated ? `  (generated password, shown once: ${password})` : ''}`);
  return res.insertId;
}

async function main() {
  const e = process.env;
  if (e.SEED_ADMIN_EMAIL || e.SEED_ADMIN_ID) {
    await ensureUser({
      email: e.SEED_ADMIN_EMAIL || 'admin@cb.amrita.edu',
      name: e.SEED_ADMIN_NAME || 'Platform Admin',
      phone: e.SEED_ADMIN_PHONE || '+919876543211',
      password: e.SEED_ADMIN_PASSWORD,
      role: 'admin',
      adminId: e.SEED_ADMIN_ID || 'ADM-001'
    });
  } else {
    console.log('- SEED_ADMIN_EMAIL or SEED_ADMIN_ID not set: no admin created. Configure environment variables and re-run.');
  }
  if (e.SEED_COORDINATOR_EMAIL) {
    const id = await ensureUser({ email: e.SEED_COORDINATOR_EMAIL, name: e.SEED_COORDINATOR_NAME || 'Demo Coordinator', phone: e.SEED_COORDINATOR_PHONE || '+919876543210', password: e.SEED_COORDINATOR_PASSWORD, role: 'coordinator' });
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
