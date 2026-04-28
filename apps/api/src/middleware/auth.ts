import type { FastifyRequest, FastifyReply } from 'fastify';
import { authenticateByApiKey } from '../services/apikey.service.js';
import { getOrganization, type Organization } from '../services/organization.service.js';

declare module 'fastify' {
  interface FastifyRequest {
    org: Organization;
    apiKeyId: string;
  }
}

export async function authMiddleware(request: FastifyRequest, reply: FastifyReply) {
  const authHeader = request.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return reply.code(401).send({
      error: 'UNAUTHORIZED',
      message: 'Missing or invalid Authorization header. Expected: Bearer ak_live_...',
    });
  }

  const apiKey = authHeader.slice(7);
  const authResult = await authenticateByApiKey(apiKey);

  if (!authResult) {
    return reply.code(401).send({
      error: 'UNAUTHORIZED',
      message: 'Invalid API key.',
    });
  }

  const org = await getOrganization(authResult.orgId);
  if (!org) {
    return reply.code(401).send({
      error: 'UNAUTHORIZED',
      message: 'Organization not found.',
    });
  }

  request.org = org;
  request.apiKeyId = authResult.keyId;
}
