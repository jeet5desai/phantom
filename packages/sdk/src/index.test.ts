import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Phantom } from './index.js';

// Mock fetch globally
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

function mockResponse(status: number, data: unknown) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(data),
  };
}

describe('Phantom SDK', () => {
  let ph: Phantom;

  beforeEach(() => {
    ph = new Phantom({ apiKey: 'ph_live_test123', baseUrl: 'http://localhost:3100' });
    mockFetch.mockReset();
  });

  describe('Agents', () => {
    it('should create an agent', async () => {
      const mockAgent = {
        agent: { id: 'agt_test123', name: 'test-agent', model: 'gpt-4' },
        privateKey: '-----BEGIN PRIVATE KEY-----...',
      };
      mockFetch.mockResolvedValueOnce(mockResponse(201, mockAgent));

      const result = await ph.agents.create({ name: 'test-agent', model: 'gpt-4' });

      expect(result.agent.id).toBe('agt_test123');
      expect(result.privateKey).toBeDefined();
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3100/api/v1/agents',
        expect.objectContaining({ method: 'POST' }),
      );
    });

    it('should list agents', async () => {
      mockFetch.mockResolvedValueOnce(mockResponse(200, { agents: [] }));

      const result = await ph.agents.list();
      expect(result.agents).toEqual([]);
    });

    it('should revoke an agent', async () => {
      mockFetch.mockResolvedValueOnce(
        mockResponse(200, { agent: { id: 'agt_test' }, message: 'Revoked' }),
      );

      const result = await ph.agents.revoke('agt_test');
      expect(result.message).toBe('Revoked');
    });

    it('should activate kill switch', async () => {
      mockFetch.mockResolvedValueOnce(
        mockResponse(200, { message: 'Kill switch activated', revokedCount: 5 }),
      );

      const result = await ph.agents.killSwitch('agt_test');
      expect(result.revokedCount).toBe(5);
    });
  });

  describe('Tokens', () => {
    it('should create a token', async () => {
      const mockToken = {
        token: { id: 'tok_abc', scopes: ['stripe:invoices:read'], expires_at: '2025-01-01' },
      };
      mockFetch.mockResolvedValueOnce(mockResponse(201, mockToken));

      const result = await ph.tokens.create({
        agentId: 'agt_test',
        scopes: ['stripe:invoices:read'],
        ttl: 300,
      });

      expect(result.token.id).toBe('tok_abc');
    });

    it('should verify a token', async () => {
      mockFetch.mockResolvedValueOnce(mockResponse(200, { valid: true, token: { id: 'tok_abc' } }));

      const result = await ph.tokens.verify('tok_abc');
      expect(result.valid).toBe(true);
    });

    it('should handle invalid token verification', async () => {
      mockFetch.mockResolvedValueOnce(mockResponse(401, { valid: false, reason: 'Token expired' }));

      await expect(ph.tokens.verify('tok_expired')).rejects.toThrow();
    });
  });

  describe('Credentials', () => {
    it('should store a credential', async () => {
      mockFetch.mockResolvedValueOnce(
        mockResponse(201, {
          credential: { id: 'cred_abc', service: 'stripe' },
        }),
      );

      const result = await ph.credentials.store('stripe', 'sk_test_123', 'My Stripe');
      expect(result.credential.service).toBe('stripe');
    });

    it('should list credentials', async () => {
      mockFetch.mockResolvedValueOnce(
        mockResponse(200, { credentials: [{ id: 'cred_1' }, { id: 'cred_2' }] }),
      );

      const result = await ph.credentials.list();
      expect(result.credentials).toHaveLength(2);
    });
  });

  describe('Permissions', () => {
    it('should grant a permission', async () => {
      mockFetch.mockResolvedValueOnce(
        mockResponse(201, {
          permission: { id: 'perm_abc', resource: 'stripe:invoices', action: 'read' },
        }),
      );

      const result = await ph.permissions.grant('agt_test', 'stripe:invoices', 'read');
      expect(result.permission.resource).toBe('stripe:invoices');
    });

    it('should check scopes', async () => {
      mockFetch.mockResolvedValueOnce(
        mockResponse(200, {
          allowed: true,
          granted: ['stripe:invoices:read'],
          denied: [],
        }),
      );

      const result = await ph.permissions.check('agt_test', ['stripe:invoices:read']);
      expect(result.allowed).toBe(true);
    });
  });

  describe('Audit', () => {
    it('should list audit entries', async () => {
      mockFetch.mockResolvedValueOnce(mockResponse(200, { entries: [], total: 0 }));

      const result = await ph.audit.list({ agentId: 'agt_test' });
      expect(result.total).toBe(0);
    });

    it('should verify audit chain', async () => {
      mockFetch.mockResolvedValueOnce(mockResponse(200, { valid: true, totalEntries: 42 }));

      const result = await ph.audit.verifyChain();
      expect(result.valid).toBe(true);
    });
  });

  describe('Error Handling', () => {
    interface SDKError extends Error {
      status?: number;
      code?: string;
    }

    it('should throw on non-2xx responses', async () => {
      mockFetch.mockResolvedValueOnce(
        mockResponse(403, { error: 'SCOPE_DENIED', message: 'Forbidden' }),
      );

      await expect(
        ph.tokens.create({
          agentId: 'agt_test',
          scopes: ['admin:*'],
        }),
      ).rejects.toThrow('Forbidden');
    });

    it('should include status code in error', async () => {
      mockFetch.mockResolvedValueOnce(
        mockResponse(404, { error: 'NOT_FOUND', message: 'Not found' }),
      );

      try {
        await ph.agents.get('agt_nonexistent');
      } catch (err) {
        const error = err as SDKError;
        expect(error.status).toBe(404);
        expect(error.code).toBe('NOT_FOUND');
      }
    });
  });

  describe('Authorization Header', () => {
    it('should send API key as Bearer token', async () => {
      mockFetch.mockResolvedValueOnce(mockResponse(200, { agents: [] }));

      await ph.agents.list();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer ph_live_test123',
          }),
        }),
      );
    });
  });
});
