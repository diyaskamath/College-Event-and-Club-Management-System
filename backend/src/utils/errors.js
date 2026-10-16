'use strict';

class AppError extends Error {
  constructor(status, code, message, details) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
    this.expose = true;
  }
}

const badRequest = (code, message, details) => new AppError(400, code, message, details);
const unauthorized = (message = 'Authentication required.', code = 'unauthorized') => new AppError(401, code, message);
const forbidden = (message = 'You do not have permission to perform this action.', code = 'forbidden') => new AppError(403, code, message);
const notFound = (message = 'Resource not found.', code = 'not_found') => new AppError(404, code, message);
const conflict = (code, message, details) => new AppError(409, code, message, details);
const tooMany = (code, message, details) => new AppError(429, code, message, details);

module.exports = { AppError, badRequest, unauthorized, forbidden, notFound, conflict, tooMany };
