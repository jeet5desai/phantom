import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import * as credentialService from '../services/credential.service.js';
import { logAction } from '../services/audit.service.js';
import { authMiddleware } from '../middleware/auth.js';

const StoreCredentialSchema = z.object({
  service: z.string().min(1).max(50),
  apiKey: z.string().min(1),
  label: z.string().optional(),
});

const RotateCredentialSchema = z.object({
  apiKey: z.string().min(1),
});

export function registerCredentialRoutes(app: FastifyInstance) {
  app.addHook('onRequest', authMiddleware);

  /** Store a credential in the vault. */
  app.post('/api/v1/credentials', async (request, reply) => {
    const body = StoreCredentialSchema.parse(request.body);
    const credential = await credentialService.storeCredential(
      request.org.id,
      body.service,
      body.apiKey,
      body.label,
    );

    await logAction({
      orgId: request.org.id,
      agentId: 'system',
      action: 'credential.store',
      resource: body.service,
      result: 'success',
      reasoning: `Credential stored for service: ${body.service}`,
    });

    return reply.code(201).send({ credential });
  });

  /** List credentials (metadata only, no decryption). */
  app.get('/api/v1/credentials', async (request) => {
    const credentials = await credentialService.listCredentials(request.org.id);
    return { credentials };
  });

  /** Rotate a credential's API key. */
  app.put('/api/v1/credentials/:credentialId/rotate', async (request, reply) => {
    const { credentialId } = request.params as { credentialId: string };
    const body = RotateCredentialSchema.parse(request.body);

    const credential = await credentialService.rotateCredential(
      request.org.id,
      credentialId,
      body.apiKey,
    );

    if (!credential) {
      return reply.code(404).send({ error: 'NOT_FOUND', message: 'Credential not found.' });
    }

    await logAction({
      orgId: request.org.id,
      agentId: 'system',
      action: 'credential.rotate',
      resource: credential.service,
      result: 'success',
    });

    return { credential, message: 'Credential rotated successfully.' };
  });

  /** Delete a credential. */
  app.delete('/api/v1/credentials/:credentialId', async (request, reply) => {
    const { credentialId } = request.params as { credentialId: string };
    const deleted = await credentialService.deleteCredential(request.org.id, credentialId);

    if (!deleted) {
      return reply.code(404).send({ error: 'NOT_FOUND', message: 'Credential not found.' });
    }

    return { message: 'Credential deleted.' };
  });
}
