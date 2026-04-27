import type { FastifyInstance } from 'fastify';
import { dashboardService } from '../services/dashboard.service.js';
import { authMiddleware } from '../middleware/auth.js';

export function registerDashboardRoutes(app: FastifyInstance) {
  /**
   * GET /api/v1/dashboard/stats
   * Get overview stats for the dashboard.
   */
  app.get('/api/v1/dashboard/stats', { preHandler: [authMiddleware] }, async (request, reply) => {
    try {
      // request.org is attached by authMiddleware
      const stats = await dashboardService.getStats(request.org.id);
      return reply.send(stats);
    } catch (error) {
      const err = error as Error;
      return reply.code(500).send({
        error: 'INTERNAL_ERROR',
        message: err.message,
      });
    }
  });
}
