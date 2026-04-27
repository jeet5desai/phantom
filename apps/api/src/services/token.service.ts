import { query } from '../db/pool.js';
import { generateId } from '../lib/crypto.js';
import { checkScopes, validateDelegation } from './permission.service.js';
import { isAgentActive, getAgent } from './agent.service.js';
import { logAction } from './audit.service.js';
import {
  cacheRevokedToken,
  cacheRevokedAgent,
  isTokenRevokedFast,
  isAgentRevokedFast,
} from '../db/redis.js';

export interface Token {
  id: string;
  agent_id: string;
  credential_id: string | null;
  scopes: string[];
  expires_at: Date;
  revoked: boolean;
  created_at: Date;
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

  const result = await query<Token>(
    `INSERT INTO tokens (id, agent_id, credential_id, scopes, expires_at)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [id, input.agentId, input.credentialId || null, JSON.stringify(input.scopes), expiresAt],
  );

  await logAction({
    orgId: input.orgId,
    agentId: input.agentId,
    tokenId: id,
    action: 'token.create',
    resource: input.scopes.join(', '),
    result: 'success',
    reasoning: `Token issued, TTL=${input.ttl}s`,
  });

  return result.rows[0];
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

  const result = await query<Token>(`SELECT * FROM tokens WHERE id = $1`, [tokenId]);

  const token = result.rows[0];
  if (!token) return { valid: false, reason: 'Token not found' };
  if (token.revoked) return { valid: false, reason: 'Token revoked' };
  if (new Date(token.expires_at) < new Date()) return { valid: false, reason: 'Token expired' };

  // Check agent revocation (Redis fast path, then DB)
  const agentCachedRevoked = await isAgentRevokedFast(token.agent_id);
  if (agentCachedRevoked === true) return { valid: false, reason: 'Agent revoked' };

  const active = await isAgentActive(token.agent_id);
  if (!active) return { valid: false, reason: 'Agent revoked' };

  return { valid: true, token };
}

/** Revoke a specific token. */
export async function revokeToken(tokenId: string): Promise<boolean> {
  const result = await query(`UPDATE tokens SET revoked = TRUE WHERE id = $1 AND revoked = FALSE`, [
    tokenId,
  ]);
  if (result.rowCount! > 0) {
    await cacheRevokedToken(tokenId, 86400); // Cache for 24h
  }
  return result.rowCount! > 0;
}

/** Revoke ALL tokens for an agent (kill switch). */
export async function revokeAllTokens(orgId: string, agentId: string): Promise<number> {
  const result = await query(
    `UPDATE tokens SET revoked = TRUE WHERE agent_id = $1 AND revoked = FALSE`,
    [agentId],
  );

  // Cache agent-level revocation in Redis for fast verification
  await cacheRevokedAgent(agentId);

  await logAction({
    orgId,
    agentId,
    action: 'tokens.revoke_all',
    result: 'success',
    reasoning: 'Kill switch activated — all tokens revoked',
  });

  return result.rowCount!;
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
  return createToken(input);
}
