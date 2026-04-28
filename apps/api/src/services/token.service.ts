import prisma from '../db/prisma.js';
import { generateId } from '../lib/crypto.js';
import { checkScopes, validateDelegation } from './permission.service.js';
import { isAgentActive } from './agent.service.js';
import { logAction } from './audit.service.js';
import {
  cacheRevokedToken,
  cacheRevokedAgent,
  isTokenRevokedFast,
  isAgentRevokedFast,
} from '../db/redis.js';
import type { Prisma } from '@prisma/client';

export interface Token {
  id: string;
  agentId: string;
  credentialId: string | null;
  scopes: string[];
  expiresAt: Date;
  revoked: boolean;
  createdAt: Date;
}

export interface CreateTokenInput {
  orgId: string;
  agentId: string;
  scopes: string[];
  ttl: number; // seconds
  credentialId?: string;
}

/** Issue a scoped, time-limited token for an agent. */
export async function createToken(input: CreateTokenInput): Promise<Token> {
  // 1. Check agent is active
  const active = await isAgentActive(input.agentId);
  if (!active) {
    await logAction({
      orgId: input.orgId,
      agentId: input.agentId,
      action: 'token.create',
      result: 'denied',
      reasoning: 'Agent is revoked or does not exist',
    });
    throw new Error('AGENT_REVOKED');
  }

  // 2. Check agent has the requested scopes
  const scopeCheck = await checkScopes(input.agentId, input.scopes);
  if (!scopeCheck.allowed) {
    await logAction({
      orgId: input.orgId,
      agentId: input.agentId,
      action: 'token.create',
      resource: input.scopes.join(', '),
      result: 'denied',
      reasoning: `Scopes denied: ${scopeCheck.denied.join(', ')}`,
    });
    throw new Error(`SCOPE_DENIED:${scopeCheck.denied.join(',')}`);
  }

  // 3. Issue token
  const id = generateId('tok');
  const expiresAt = new Date(Date.now() + input.ttl * 1000);

  return prisma.$transaction(async (tx) => {
    const token = await tx.token.create({
      data: {
        id,
        agentId: input.agentId,
        credentialId: input.credentialId || null,
        scopes: input.scopes as Prisma.JsonArray,
        expiresAt,
      },
    });

    await logAction({
      orgId: input.orgId,
      agentId: input.agentId,
      tokenId: id,
      action: 'token.create',
      resource: input.scopes.join(', '),
      result: 'success',
      reasoning: `Token issued, TTL=${input.ttl}s`,
    });

    return {
      ...token,
      scopes: token.scopes as string[],
      revoked: token.revoked || false
    };
  });
}

/** Verify a token — checks Redis cache first, then DB. */
export async function verifyToken(tokenId: string): Promise<{
  valid: boolean;
  token?: Token;
  reason?: string;
}> {
  // Fast path: check Redis cache for revoked tokens
  const cachedRevoked = await isTokenRevokedFast(tokenId);
  if (cachedRevoked === true) return { valid: false, reason: 'Token revoked' };

  const token = await prisma.token.findUnique({
    where: { id: tokenId },
  });

  if (!token) return { valid: false, reason: 'Token not found' };
  if (token.revoked) return { valid: false, reason: 'Token revoked' };
  if (new Date(token.expiresAt) < new Date()) return { valid: false, reason: 'Token expired' };

  // Check agent revocation (Redis fast path, then DB)
  const agentCachedRevoked = await isAgentRevokedFast(token.agentId);
  if (agentCachedRevoked === true) return { valid: false, reason: 'Agent revoked' };

  const active = await isAgentActive(token.agentId);
  if (!active) return { valid: false, reason: 'Agent revoked' };

  return {
    valid: true,
    token: {
      ...token,
      scopes: token.scopes as string[],
      revoked: token.revoked || false
    }
  };
}

/** Revoke a specific token. */
export async function revokeToken(orgId: string, tokenId: string): Promise<boolean> {
  try {
    const result = await prisma.token.update({
      where: {
        id: tokenId,
        agent: {
          orgId,
        },
        revoked: false,
      },
      data: {
        revoked: true,
      },
    });

    if (result) {
      await cacheRevokedToken(tokenId, 86400); // Cache for 24h
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

/** Revoke ALL tokens for an agent (kill switch). */
export async function revokeAllTokens(orgId: string, agentId: string): Promise<number> {
  const result = await prisma.token.updateMany({
    where: {
      agentId,
      agent: {
        orgId,
      },
      revoked: false,
    },
    data: {
      revoked: true,
    },
  });

  // Cache agent-level revocation in Redis for fast verification
  await cacheRevokedAgent(agentId);

  await logAction({
    orgId,
    agentId,
    action: 'tokens.revoke_all',
    result: 'success',
    reasoning: 'Kill switch activated — all tokens revoked',
  });

  return result.count;
}

/**
 * Create a delegated token for a sub-agent.
 * The sub-agent's scopes MUST be a subset of the parent agent's scopes.
 */
export async function createDelegatedToken(
  input: CreateTokenInput & { parentAgentId: string },
): Promise<Token> {
  // Validate parent agent exists and is active
  const parentActive = await isAgentActive(input.parentAgentId);
  if (!parentActive) {
    throw new Error('PARENT_AGENT_REVOKED');
  }

  // Validate delegation: child scopes ⊆ parent scopes
  const delegation = await validateDelegation(input.parentAgentId, input.scopes);
  if (!delegation.valid) {
    await logAction({
      orgId: input.orgId,
      agentId: input.agentId,
      action: 'token.delegate',
      resource: input.scopes.join(', '),
      result: 'denied',
      reasoning: `Privilege escalation blocked. Parent lacks: ${delegation.denied.join(', ')}`,
    });
    throw new Error(`DELEGATION_DENIED:${delegation.denied.join(',')}`);
  }

  // Delegate — issue the token with same flow
  const { parentAgentId, ...createInput } = input;
  return createToken(createInput);
}

