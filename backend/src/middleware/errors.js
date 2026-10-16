'use strict';
const config = require('../config');

const notFoundHandler = (req, res) => res.status(404).json({ error: { code: 'route_not_found', message: `No route for ${req.method} ${req.path}` } });

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, _next) => {
  if (err && err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: { code: 'invalid_json', message: 'Request body is not valid JSON.' } });
  }
  if (err && err.type === 'entity.too.large') {
    return res.status(413).json({ error: { code: 'payload_too_large', message: 'Request body is too large.' } });
  }
  if (err && err.expose && err.status) {
    return res.status(err.status).json({ error: { code: err.code, message: err.message, ...(err.details ? { details: err.details } : {}) } });
  }
  // Unknown error: log server-side, never leak internals / SQL / secrets to the client.
  console.error(`[error] ${req.method} ${req.originalUrl}:`, config.isProd ? err.message : err);
  return res.status(500).json({ error: { code: 'internal_error', message: 'Something went wrong on our side. Please try again.' } });
};

module.exports = { errorHandler, notFoundHandler };
