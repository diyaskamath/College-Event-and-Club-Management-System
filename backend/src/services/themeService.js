'use strict';
const { query } = require('../db');
const { mapTheme } = require('./mappers');
const { audit } = require('../utils/audit');
const { notFound, conflict, badRequest } = require('../utils/errors');

// ---- WCAG contrast helpers (guard against unreadable admin-configured themes) ----------------
const hexToRgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
const lin = (c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const luminance = (hex) => {
  const [r, g, b] = hexToRgb(hex).map(lin);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contrast = (a, b) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

function assertReadable(cfg) {
  const c = cfg.colors || {};
  if (c.text && c.background && contrast(c.text, c.background) < 4.5) throw badRequest('low_contrast', 'Text and background colours do not have enough contrast (WCAG AA needs at least 4.5:1).');
  if (c.text && c.surface && contrast(c.text, c.surface) < 4.5) throw badRequest('low_contrast', 'Text and card-surface colours do not have enough contrast (WCAG AA needs at least 4.5:1).');
}

/** Campus-local calendar date (YYYY-MM-DD) for a given instant. */
function localDate(timezone, at = new Date()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(at);
}

/**
 * Resolve the theme for a campus at a given instant.
 * Overlap rule: highest priority wins; ties -> most recently started window; then lowest id.
 * Outside every enabled window -> `null` (client falls back to the everyday campus theme).
 */
async function resolveActive({ campusId, campusSlug, date, at = new Date() } = {}) {
  let campus;
  if (campusId) campus = (await query('SELECT * FROM campuses WHERE id=? AND is_active=1', [campusId]))[0];
  else if (campusSlug) campus = (await query('SELECT * FROM campuses WHERE slug=? AND is_active=1', [campusSlug]))[0];
  else campus = (await query('SELECT * FROM campuses WHERE is_active=1 ORDER BY id LIMIT 1'))[0];
  if (!campus) throw notFound('Campus not found.', 'campus_not_found');

  const day = date || localDate(campus.timezone, at);
  const rows = await query(
    `SELECT * FROM festival_themes WHERE is_enabled=1 AND start_date <= ? AND end_date >= ? AND (campus_id IS NULL OR campus_id=?)
     ORDER BY priority DESC, start_date DESC, id ASC LIMIT 1`,
    [day, day, campus.id],
  );
  return {
    mode: rows.length ? 'festival' : 'default',
    theme: rows.length ? mapTheme(rows[0]) : null,
    campus: { id: campus.id, slug: campus.slug, name: campus.name, timezone: campus.timezone },
    localDate: day,
  };
}

async function list() {
  const rows = await query('SELECT * FROM festival_themes ORDER BY start_date ASC, id ASC');
  return rows.map(mapTheme);
}

const overlapsWith = async (themeId, { campusId, startDate, endDate }) => {
  const rows = await query(
    `SELECT slug, name FROM festival_themes WHERE is_enabled=1 AND id <> ? AND start_date <= ? AND end_date >= ? AND (campus_id IS NULL OR ? IS NULL OR campus_id=?)`,
    [themeId || 0, endDate, startDate, campusId || null, campusId || 0],
  );
  return rows;
};

async function create(admin, input) {
  assertReadable(input.config);
  if (input.campusId && !(await query('SELECT 1 FROM campuses WHERE id=?', [input.campusId])).length) throw badRequest('invalid_campus', 'Unknown campus.');
  try {
    const res = await query(
      'INSERT INTO festival_themes (slug,name,description,campus_id,start_date,end_date,is_enabled,priority,config,is_demo) VALUES (?,?,?,?,?,?,?,?,?,0)',
      [input.slug, input.name, input.description || null, input.campusId || null, input.startDate, input.endDate, input.isEnabled ? 1 : 0, input.priority || 0, JSON.stringify(input.config)],
    );
    await audit(admin.id, 'theme.create', { entityType: 'festival_theme', entityId: res.insertId, metadata: { slug: input.slug } });
    return get(res.insertId);
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') throw conflict('theme_exists', 'A theme with this slug already exists.');
    throw err;
  }
}

async function get(id) {
  const rows = await query('SELECT * FROM festival_themes WHERE id=?', [id]);
  if (!rows.length) throw notFound('Theme not found.', 'theme_not_found');
  const theme = mapTheme(rows[0]);
  theme.overlaps = await overlapsWith(id, { campusId: theme.campusId, startDate: theme.startDate, endDate: theme.endDate });
  return theme;
}

async function update(admin, id, input) {
  const current = await get(id);
  const next = { ...current, ...input, config: input.config ? { ...current.config, ...input.config, colors: { ...(current.config.colors || {}), ...(input.config.colors || {}) }, banner: { ...(current.config.banner || {}), ...(input.config.banner || {}) } } : current.config };
  if (next.endDate < next.startDate) throw badRequest('invalid_dates', 'End date must be on or after the start date.');
  assertReadable(next.config);
  await query(
    'UPDATE festival_themes SET name=?, description=?, campus_id=?, start_date=?, end_date=?, is_enabled=?, priority=?, config=?, is_demo=? WHERE id=?',
    [next.name, next.description, next.campusId || null, next.startDate, next.endDate, next.isEnabled ? 1 : 0, next.priority || 0, JSON.stringify(next.config), current.isDemo ? 1 : 0, id],
  );
  await audit(admin.id, 'theme.update', { entityType: 'festival_theme', entityId: id, metadata: { fields: Object.keys(input) } });
  return get(id);
}

module.exports = { resolveActive, list, get, create, update, localDate, contrast };
