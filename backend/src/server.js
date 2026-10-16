'use strict';
const config = require('./config');
const { createApp } = require('./app');
const { pool } = require('./db');
const lifecycle = require('./services/lifecycleService');
const delivery = require('./integrations/delivery');

async function main() {
  await pool.query('SELECT 1'); // fail fast if MySQL is unreachable
  const app = createApp();
  const server = app.listen(config.port, () => {
    const d = delivery.status();
    console.log(`Amrita Connect API listening on http://localhost:${config.port}`);
    console.log(`  database : ${config.db.host}:${config.db.port}/${config.db.database}`);
    console.log(`  email OTP: ${d.email.enabled ? `enabled (${d.email.provider})` : d.email.devConsole ? 'DEV console mode (not delivered)' : 'NOT CONFIGURED - student OTP emails cannot be sent'}`);
    console.log(`  sms OTP  : ${d.sms.enabled ? `enabled (${d.sms.provider})` : d.sms.devConsole ? 'DEV console mode (not delivered)' : 'NOT CONFIGURED - coordinator/admin OTP SMS cannot be sent'}`);
  });
  if (config.scheduler.enabled) lifecycle.startScheduler(config.scheduler.intervalSeconds);

  const shutdown = () => server.close(() => pool.end().finally(() => process.exit(0)));
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main().catch((err) => {
  console.error('Failed to start server:', err.message);
  process.exit(1);
});
