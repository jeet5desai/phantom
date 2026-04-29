import prisma from '../db/prisma.js';

export interface UserInput {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  imageUrl?: string | null;
}

/** Sync user from Clerk to our database. */
export async function syncUser(input: UserInput) {
  return prisma.user.upsert({
    where: { id: input.id },
    update: {
      email: input.email,
      firstName: input.firstName,
      lastName: input.lastName,
      imageUrl: input.imageUrl,
    },
    create: {
      id: input.id,
      email: input.email,
      firstName: input.firstName,
      lastName: input.lastName,
      imageUrl: input.imageUrl,
    },
  });
}

/** Get total signup count. */
export async function getUserCount() {
  return prisma.user.count();
}
