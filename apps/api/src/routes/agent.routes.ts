import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import * as agentService from '../services/agent.service.js';
import { revokeAllTokens } from '../services/token.service.js';
import { logAction } from '../services/audit.service.js';
import { authMiddleware } from '../middleware/auth.js';

const CreateAgentSchema = z.object({
  name: z.string().min(1).max(100),
  model: z.string().optional(),
  version: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
  createdBy: z.string().optional(),
  parentAgentId: z.string().optional(),
});

export function registerAgentRoutes(app: FastifyInstance) {
  // All agent routes require authentication
  app.addHook('onRequest', authMiddleware);

  /** Create a new agent. */
  app.post('/api/v1/agents', async (request, reply) => {
    const body = CreateAgentSchema.parse(request.body);

    // If delegating from a parent, validate parent belongs to same org
    if (body.parentAgentId) {
      const parent = await agentService.getAgent(request.org.id, body.parentAgentId);
      if (!parent) {
        return reply.code(404).send({
          error: 'PARENT_NOT_FOUND',
          message: 'Parent agent not found in your organization.',
        });
      }
      if (parent.revokedAt) {
        return reply
          .code(400)
          .send({ error: 'PARENT_REVOKED', message: 'Parent agent is revoked.' });
      }
    }

    const agent = await agentService.createAgent({
      orgId: request.org.id,
      ...body,
    });

    await logAction({
      orgId: request.org.id,
      agentId: agent.id,
      action: 'agent.create',
      result: 'success',
      reasoning: `Agent "${body.name}" created`,
    });

    // Return agent info + private key (shown only once)
    const { privateKey, ...agentData } = agent;
    return reply.code(201).send({
      agent: agentData,
      privateKey,
      _warning: 'Store the private key securely. It will not be shown again.',
    });
  });

  /** List agents. */
  app.get('/api/v1/agents', async (request) => {
    const { includeRevoked } = request.query as { includeRevoked?: string };
    const agents = await agentService.listAgents(request.org.id, includeRevoked === 'true');
    return { agents };
  });

  /** Get a specific agent. */
  app.get('/api/v1/agents/:agentId', async (request, reply) => {
    const { agentId } = request.params as { agentId: string };
    const agent = await agentService.getAgent(request.org.id, agentId);

    if (!agent) {
      return reply.code(404).send({ error: 'NOT_FOUND', message: 'Agent not found.' });
    }

    return { agent };
  });

  /** Revoke an agent — marks as inactive. */
  app.post('/api/v1/agents/:agentId/revoke', async (request, reply) => {
    const { agentId } = request.params as { agentId: string };
    const agent = await agentService.revokeAgent(request.org.id, agentId);

    if (!agent) {
      return reply
        .code(404)
        .send({ error: 'NOT_FOUND', message: 'Agent not found or already revoked.' });
    }

    return { agent, message: 'Agent revoked successfully.' };
  });

  /** Kill switch — revoke ALL tokens for an agent. */
  app.delete('/api/v1/agents/:agentId/tokens', async (request, reply) => {
    const { agentId } = request.params as { agentId: string };

    // Verify agent exists in this org
    const agent = await agentService.getAgent(request.org.id, agentId);
    if (!agent) {
      return reply.code(404).send({ error: 'NOT_FOUND', message: 'Agent not found.' });
    }

    const revokedCount = await revokeAllTokens(request.org.id, agentId);
    return { message: `Kill switch activated. ${revokedCount} token(s) revoked.`, revokedCount };
  });
}
