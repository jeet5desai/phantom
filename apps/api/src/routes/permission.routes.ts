import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import * as permissionService from '../services/permission.service.js';
import { authMiddleware } from '../middleware/auth.js';
import { getAgent } from '../services/agent.service.js';

const GrantPermissionSchema = z.object({
  agentId: z.string().min(1),
  resource: z.string().min(1),
  action: z.string().min(1),
  requiresApproval: z.boolean().optional(),
});

const CheckScopesSchema = z.object({
  agentId: z.string().min(1),
  scopes: z.array(z.string().min(1)),
});

export function registerPermissionRoutes(app: FastifyInstance) {
  app.addHook('onRequest', authMiddleware);

  /** Grant a permission to an agent. */
  app.post('/api/v1/permissions', async (request, reply) => {
    const body = GrantPermissionSchema.parse(request.body);

    // Verify agent belongs to this org
    const agent = await getAgent(request.userId, body.agentId);
    if (!agent) {
      return reply.code(404).send({ error: 'AGENT_NOT_FOUND' });
    }

    const permission = await permissionService.grantPermission(
      body.agentId,
      body.resource,
      body.action,
      body.requiresApproval,
    );

    return reply.code(201).send({ permission });
  });

  /** List permissions for an agent. */
  app.get('/api/v1/agents/:agentId/permissions', async (request, reply) => {
    const { agentId } = request.params as { agentId: string };

    const agent = await getAgent(request.userId, agentId);
    if (!agent) {
      return reply.code(404).send({ error: 'AGENT_NOT_FOUND' });
    }

    const permissions = await permissionService.listPermissions(agentId);
    return { permissions };
  });

  /** Check if an agent has specific scopes. */
  app.post('/api/v1/permissions/check', async (request, reply) => {
    const body = CheckScopesSchema.parse(request.body);

    const agent = await getAgent(request.userId, body.agentId);
    if (!agent) {
      return reply.code(404).send({ error: 'AGENT_NOT_FOUND' });
    }

    const result = await permissionService.checkScopes(body.agentId, body.scopes);
    return result;
  });

  /** Revoke a specific permission. */
  app.delete('/api/v1/permissions/:permissionId', async (request, reply) => {
    const { permissionId } = request.params as { permissionId: string };
    const { agentId } = request.query as { agentId: string };

    if (!agentId) {
      return reply
        .code(400)
        .send({ error: 'MISSING_AGENT_ID', message: 'agentId query param required.' });
    }

    const agent = await getAgent(request.userId, agentId);
    if (!agent) {
      return reply.code(404).send({ error: 'NOT_FOUND', message: 'Agent not found.' });
    }

    const deleted = await permissionService.revokePermission(agentId, permissionId);
    if (!deleted) {
      return reply.code(404).send({ error: 'NOT_FOUND' });
    }

    return { message: 'Permission revoked.' };
  });
}
