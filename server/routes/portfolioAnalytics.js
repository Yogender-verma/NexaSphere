/**
 * Portfolio Analytics Routes
 * POST /api/portfolio/:username/view  — public, records a page view
 * GET  /api/portfolio/:username/analytics — owner-only (passkey), returns stats
 */

import { Router } from 'express';
import { portfolioAnalyticsRepository } from '../repositories/portfolioAnalyticsRepository.js';
import { portfolioRepository } from '../repositories/portfolioRepository.js';

const router = Router();

router.post('/api/portfolio/:username/view', async (req, res) => {
  try {
    const username = String(req.params.username || '').trim();
    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }

    const ip = String(req.ip || 'unknown').trim();
    const referrer = req.get('Referer') || req.body?.referrer || null;

    await portfolioAnalyticsRepository.recordView(username, { ip, referrer });
    return res.status(204).end();
  } catch (err) {
    console.error('Error recording portfolio view:', err);
    // Fail silently from the client's perspective — view tracking should
    // never break the portfolio page itself.
    return res.status(204).end();
  }
});

router.get('/api/portfolio/:username/analytics', async (req, res) => {
  try {
    const username = String(req.params.username || '').trim();
    const passkey = String(req.query.passkey || '').trim();
    const days = Number(req.query.days) || 30;

    if (!username || !passkey) {
      return res.status(400).json({ error: 'Username and passkey are required' });
    }

    const isAuthorized = await portfolioRepository.verifyPasskey(username, passkey);
    if (!isAuthorized) {
      return res.status(401).json({ error: 'Incorrect passkey for this username' });
    }

    const stats = await portfolioAnalyticsRepository.getStats(username, { days });
    return res.json(stats);
  } catch (err) {
    console.error('Error fetching portfolio analytics:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

export default router;
