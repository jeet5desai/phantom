import 'dotenv/config';
import crypto from 'node:crypto';

// ─── Validate Critical Secrets ──────────────────────────────────────────────

const isProd = (process.env.NODE_ENV || 'development') === 'production';

function requireSecret(name: string, value: string | undefined): string {
  if (!value || value.startsWith('dev-')) {
    if (isProd) {
      console.error(
        `\n🛑 FATAL: ${name} is not set or is using a development default.\n` +
          `   Generate a production secret: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"\n` +
          `   Then set ${name} in your environment.\n`,
      );
      process.exit(1);
    }
    // In dev, warn but allow startup
    if (!value || value.startsWith('dev-')) {
      console.warn(
        `⚠️  WARNING: ${name} is using a development default. Do NOT use this in production.`,
      );
    }
  }
  return value || '';
}

const vaultKey = requireSecret('VAULT_ENCRYPTION_KEY', process.env.VAULT_ENCRYPTION_KEY);
const apiKeySecret = requireSecret('API_KEY_SECRET', process.env.API_KEY_SECRET);

export const config = {
  port: parseInt(process.env.PORT || '3100', 10),
  host: process.env.HOST || '0.0.0.0',

  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'agentkey',
  },

  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
  },

  /** Secret used to sign org-level API keys */
  apiKeySecret: apiKeySecret || 'dev-secret-change-me',

  /**
   * AES-256 key for encrypting credentials in the vault.
   * Must be set via VAULT_ENCRYPTION_KEY env var in production.
   * Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   */
  vaultEncryptionKey: vaultKey || crypto.randomBytes(32).toString('hex'),

  env: (process.env.NODE_ENV || 'development') as 'development' | 'production' | 'test',
} as const;
