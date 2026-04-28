import crypto from 'node:crypto';
import { nanoid } from 'nanoid';
import { config } from '../config.js';

// ─── ID Generation ──────────────────────────────────────────────────────────

/** Generate a prefixed unique ID, e.g. agt_xK2f9... */
export function generateId(prefix: string): string {
  return `${prefix}_${nanoid(20)}`;
}

// ─── API Key Hashing ────────────────────────────────────────────────────────

/** Hash an API key for storage (one-way). */
export function hashApiKey(key: string): string {
  return crypto.createHmac('sha256', config.apiKeySecret).update(key).digest('hex');
}

/** Generate a new API key and its hash. */
export function generateApiKey(): { raw: string; hash: string } {
  const raw = `ak_live_${nanoid(40)}`;
  return { raw, hash: hashApiKey(raw) };
}

// ─── Vault Encryption (AES-256-GCM) ────────────────────────────────────────

const ALGORITHM = 'aes-256-gcm';

function getEncryptionKey(): Buffer {
  // Derive a proper 32-byte key from the config secret
  return crypto.scryptSync(config.vaultEncryptionKey, 'agentkey-vault-salt', 32);
}

/** Encrypt a plaintext secret for vault storage. */
export function encrypt(plaintext: string): { encrypted: string; iv: string; authTag: string } {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag().toString('hex');

  return {
    encrypted: encrypted + ':' + authTag,
    iv: iv.toString('hex'),
    authTag,
  };
}

/** Decrypt a vault secret. */
export function decrypt(encryptedWithTag: string, ivHex: string): string {
  const key = getEncryptionKey();
  const [encrypted, authTagHex] = encryptedWithTag.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

// ─── Audit Hashing (SHA-256 chain) ──────────────────────────────────────────

/** Compute SHA-256 hash for an audit log entry, chained to the previous entry. */
export function computeAuditHash(entry: {
  agent_id: string;
  action: string;
  resource?: string;
  result: string;
  prev_hash?: string;
}): string {
  const payload = JSON.stringify({
    agent_id: entry.agent_id,
    action: entry.action,
    resource: entry.resource,
    result: entry.result,
    prev_hash: entry.prev_hash || '',
  });
  return crypto.createHash('sha256').update(payload).digest('hex');
}

// ─── Ed25519 Key Pairs (Agent Identity) ─────────────────────────────────────

/** Generate an Ed25519 keypair for agent identity signing. */
export function generateAgentKeyPair(): { publicKey: string; privateKey: string } {
  const { publicKey, privateKey } = crypto.generateKeyPairSync('ed25519');

  return {
    publicKey: publicKey.export({ type: 'spki', format: 'pem' }).toString(),
    privateKey: privateKey.export({ type: 'pkcs8', format: 'pem' }).toString(),
  };
}
