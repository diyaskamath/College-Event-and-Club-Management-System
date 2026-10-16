'use strict';
const express = require('express');
const rateLimit = require('express-rate-limit');
const config = require('../config');
const v = require('../validation/schemas');
const { validate } = require('../utils/http');
const { requireAuth } = require('../middleware/auth');
const c = require('../controllers/authController');

const router = express.Router();
const windowMs = config.rateLimit.windowMinutes * 60 * 1000;
const limitMsg = { error: { code: 'rate_limited', message: 'Too many attempts. Please wait a few minutes and try again.' } };
const authLimiter = rateLimit({ windowMs, limit: config.rateLimit.auth, standardHeaders: true, legacyHeaders: false, message: limitMsg });
// Credential guessing is limited per IP + email so one attacker cannot lock out unrelated accounts.
const loginLimiter = rateLimit({
  windowMs, limit: Math.max(10, Math.floor(config.rateLimit.auth / 2)), standardHeaders: true, legacyHeaders: false, message: limitMsg,
  keyGenerator: (req) => `${req.ip}|${String((req.body && req.body.email) || '').toLowerCase()}`,
});
// OTP guessing is limited per IP + challenge (attempt counter in DB is the hard limit).
const otpLimiter = rateLimit({
  windowMs, limit: Math.max(20, config.rateLimit.auth), standardHeaders: true, legacyHeaders: false, message: limitMsg,
  keyGenerator: (req) => `${req.ip}|${String((req.body && req.body.challengeId) || '')}`,
});

router.get('/config', c.config);
router.post('/register', authLimiter, validate(v.register), c.register);
router.post('/register/verify', otpLimiter, validate(v.otpVerify), c.verifyRegistration);
router.post('/login', loginLimiter, validate(v.login), c.login);
router.post('/login/verify', otpLimiter, validate(v.otpVerify), c.verifyLogin);
router.post('/otp/resend', authLimiter, validate(v.otpResend), c.resend);
router.post('/logout', requireAuth, c.logout);
router.get('/me', requireAuth, c.me);

module.exports = router;
