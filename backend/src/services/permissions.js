'use strict';
const { query } = require('../db');
const { forbidden } = require('../utils/errors');

/** Club ids a coordinator is explicitly assigned to (admins manage everything, so return null = unrestricted). */
async function assignedClubIds(user) {
  if (user.role === 'admin') return null;
  if (user.role !== 'coordinator') return [];
  const rows = await query('SELECT club_id FROM coordinator_assignments WHERE user_id=?', [user.id]);
  return rows.map((r) => r.club_id);
}

async function canManageClub(user, clubId) {
  if (!user) return false;
  if (user.role === 'admin') return true;
  if (user.role !== 'coordinator') return false;
  const rows = await query('SELECT 1 FROM coordinator_assignments WHERE user_id=? AND club_id=?', [user.id, clubId]);
  return rows.length > 0;
}

/** Coordinators manage events of their assigned clubs; campus-wide events (no club) are Admin-only. */
async function canManageEvent(user, event) {
  if (!user) return false;
  if (user.role === 'admin') return true;
  if (user.role !== 'coordinator' || !event.club_id) return false;
  return canManageClub(user, event.club_id);
}

async function assertCanManageClub(user, clubId) {
  if (!(await canManageClub(user, clubId))) throw forbidden('You are not assigned as Coordinator of this club.', 'not_club_coordinator');
}

async function assertCanManageEvent(user, event) {
  if (!(await canManageEvent(user, event))) throw forbidden('You are not permitted to manage this event.', 'not_event_manager');
}

module.exports = { assignedClubIds, canManageClub, canManageEvent, assertCanManageClub, assertCanManageEvent };
