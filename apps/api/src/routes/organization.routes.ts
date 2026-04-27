import type { FastifyInstance, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { createOrganization } from '../services/organization.service.js';

const CreateOrgSchema = z.object({
  name: z.string().min(1).max(100),
});

export function registerOrgRoutes(app: FastifyInstance) {
  /**
   * Create a new organization — returns the API key (shown only once).
   *
   * NOTE: This is the only unauthenticated endpoint. Aggressive rate limiting
   * is applied (3 creations per IP per hour) to prevent abuse.
   */
  app.post(
    '/api/v1/organizations',
    {
      config: {
        rateLimit: {
          max: 3,
          timeWindow: '1 hour',
          keyGenerator: (request: FastifyRequest) => request.ip,
        },
      },
    },
    async (request, reply) => {
      const body = CreateOrgSchema.parse(request.body);
      const { org, apiKey } = await createOrganization(body.name);

      return reply.code(201).send({
        organization: org,
        apiKey,
        _warning: 'Store this API key securely. It will not be shown again.',
      });
    },
  );
}
