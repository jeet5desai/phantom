import { query } from '../db/pool.js';
import { generateId } from '../lib/crypto.js';

export interface Permission {
  id: string;
  agent_id: string;
  resource: string;
  action: string;
  requires_approval: boolean;
  created_at: Date;
}

/** Grant a permission to an agent. */
export async function grantPermission(
  agentId: string,
  resource: string,
  action: string,
  requiresApproval = false,
): Promise<Permission> {
  const id = generateId('perm');

  const result = await query<Permission>(
    `INSERT INTO permissions (id, agent_id, resource, action, requires_approval)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (agent_id, resource, action) DO NOTHING
     RETURNING *`,
    [id, agentId, resource, action, requiresApproval],
  );

  // If already exists, return existing
  if (!result.rows[0]) {
    const existing = await query<Permission>(
      `SELECT * FROM permissions WHERE agent_id = $1 AND resource = $2 AND action = $3`,
      [agentId, resource, action],
    );
    return existing.rows[0];
  }

  return result.rows[0];
}

/** Revoke a specific permission. */
export async function revokePermission(agentId: string, permissionId: string): Promise<boolean> {
  const result = await query(`DELETE FROM permissions WHERE id = $1 AND agent_id = $2`, [
    permissionId,
    agentId,
  ]);
  return result.rowCount! > 0;
}

/** List all permissions for an agent. */
export async function listPermissions(agentId: string): Promise<Permission[]> {
  const result = await query<Permission>(
    `SELECT * FROM permissions WHERE agent_id = $1 ORDER BY resource, action`,
    [agentId],
  );
  return result.rows;
}

/**
 * Check if an agent has ALL the requested scopes.
 * Scopes are formatted as "resource:action", e.g. "stripe:invoices:read".
 */
export async function checkScopes(
  agentId: string,
  requestedScopes: string[],
): Promise<{
  allowed: boolean;
  granted: string[];
  denied: string[];
}> {
  const perms = await listPermissions(agentId);

  const grantedSet = new Set(perms.map((p) => `${p.resource}:${p.action}`));
  const granted: string[] = [];
  const denied: string[] = [];

  for (const scope of requestedScopes) {
    if (grantedSet.has(scope)) {
      granted.push(scope);
    } else {
      // Check for wildcards at every level: "stripe:*" or "stripe:invoices:*"
      let allowed = false;
      const parts = scope.split(':');
      for (let i = 1; i < parts.length; i++) {
        const wildcardCheck = parts.slice(0, i).join(':') + ':*';
        if (grantedSet.has(wildcardCheck)) {
          allowed = true;
          break;
        }
      }

      if (allowed) {
        granted.push(scope);
      } else {
        denied.push(scope);
      }
    }
  }

  return { allowed: denied.length === 0, granted, denied };
}

/**
 * Validate that a child agent's requested scopes are a subset
 * of its parent's scopes (agent-to-agent delegation).
 */
export async function validateDelegation(
  parentAgentId: string,
  childScopes: string[],
): Promise<{ valid: boolean; denied: string[] }> {
  const parentCheck = await checkScopes(parentAgentId, childScopes);
  return { valid: parentCheck.allowed, denied: parentCheck.denied };
}
