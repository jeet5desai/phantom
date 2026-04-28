import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { getAuth } from '@clerk/fastify';
import * as apiKeyService from '../services/apikey.service.js';

const CreateApiKeySchema = z.object({
  name: z.string().min(1).max(100),
});

export function registerApiKeyRoutes(app: FastifyInstance) {
  app.post('/api/v1/api-keys', async (request, reply) => {
    const { userId } = getAuth(request);
    if (!userId) {
      return reply.code(401).send({ error: 'UNAUTHORIZED', message: 'Sign in required.' });
    }

    const body = CreateApiKeySchema.parse(request.body);
    const { apiKey, rawKey } = await apiKeyService.createApiKey(userId, body.name);

    return reply.code(201).send({
      apiKey,
      rawKey,
      _warning: 'Store this API key securely. It will not be shown again.',
    });
  });

  app.get('/api/v1/api-keys', async (request, reply) => {
    const { userId } = getAuth(request);
    if (!userId) {
      return reply.code(401).send({ error: 'UNAUTHORIZED', message: 'Sign in required.' });
    }

    const apiKeys = await apiKeyService.listApiKeys(userId);
    return { apiKeys };
  });

  app.post('/api/v1/api-keys/:keyId/revoke', async (request, reply) => {
    const { userId } = getAuth(request);
    if (!userId) {
      return reply.code(401).send({ error: 'UNAUTHORIZED', message: 'Sign in required.' });
    }

    const { keyId } = request.params as { keyId: string };
    const apiKey = await apiKeyService.revokeApiKey(userId, keyId);

    if (!apiKey) {
      return reply
        .code(404)
        .send({ error: 'NOT_FOUND', message: 'API key not found or already revoked.' });
    }

    return { apiKey, message: 'API key revoked.' };
  });

  app.delete('/api/v1/api-keys/:keyId', async (request, reply) => {
    const { userId } = getAuth(request);
    if (!userId) {
      return reply.code(401).send({ error: 'UNAUTHORIZED', message: 'Sign in required.' });
    }

    const { keyId } = request.params as { keyId: string };
    const deleted = await apiKeyService.deleteApiKey(userId, keyId);

    if (!deleted) {
      return reply.code(404).send({ error: 'NOT_FOUND', message: 'API key not found.' });
    }

    return { message: 'API key deleted.' };
  });
}
