import prisma from '../db/prisma.js';
import { generateId, generateApiKey, hashApiKey } from '../lib/crypto.js';

export interface Organization {
  id: string;
  name: string;
  createdAt: Date;
}

/** Create a new organization and return it with its API key. */
export async function createOrganization(
  name: string,
): Promise<{ org: Organization; apiKey: string }> {
  const id = generateId('org');
  const { raw, hash } = generateApiKey();

  const org = await prisma.organization.create({
    data: {
      id,
      name,
      apiKeyHash: hash,
    },
    select: {
      id: true,
      name: true,
      createdAt: true,
    },
  });

  return { org, apiKey: raw };
}

/** Authenticate an API key and return the org. */
export async function authenticateApiKey(apiKey: string): Promise<Organization | null> {
  const hash = hashApiKey(apiKey);
  return prisma.organization.findUnique({
    where: { apiKeyHash: hash },
    select: {
      id: true,
      name: true,
      createdAt: true,
    },
  });
}

/** Get org by ID. */
export async function getOrganization(id: string): Promise<Organization | null> {
  return prisma.organization.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      createdAt: true,
    },
  });
}
