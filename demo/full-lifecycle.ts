/**
 * AgentKey — Full Lifecycle Demo
 *
 * This script exercises the entire AgentKey flow:
 * 1. Create an organization
 * 2. Create an agent with identity
 * 3. Store a credential in the vault
 * 4. Grant permissions
 * 5. Issue a scoped token
 * 6. Verify the token
 * 7. Attempt unauthorized scope (should fail)
 * 8. Check audit log
 * 9. Kill switch — revoke all tokens
 * 10. Verify revoked token fails
 *
 * Usage: npx tsx demo/full-lifecycle.ts
 */

const API_BASE = 'http://localhost:3100';

async function request(method: string, path: string, body?: unknown, apiKey?: string) {
  const headers: Record<string, string> = {};
  if (body) headers['Content-Type'] = 'application/json';
  if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`;

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json();
  return { status: res.status, data };
}

function log(emoji: string, msg: string, detail?: unknown) {
  console.log(`${emoji}  ${msg}`);
  if (detail)
    console.log(`   →`, typeof detail === 'string' ? detail : JSON.stringify(detail, null, 2));
}

async function main() {
  console.log('\n╔═══════════════════════════════════════════╗');
  console.log('║   🔐 AgentKey — Full Lifecycle Demo      ║');
  console.log('╚═══════════════════════════════════════════╝\n');

  // 1. Create Organization
  const orgRes = await request('POST', '/api/v1/organizations', { name: 'Demo Corp' });
  if (!orgRes.data.organization) {
    console.error('Failed to create organization:', orgRes.data);
    process.exit(1);
  }
  const apiKey = orgRes.data.apiKey;
  log('🏢', `Organization created: ${orgRes.data.organization.id}`, orgRes.data.organization.name);
  log('🔑', `API Key: ${apiKey.slice(0, 20)}...`);

  // 2. Create Agent
  const agentRes = await request(
    'POST',
    '/api/v1/agents',
    {
      name: 'invoice-processor',
      model: 'gpt-4',
      metadata: { purpose: 'Process Stripe invoices' },
    },
    apiKey,
  );
  const agentId = agentRes.data.agent.id;
  log('🤖', `Agent created: ${agentId}`, agentRes.data.agent.name);

  // 3. Store Credential
  const credRes = await request(
    'POST',
    '/api/v1/credentials',
    {
      service: 'stripe',
      apiKey: 'sk_test_demo_fake_key_12345',
      label: 'Stripe Test Key',
    },
    apiKey,
  );
  const credId = credRes.data.credential.id;
  log('🔒', `Credential stored: ${credId}`, `service: ${credRes.data.credential.service}`);

  // 4. Grant Permissions
  await request(
    'POST',
    '/api/v1/permissions',
    {
      agentId,
      resource: 'stripe:invoices',
      action: 'read',
    },
    apiKey,
  );
  log('✅', 'Permission granted: stripe:invoices:read');

  await request(
    'POST',
    '/api/v1/permissions',
    {
      agentId,
      resource: 'stripe:invoices',
      action: 'list',
    },
    apiKey,
  );
  log('✅', 'Permission granted: stripe:invoices:list');

  // 5. Issue Scoped Token
  const tokenRes = await request(
    'POST',
    '/api/v1/tokens',
    {
      agentId,
      scopes: ['stripe:invoices:read'],
      ttl: 300,
      credentialId: credId,
    },
    apiKey,
  );
  const tokenId = tokenRes.data.token.id;
  log('🎫', `Token issued: ${tokenId}`, `expires: ${tokenRes.data.token.expires_at}`);

  // 6. Verify Token
  const verifyRes = await request('POST', '/api/v1/tokens/verify', { token: tokenId }, apiKey);
  log('✔️', `Token verification: ${verifyRes.data.valid ? 'VALID ✅' : 'INVALID ❌'}`);

  // 7. Attempt Unauthorized Scope
  const deniedRes = await request(
    'POST',
    '/api/v1/tokens',
    {
      agentId,
      scopes: ['stripe:refunds:write'], // NOT permitted!
      ttl: 60,
    },
    apiKey,
  );
  log(
    '🚫',
    `Unauthorized scope attempt: ${deniedRes.status === 403 ? 'BLOCKED ✅' : 'OOPS ❌'}`,
    deniedRes.data.deniedScopes || deniedRes.data.error,
  );

  // 8. Check Audit Log
  const auditRes = await request(
    'GET',
    `/api/v1/audit?agentId=${agentId}&limit=10`,
    undefined,
    apiKey,
  );
  log('📝', `Audit log: ${auditRes.data.total} entries`);
  for (const entry of auditRes.data.entries.slice(0, 5)) {
    console.log(
      `     [${entry.result.toUpperCase()}] ${entry.action} — ${entry.reasoning || 'n/a'}`,
    );
  }

  // 9. Kill Switch
  const killRes = await request('DELETE', `/api/v1/agents/${agentId}/tokens`, undefined, apiKey);
  log('🔴', `Kill switch activated!`, killRes.data);

  // 10. Verify Revoked Token
  const revokedVerify = await request('POST', '/api/v1/tokens/verify', { token: tokenId }, apiKey);
  log(
    '🔒',
    `Revoked token verification: ${revokedVerify.data.valid ? 'STILL VALID ❌' : 'BLOCKED ✅'}`,
    revokedVerify.data.reason,
  );

  // 11. Verify Audit Chain Integrity
  const chainRes = await request('GET', '/api/v1/audit/verify', undefined, apiKey);
  log(
    '🔗',
    `Audit chain integrity: ${chainRes.data.valid ? 'INTACT ✅' : 'BROKEN ❌'}`,
    `${chainRes.data.totalEntries} entries`,
  );

  console.log('\n═══════════════════════════════════════════');
  console.log('  ✅ Full lifecycle demo complete!');
  console.log('═══════════════════════════════════════════\n');
}

main().catch((err) => {
  console.error('❌ Demo failed:', err.message);
  process.exit(1);
});
