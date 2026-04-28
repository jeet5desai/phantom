import prisma from '../db/prisma.js';
import { generateId, generateAgentKeyPair } from '../lib/crypto.js';
import type { Prisma } from '@prisma/client';

export interface Agent {
  id: string;
  userId: string;
  name: string;
  model: string | null;
  version: string | null;
  publicKey: string | null;
  metadata: any;
  createdBy: string | null;
  createdAt: Date;
  revokedAt: Date | null;
  parentAgentId: string | null;
}

export interface CreateAgentInput {
  userId: string;
  name: string;
  model?: string;
  version?: string;
  metadata?: Record<string, unknown>;
  createdBy?: string;
  parentAgentId?: string;
}

/** Create a new agent with a cryptographic identity. */
export async function createAgent(
  input: CreateAgentInput,
): Promise<Agent & { privateKey: string }> {
  const id = generateId('agt');
  const { publicKey, privateKey } = generateAgentKeyPair();

  const agent = await prisma.agent.create({
    data: {
      id,
      userId: input.userId,
      name: input.name,
      model: input.model || null,
      version: input.version || '1.0.0',
      publicKey,
      metadata: (input.metadata || {}) as Prisma.JsonObject,
      createdBy: input.createdBy || null,
      parentAgentId: input.parentAgentId || null,
    },
  });

  return { ...agent, privateKey };
}

/** Get agent by ID, only if it belongs to the given user. */
export async function getAgent(userId: string, agentId: string): Promise<Agent | null> {
  return prisma.agent.findFirst({
    where: {
      id: agentId,
      userId,
    },
  });
}

/** List all agents for a user. */
export async function listAgents(userId: string, includeRevoked = false): Promise<Agent[]> {
  return prisma.agent.findMany({
    where: {
      userId,
      revokedAt: includeRevoked ? undefined : null,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

/** Revoke an agent — sets revoked_at timestamp. */
export async function revokeAgent(userId: string, agentId: string): Promise<Agent | null> {
  return prisma.agent
    .update({
      where: {
        id: agentId,
        userId,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    })
    .catch(() => null);
}

/** Check if an agent is active (exists and not revoked). */
export async function isAgentActive(agentId: string): Promise<boolean> {
  const count = await prisma.agent.count({
    where: {
      id: agentId,
      revokedAt: null,
    },
  });
  return count > 0;
}
