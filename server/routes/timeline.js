import { Router } from 'express';
import { activityTimelineService } from '../services/activityTimelineService.js';
import { adminAuthMiddleware } from '../middleware/adminAuthMiddleware.js';

const router = Router();

// ── Admin: User Activity Timeline ────────────────────────────────────────────

router.get('/admin/users/timeline', adminAuthMiddleware.requireAdmin, async (req, res) => {
  try {
    const { email, username } = req.query;
    if (!email && !username) {
      return res.status(400).json({ error: 'Must provide either email or username' });
    }

    const timeline = await activityTimelineService.getUserTimeline({ email, username });
    return res.json({ timeline });
  } catch (error) {
    console.error('Error fetching user timeline:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/admin/users/timeline/export', adminAuthMiddleware.requireAdmin, async (req, res) => {
  try {
    const { email, username } = req.query;
    if (!email && !username) {
      return res.status(400).send('Must provide either email or username');
    }

    const timeline = await activityTimelineService.getUserTimeline({ email, username });

    // Format as CSV
    const headers = ['Timestamp', 'Type', 'Title', 'Description'];
    const rows = timeline.map((event) => [
      new Date(event.timestamp).toISOString(),
      event.type,
      `"${event.title.replace(/"/g, '""')}"`,
      `"${event.description.replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');

    const identifier = username || email.split('@')[0];
    const filename = `timeline_${identifier}_${new Date().toISOString().split('T')[0]}.csv`;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.send(csvContent);
  } catch (error) {
    console.error('Error exporting user timeline:', error);
    return res.status(500).send('Internal server error');
  }
});

export default router;
