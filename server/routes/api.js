import { Router } from 'express';
import * as eventsController from '../controllers/eventsController.js';
import * as activityEventsController from '../controllers/activityEventsController.js';
import { adminAuthMiddleware } from '../middleware/adminAuthMiddleware.js';
import * as coreTeamController from '../controllers/coreTeamController.js';
import * as eventRegistrationController from '../controllers/eventRegistrationController.js';
import * as usersController from '../controllers/usersController.js';
import * as attendanceController from '../controllers/attendanceController.js';
import * as eventAnalyticsController from '../controllers/eventAnalyticsController.js';
import { adminAuditMiddleware, attachOldState } from '../middleware/adminAuditMiddleware.js';
import { eventsRepository } from '../repositories/eventsRepository.js';
import { coreTeamService } from '../services/coreTeamService.js';
import { authRateLimiter, protectedActionRateLimiter } from '../middleware/authRateLimiter.js';
import { portfolioRepository } from '../repositories/portfolioRepository.js';
import { achievementsRepository } from '../repositories/achievementsRepository.js';
import { portfolioService } from '../services/portfolioService.js';
import { eventPlanningService } from '../services/eventPlanningService.js';

const router = Router();

// Public
router.get('/api/users', usersController.getPublicUsers);
router.get('/api/content/events', eventsController.listEvents);
router.post('/api/content/events/:eventId/register', eventRegistrationController.registerForEvent);
router.get('/api/content/events/:eventId/calendar', eventRegistrationController.getEventCalendar);
router.get(
  '/api/content/activity-events/:activityKey',
  activityEventsController.listActivityEvents
);
router.post(
  '/api/content/activity-events/:activityKey',
  protectedActionRateLimiter,
  adminAuthMiddleware.requireScope('events:write'),
  activityEventsController.addActivityEvent
);
router.delete(
  '/api/content/activity-events/:activityKey/:eventId',
  protectedActionRateLimiter,
  adminAuthMiddleware.requireScope('events:write'),
  activityEventsController.deleteActivityEvent
);

// Admin auth
router.get('/api/admin/users', adminAuthMiddleware.requireAdmin, usersController.getAdminUsers);
router.post(
  '/api/admin/users',
  adminAuthMiddleware.requireAdmin,
  adminAuditMiddleware,
  usersController.adminCreateUser
);
router.put(
  '/api/admin/users/:id',
  adminAuthMiddleware.requireAdmin,
  adminAuditMiddleware,
  usersController.adminUpdateUser
);
router.delete(
  '/api/admin/users/:id',
  adminAuthMiddleware.requireAdmin,
  adminAuditMiddleware,
  usersController.adminDeactivateUser
);
router.post('/api/admin/login', authRateLimiter, adminAuthMiddleware.login);
router.post('/api/admin/logout', adminAuthMiddleware.requireAdmin, adminAuthMiddleware.logout);

router.get(
  '/api/admin/events',
  adminAuthMiddleware.requireScope('events:read'),
  eventsController.adminListEvents
);
router.post(
  '/api/admin/events',
  adminAuthMiddleware.requireScope('events:write'),
  adminAuditMiddleware,
  eventsController.adminCreateEvent
);
router.put(
  '/api/admin/events/:id',
  adminAuthMiddleware.requireScope('events:write'),
  attachOldState((req) => eventsRepository.getById(req.params.id)),
  adminAuditMiddleware,
  eventsController.adminUpdateEvent
);
router.delete(
  '/api/admin/events/:id',
  adminAuthMiddleware.requireScope('events:write'),
  attachOldState((req) => eventsRepository.getById(req.params.id)),
  adminAuditMiddleware,
  eventsController.adminDeleteEvent
);

// Core team management APIs
router.get(
  '/api/admin/core-team/members',
  adminAuthMiddleware.requireScope('settings:admin'),
  coreTeamController.adminListCoreTeamMembers
);
router.post(
  '/api/admin/core-team/members',
  adminAuthMiddleware.requireScope('settings:admin'),
  adminAuditMiddleware,
  coreTeamController.adminAddCoreTeamMember
);
router.delete(
  '/api/admin/core-team/members/:id',
  adminAuthMiddleware.requireScope('settings:admin'),
  attachOldState(async (req) => {
    const members = await coreTeamService.listMembers();
    return members.find((m) => String(m.id) === String(req.params.id));
  }),
  adminAuditMiddleware,
  coreTeamController.adminDeleteCoreTeamMember
);

// Portfolio management APIs
router.get(
  '/api/admin/portfolios',
  adminAuthMiddleware.requireScope('events:read'),
  async (req, res) => {
    try {
      const username = String(req.query.username || '').trim();
      if (username) {
        const portfolio = await portfolioService.getByUsername(username);
        return res.json(portfolio ? { portfolios: [portfolio] } : { portfolios: [] });
      }
      const portfolios = (await portfolioRepository.listAll)
        ? await portfolioRepository.listAll()
        : [];
      return res.json({ portfolios });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }
);
router.delete(
  '/api/admin/portfolios/:username',
  adminAuthMiddleware.requireScope('events:write'),
  adminAuditMiddleware,
  async (req, res) => {
    try {
      const username = String(req.params.username || '')
        .trim()
        .toLowerCase();
      if (!username) return res.status(400).json({ error: 'Username required' });
      await portfolioRepository.delete(username);
      return res.json({ ok: true });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }
);

// Achievement management APIs
router.get(
  '/api/admin/portfolios/:username/achievements',
  adminAuthMiddleware.requireScope('events:read'),
  async (req, res) => {
    try {
      const username = String(req.params.username || '')
        .trim()
        .toLowerCase();
      const achievements = await achievementsRepository.getByUsername(username);
      return res.json({ achievements });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }
);
router.post(
  '/api/admin/portfolios/:username/achievements',
  adminAuthMiddleware.requireScope('events:write'),
  async (req, res) => {
    try {
      const username = String(req.params.username || '')
        .trim()
        .toLowerCase();
      const { name, description, tier, iconUrl, source } = req.body;
      if (!name) return res.status(400).json({ error: 'Achievement name is required' });
      const achievement = await portfolioService.awardAchievement(username, {
        name: String(name).trim().slice(0, 120),
        description: description ? String(description).trim().slice(0, 1000) : null,
        tier: tier ? String(tier).trim().slice(0, 40) : 'bronze',
        iconUrl: iconUrl ? String(iconUrl).trim().slice(0, 500) : null,
        source: source ? String(source).trim().slice(0, 60) : 'admin',
      });
      return res.status(201).json({ achievement });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }
);
router.delete(
  '/api/admin/portfolios/:username/achievements/:name',
  adminAuthMiddleware.requireScope('events:write'),
  async (req, res) => {
    try {
      const username = String(req.params.username || '')
        .trim()
        .toLowerCase();
      const name = String(req.params.name || '').trim();
      await portfolioService.removeAchievement(username, name);
      return res.json({ ok: true });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }
);

// Event planning — content routes (for website)
router.get('/api/content/events/:eventId/planning', (req, res) => {
  eventPlanningService.seedDefaultTemplates(req.params.eventId);
  res.json(eventPlanningService.getPlan(req.params.eventId));
});
router.post('/api/content/events/:eventId/planning/tasks', (req, res) => {
  const task = eventPlanningService.createTask(req.params.eventId, req.body, req.ip);
  res.status(201).json(task);
});
router.put('/api/content/events/:eventId/planning/tasks/:taskId', (req, res) => {
  const task = eventPlanningService.updateTask(
    req.params.eventId,
    req.params.taskId,
    req.body,
    req.ip
  );
  if (!task) return res.status(404).json({ error: 'Task not found' });
  res.json(task);
});
router.delete('/api/content/events/:eventId/planning/tasks/:taskId', (req, res) => {
  if (!eventPlanningService.deleteTask(req.params.eventId, req.params.taskId, req.ip))
    return res.status(404).json({ error: 'Task not found' });
  res.json({ ok: true });
});
router.post('/api/content/events/:eventId/planning/tasks/:taskId/comments', (req, res) => {
  const comment = eventPlanningService.addComment(
    req.params.eventId,
    req.params.taskId,
    { content: req.body.content },
    req.ip
  );
  if (!comment) return res.status(404).json({ error: 'Task not found' });
  res.status(201).json(comment);
});

// Event planning — admin routes
router.get(
  '/api/admin/event-planning',
  adminAuthMiddleware.requireScope('events:read'),
  (req, res) => {
    const all = {};
    const { plans } = eventPlanningService;
    for (const [eventId, plan] of plans) {
      all[eventId] = {
        tasks: Array.from(plan.tasks.values()),
        budget: plan.budget,
        activityLog: plan.activityLog.slice(-50),
      };
    }
    res.json({ plans: all });
  }
);
router.put(
  '/api/admin/event-planning/:eventId/budget',
  adminAuthMiddleware.requireScope('events:write'),
  (req, res) => {
    res.json(eventPlanningService.updateBudget(req.params.eventId, req.body));
  }
);
router.post(
  '/api/admin/event-planning/:eventId/templates/seed',
  adminAuthMiddleware.requireScope('events:write'),
  (req, res) => {
    eventPlanningService.seedDefaultTemplates(req.params.eventId);
    res.json({ ok: true });
  }
);

export default router;
