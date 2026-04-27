import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { createOrganization } from '../services/organization.service.js';

const CreateOrgSchema = z.object({
  name: z.string().min(1).max(100),
});

export function registerOrgRoutes(app: FastifyInstance) {
  /** Create a new organization — returns the API key (shown only once). */
  app.post('/api/v1/organizations', async (request, reply) => {
    const body = CreateOrgSchema.parse(request.body);
    const { org, apiKey } = await createOrganization(body.name);

    return reply.code(201).send({
      organization: org,
      apiKey,
      _warning: 'Store this API key securely. It will not be shown again.',
    });
  });
}
