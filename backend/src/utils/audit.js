'use strict';
const { query } = require('../db');

/**
 * Write an audit log entry. Never throws: audit failure must not break the user action.
 * `metadata` must never contain passwords, OTPs or tokens.
 */
async function audit(actorId, action, { entityType = null, entityId = null, metadata = null, ip = null } = {}, conn = null) {
  try {
    await query(
      'INSERT INTO audit_logs (actor_id, action, entity_type, entity_id, metadata, ip) VALUES (?,?,?,?,?,?)',
      [actorId || null, action, entityType, entityId === null ? null : String(entityId), metadata ? JSON.stringify(metadata) : null, ip],
      conn,
    );
  } catch (err) {
    console.error('[audit] failed to write log:', err.message);
  }
}

module.exports = { audit };
