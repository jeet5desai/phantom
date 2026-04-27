import { query } from '../db/pool.js';
import { generateId, generateApiKey, hashApiKey } from '../lib/crypto.js';

export interface Organization {
  id: string;
  name: string;
  created_at: Date;
}

/** Create a new organization and return it with its API key. */
export async function createOrganization(
  name: string,
): Promise<{ org: Organization; apiKey: string }> {
  const id = generateId('org');
  const { raw, hash } = generateApiKey();

  const result = await query<Organization>(
    `INSERT INTO organizations (id, name, api_key_hash) VALUES ($1, $2, $3) RETURNING id, name, created_at`,
    [id, name, hash],
  );

  return { org: result.rows[0], apiKey: raw };
}

/** Authenticate an API key and return the org. */
export async function authenticateApiKey(apiKey: string): Promise<Organization | null> {
  const hash = hashApiKey(apiKey);
  const result = await query<Organization>(
    `SELECT id, name, created_at FROM organizations WHERE api_key_hash = $1`,
    [hash],
  );
  return result.rows[0] || null;
}

/** Get org by ID. */
export async function getOrganization(id: string): Promise<Organization | null> {
  const result = await query<Organization>(
    `SELECT id, name, created_at FROM organizations WHERE id = $1`,
    [id],
  );
  return result.rows[0] || null;
}
