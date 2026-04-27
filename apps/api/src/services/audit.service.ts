import { query } from '../db/pool.js';
import { computeAuditHash } from '../lib/crypto.js';

export interface AuditEntry {
  id: number;
  org_id: string;
  agent_id: string;
  credential_id: string | null;
  token_id: string | null;
  action: string;
  resource: string | null;
  result: string;
  reasoning: string | null;
  metadata: Record<string, unknown>;
  hash: string;
  prev_hash: string | null;
  created_at: Date;
}

export interface LogActionInput {
  orgId: string;
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
  // Get previous hash for chaining
  const prevResult = await query<{ hash: string }>(
    `SELECT hash FROM audit_log WHERE org_id = $1 ORDER BY id DESC LIMIT 1`,
    [input.orgId],
  );
  const prevHash = prevResult.rows[0]?.hash || null;

  // Compute hash for this entry
  const hash = computeAuditHash({
    agent_id: input.agentId,
    action: input.action,
    resource: input.resource,
    result: input.result,
    prev_hash: prevHash || undefined,
  });

  const result = await query<AuditEntry>(
    `INSERT INTO audit_log (org_id, agent_id, credential_id, token_id, action, resource, result, reasoning, metadata, hash, prev_hash)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
     RETURNING *`,
    [
      input.orgId,
      input.agentId,
      input.credentialId || null,
      input.tokenId || null,
      input.action,
      input.resource || null,
      input.result,
      input.reasoning || null,
      JSON.stringify(input.metadata || {}),
      hash,
      prevHash,
    ],
  );

  return result.rows[0];
}

/** Query audit log for an org with filters. */
export async function queryAuditLog(
  orgId: string,
  filters?: {
    agentId?: string;
    action?: string;
    result?: string;
    limit?: number;
    offset?: number;
  },
): Promise<{ entries: AuditEntry[]; total: number }> {
  const conditions = ['org_id = $1'];
  const params: unknown[] = [orgId];
  let paramIdx = 2;

  if (filters?.agentId) {
    conditions.push(`agent_id = $${paramIdx++}`);
    params.push(filters.agentId);
  }
  if (filters?.action) {
    conditions.push(`action = $${paramIdx++}`);
    params.push(filters.action);
  }
  if (filters?.result) {
    conditions.push(`result = $${paramIdx++}`);
    params.push(filters.result);
  }

  const where = conditions.join(' AND ');
  const limit = filters?.limit || 50;
  const offset = filters?.offset || 0;

  const [dataResult, countResult] = await Promise.all([
    query<AuditEntry>(
      `SELECT * FROM audit_log WHERE ${where} ORDER BY id DESC LIMIT $${paramIdx} OFFSET $${paramIdx + 1}`,
      [...params, limit, offset],
    ),
    query<{ count: string }>(`SELECT COUNT(*) as count FROM audit_log WHERE ${where}`, params),
  ]);

  return {
    entries: dataResult.rows,
    total: parseInt(countResult.rows[0].count, 10),
  };
}

/** Verify the integrity of the audit chain for an org. */
export async function verifyAuditChain(orgId: string): Promise<{
  valid: boolean;
  brokenAt?: number;
  totalEntries: number;
}> {
  const result = await query<AuditEntry>(
    `SELECT * FROM audit_log WHERE org_id = $1 ORDER BY id ASC`,
    [orgId],
  );

  for (let i = 1; i < result.rows.length; i++) {
    const current = result.rows[i];
    const previous = result.rows[i - 1];

    if (current.prev_hash !== previous.hash) {
      return { valid: false, brokenAt: current.id, totalEntries: result.rows.length };
    }
  }

  return { valid: true, totalEntries: result.rows.length };
}
