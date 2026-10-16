'use strict';
const { z } = require('zod');
const { badRequest } = require('./errors');

const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

/** Validate req[source] with a zod schema and replace it with the parsed (stripped, coerced) value. */
function validate(schema, source = 'body') {
  return (req, _res, next) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      const details = result.error.issues.map((i) => ({ field: i.path.join('.'), message: i.message }));
      return next(badRequest('validation_error', details[0] ? `${details[0].field ? `${details[0].field}: ` : ''}${details[0].message}` : 'Invalid input.', details));
    }
    if (source === 'query') {
      // Express 4 allows reassigning req.query
      req.query = result.data;
    } else {
      req[source] = result.data;
    }
    return next();
  };
}

const idParam = z.object({ id: z.coerce.number().int().positive() });
const regParam = z.object({ id: z.coerce.number().int().positive(), regId: z.coerce.number().int().positive() });
const E164 = /^\+[1-9]\d{7,14}$/;

const phoneSchema = z
  .string()
  .trim()
  .transform((v) => v.replace(/[\s()-]/g, ''))
  .refine((v) => E164.test(v), 'Phone must be in international format, e.g. +919876543210');

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(72, 'Password must be at most 72 characters')
  .refine((v) => /[A-Za-z]/.test(v) && /\d/.test(v), 'Password must contain at least one letter and one number');

const emailSchema = z.string().trim().toLowerCase().email('Enter a valid email address').max(190);

const isoDate = z
  .string()
  .refine((v) => !Number.isNaN(Date.parse(v)), 'Must be a valid ISO date-time')
  .transform((v) => new Date(v));

module.exports = { asyncHandler, validate, idParam, regParam, phoneSchema, passwordSchema, emailSchema, isoDate, E164 };
