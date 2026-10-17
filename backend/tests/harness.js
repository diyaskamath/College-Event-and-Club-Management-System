'use strict';
/**
 * Shared test harness. Boots the real Express app against a throw-away MySQL/MariaDB database
 * (default name: cecms_test, dropped and recreated on every run) with the real schema + seed scripts.
 * Email/SMS go to an in-memory outbox (only possible when NODE_ENV=test).
 *
 *   TEST_DB_HOST / TEST_DB_PORT / TEST_DB_USER / TEST_DB_PASSWORD / TEST_DB_NAME  (fall back to DB_*)
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
process.env.NODE_ENV = 'test';
process.env.DB_HOST = process.env.TEST_DB_HOST || process.env.DB_HOST || '127.0.0.1';
process.env.DB_PORT = process.env.TEST_DB_PORT || process.env.DB_PORT || '3306';
process.env.DB_USER = process.env.TEST_DB_USER || process.env.DB_USER || 'root';
process.env.DB_PASSWORD = process.env.TEST_DB_PASSWORD || process.env.DB_PASSWORD || '';
process.env.DB_NAME = process.env.TEST_DB_NAME || 'cecms_test';
process.env.JWT_SECRET = 'test-secret-test-secret-test-secret-test-secret';

const { execFileSync } = require('child_process');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function resetDatabase() {
  const conn = await mysql.createConnection({ host: process.env.DB_HOST, port: Number(process.env.DB_PORT), user: process.env.DB_USER, password: process.env.DB_PASSWORD });
  await conn.query(`DROP DATABASE IF EXISTS \`${process.env.DB_NAME}\``);
  await conn.end();
  execFileSync(process.execPath, [path.join(__dirname, '..', 'scripts', 'setup-db.js')], { env: process.env, stdio: 'pipe' });
}

class Client {
  constructor(base) {
    this.base = base;
    this.cookie = null;
  }

  async request(method, url, body, headers = {}) {
    const res = await fetch(`${this.base}/api${url}`, {
      method,
      headers: { ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}), ...(this.cookie ? { Cookie: this.cookie } : {}), ...headers },
      body: body !== undefined ? (typeof body === 'string' ? body : JSON.stringify(body)) : undefined,
    });
    const setCookies = res.headers.getSetCookie ? res.headers.getSetCookie() : [];
    for (const sc of setCookies) {
      const pair = sc.split(';')[0];
      if (pair.endsWith('=')) this.cookie = null;
      else this.cookie = pair;
    }
    const text = await res.text();
    let json = null;
    try { json = JSON.parse(text); } catch (_) { /* not json */ }
    return { status: res.status, body: json, text, headers: res.headers, setCookies };
  }

  get(url) { return this.request('GET', url); }
  post(url, body = {}) { return this.request('POST', url, body); }
  put(url, body = {}) { return this.request('PUT', url, body); }
  patch(url, body = {}) { return this.request('PATCH', url, body); }
  del(url) { return this.request('DELETE', url); }
}

let seq = 0;
const uniq = (p) => `${p}${Date.now().toString(36)}${(seq += 1)}`;

module.exports = { resetDatabase, Client, uniq, bcrypt };
