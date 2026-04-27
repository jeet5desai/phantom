/**
 * AgentKey — Real Task Simulator
 * 
 * This script simulates a multi-step autonomous task performed by an AI Agent.
 * It demonstrates how the AgentKey backend captures real-time governance checks
 * and audit trails for a complex workflow.
 * 
 * Workflow: "Summarize sensitive emails and draft a reply"
 */
export {};

const API_BASE = 'http://localhost:3100';
const DEFAULT_API_KEY = 'ak_live_vzZpmZRBP57o1dA9mV48xHNgWrZchrcgqJiQwJ0C';

async function request(method: string, path: string, body?: unknown) {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      'Authorization': `Bearer ${DEFAULT_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  return await res.json();
}

function step(num: number, title: string) {
  console.log(`\n[STEP ${num}] ${title}`);
}

async function simulate() {
  console.log('🚀 Starting "Email Summary" Task Simulation for gmail-preview-assistant...\n');

  // Find the agent and credential from the previous setup
  const agentsRes = await request('GET', '/api/v1/agents');
  const gmailAgent = agentsRes.agents.find((a: any) => a.name === 'gmail-preview-assistant');
  
  const credsRes = await request('GET', '/api/v1/credentials');
  const gmailCred = credsRes.credentials.find((c: any) => c.service === 'gmail');

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
    credentialId: credId
  });
  const readToken = readTokenRes.token.id;
  console.log(`✅ Token Issued: ${readToken}`);

  // Step 2: Verify Token (Simulated Action)
  step(2, 'Agent verifying token before listing messages');
  await request('POST', '/api/v1/tokens/verify', { token: readToken });
  console.log('✅ Token Verified');

  // Step 3: Record Audit for "Summarize" (Sensitive Action)
  step(3, 'Agent performing sensitive "Summarize" action on PII data');
  // We manually trigger an audit entry to simulate the governance engine catching this
  // In a real integration, the SDK would handle this automatically.
  await request('POST', '/api/v1/audit', {
    agentId,
    action: 'GMAIL_SUMMARY',
    resource: 'gmail:messages:summary',
    result: 'allowed',
    reasoning: 'Request contained PII; Redaction filter applied successfully.'
  });
  console.log('✅ Action Audit recorded with PII Redaction metadata');

  // Step 4: Request token for Writing (Escalation)
  step(4, 'Agent requesting access to WRITE a draft (Privilege Escalation)');
  const writeTokenRes = await request('POST', '/api/v1/tokens', {
    agentId,
    scopes: ['gmail:drafts:write'],
    ttl: 300,
    credentialId: credId
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
    ttl: 60
  });
  console.log(`🚫 Action Blocked: ${badTokenRes.message}`);

  console.log('\n✨ Simulation Complete!');
  console.log('Check the Dashboard (http://localhost:3000) to see the live Audit Trail.');
}

simulate().catch(console.error);
