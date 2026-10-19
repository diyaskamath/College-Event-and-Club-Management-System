'use strict';
/**
 * Central configuration. Everything sensitive comes from environment variables
 * (see backend/.env.example). Nothing in this file contains a real secret.
 */
const path = require('path');
const crypto = require('crypto');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const env = process.env;
const bool = (v, d = false) => (v === undefined || v === '' ? d : ['1', 'true', 'yes', 'on'].includes(String(v).toLowerCase()));
const int = (v, d) => (v === undefined || v === '' || Number.isNaN(parseInt(v, 10)) ? d : parseInt(v, 10));
const list = (v, d = []) => (v ? String(v).split(',').map((s) => s.trim().toLowerCase()).filter(Boolean) : d);

const nodeEnv = env.NODE_ENV || 'development';
const isProd = nodeEnv === 'production';
const isTest = nodeEnv === 'test';

let jwtSecret = env.JWT_SECRET;
if (!jwtSecret || jwtSecret.length < 32) {
  if (isProd) {
    throw new Error('JWT_SECRET must be set to a random string of at least 32 characters in production.');
  }
  jwtSecret = crypto.randomBytes(48).toString('hex');
  if (!isTest) {
    // eslint-disable-next-line no-console
    console.warn('[config] JWT_SECRET missing/short: using an ephemeral secret. Sessions will be invalidated on restart.');
  }
}

const config = {
  nodeEnv,
  isProd,
  isTest,
  port: int(env.PORT, 4000),
  clientOrigins: list(env.CLIENT_ORIGIN, ['http://localhost:5173']).map((o) => o.replace(/\/$/, '')),
  trustProxy: bool(env.TRUST_PROXY, false),

  db: {
    host: env.DB_HOST || '127.0.0.1',
    port: int(env.DB_PORT, 3306),
    user: env.DB_USER || 'root',
    password: env.DB_PASSWORD || '',
    database: env.DB_NAME || 'amrita_connect',
    connectionLimit: int(env.DB_POOL_SIZE, 10),
  },

  auth: {
    jwtSecret,
    sessionHours: int(env.SESSION_HOURS, 8),
    cookieName: 'cecms_session',
    bcryptRounds: int(env.BCRYPT_ROUNDS, isTest ? 4 : 12),
    otpPepper: env.OTP_PEPPER && env.OTP_PEPPER.length >= 16 ? env.OTP_PEPPER : crypto.createHash('sha256').update(`otp:${jwtSecret}`).digest('hex'),
  },

  otp: {
    ttlMinutes: int(env.OTP_TTL_MINUTES, 5),
    maxAttempts: int(env.OTP_MAX_ATTEMPTS, 5),
    resendCooldownSeconds: isTest ? 1 : int(env.OTP_RESEND_COOLDOWN_SECONDS, 60),
    maxResends: int(env.OTP_MAX_RESENDS, 5),
    maxPerDestinationPerHour: int(env.OTP_MAX_PER_DESTINATION_PER_HOUR, 8),
  },

  // Student email domains accepted at registration. Admins can change this at runtime (platform_settings).
  defaultStudentEmailDomains: list(env.STUDENT_EMAIL_DOMAINS, ['cb.students.amrita.edu']),

  email: {
    provider: (env.EMAIL_PROVIDER || 'none').toLowerCase(), // none | smtp | graph
    from: env.EMAIL_FROM || '',
    smtp: {
      host: env.SMTP_HOST || '',
      port: int(env.SMTP_PORT, 587),
      secure: bool(env.SMTP_SECURE, false),
      user: env.SMTP_USER || '',
      pass: env.SMTP_PASS || '',
    },
    graph: {
      tenantId: env.GRAPH_TENANT_ID || '',
      clientId: env.GRAPH_CLIENT_ID || '',
      clientSecret: env.GRAPH_CLIENT_SECRET || '',
      senderUser: env.GRAPH_SENDER_USER || '', // mailbox (UPN) that sends the mail
    },
  },

  sms: {
    provider: (env.SMS_PROVIDER || 'none').toLowerCase(), // none | twilio
    twilio: {
      accountSid: env.TWILIO_ACCOUNT_SID || '',
      authToken: env.TWILIO_AUTH_TOKEN || '',
      from: env.TWILIO_FROM || '',
      messagingServiceSid: env.TWILIO_MESSAGING_SERVICE_SID || '',
    },
  },

  // DEV ONLY: print OTPs to the server console when no provider is configured. Refused in production.
  devLogOtpToConsole: !isProd && bool(env.DEV_LOG_OTP_TO_CONSOLE, false),

  rateLimit: {
    windowMinutes: 15,
    general: int(env.RATE_LIMIT_GENERAL, isTest ? 100000 : 600),
    auth: int(env.RATE_LIMIT_AUTH, isTest ? 100000 : 40),
  },

  scheduler: {
    enabled: !isTest && bool(env.SCHEDULER_ENABLED, true),
    intervalSeconds: int(env.SCHEDULER_INTERVAL_SECONDS, 60),
  },
};

module.exports = config;
