import type { FastifyInstance } from 'fastify';
import * as auditService from '../services/audit.service.js';
import { authMiddleware } from '../middleware/auth.js';

export function registerAuditRoutes(app: FastifyInstance) {
  app.addHook('onRequest', authMiddleware);

  /** Query audit log. */
  app.get('/api/v1/audit', async (request) => {
    const { agentId, action, result, limit, offset } = request.query as {
      agentId?: string;
      action?: string;
      result?: string;
      limit?: string;
      offset?: string;
    };

    const data = await auditService.queryAuditLog(request.org.id, {
      agentId,
      action,
      result,
      limit: limit ? parseInt(limit, 10) : undefined,
      offset: offset ? parseInt(offset, 10) : undefined,
    });

    return data;
  });

  /** Verify audit chain integrity. */
  app.get('/api/v1/audit/verify', async (request) => {
    const result = await auditService.verifyAuditChain(request.org.id);
    return result;
  });
}
