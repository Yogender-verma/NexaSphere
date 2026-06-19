import { financialService } from '../services/financialService.js';

function sanitizeUser(user) {
  if (!user) return null;
  return { id: user.id, email: user.email, name: user.name || null, role: user.role || 'student' };
}

export const financialController = {
  async createBudget(req, res) {
    try {
      const budget = await financialService.createBudget(req.body, sanitizeUser(req.user));
      res.status(201).json({ success: true, data: budget });
    } catch (err) {
      const status = err.message.includes('Forbidden')
        ? 403
        : err.message.includes('Authentication')
          ? 401
          : 400;
      res.status(status).json({ success: false, error: err.message });
    }
  },

  async getBudgets(req, res) {
    try {
      const budgets = await financialService.getBudgets(sanitizeUser(req.user));
      res.json({ success: true, data: budgets });
    } catch (err) {
      const status = err.message.includes('Forbidden') ? 403 : 500;
      res.status(status).json({ success: false, error: err.message });
    }
  },

  async getBudgetById(req, res) {
    try {
      const budget = await financialService.getBudgetById(
        req.params.budgetId,
        sanitizeUser(req.user)
      );
      if (!budget) return res.status(404).json({ success: false, error: 'Budget not found' });
      res.json({ success: true, data: budget });
    } catch (err) {
      const status = err.message.includes('Forbidden') ? 403 : 500;
      res.status(status).json({ success: false, error: err.message });
    }
  },

  async updateBudget(req, res) {
    try {
      const budget = await financialService.updateBudget(
        req.params.budgetId,
        req.body,
        sanitizeUser(req.user)
      );
      if (!budget) return res.status(404).json({ success: false, error: 'Budget not found' });
      res.json({ success: true, data: budget });
    } catch (err) {
      const status = err.message.includes('Forbidden')
        ? 403
        : err.message.includes('not found')
          ? 404
          : 400;
      res.status(status).json({ success: false, error: err.message });
    }
  },

  async deleteBudget(req, res) {
    try {
      await financialService.deleteBudget(req.params.budgetId, sanitizeUser(req.user));
      res.json({ success: true, message: 'Budget deleted successfully' });
    } catch (err) {
      const status = err.message.includes('Forbidden')
        ? 403
        : err.message.includes('not found')
          ? 404
          : 400;
      res.status(status).json({ success: false, error: err.message });
    }
  },

  async cloneBudget(req, res) {
    try {
      const budget = await financialService.cloneBudget(
        req.params.budgetId,
        req.body.eventId,
        sanitizeUser(req.user)
      );
      res.status(201).json({ success: true, data: budget });
    } catch (err) {
      const status = err.message.includes('Forbidden') ? 403 : 400;
      res.status(status).json({ success: false, error: err.message });
    }
  },

  async getExpenses(req, res) {
    try {
      const expenses = await financialService.getExpenses(
        req.params.budgetId,
        sanitizeUser(req.user)
      );
      res.json({ success: true, data: expenses });
    } catch (err) {
      const status = err.message.includes('Forbidden') ? 403 : 500;
      res.status(status).json({ success: false, error: err.message });
    }
  },

  async createExpense(req, res) {
    try {
      const expense = await financialService.createExpense(
        { ...req.body, budgetId: req.params.budgetId },
        sanitizeUser(req.user)
      );
      res.status(201).json({ success: true, data: expense });
    } catch (err) {
      const status = err.message.includes('Forbidden')
        ? 403
        : err.message.includes('Authentication')
          ? 401
          : 400;
      res.status(status).json({ success: false, error: err.message });
    }
  },

  async updateExpense(req, res) {
    try {
      const expense = await financialService.updateExpense(
        req.params.expenseId,
        req.body,
        sanitizeUser(req.user)
      );
      if (!expense) return res.status(404).json({ success: false, error: 'Expense not found' });
      res.json({ success: true, data: expense });
    } catch (err) {
      const status = err.message.includes('Forbidden')
        ? 403
        : err.message.includes('not found')
          ? 404
          : 400;
      res.status(status).json({ success: false, error: err.message });
    }
  },

  async deleteExpense(req, res) {
    try {
      await financialService.deleteExpense(req.params.expenseId, sanitizeUser(req.user));
      res.json({ success: true, message: 'Expense deleted successfully' });
    } catch (err) {
      const status = err.message.includes('Forbidden')
        ? 403
        : err.message.includes('not found')
          ? 404
          : 400;
      res.status(status).json({ success: false, error: err.message });
    }
  },

  async getRevenues(req, res) {
    try {
      const revenues = await financialService.getRevenues(
        req.params.budgetId,
        sanitizeUser(req.user)
      );
      res.json({ success: true, data: revenues });
    } catch (err) {
      const status = err.message.includes('Forbidden') ? 403 : 500;
      res.status(status).json({ success: false, error: err.message });
    }
  },

  async createRevenue(req, res) {
    try {
      const revenue = await financialService.createRevenue(
        { ...req.body, budgetId: req.params.budgetId },
        sanitizeUser(req.user)
      );
      res.status(201).json({ success: true, data: revenue });
    } catch (err) {
      const status = err.message.includes('Forbidden')
        ? 403
        : err.message.includes('Authentication')
          ? 401
          : 400;
      res.status(status).json({ success: false, error: err.message });
    }
  },

  async deleteRevenue(req, res) {
    try {
      await financialService.deleteRevenue(req.params.revenueId, sanitizeUser(req.user));
      res.json({ success: true, message: 'Revenue entry deleted successfully' });
    } catch (err) {
      const status = err.message.includes('Forbidden')
        ? 403
        : err.message.includes('not found')
          ? 404
          : 400;
      res.status(status).json({ success: false, error: err.message });
    }
  },

  async getBudgetVariance(req, res) {
    try {
      const variance = await financialService.getBudgetVariance(
        req.params.budgetId,
        sanitizeUser(req.user)
      );
      res.json({ success: true, data: variance });
    } catch (err) {
      const status = err.message.includes('Forbidden') ? 403 : 500;
      res.status(status).json({ success: false, error: err.message });
    }
  },

  async getIncomeStatement(req, res) {
    try {
      const statement = await financialService.getIncomeStatement(
        req.params.budgetId,
        sanitizeUser(req.user)
      );
      res.json({ success: true, data: statement });
    } catch (err) {
      const status = err.message.includes('Forbidden') ? 403 : 500;
      res.status(status).json({ success: false, error: err.message });
    }
  },

  async getBudgetsUtilizationReport(req, res) {
    try {
      const report = await financialService.getBudgetsUtilizationReport(sanitizeUser(req.user));
      res.json({ success: true, data: report });
    } catch (err) {
      const status = err.message.includes('Forbidden') ? 403 : 500;
      res.status(status).json({ success: false, error: err.message });
    }
  },

  async exportReport(req, res) {
    try {
      const format = req.query.format || 'json';
      const report = await financialService.exportReport(
        req.params.budgetId,
        format,
        sanitizeUser(req.user)
      );
      if (format.toLowerCase() === 'json') {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader(
          'Content-Disposition',
          `attachment; filename="report-${req.params.budgetId}.json"`
        );
        res.send(report);
      } else if (format.toLowerCase() === 'csv') {
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader(
          'Content-Disposition',
          `attachment; filename="report-${req.params.budgetId}.csv"`
        );
        res.send(report);
      }
    } catch (err) {
      const status = err.message.includes('Forbidden') ? 403 : 400;
      res.status(status).json({ success: false, error: err.message });
    }
  },
};
