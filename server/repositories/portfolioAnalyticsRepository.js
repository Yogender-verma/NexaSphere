/**
 * Portfolio Analytics Repository
 * Tracks page views per portfolio and computes aggregate stats.
 * Privacy-respecting: stores a hash of the visitor IP, never the raw IP.
 */

import crypto from 'crypto';
import { withDb } from './db.js';
import { canonicalizeUsername } from './portfolioRepository.js';

let schemaReady = null;
let schemaOk = false;

async function ensureSchema(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS portfolio_views (
      id SERIAL PRIMARY KEY,
      username VARCHAR(100) NOT NULL,
      viewer_hash VARCHAR(64) NOT NULL,
      referrer TEXT,
      viewed_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_portfolio_views_username
    ON portfolio_views (username)
  `);

  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_portfolio_views_viewed_at
    ON portfolio_views (viewed_at)
  `);
}

async function ensureReady() {
  if (schemaOk) return true;
  if (schemaReady) {
    try {
      await schemaReady;
      return true;
    } catch {
      return false;
    }
  }
  schemaReady = withDb(async (client) => {
    await ensureSchema(client);
  })
    .then(() => {
      schemaOk = true;
    })
    .catch((err) => {
      schemaReady = null;
      throw err;
    });

  try {
    await schemaReady;
    return true;
  } catch (err) {
    console.warn('PostgreSQL not available for portfolio analytics:', err.message);
    return false;
  }
}

// Hashes the IP so we can dedupe "unique" visitors without ever storing
// or returning the raw IP address.
function hashViewer(ip) {
  const salt = process.env.VIEW_HASH_SALT || 'nexasphere-view-salt';
  return crypto
    .createHash('sha256')
    .update(`${ip || 'unknown'}:${salt}`)
    .digest('hex');
}

export const portfolioAnalyticsRepository = {
  async recordView(username, { ip, referrer } = {}) {
    const isDbAvailable = await ensureReady();
    if (!isDbAvailable) return false;

    const sanitizedUsername = canonicalizeUsername(username);
    const viewerHash = hashViewer(ip);
    const safeReferrer = referrer ? String(referrer).slice(0, 500) : null;

    await withDb(async (client) => {
      await client.query(
        `INSERT INTO portfolio_views (username, viewer_hash, referrer) VALUES ($1, $2, $3)`,
        [sanitizedUsername, viewerHash, safeReferrer]
      );
    });
    return true;
  },

  async getStats(username, { days = 30 } = {}) {
    const isDbAvailable = await ensureReady();
    const sanitizedUsername = canonicalizeUsername(username);

    if (!isDbAvailable) {
      return { totalViews: 0, uniqueViews: 0, trend: [] };
    }

    return withDb(async (client) => {
      const { rows: totalsRows } = await client.query(
        `SELECT
           COUNT(*)::int AS total_views,
           COUNT(DISTINCT viewer_hash)::int AS unique_views
         FROM portfolio_views
         WHERE username = $1
           AND viewed_at >= NOW() - ($2 || ' days')::interval`,
        [sanitizedUsername, String(days)]
      );

      const { rows: trendRows } = await client.query(
        `SELECT
           DATE(viewed_at) AS date,
           COUNT(*)::int AS views,
           COUNT(DISTINCT viewer_hash)::int AS unique_views
         FROM portfolio_views
         WHERE username = $1
           AND viewed_at >= NOW() - ($2 || ' days')::interval
         GROUP BY DATE(viewed_at)
         ORDER BY DATE(viewed_at) ASC`,
        [sanitizedUsername, String(days)]
      );

      return {
        totalViews: totalsRows[0]?.total_views || 0,
        uniqueViews: totalsRows[0]?.unique_views || 0,
        trend: trendRows.map((r) => ({
          date: r.date,
          views: r.views,
          uniqueViews: r.unique_views,
        })),
      };
    });
  },
};

function resetState() {
  schemaReady = null;
  schemaOk = false;
}

export const __portfolioAnalyticsRepositoryInternals = {
  ensureSchema,
  resetState,
};
