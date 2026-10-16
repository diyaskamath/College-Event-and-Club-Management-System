'use strict';
/**
 * Notification service.
 *   in-app  : always persisted to MySQL (idempotent through UNIQUE(user_id, dedupe_key))
 *   email   : sent after commit when the user's preference allows and a provider is configured
 *   sms     : sent after commit for coordinators/admins who enabled it and have a phone number
 * Failures in email/SMS never break the originating action.
 */
const { query } = require('../db');
const delivery = require('../integrations/delivery');

const CATEGORIES = ['club_activity', 'event_updates', 'announcements', 'reminders', 'login_alerts', 'admin_activity'];
const PREF_COLUMNS = ['email_enabled', 'sms_enabled', ...CATEGORIES.map((c) => `pref_${c}`)];

const mapNotification = (r) => ({
  id: r.id,
  type: r.type,
  category: r.category,
  title: r.title,
  body: r.body,
  link: r.link,
  isRead: !!r.is_read,
  createdAt: r.created_at,
  readAt: r.read_at,
});

const mapPrefs = (r) => ({
  emailEnabled: !!r.email_enabled,
  smsEnabled: !!r.sms_enabled,
  clubActivity: !!r.pref_club_activity,
  eventUpdates: !!r.pref_event_updates,
  announcements: !!r.pref_announcements,
  reminders: !!r.pref_reminders,
  loginAlerts: !!r.pref_login_alerts,
  adminActivity: !!r.pref_admin_activity,
});

async function ensurePreferences(userId, conn = null) {
  await query('INSERT IGNORE INTO notification_preferences (user_id) VALUES (?)', [userId], conn);
}

async function getPreferenceRow(userId, conn = null) {
  let rows = await query('SELECT * FROM notification_preferences WHERE user_id=?', [userId], conn);
  if (!rows.length) {
    await ensurePreferences(userId, conn);
    rows = await query('SELECT * FROM notification_preferences WHERE user_id=?', [userId], conn);
  }
  return rows[0];
}

async function getPreferences(userId) {
  return mapPrefs(await getPreferenceRow(userId));
}

async function updatePreferences(userId, values) {
  const map = {
    emailEnabled: 'email_enabled',
    smsEnabled: 'sms_enabled',
    clubActivity: 'pref_club_activity',
    eventUpdates: 'pref_event_updates',
    announcements: 'pref_announcements',
    reminders: 'pref_reminders',
    loginAlerts: 'pref_login_alerts',
    adminActivity: 'pref_admin_activity',
  };
  await ensurePreferences(userId);
  const sets = [];
  const params = [];
  for (const [k, col] of Object.entries(map)) {
    if (values[k] !== undefined) {
      sets.push(`${col}=?`);
      params.push(values[k] ? 1 : 0);
    }
  }
  if (sets.length) await query(`UPDATE notification_preferences SET ${sets.join(', ')} WHERE user_id=?`, [...params, userId]);
  return getPreferences(userId);
}

async function dispatchExternal(userId, prefs, n) {
  const users = await query('SELECT email, phone, role, status FROM users WHERE id=?', [userId]);
  const user = users[0];
  if (!user || user.status !== 'active') return;
  if (prefs.email_enabled && delivery.status().email.enabled) {
    await delivery
      .sendEmail({ to: user.email, subject: `Amrita Connect: ${n.title}`, text: `${n.title}\n\n${n.body}\n\nYou can change these emails in Profile > Notification preferences.` })
      .catch((err) => console.error('[notify] email failed:', err.code || err.message));
  }
  if (prefs.sms_enabled && user.phone && user.role !== 'student' && delivery.status().sms.enabled) {
    await delivery.sendSms({ to: user.phone, text: `Amrita Connect: ${n.title}` }).catch((err) => console.error('[notify] sms failed:', err.code || err.message));
  }
}

/**
 * Create a notification for one user.
 * @param {object|null} tx  transaction context from withTransaction (null = standalone)
 * @param {object} p {userId,type,category,title,body,link,dedupeKey,transactional}
 *   transactional=true  -> confirmation of the user's own action: created regardless of category preference
 * @returns {{created:boolean, skipped?:string}}
 */
async function notify(tx, p) {
  const run = (sql, params) => (tx ? tx.q(sql, params) : query(sql, params));
  const prefs = (await run('SELECT * FROM notification_preferences WHERE user_id=?', [p.userId]))[0] || (await getPreferenceRow(p.userId, tx ? tx.conn : null));
  if (!p.transactional && !prefs[`pref_${p.category}`]) return { created: false, skipped: 'preference' };

  const res = await run(
    'INSERT IGNORE INTO notifications (user_id, type, category, title, body, link, dedupe_key) VALUES (?,?,?,?,?,?,?)',
    [p.userId, p.type, p.category, p.title.slice(0, 200), p.body.slice(0, 1000), p.link || null, p.dedupeKey.slice(0, 190)],
  );
  const created = res.affectedRows === 1;
  if (!created) return { created: false, skipped: 'duplicate' };
  const deliver = () => dispatchExternal(p.userId, prefs, p);
  if (tx) tx.afterCommit(deliver);
  else deliver().catch((e) => console.error('[notify] dispatch failed:', e.message));
  return { created: true };
}

async function list(userId, { limit = 20, offset = 0, unreadOnly = false } = {}) {
  const where = unreadOnly ? 'AND is_read=0' : '';
  const rows = await query(`SELECT * FROM notifications WHERE user_id=? ${where} ORDER BY created_at DESC, id DESC LIMIT ? OFFSET ?`, [userId, limit, offset]);
  const total = (await query(`SELECT COUNT(*) c FROM notifications WHERE user_id=? ${where}`, [userId]))[0].c;
  return { items: rows.map(mapNotification), total, unread: await unreadCount(userId) };
}

async function unreadCount(userId) {
  return (await query('SELECT COUNT(*) c FROM notifications WHERE user_id=? AND is_read=0', [userId]))[0].c;
}

async function markRead(userId, id) {
  const res = await query('UPDATE notifications SET is_read=1, read_at=UTC_TIMESTAMP() WHERE id=? AND user_id=? AND is_read=0', [id, userId]);
  return res.affectedRows;
}

async function markAllRead(userId) {
  const res = await query('UPDATE notifications SET is_read=1, read_at=UTC_TIMESTAMP() WHERE user_id=? AND is_read=0', [userId]);
  return res.affectedRows;
}

module.exports = { notify, list, unreadCount, markRead, markAllRead, getPreferences, updatePreferences, ensurePreferences, CATEGORIES, PREF_COLUMNS };
