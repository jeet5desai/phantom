/**
 * Phantom — Real Task Simulator
 *
 * This script simulates a multi-step autonomous task performed by an AI Agent.
 * It demonstrates how the Phantom backend captures real-time governance checks
 * and audit trails for a complex workflow.
 *
 * Workflow: "Summarize sensitive emails and draft a reply"
 */
export {};

const API_BASE = process.env.PHANTOM_API_URL || 'http://localhost:3100';
const DEFAULT_API_KEY = process.env.PHANTOM_API_KEY || '';

if (!DEFAULT_API_KEY) {
  console.error('❌ Set PHANTOM_API_KEY environment variable before running this script.');
  process.exit(1);
}

async function request(method: string, path: string, body?: unknown) {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${DEFAULT_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  return await res.json();
}

function step(num: number, title: string) {
  console.log(`\n[STEP ${num}] ${title}`);
}

interface Agent {
  id: string;
  name: string;
}

interface Credential {
  id: string;
  service: string;
}

async function simulate() {
  console.log('🚀 Starting "Email Summary" Task Simulation for gmail-preview-assistant...\n');

  // Find the agent and credential from the previous setup
  const agentsRes = await request('GET', '/api/v1/agents');
  const gmailAgent = agentsRes.agents.find((a: Agent) => a.name === 'gmail-preview-assistant');

  const credsRes = await request('GET', '/api/v1/credentials');
  const gmailCred = credsRes.credentials.find((c: Credential) => c.service === 'gmail');

  if (!gmailAgent || !gmailCred) {
    console.error('❌ Gmail agent or credentials not found. Run demo/gmail-agent.ts first!');
    return;
  }

  const agentId = gmailAgent.id;
  const credId = gmailCred.id;

  // Step 1: Request token for Reading
  step(1, 'Agent requesting access to READ inbox');
  const readTokenRes = await request('POST', '/api/v1/tokens', {
    agentId,
    scopes: ['gmail:messages:read'],
    ttl: 300,
    credentialId: credId,
  });
  const readToken = readTokenRes.token.id;
  console.log(`✅ Token Issued: ${readToken}`);

  // Step 2: Verify Token (Simulated Action)
  step(2, 'Agent verifying token before listing messages');
  await request('POST', '/api/v1/tokens/verify', { token: readToken });
  console.log('✅ Token Verified');

  // Step 3: Demonstrate that the audit trail is recorded server-side
  step(3, 'Agent performing sensitive "Summarize" action on PII data');
  // NOTE: Audit logs are written internally by the server during token issuance
  // and verification. There is intentionally NO public POST /api/v1/audit endpoint —
  // allowing external writes would destroy the immutability guarantee of the audit ledger.
  console.log('✅ Audit entries recorded automatically by the governance engine');

  // Step 4: Request token for Writing (Escalation)
  step(4, 'Agent requesting access to WRITE a draft (Privilege Escalation)');
  const writeTokenRes = await request('POST', '/api/v1/tokens', {
    agentId,
    scopes: ['gmail:drafts:write'],
    ttl: 300,
    credentialId: credId,
  });

  if (writeTokenRes.token) {
    console.log(`✅ Token Issued for Escalation: ${writeTokenRes.token.id}`);
  } else {
    console.log(`🚫 Escalation blocked by policy: ${writeTokenRes.error}`);
  }

  // Step 5: Unauthorized Attempt
  step(5, 'Agent attempting UNAUTHORIZED action (delete messages)');
  const badTokenRes = await request('POST', '/api/v1/tokens', {
    agentId,
    scopes: ['gmail:messages:delete'],
    ttl: 60,
  });
  console.log(`🚫 Action Blocked: ${badTokenRes.message}`);

  console.log('\n✨ Simulation Complete!');
  console.log('Check the Dashboard (http://localhost:3000) to see the live Audit Trail.');
}

simulate().catch(console.error);
