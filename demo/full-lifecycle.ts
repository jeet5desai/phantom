/**
 * Phantom — Full Lifecycle Demo
 *
 * This script exercises the entire Phantom flow:
 * 1. Create an agent with identity
 * 2. Store a credential in the vault
 * 3. Grant permissions
 * 4. Issue a scoped token
 * 5. Verify the token
 * 6. Attempt unauthorized scope (should fail)
 * 7. Check audit log
 * 8. Kill switch — revoke all tokens
 * 9. Verify revoked token fails
 *
 * Usage: API_KEY=ph_... npx tsx demo/full-lifecycle.ts
 */

const API_BASE = 'http://localhost:3100';
const apiKey = process.env.API_KEY;

if (!apiKey) {
  console.error(
    'Missing API_KEY env var. Run the seed first, then: API_KEY=ph_... npx tsx demo/full-lifecycle.ts',
  );
  process.exit(1);
}

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
  console.log('║   🔐 Phantom — Full Lifecycle Demo       ║');
  console.log('╚═══════════════════════════════════════════╝\n');

  log('🔑', `Using API Key: ${apiKey?.slice(0, 20)}...`);

  // 1. Create Agent
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

  // 2. Store Credential
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

  // 3. Grant Permissions
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

  // 4. Issue Scoped Token
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

  // 5. Verify Token
  const verifyRes = await request('POST', '/api/v1/tokens/verify', { token: tokenId }, apiKey);
  log('✔️', `Token verification: ${verifyRes.data.valid ? 'VALID ✅' : 'INVALID ❌'}`);

  // 6. Attempt Unauthorized Scope
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

  // 7. Check Audit Log
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

  // 8. Kill Switch
  const killRes = await request('DELETE', `/api/v1/agents/${agentId}/tokens`, undefined, apiKey);
  log('🔴', `Kill switch activated!`, killRes.data);

  // 9. Verify Revoked Token
  const revokedVerify = await request('POST', '/api/v1/tokens/verify', { token: tokenId }, apiKey);
  log(
    '🔒',
    `Revoked token verification: ${revokedVerify.data.valid ? 'STILL VALID ❌' : 'BLOCKED ✅'}`,
    revokedVerify.data.reason,
  );

  // 10. Verify Audit Chain Integrity
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
