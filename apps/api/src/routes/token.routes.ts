import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import * as tokenService from '../services/token.service.js';
import { authMiddleware } from '../middleware/auth.js';
import { getAgent } from '../services/agent.service.js';

const CreateTokenSchema = z.object({
  agentId: z.string().min(1),
  scopes: z.array(z.string().min(1)).min(1),
  ttl: z.number().int().min(10).max(86400).default(300), // 10s to 24h
  credentialId: z.string().optional(),
});

const VerifyTokenSchema = z.object({
  token: z.string().min(1),
});

export function registerTokenRoutes(app: FastifyInstance) {
  app.addHook('onRequest', authMiddleware);

  /** Issue a scoped, time-limited token. */
  app.post('/api/v1/tokens', async (request, reply) => {
    const body = CreateTokenSchema.parse(request.body);

    // Verify agent belongs to this org
    const agent = await getAgent(request.userId, body.agentId);
    if (!agent) {
      return reply.code(404).send({ error: 'AGENT_NOT_FOUND' });
    }

    try {
      const token = await tokenService.createToken({
        userId: request.userId,
        agentId: body.agentId,
        scopes: body.scopes,
        ttl: body.ttl,
        credentialId: body.credentialId,
      });

      return reply.code(201).send({ token });
    } catch (err) {
      const error = err as Error;
      if (error.message === 'AGENT_REVOKED') {
        return reply.code(403).send({ error: 'AGENT_REVOKED', message: 'Agent is revoked.' });
      }
      if (error.message.startsWith('SCOPE_DENIED')) {
        const denied = error.message.split(':').slice(1).join(':');
        return reply.code(403).send({
          error: 'SCOPE_DENIED',
          message: 'Agent lacks required permissions.',
          deniedScopes: denied.split(','),
        });
      }
      throw err;
    }
  });

  /** Verify a token. */
  app.post('/api/v1/tokens/verify', async (request, reply) => {
    const body = VerifyTokenSchema.parse(request.body);
    const result = await tokenService.verifyToken(body.token);

    if (!result.valid) {
      return reply.code(401).send({ valid: false, reason: result.reason });
    }

    return { valid: true, token: result.token };
  });

  /** Revoke a specific token. */
  app.delete('/api/v1/tokens/:tokenId', async (request, reply) => {
    const { tokenId } = request.params as { tokenId: string };
    const revoked = await tokenService.revokeToken(request.userId, tokenId);

    if (!revoked) {
      return reply
        .code(404)
        .send({ error: 'NOT_FOUND', message: 'Token not found or already revoked.' });
    }

    return { message: 'Token revoked.' };
  });

  /** Delegate a scoped token from a parent agent to a sub-agent. */
  app.post('/api/v1/tokens/delegate', async (request, reply) => {
    const DelegateSchema = z.object({
      parentAgentId: z.string().min(1),
      childAgentId: z.string().min(1),
      scopes: z.array(z.string().min(1)).min(1),
      ttl: z.number().int().min(10).max(86400).default(300),
      credentialId: z.string().optional(),
    });

    const body = DelegateSchema.parse(request.body);

    // Verify both agents belong to this org
    const parent = await getAgent(request.userId, body.parentAgentId);
    if (!parent) {
      return reply.code(404).send({ error: 'PARENT_NOT_FOUND' });
    }

    const child = await getAgent(request.userId, body.childAgentId);
    if (!child) {
      return reply.code(404).send({ error: 'CHILD_NOT_FOUND' });
    }

    try {
      // Remove parentAgentId before passing to createToken via createDelegatedToken
      const token = await tokenService.createDelegatedToken({
        userId: request.userId,
        agentId: body.childAgentId,
        parentAgentId: body.parentAgentId,
        scopes: body.scopes,
        ttl: body.ttl,
        credentialId: body.credentialId,
      });

      return reply.code(201).send({ token, delegatedFrom: body.parentAgentId });
    } catch (err) {
      const error = err as Error;
      if (error.message === 'PARENT_AGENT_REVOKED') {
        return reply.code(403).send({ error: 'PARENT_AGENT_REVOKED' });
      }
      if (error.message.startsWith('DELEGATION_DENIED')) {
        const denied = error.message.split(':').slice(1).join(':');
        return reply.code(403).send({
          error: 'DELEGATION_DENIED',
          message: 'Sub-agent cannot exceed parent permissions. Privilege escalation blocked.',
          deniedScopes: denied.split(','),
        });
      }
      throw err;
    }
  });
}
