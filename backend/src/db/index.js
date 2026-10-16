'use strict';
const mysql = require('mysql2/promise');
const config = require('../config');

/**
 * Pool configuration notes:
 *  - timezone 'Z'          : DATETIME values are exchanged in UTC.
 *  - dateStrings ['DATE']  : DATE columns (festival windows) stay plain 'YYYY-MM-DD' strings.
 *  - pool.query (not execute): values are still bound via '?' placeholders and escaped by mysql2.
 */
const pool = mysql.createPool({
  host: config.db.host,
  port: config.db.port,
  user: config.db.user,
  password: config.db.password,
  database: config.db.database,
  waitForConnections: true,
  connectionLimit: config.db.connectionLimit,
  timezone: 'Z',
  dateStrings: ['DATE'],
  charset: 'utf8mb4',
  decimalNumbers: true,
  supportBigNumbers: true,
  bigNumberStrings: false,
});

/** Run a statement and return the rows (or the OkPacket for writes). */
async function query(sql, params = [], conn = null) {
  const [rows] = await (conn || pool).query(sql, params);
  return rows;
}

/**
 * Run `fn(tx)` inside a READ COMMITTED transaction.
 *   tx.q(sql, params)    -> rows
 *   tx.conn              -> raw connection
 *   tx.afterCommit(cb)   -> queue a callback (e.g. send email) that only runs if the transaction commits
 */
async function withTransaction(fn) {
  const conn = await pool.getConnection();
  const callbacks = [];
  const tx = {
    conn,
    q: async (sql, params = []) => (await conn.query(sql, params))[0],
    afterCommit: (cb) => callbacks.push(cb),
  };
  try {
    await conn.query('SET TRANSACTION ISOLATION LEVEL READ COMMITTED');
    await conn.beginTransaction();
    const result = await fn(tx);
    await conn.commit();
    conn.release();
    for (const cb of callbacks) {
      Promise.resolve()
        .then(cb)
        .catch((err) => console.error('[afterCommit] callback failed:', err.message));
    }
    return result;
  } catch (err) {
    try {
      await conn.rollback();
    } catch (_) {
      /* ignore rollback failure */
    }
    conn.release();
    throw err;
  }
}

/** Parse a JSON column (MySQL returns objects, MariaDB returns strings). */
function parseJson(value, fallback = null) {
  if (value === null || value === undefined) return fallback;
  if (typeof value === 'object') return value;
  try {
    return JSON.parse(value);
  } catch (_) {
    return fallback;
  }
}

/** Escape LIKE wildcards in user-supplied search text. */
function likeEscape(text) {
  return String(text).replace(/[\\%_]/g, (m) => `\\${m}`);
}

module.exports = { pool, query, withTransaction, parseJson, likeEscape };
