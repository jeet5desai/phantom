import prisma from '../db/prisma.js';
import { computeAuditHash } from '../lib/crypto.js';
import type { Prisma } from '@prisma/client';

export interface AuditEntry {
  id: string;
  userId: string;
  agentId: string;
  credentialId: string | null;
  tokenId: string | null;
  action: string;
  resource: string | null;
  result: string;
  reasoning: string | null;
  metadata: any;
  hash: string;
  prevHash: string | null;
  createdAt: Date;
}

export interface LogActionInput {
  userId: string;
  agentId: string;
  credentialId?: string;
  tokenId?: string;
  action: string;
  resource?: string;
  result: string;
  reasoning?: string;
  metadata?: Record<string, unknown>;
}

/** Append an immutable entry to the audit ledger. */
export async function logAction(input: LogActionInput): Promise<AuditEntry> {
  return prisma.$transaction(async (tx) => {
    // Get previous hash for chaining and lock the last row
    // Note: raw query is used here because Prisma doesn't support 'FOR UPDATE' natively on findFirst yet
    // without using extensions or raw queries in some versions.
    // In Prisma 5, we can use $queryRaw for 'FOR UPDATE'.
    const prevResults = await tx.$queryRaw<{ hash: string }[]>`
      SELECT hash FROM audit_log WHERE user_id = ${input.userId} ORDER BY id DESC LIMIT 1 FOR UPDATE
    `;
    const prevHash = prevResults[0]?.hash || null;

    // Compute hash for this entry
    const hash = computeAuditHash({
      agent_id: input.agentId,
      action: input.action,
      resource: input.resource,
      result: input.result,
      prev_hash: prevHash || undefined,
    });

    const entry = await tx.auditLog.create({
      data: {
        userId: input.userId,
        agentId: input.agentId,
        credentialId: input.credentialId || null,
        tokenId: input.tokenId || null,
        action: input.action,
        resource: input.resource || null,
        result: input.result,
        reasoning: input.reasoning || null,
        metadata: (input.metadata || {}) as Prisma.JsonObject,
        hash,
        prevHash,
      },
    });

    return {
      ...entry,
      id: entry.id.toString(),
      metadata: entry.metadata as any,
    };
  });
}

/** Query audit log for a user with filters. */
export async function queryAuditLog(
  userId: string,
  filters?: {
    agentId?: string;
    action?: string;
    result?: string;
    limit?: number;
    offset?: number;
  },
): Promise<{ entries: AuditEntry[]; total: number }> {
  const where: Prisma.AuditLogWhereInput = {
    userId,
  };

  if (filters?.agentId) where.agentId = filters.agentId;
  if (filters?.action) where.action = filters.action;
  if (filters?.result) where.result = filters.result;

  const limit = filters?.limit || 50;
  const offset = filters?.offset || 0;

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { id: 'desc' },
      take: limit,
      skip: offset,
    }),
    prisma.auditLog.count({ where }),
  ]);

  return {
    entries: logs.map((l) => ({ ...l, id: l.id.toString(), metadata: l.metadata as any })),
    total,
  };
}

/** Verify the integrity of the audit chain for a user. */
export async function verifyAuditChain(userId: string): Promise<{
  valid: boolean;
  brokenAt?: string;
  totalEntries: number;
}> {
  const logs = await prisma.auditLog.findMany({
    where: { userId },
    orderBy: { id: 'asc' },
  });

  for (let i = 0; i < logs.length; i++) {
    const current = logs[i];
    const previous = i > 0 ? logs[i - 1] : null;

    const expectedHash = computeAuditHash({
      agent_id: current.agentId,
      action: current.action,
      resource: current.resource || undefined,
      result: current.result,
      prev_hash: previous?.hash,
    });

    if (current.hash !== expectedHash || (i > 0 && current.prevHash !== previous!.hash)) {
      return { valid: false, brokenAt: current.id.toString(), totalEntries: logs.length };
    }
  }

  return { valid: true, totalEntries: logs.length };
}
