'use strict';
/**
 * Creates the database (if missing), applies db/schema.sql and db/seed.sql.
 * Safe to re-run.  Usage:  npm run db:setup          (uses .env)
 *                          npm run db:setup -- --no-seed
 */
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const config = require('../src/config');

async function main() {
  const { host, port, user, password, database } = config.db;
  if (!/^[A-Za-z0-9_]+$/.test(database)) throw new Error('DB_NAME may only contain letters, numbers and underscores.');
  const conn = await mysql.createConnection({ host, port, user, password, multipleStatements: true, charset: 'utf8mb4', timezone: 'Z' });
  try {
    await conn.query(`CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    await conn.query(`USE \`${database}\``);
    await conn.query(fs.readFileSync(path.join(__dirname, '..', 'db', 'schema.sql'), 'utf8'));
    console.log(`Schema applied to "${database}".`);
    if (!process.argv.includes('--no-seed')) {
      await conn.query(fs.readFileSync(path.join(__dirname, '..', 'db', 'seed.sql'), 'utf8'));
      const [[clubs]] = await conn.query('SELECT COUNT(*) c FROM clubs');
      const [[regular]] = await conn.query("SELECT COUNT(*) c FROM events WHERE kind='regular'");
      const [[festival]] = await conn.query("SELECT COUNT(*) c FROM events WHERE kind='festival'");
      console.log(`Demo seed applied: ${clubs.c} clubs, ${regular.c} regular events, ${festival.c} festival events.`);
    }
  } finally {
    await conn.end();
  }
}

main().catch((err) => {
  console.error('Database setup failed:', err.message);
  process.exit(1);
});
