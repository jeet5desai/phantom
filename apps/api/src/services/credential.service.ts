import { query } from '../db/pool.js';
import { generateId, encrypt, decrypt } from '../lib/crypto.js';

export interface Credential {
  id: string;
  org_id: string;
  service: string;
  label: string | null;
  created_at: Date;
  rotated_at: Date | null;
}

/** Store a credential in the encrypted vault. */
export async function storeCredential(
  orgId: string,
  service: string,
  apiKey: string,
  label?: string,
): Promise<Credential> {
  const id = generateId('cred');
  const { encrypted, iv } = encrypt(apiKey);

  const result = await query<Credential>(
    `INSERT INTO credentials (id, org_id, service, label, encrypted_key, iv)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, org_id, service, label, created_at, rotated_at`,
    [id, orgId, service, label || null, encrypted, iv],
  );

  return result.rows[0];
}

/** List credentials for an org (metadata only, no decryption). */
export async function listCredentials(orgId: string): Promise<Credential[]> {
  const result = await query<Credential>(
    `SELECT id, org_id, service, label, created_at, rotated_at FROM credentials WHERE org_id = $1 ORDER BY created_at DESC`,
    [orgId],
  );
  return result.rows;
}

/** Rotate a credential — replace the stored key. */
export async function rotateCredential(
  orgId: string,
  credentialId: string,
  newApiKey: string,
): Promise<Credential | null> {
  const { encrypted, iv } = encrypt(newApiKey);

  const result = await query<Credential>(
    `UPDATE credentials SET encrypted_key = $1, iv = $2, rotated_at = NOW()
     WHERE id = $3 AND org_id = $4
     RETURNING id, org_id, service, label, created_at, rotated_at`,
    [encrypted, iv, credentialId, orgId],
  );

  return result.rows[0] || null;
}

/** Delete a credential. */
export async function deleteCredential(orgId: string, credentialId: string): Promise<boolean> {
  const result = await query(`DELETE FROM credentials WHERE id = $1 AND org_id = $2`, [
    credentialId,
    orgId,
  ]);
  return result.rowCount! > 0;
}
