'use strict';
/**
 * Lifecycle automation + reminders. Runs on a timer (scheduler) and lazily before event reads.
 * Automatic transitions follow the state machine:
 *   published -> registration_closed (deadline passed) -> ongoing (start time) -> completed (end time)
 */
const { query, withTransaction } = require('../db');
const notifications = require('./notificationService');
const settings = require('./settingsService');

let lastSync = 0;

async function syncStatuses(now = new Date()) {
  const a = await query("UPDATE events SET status='completed' WHERE status IN ('published','registration_closed','ongoing') AND ends_at <= ?", [now]);
  const b = await query("UPDATE events SET status='ongoing' WHERE status IN ('published','registration_closed') AND starts_at <= ? AND ends_at > ?", [now, now]);
  const c = await query("UPDATE events SET status='registration_closed' WHERE status='published' AND registration_deadline <= ? AND starts_at > ?", [now, now]);
  lastSync = Date.now();
  return { completed: a.affectedRows, ongoing: b.affectedRows, registrationClosed: c.affectedRows };
}

/** Cheap guard so read endpoints see fresh statuses without running 3 UPDATEs on every request. */
async function ensureFresh() {
  if (Date.now() - lastSync > 15000) await syncStatuses();
}

/** Remind confirmed registrants of events starting within the configured window. Idempotent per user+event. */
async function sendReminders(now = new Date()) {
  const { reminderHours } = await settings.getTyped();
  const until = new Date(now.getTime() + reminderHours * 3600 * 1000);
  const events = await query("SELECT id, slug, title, starts_at FROM events WHERE status IN ('published','registration_closed') AND starts_at > ? AND starts_at <= ?", [now, until]);
  let created = 0;
  for (const ev of events) {
    const regs = await query("SELECT user_id FROM event_registrations WHERE event_id=? AND status='confirmed'", [ev.id]);
    for (const r of regs) {
      const res = await notifications.notify(null, {
        userId: r.user_id,
        type: 'event_reminder',
        category: 'reminders',
        title: `Reminder: ${ev.title}`,
        body: `${ev.title} starts at ${new Date(ev.starts_at).toUTCString()}. Check the event page for the latest venue details.`,
        link: `/events/${ev.slug}`,
        dedupeKey: `reminder:${ev.id}:${r.user_id}`,
      });
      if (res.created) created += 1;
    }
  }
  return { created };
}

async function cleanup() {
  await query('DELETE FROM sessions WHERE expires_at < (UTC_TIMESTAMP() - INTERVAL 7 DAY)');
  await query('DELETE FROM otp_challenges WHERE expires_at < (UTC_TIMESTAMP() - INTERVAL 1 DAY)');
}

function startScheduler(intervalSeconds) {
  const tick = async () => {
    try {
      await syncStatuses();
      await sendReminders();
      await cleanup();
    } catch (err) {
      console.error('[scheduler] tick failed:', err.message);
    }
  };
  tick();
  const timer = setInterval(tick, intervalSeconds * 1000);
  timer.unref();
  return timer;
}

module.exports = { syncStatuses, ensureFresh, sendReminders, startScheduler, withTransaction };
