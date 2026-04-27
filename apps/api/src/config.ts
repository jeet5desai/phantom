import 'dotenv/config';

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
  apiKeySecret: process.env.API_KEY_SECRET || 'dev-secret-change-me',

  /** AES-256 key for encrypting credentials in the vault (hex-encoded, 32 bytes) */
  vaultEncryptionKey: process.env.VAULT_ENCRYPTION_KEY || 'a]b!c@d#e$f%g^h&i*j(k)l-m_n+o=p0',

  env: (process.env.NODE_ENV || 'development') as 'development' | 'production' | 'test',
} as const;
