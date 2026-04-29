import prisma from '../db/prisma.js';
import { generateId, generateAgentKeyPair } from '../lib/crypto.js';
import type { Prisma, Agent } from '@prisma/client';

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
        status: 'REVOKED',
      },
    })
    .catch(() => null);
}

/** Check if an agent is active (exists and not revoked). */
export async function isAgentActive(agentId: string): Promise<boolean> {
  const count = await prisma.agent.count({
    where: {
      id: agentId,
      status: 'ACTIVE',
      revokedAt: null,
    },
  });
  return count > 0;
}

/** Pause an agent — sets status to PAUSED. */
export async function pauseAgent(userId: string, agentId: string): Promise<Agent | null> {
  return prisma.agent
    .update({
      where: {
        id: agentId,
        userId,
        status: 'ACTIVE',
      },
      data: {
        status: 'PAUSED',
      },
    })
    .catch(() => null);
}

/** Resume a paused agent — sets status to ACTIVE. */
export async function resumeAgent(userId: string, agentId: string): Promise<Agent | null> {
  return prisma.agent
    .update({
      where: {
        id: agentId,
        userId,
        status: 'PAUSED',
      },
      data: {
        status: 'ACTIVE',
      },
    })
    .catch(() => null);
}

/** Permanently delete an agent and its associations. */
export async function deleteAgent(userId: string, agentId: string): Promise<boolean> {
  try {
    await prisma.agent.delete({
      where: {
        id: agentId,
        userId,
      },
    });
    return true;
  } catch {
    return false;
  }
}
