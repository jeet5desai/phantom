import { query } from './pool.js';

/**
 * Run all migrations to create the AgentKey schema.
 * Idempotent — safe to run multiple times.
 */
export async function runMigrations() {
  console.log('[Migrate] Running migrations...');

  // Organizations
  await query(`
    CREATE TABLE IF NOT EXISTS organizations (
      id            TEXT PRIMARY KEY,
      name          TEXT NOT NULL,
      api_key_hash  TEXT NOT NULL UNIQUE,
      created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  // Agent identities
  await query(`
    CREATE TABLE IF NOT EXISTS agents (
      id            TEXT PRIMARY KEY,
      org_id        TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
      name          TEXT NOT NULL,
      model         TEXT,
      version       TEXT DEFAULT '1.0.0',
      public_key    TEXT,
      metadata      JSONB DEFAULT '{}',
      created_by    TEXT,
      created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      revoked_at    TIMESTAMPTZ,
      parent_agent_id TEXT REFERENCES agents(id)
    );
    CREATE INDEX IF NOT EXISTS idx_agents_org ON agents(org_id);
  `);

  // Credential vault
  await query(`
    CREATE TABLE IF NOT EXISTS credentials (
      id              TEXT PRIMARY KEY,
      org_id          TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
      service         TEXT NOT NULL,
      label           TEXT,
      encrypted_key   TEXT NOT NULL,
      iv              TEXT NOT NULL,
      created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      rotated_at      TIMESTAMPTZ
    );
    CREATE INDEX IF NOT EXISTS idx_credentials_org ON credentials(org_id);
  `);

  // Permission graph
  await query(`
    CREATE TABLE IF NOT EXISTS permissions (
      id                TEXT PRIMARY KEY,
      agent_id          TEXT NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
      resource          TEXT NOT NULL,
      action            TEXT NOT NULL,
      requires_approval BOOLEAN DEFAULT FALSE,
      created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE(agent_id, resource, action)
    );
    CREATE INDEX IF NOT EXISTS idx_permissions_agent ON permissions(agent_id);
  `);

  // Scoped tokens
  await query(`
    CREATE TABLE IF NOT EXISTS tokens (
      id            TEXT PRIMARY KEY,
      agent_id      TEXT NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
      credential_id TEXT REFERENCES credentials(id),
      scopes        JSONB NOT NULL DEFAULT '[]',
      expires_at    TIMESTAMPTZ NOT NULL,
      revoked       BOOLEAN DEFAULT FALSE,
      created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_tokens_agent ON tokens(agent_id);
  `);

  // Immutable audit ledger
  await query(`
    CREATE TABLE IF NOT EXISTS audit_log (
      id            BIGSERIAL PRIMARY KEY,
      org_id        TEXT NOT NULL,
      agent_id      TEXT NOT NULL,
      credential_id TEXT,
      token_id      TEXT,
      action        TEXT NOT NULL,
      resource      TEXT,
      result        TEXT NOT NULL,
      reasoning     TEXT,
      metadata      JSONB DEFAULT '{}',
      hash          TEXT NOT NULL,
      prev_hash     TEXT,
      created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_audit_org ON audit_log(org_id);
    CREATE INDEX IF NOT EXISTS idx_audit_agent ON audit_log(agent_id);
    CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_log(created_at);
  `);

  console.log('[Migrate] ✅ All migrations complete.');
}

// Allow running as a standalone script
const isMain = process.argv[1]?.includes('migrate');
if (isMain) {
  runMigrations()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('[Migrate] ❌ Failed:', err);
      process.exit(1);
    });
}
