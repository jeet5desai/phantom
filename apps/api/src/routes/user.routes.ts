import { FastifyInstance } from 'fastify';
import { authMiddleware } from '../middleware/auth.js';
import * as userService from '../services/user.service.js';
import { z } from 'zod';

const SyncUserSchema = z.object({
  email: z.string().email(),
  firstName: z.string().nullable().optional(),
  lastName: z.string().nullable().optional(),
  imageUrl: z.string().nullable().optional(),
});

export function registerUserRoutes(app: FastifyInstance) {
  /**
   * POST /api/v1/users/sync
   * Sync the current authenticated user from Clerk to our database.
   */
  app.post('/api/v1/users/sync', { preHandler: [authMiddleware] }, async (request, reply) => {
    const userId = request.userId;
    const body = SyncUserSchema.parse(request.body);

    const user = await userService.syncUser({
      id: userId,
      email: body.email,
      firstName: body.firstName,
      lastName: body.lastName,
      imageUrl: body.imageUrl,
    });

    return reply.send({ success: true, user });
  });
}
