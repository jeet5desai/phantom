import type { FastifyRequest, FastifyReply } from 'fastify';
import { authenticateApiKey, type Organization } from '../services/organization.service.js';

// Extend Fastify request to carry the authenticated org
declare module 'fastify' {
  interface FastifyRequest {
    org: Organization;
  }
}

/**
 * Auth middleware — extracts API key from Authorization header
 * and attaches the org to the request.
 */
export async function authMiddleware(request: FastifyRequest, reply: FastifyReply) {
  const authHeader = request.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return reply.code(401).send({
      error: 'UNAUTHORIZED',
      message: 'Missing or invalid Authorization header. Expected: Bearer ak_live_...',
    });
  }

  const apiKey = authHeader.slice(7);
  const org = await authenticateApiKey(apiKey);

  if (!org) {
    return reply.code(401).send({
      error: 'UNAUTHORIZED',
      message: 'Invalid API key.',
    });
  }

  request.org = org;
}
