import { query } from '../db/pool.js';
import { generateId, generateAgentKeyPair } from '../lib/crypto.js';

export interface Agent {
  id: string;
  org_id: string;
  name: string;
  model: string | null;
  version: string;
  public_key: string | null;
  metadata: Record<string, unknown>;
  created_by: string | null;
  created_at: Date;
  revoked_at: Date | null;
  parent_agent_id: string | null;
}

export interface CreateAgentInput {
  orgId: string;
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

  const result = await query<Agent>(
    `INSERT INTO agents (id, org_id, name, model, version, public_key, metadata, created_by, parent_agent_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING *`,
    [
      id,
      input.orgId,
      input.name,
      input.model || null,
      input.version || '1.0.0',
      publicKey,
      JSON.stringify(input.metadata || {}),
      input.createdBy || null,
      input.parentAgentId || null,
    ],
  );

  return { ...result.rows[0], privateKey };
}

/** Get agent by ID, only if it belongs to the given org. */
export async function getAgent(orgId: string, agentId: string): Promise<Agent | null> {
  const result = await query<Agent>(`SELECT * FROM agents WHERE id = $1 AND org_id = $2`, [
    agentId,
    orgId,
  ]);
  return result.rows[0] || null;
}

/** List all agents for an org. */
export async function listAgents(orgId: string, includeRevoked = false): Promise<Agent[]> {
  const sql = includeRevoked
    ? `SELECT * FROM agents WHERE org_id = $1 ORDER BY created_at DESC`
    : `SELECT * FROM agents WHERE org_id = $1 AND revoked_at IS NULL ORDER BY created_at DESC`;

  const result = await query<Agent>(sql, [orgId]);
  return result.rows;
}

/** Revoke an agent — sets revoked_at timestamp. */
export async function revokeAgent(orgId: string, agentId: string): Promise<Agent | null> {
  const result = await query<Agent>(
    `UPDATE agents SET revoked_at = NOW() WHERE id = $1 AND org_id = $2 AND revoked_at IS NULL RETURNING *`,
    [agentId, orgId],
  );
  return result.rows[0] || null;
}

/** Check if an agent is active (exists and not revoked). */
export async function isAgentActive(agentId: string): Promise<boolean> {
  const result = await query(`SELECT 1 FROM agents WHERE id = $1 AND revoked_at IS NULL`, [
    agentId,
  ]);
  return result.rowCount! > 0;
}
