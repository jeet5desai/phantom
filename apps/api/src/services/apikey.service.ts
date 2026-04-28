import prisma from '../db/prisma.js';
import { generateId, generateApiKey, hashApiKey } from '../lib/crypto.js';
import { createOrganization, type Organization } from './organization.service.js';

export interface ApiKey {
  id: string;
  userId: string;
  orgId: string;
  name: string;
  keyPrefix: string;
  lastUsedAt: Date | null;
  revokedAt: Date | null;
  createdAt: Date;
}

async function ensureUserOrg(userId: string): Promise<Organization> {
  const existing = await prisma.organization.findFirst({
    where: {
      apiKeys: {
        some: { userId },
      },
    },
    select: {
      id: true,
      name: true,
      createdAt: true,
    },
  });

  if (existing) return existing;

  const { org } = await createOrganization(`${userId}'s Organization`);
  return org;
}

export async function createApiKey(
  userId: string,
  name: string,
): Promise<{ apiKey: ApiKey; rawKey: string }> {
  const org = await ensureUserOrg(userId);
  const id = generateId('ak');
  const { raw, hash } = generateApiKey();
  const prefix = raw.slice(0, 12) + '...';

  const apiKey = await prisma.apiKey.create({
    data: {
      id,
      userId,
      orgId: org.id,
      name,
      keyPrefix: prefix,
      keyHash: hash,
    },
    select: {
      id: true,
      userId: true,
      orgId: true,
      name: true,
      keyPrefix: true,
      lastUsedAt: true,
      revokedAt: true,
      createdAt: true,
    },
  });

  return { apiKey, rawKey: raw };
}

export async function listApiKeys(userId: string): Promise<ApiKey[]> {
  return prisma.apiKey.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      userId: true,
      orgId: true,
      name: true,
      keyPrefix: true,
      lastUsedAt: true,
      revokedAt: true,
      createdAt: true,
    },
  });
}

export async function revokeApiKey(userId: string, keyId: string): Promise<ApiKey | null> {
  return prisma.apiKey
    .update({
      where: {
        id: keyId,
        userId,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
      select: {
        id: true,
        userId: true,
        orgId: true,
        name: true,
        keyPrefix: true,
        lastUsedAt: true,
        revokedAt: true,
        createdAt: true,
      },
    })
    .catch(() => null);
}

export async function deleteApiKey(userId: string, keyId: string): Promise<boolean> {
  try {
    await prisma.apiKey.delete({
      where: {
        id: keyId,
        userId,
      },
    });
    return true;
  } catch {
    return false;
  }
}

export async function authenticateByApiKey(
  rawKey: string,
): Promise<{ orgId: string; userId: string; keyId: string } | null> {
  const hash = hashApiKey(rawKey);
  const key = await prisma.apiKey.findUnique({
    where: {
      keyHash: hash,
      revokedAt: null,
    },
    select: {
      id: true,
      orgId: true,
      userId: true,
    },
  });

  if (!key) return null;

  prisma.apiKey
    .update({
      where: { id: key.id },
      data: { lastUsedAt: new Date() },
    })
    .catch(() => {});

  return { orgId: key.orgId, userId: key.userId, keyId: key.id };
}
