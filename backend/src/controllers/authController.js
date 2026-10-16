'use strict';
const authService = require('../services/authService');
const otpService = require('../services/otpService');
const delivery = require('../integrations/delivery');
const settings = require('../services/settingsService');
const { asyncHandler } = require('../utils/http');

exports.config = asyncHandler(async (_req, res) => {
  const s = await settings.getTyped();
  const d = delivery.status();
  res.json({
    studentEmailDomains: s.studentEmailDomains,
    requireStudentLoginOtp: s.requireStudentLoginOtp,
    delivery: {
      email: { enabled: d.email.enabled, devConsole: d.email.devConsole },
      sms: { enabled: d.sms.enabled, devConsole: d.sms.devConsole },
    },
  });
});

exports.register = asyncHandler(async (req, res) => res.status(202).json(await authService.register(req.body, req)));
exports.verifyRegistration = asyncHandler(async (req, res) => res.json({ user: await authService.verifyRegistration(req.body, req, res) }));
exports.login = asyncHandler(async (req, res) => res.json(await authService.login(req.body, req, res)));
exports.verifyLogin = asyncHandler(async (req, res) => res.json({ user: await authService.verifyLogin(req.body, req, res) }));
exports.resend = asyncHandler(async (req, res) => res.json(await otpService.resend(req.body.challengeId)));
exports.logout = asyncHandler(async (req, res) => {
  await authService.logout(req, res);
  res.json({ message: 'Signed out.' });
});
exports.me = asyncHandler(async (req, res) => res.json({ user: req.user }));
