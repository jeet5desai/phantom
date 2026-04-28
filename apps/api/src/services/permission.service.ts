import prisma from '../db/prisma.js';
import { generateId } from '../lib/crypto.js';

export interface Permission {
  id: string;
  agentId: string;
  resource: string;
  action: string;
  requiresApproval: boolean;
  createdAt: Date;
}

/** Grant a permission to an agent. */
export async function grantPermission(
  agentId: string,
  resource: string,
  action: string,
  requiresApproval = false,
): Promise<Permission> {
  const existing = await prisma.permission.findUnique({
    where: {
      agentId_resource_action: {
        agentId,
        resource,
        action,
      },
    },
  });

  if (existing) {
    return {
      ...existing,
      requiresApproval: existing.requiresApproval || false,
    };
  }

  const id = generateId('perm');
  const perm = await prisma.permission.create({
    data: {
      id,
      agentId,
      resource,
      action,
      requiresApproval,
    },
  });

  return {
    ...perm,
    requiresApproval: perm.requiresApproval || false,
  };
}

/** Revoke a specific permission. */
export async function revokePermission(agentId: string, permissionId: string): Promise<boolean> {
  try {
    await prisma.permission.delete({
      where: {
        id: permissionId,
        agentId,
      },
    });
    return true;
  } catch {
    return false;
  }
}

/** List all permissions for an agent. */
export async function listPermissions(agentId: string): Promise<Permission[]> {
  const perms = await prisma.permission.findMany({
    where: { agentId },
    orderBy: [{ resource: 'asc' }, { action: 'asc' }],
  });

  return perms.map((p) => ({
    ...p,
    requiresApproval: p.requiresApproval || false,
  }));
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
