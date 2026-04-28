import Fastify from 'fastify';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import { config } from './config.js';
import { registerAgentRoutes } from './routes/agent.routes.js';
import { registerCredentialRoutes } from './routes/credential.routes.js';
import { registerPermissionRoutes } from './routes/permission.routes.js';
import { registerTokenRoutes } from './routes/token.routes.js';
import { registerAuditRoutes } from './routes/audit.routes.js';
import { registerIntegrationRoutes } from './routes/integration.routes.js';
import { registerDashboardRoutes } from './routes/dashboard.routes.js';
import { registerApiKeyRoutes } from './routes/apikey.routes.js';

const app = Fastify({
  logger: config.env !== 'test',
});

import { clerkPlugin } from '@clerk/fastify';

// ─── Plugins ────────────────────────────────────────────────────────────────

await app.register(cors, { origin: true });
await app.register(rateLimit, {
  max: 100,
  timeWindow: '1 minute',
});
await app.register(clerkPlugin, {
  publishableKey: config.clerkPublishableKey,
  secretKey: config.clerkSecretKey,
});

// ─── Global error handler ───────────────────────────────────────────────────

app.setErrorHandler((error: Error, request, reply) => {
  // Zod validation errors
  if (error.name === 'ZodError') {
    return reply.code(400).send({
      error: 'VALIDATION_ERROR',
      message: 'Invalid request body.',
      details: JSON.parse(error.message),
    });
  }

  app.log.error(error);
  return reply.code(500).send({
    error: 'INTERNAL_ERROR',
    message: config.env === 'production' ? 'Something went wrong.' : error.message,
  });
});

// ─── Health check ───────────────────────────────────────────────────────────

app.get('/health', async () => ({
  status: 'ok',
  service: 'agentkey-api',
  version: '0.1.0',
  timestamp: new Date().toISOString(),
}));

// ─── Routes ─────────────────────────────────────────────────────────────────

registerAgentRoutes(app);
registerCredentialRoutes(app);
registerPermissionRoutes(app);
registerTokenRoutes(app);
registerAuditRoutes(app);
registerIntegrationRoutes(app);
registerDashboardRoutes(app);
registerApiKeyRoutes(app);

// ─── Start ──────────────────────────────────────────────────────────────────

async function start() {
  try {
    await app.listen({ port: config.port, host: config.host });

    console.log(`
╔═══════════════════════════════════════════╗
║                                           ║
║   🔐 AgentKey API v0.1.0                 ║
║   Running on http://localhost:${config.port}      ║
║   Environment: ${config.env.padEnd(23)}║
║                                           ║
╚═══════════════════════════════════════════╝
    `);
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();

export { app };
