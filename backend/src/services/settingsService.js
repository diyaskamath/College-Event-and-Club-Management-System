'use strict';
const { query, parseJson } = require('../db');
const config = require('../config');

const DEFAULTS = {
  student_email_domains: config.defaultStudentEmailDomains.join(','),
  require_student_login_otp: 'false',
  reminder_hours: '24',
};

const ALLOWED_KEYS = Object.keys(DEFAULTS);

async function getAll() {
  const rows = await query('SELECT setting_key, setting_value FROM platform_settings');
  const out = { ...DEFAULTS };
  for (const r of rows) if (ALLOWED_KEYS.includes(r.setting_key)) out[r.setting_key] = r.setting_value;
  return out;
}

async function getTyped() {
  const s = await getAll();
  return {
    studentEmailDomains: s.student_email_domains.split(',').map((d) => d.trim().toLowerCase()).filter(Boolean),
    requireStudentLoginOtp: s.require_student_login_otp === 'true',
    reminderHours: Math.max(1, parseInt(s.reminder_hours, 10) || 24),
  };
}

async function update(values, actorId) {
  for (const [k, v] of Object.entries(values)) {
    if (!ALLOWED_KEYS.includes(k)) continue;
    await query(
      'INSERT INTO platform_settings (setting_key, setting_value, updated_by) VALUES (?,?,?) ON DUPLICATE KEY UPDATE setting_value=VALUES(setting_value), updated_by=VALUES(updated_by)',
      [k, String(v), actorId],
    );
  }
  return getTyped();
}

module.exports = { getAll, getTyped, update, ALLOWED_KEYS, parseJson };
