/**
 * @agentkey/sdk — TypeScript SDK for the AgentKey platform.
 *
 * Usage:
 *   import { AgentKey } from '@agentkey/sdk';
 *   const ak = new AgentKey({ apiKey: 'ak_live_...' });
 */

// ─── Types ──────────────────────────────────────────────────────────────────

export interface AgentKeyConfig {
  apiKey: string;
  baseUrl?: string;
}

export interface Organization {
  id: string;
  name: string;
  created_at: string;
}

export interface Agent {
  id: string;
  org_id: string;
  name: string;
  model: string | null;
  version: string;
  public_key: string | null;
  metadata: Record<string, unknown>;
  created_by: string | null;
  created_at: string;
  revoked_at: string | null;
  parent_agent_id: string | null;
}

export interface CreateAgentInput {
  name: string;
  model?: string;
  version?: string;
  metadata?: Record<string, unknown>;
  createdBy?: string;
  parentAgentId?: string;
}

export interface Token {
  id: string;
  agent_id: string;
  credential_id: string | null;
  scopes: string[];
  expires_at: string;
  revoked: boolean;
  created_at: string;
}

export interface CreateTokenInput {
  agentId: string;
  scopes: string[];
  ttl?: number;
  credentialId?: string;
}

export interface Credential {
  id: string;
  org_id: string;
  service: string;
  label: string | null;
  created_at: string;
  rotated_at: string | null;
}

export interface Permission {
  id: string;
  agent_id: string;
  resource: string;
  action: string;
  requires_approval: boolean;
  created_at: string;
}

export interface AuditEntry {
  id: number;
  org_id: string;
  agent_id: string;
  action: string;
  resource: string | null;
  result: string;
  reasoning: string | null;
  hash: string;
  prev_hash: string | null;
  created_at: string;
}

export interface ScopeCheckResult {
  allowed: boolean;
  granted: string[];
  denied: string[];
}

// ─── HTTP Client ────────────────────────────────────────────────────────────

class HttpClient {
  constructor(
    private baseUrl: string,
    private apiKey: string,
  ) {}

  private async request<T>(method: string, path: string, body?: unknown): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.apiKey}`,
    };

    const res = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = (await res.json()) as any;

    if (!res.ok) {
      const error = new Error(data.message || `HTTP ${res.status}`) as any;
      error.status = res.status;
      error.code = data.error;
      error.details = data;
      throw error;
    }

    return data as T;
  }

  get<T>(path: string) {
    return this.request<T>('GET', path);
  }
  post<T>(path: string, body?: unknown) {
    return this.request<T>('POST', path, body);
  }
  put<T>(path: string, body?: unknown) {
    return this.request<T>('PUT', path, body);
  }
  delete<T>(path: string) {
    return this.request<T>('DELETE', path);
  }
}

// ─── Resource Classes ───────────────────────────────────────────────────────

class AgentsResource {
  constructor(private http: HttpClient) {}

  async create(input: CreateAgentInput): Promise<{ agent: Agent; privateKey: string }> {
    return this.http.post('/api/v1/agents', input);
  }

  async list(includeRevoked = false): Promise<{ agents: Agent[] }> {
    const qs = includeRevoked ? '?includeRevoked=true' : '';
    return this.http.get(`/api/v1/agents${qs}`);
  }

  async get(agentId: string): Promise<{ agent: Agent }> {
    return this.http.get(`/api/v1/agents/${agentId}`);
  }

  async revoke(agentId: string): Promise<{ agent: Agent; message: string }> {
    return this.http.post(`/api/v1/agents/${agentId}/revoke`);
  }

  async killSwitch(agentId: string): Promise<{ message: string; revokedCount: number }> {
    return this.http.delete(`/api/v1/agents/${agentId}/tokens`);
  }
}

class TokensResource {
  constructor(private http: HttpClient) {}

  async create(input: CreateTokenInput): Promise<{ token: Token }> {
    return this.http.post('/api/v1/tokens', {
      agentId: input.agentId,
      scopes: input.scopes,
      ttl: input.ttl ?? 300,
      credentialId: input.credentialId,
    });
  }

  async verify(tokenId: string): Promise<{ valid: boolean; token?: Token; reason?: string }> {
    return this.http.post('/api/v1/tokens/verify', { token: tokenId });
  }

  async revoke(tokenId: string): Promise<{ message: string }> {
    return this.http.delete(`/api/v1/tokens/${tokenId}`);
  }
}

class CredentialsResource {
  constructor(private http: HttpClient) {}

  async store(
    service: string,
    apiKey: string,
    label?: string,
  ): Promise<{ credential: Credential }> {
    return this.http.post('/api/v1/credentials', { service, apiKey, label });
  }

  async list(): Promise<{ credentials: Credential[] }> {
    return this.http.get('/api/v1/credentials');
  }

  async rotate(credentialId: string, newApiKey: string): Promise<{ credential: Credential }> {
    return this.http.put(`/api/v1/credentials/${credentialId}/rotate`, { apiKey: newApiKey });
  }

  async delete(credentialId: string): Promise<{ message: string }> {
    return this.http.delete(`/api/v1/credentials/${credentialId}`);
  }
}

class PermissionsResource {
  constructor(private http: HttpClient) {}

  async grant(
    agentId: string,
    resource: string,
    action: string,
    requiresApproval = false,
  ): Promise<{ permission: Permission }> {
    return this.http.post('/api/v1/permissions', { agentId, resource, action, requiresApproval });
  }

  async list(agentId: string): Promise<{ permissions: Permission[] }> {
    return this.http.get(`/api/v1/agents/${agentId}/permissions`);
  }

  async check(agentId: string, scopes: string[]): Promise<ScopeCheckResult> {
    return this.http.post('/api/v1/permissions/check', { agentId, scopes });
  }

  async revoke(agentId: string, permissionId: string): Promise<{ message: string }> {
    return this.http.delete(`/api/v1/permissions/${permissionId}?agentId=${agentId}`);
  }
}

class AuditResource {
  constructor(private http: HttpClient) {}

  async list(filters?: {
    agentId?: string;
    action?: string;
    result?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ entries: AuditEntry[]; total: number }> {
    const params = new URLSearchParams();
    if (filters?.agentId) params.set('agentId', filters.agentId);
    if (filters?.action) params.set('action', filters.action);
    if (filters?.result) params.set('result', filters.result);
    if (filters?.limit) params.set('limit', String(filters.limit));
    if (filters?.offset) params.set('offset', String(filters.offset));

    const qs = params.toString() ? `?${params.toString()}` : '';
    return this.http.get(`/api/v1/audit${qs}`);
  }

  async verifyChain(): Promise<{ valid: boolean; brokenAt?: number; totalEntries: number }> {
    return this.http.get('/api/v1/audit/verify');
  }
}

// ─── Main Client ────────────────────────────────────────────────────────────

export class AgentKey {
  readonly agents: AgentsResource;
  readonly tokens: TokensResource;
  readonly credentials: CredentialsResource;
  readonly permissions: PermissionsResource;
  readonly audit: AuditResource;

  constructor(config: AgentKeyConfig) {
    const baseUrl = config.baseUrl || 'http://localhost:3100';
    const http = new HttpClient(baseUrl, config.apiKey);

    this.agents = new AgentsResource(http);
    this.tokens = new TokensResource(http);
    this.credentials = new CredentialsResource(http);
    this.permissions = new PermissionsResource(http);
    this.audit = new AuditResource(http);
  }
}

export default AgentKey;
