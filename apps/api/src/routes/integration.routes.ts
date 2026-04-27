import type { FastifyInstance } from 'fastify';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load templates once at startup
const templates = JSON.parse(
  readFileSync(join(__dirname, '../integrations/templates.json'), 'utf-8'),
);

export function registerIntegrationRoutes(app: FastifyInstance) {
  /** List all available integration templates. */
  app.get('/api/v1/integrations', async () => {
    const summary = Object.entries(templates).map(([key, tmpl]: [string, any]) => ({
      id: key,
      name: tmpl.name,
      description: tmpl.description,
      authType: tmpl.authType,
      scopeCount: tmpl.scopes.reduce((acc: number, s: any) => acc + s.actions.length, 0),
      docsUrl: tmpl.docsUrl,
    }));

    return { integrations: summary };
  });

  /** Get a specific integration template with all scopes. */
  app.get('/api/v1/integrations/:service', async (request, reply) => {
    const { service } = request.params as { service: string };
    const tmpl = templates[service];

    if (!tmpl) {
      return reply.code(404).send({
        error: 'NOT_FOUND',
        message: `Integration "${service}" not found. Use GET /api/v1/integrations for available options.`,
      });
    }

    return { integration: { id: service, ...tmpl } };
  });
}
