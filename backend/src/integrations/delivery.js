'use strict';
/**
 * Delivery layer. Responsibilities are separated:
 *   - email providers  (smtp | graph)           -> deliverEmail()
 *   - sms providers    (twilio)                 -> deliverSms()
 * In-app delivery lives in services/notificationService.js.
 *
 * If a channel has no provider configured, send*() throws AppError 503 `delivery_not_configured`.
 * Callers must NEVER tell the user a message was sent unless send*() resolved.
 */
const nodemailer = require('nodemailer');
const config = require('../config');
const { AppError } = require('../utils/errors');

// ---- test capture (only active when NODE_ENV=test) --------------------------------------
const outbox = [];
let testMode = 'memory'; // 'memory' | 'none'
const setTestMode = (mode) => {
  if (!config.isTest) throw new Error('setTestMode is only available when NODE_ENV=test');
  testMode = mode;
};

// ---- helpers ---------------------------------------------------------------------------
function emailProviderName() {
  if (config.isTest) return testMode === 'memory' ? 'memory' : 'none';
  const p = config.email.provider;
  if (p === 'smtp' && config.email.smtp.host && config.email.from) return 'smtp';
  if (p === 'graph' && config.email.graph.tenantId && config.email.graph.clientId && config.email.graph.clientSecret && config.email.graph.senderUser) return 'graph';
  if (config.devLogOtpToConsole) return 'console';
  return 'none';
}

function smsProviderName() {
  if (config.isTest) return testMode === 'memory' ? 'memory' : 'none';
  const t = config.sms.twilio;
  if (config.sms.provider === 'twilio' && t.accountSid && t.authToken && (t.from || t.messagingServiceSid)) return 'twilio';
  if (config.devLogOtpToConsole) return 'console';
  return 'none';
}

const notConfigured = (channel) =>
  new AppError(
    503,
    'delivery_not_configured',
    channel === 'email'
      ? 'Email delivery is not configured on this server, so no verification code was sent. Ask the administrator to configure EMAIL_PROVIDER.'
      : 'SMS delivery is not configured on this server, so no verification code was sent. Ask the administrator to configure SMS_PROVIDER.',
  );

const deliveryFailed = (channel) =>
  new AppError(502, 'delivery_failed', `We could not deliver the message via ${channel}. Nothing was sent; please try again shortly.`);

let smtpTransport = null;
function getSmtp() {
  if (!smtpTransport) {
    const s = config.email.smtp;
    smtpTransport = nodemailer.createTransport({
      host: s.host,
      port: s.port,
      secure: s.secure,
      auth: s.user ? { user: s.user, pass: s.pass } : undefined,
      requireTLS: !s.secure, // Office 365 requires STARTTLS on 587
    });
  }
  return smtpTransport;
}

let graphToken = { value: null, exp: 0 };
async function getGraphToken() {
  if (graphToken.value && graphToken.exp > Date.now() + 60000) return graphToken.value;
  const g = config.email.graph;
  const body = new URLSearchParams({
    client_id: g.clientId,
    client_secret: g.clientSecret,
    scope: 'https://graph.microsoft.com/.default',
    grant_type: 'client_credentials',
  });
  const res = await fetch(`https://login.microsoftonline.com/${encodeURIComponent(g.tenantId)}/oauth2/v2.0/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  if (!res.ok) throw new Error(`Graph token request failed with HTTP ${res.status}`);
  const json = await res.json();
  graphToken = { value: json.access_token, exp: Date.now() + json.expires_in * 1000 };
  return graphToken.value;
}

/**
 * Send an email. Returns { provider } on success.
 * @param {{to:string, subject:string, text:string, html?:string}} msg
 */
async function sendEmail(msg) {
  const provider = emailProviderName();
  try {
    switch (provider) {
      case 'memory':
        outbox.push({ channel: 'email', to: msg.to, subject: msg.subject, text: msg.text });
        return { provider };
      case 'console':
        console.log(`[DEV ONLY - NOT DELIVERED] email to ${msg.to}: ${msg.subject}\n${msg.text}`);
        return { provider };
      case 'smtp':
        await getSmtp().sendMail({ from: config.email.from, to: msg.to, subject: msg.subject, text: msg.text, html: msg.html });
        return { provider };
      case 'graph': {
        const token = await getGraphToken();
        const res = await fetch(`https://graph.microsoft.com/v1.0/users/${encodeURIComponent(config.email.graph.senderUser)}/sendMail`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: {
              subject: msg.subject,
              body: { contentType: msg.html ? 'HTML' : 'Text', content: msg.html || msg.text },
              toRecipients: [{ emailAddress: { address: msg.to } }],
            },
            saveToSentItems: false,
          }),
        });
        if (res.status !== 202) throw new Error(`Graph sendMail failed with HTTP ${res.status}`);
        return { provider };
      }
      default:
        throw notConfigured('email');
    }
  } catch (err) {
    if (err instanceof AppError) throw err;
    console.error(`[delivery:email:${provider}] failed:`, err.message);
    throw deliveryFailed('email');
  }
}

/**
 * Send an SMS. Returns { provider } on success.
 * @param {{to:string, text:string}} msg  `to` must be E.164
 */
async function sendSms(msg) {
  const provider = smsProviderName();
  try {
    switch (provider) {
      case 'memory':
        outbox.push({ channel: 'sms', to: msg.to, text: msg.text });
        return { provider };
      case 'console':
        console.log(`[DEV ONLY - NOT DELIVERED] sms to ${msg.to}: ${msg.text}`);
        return { provider };
      case 'twilio': {
        const t = config.sms.twilio;
        const body = new URLSearchParams({ To: msg.to, Body: msg.text });
        if (t.messagingServiceSid) body.set('MessagingServiceSid', t.messagingServiceSid);
        else body.set('From', t.from);
        const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${encodeURIComponent(t.accountSid)}/Messages.json`, {
          method: 'POST',
          headers: {
            Authorization: `Basic ${Buffer.from(`${t.accountSid}:${t.authToken}`).toString('base64')}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body,
        });
        if (!res.ok) throw new Error(`Twilio responded with HTTP ${res.status}`);
        return { provider };
      }
      default:
        throw notConfigured('sms');
    }
  } catch (err) {
    if (err instanceof AppError) throw err;
    console.error(`[delivery:sms:${provider}] failed:`, err.message);
    throw deliveryFailed('sms');
  }
}

/** Public, secret-free description of what is enabled. */
function status() {
  const e = emailProviderName();
  const s = smsProviderName();
  return {
    email: { enabled: ['smtp', 'graph', 'memory'].includes(e), provider: e, devConsole: e === 'console' },
    sms: { enabled: ['twilio', 'memory'].includes(s), provider: s, devConsole: s === 'console' },
  };
}

const isRealDelivery = (provider) => ['smtp', 'graph', 'twilio', 'memory'].includes(provider);

module.exports = { sendEmail, sendSms, status, emailProviderName, smsProviderName, isRealDelivery, outbox, setTestMode };
