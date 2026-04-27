import { Redis } from 'ioredis';
import { config } from '../config.js';

const redis = new Redis({
  host: config.redis.host,
  port: config.redis.port,
  password: config.redis.password,
  maxRetriesPerRequest: 3,
  retryStrategy(times: number) {
    if (times > 5) return null; // stop retrying
    return Math.min(times * 200, 2000);
  },
  lazyConnect: true, // Don't connect immediately — allows graceful fallback
});

let connected = false;

redis.on('connect', () => {
  connected = true;
  console.log('[Redis] Connected');
});

redis.on('error', (err: Error) => {
  connected = false;
  if (config.env === 'development') {
    // In dev, Redis is optional — fall back to DB-only checks
    console.warn('[Redis] Not available — falling back to DB-only token checks');
  } else {
    console.error('[Redis] Error:', err.message);
  }
});

// Attempt connection (non-blocking)
redis.connect().catch(() => {
  // Silently handled by error event above
});

/**
 * Cache a revoked token ID in Redis for fast lookup.
 * TTL matches the token's remaining lifetime so entries auto-expire.
 */
export async function cacheRevokedToken(tokenId: string, ttlSeconds: number): Promise<void> {
  if (!connected) return;
  try {
    await redis.set(`revoked:${tokenId}`, '1', 'EX', Math.max(ttlSeconds, 60));
  } catch {
    // Non-critical — DB is the source of truth
  }
}

/**
 * Cache all revoked tokens for an agent (kill switch).
 */
export async function cacheRevokedAgent(agentId: string, ttlSeconds = 86400): Promise<void> {
  if (!connected) return;
  try {
    await redis.set(`revoked_agent:${agentId}`, '1', 'EX', ttlSeconds);
  } catch {
    // Non-critical
  }
}

/**
 * Fast check: is this token revoked? Returns null if Redis unavailable (fall back to DB).
 */
export async function isTokenRevokedFast(tokenId: string): Promise<boolean | null> {
  if (!connected) return null; // Caller should check DB
  try {
    const result = await redis.get(`revoked:${tokenId}`);
    return result === '1';
  } catch {
    return null;
  }
}

/**
 * Fast check: is this agent revoked?
 */
export async function isAgentRevokedFast(agentId: string): Promise<boolean | null> {
  if (!connected) return null;
  try {
    const result = await redis.get(`revoked_agent:${agentId}`);
    return result === '1';
  } catch {
    return null;
  }
}

export { redis, connected as redisConnected };
