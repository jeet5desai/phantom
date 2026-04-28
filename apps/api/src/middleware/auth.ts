import type { FastifyRequest, FastifyReply } from 'fastify';
import { authenticateByApiKey } from '../services/apikey.service.js';

declare module 'fastify' {
  interface FastifyRequest {
    userId: string;
    apiKeyId?: string;
  }
}

import { verifyToken } from '@clerk/fastify';
import { config } from '../config.js';

export async function authMiddleware(request: FastifyRequest, reply: FastifyReply) {
  const authHeader = request.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return reply.code(401).send({
      error: 'UNAUTHORIZED',
      message: 'Authentication required. Provide a valid Clerk session or API key.',
    });
  }

  const token = authHeader.slice(7);

  // 1. Try Clerk Authentication (if it looks like a JWT)
  if (token.includes('.')) {
    try {
      const verified = await verifyToken(token, {
        secretKey: config.clerkSecretKey,
      });

      if (verified && verified.sub) {
        request.userId = verified.sub;
        return;
      }
    } catch (e) {
      // If it's a JWT but verification fails, we don't fall back to API key
      return reply.code(401).send({
        error: 'UNAUTHORIZED',
        message: 'Invalid or expired Clerk session.',
        details: (e as Error).message,
      });
    }
  }

  // 2. Fallback to API Key (for SDK/external calls)
  const apiKey = token; // token is already authHeader.slice(7)

  const authResult = await authenticateByApiKey(apiKey);

  if (!authResult) {
    return reply.code(401).send({
      error: 'UNAUTHORIZED',
      message: 'Invalid API key or session expired.',
    });
  }

  request.userId = authResult.userId;
  request.apiKeyId = authResult.keyId;
}
