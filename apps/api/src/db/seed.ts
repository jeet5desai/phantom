import { createApiKey } from '../services/apikey.service.js';
import { createAgent } from '../services/agent.service.js';
import { storeCredential } from '../services/credential.service.js';
import { grantPermission } from '../services/permission.service.js';

/**
 * Seed the database with sample data for local development.
 * Creates a demo user's API key, agents, credentials, and permissions.
 */
const DEMO_USER_ID = 'user_demo_seed_001';

async function seed() {
  console.log('[Seed] Starting seeding process...');

  console.log('[Seed] Creating API key for demo user...');
  const { apiKey, rawKey } = await createApiKey(DEMO_USER_ID, 'Demo Key');
  console.log(`  → API Key ID: ${apiKey.id}`);
  console.log(`  → Raw Key:    ${rawKey}`);

  console.log('[Seed] Creating demo agent...');
  const agent = await createAgent({
    userId: DEMO_USER_ID,
    name: 'invoice-processor',
    model: 'gpt-4',
    version: '1.0.0',
    metadata: { purpose: 'Process and read Stripe invoices' },
    createdBy: 'seed-script',
  });
  console.log(`  → Agent: ${agent.id} (${agent.name})`);

  console.log('[Seed] Creating sub-agent...');
  const subAgent = await createAgent({
    userId: DEMO_USER_ID,
    name: 'email-notifier',
    model: 'gpt-4-mini',
    version: '1.0.0',
    metadata: { purpose: 'Send email notifications about invoices' },
    createdBy: 'seed-script',
    parentAgentId: agent.id,
  });
  console.log(`  → Sub-Agent: ${subAgent.id} (${subAgent.name})`);

  console.log('[Seed] Storing demo credentials...');
  const stripeCred = await storeCredential(
    DEMO_USER_ID,
    'stripe',
    'sk_test_fake_stripe_key_12345',
    'Stripe Test',
  );
  const gmailCred = await storeCredential(
    DEMO_USER_ID,
    'gmail',
    'gmail_fake_oauth_token_12345',
    'Gmail OAuth',
  );
  console.log(`  → Stripe: ${stripeCred.id}`);
  console.log(`  → Gmail:  ${gmailCred.id}`);

  console.log('[Seed] Granting permissions...');
  await grantPermission(agent.id, 'stripe:invoices', 'read');
  await grantPermission(agent.id, 'stripe:invoices', 'list');
  await grantPermission(agent.id, 'gmail', 'send');
  await grantPermission(subAgent.id, 'gmail', 'send');
  console.log('  → invoice-processor: stripe:invoices:read, stripe:invoices:list, gmail:send');
  console.log('  → email-notifier:    gmail:send');

  console.log('\n[Seed] ✅ Seed complete! Save this API key to test:\n');
  console.log(`  API_KEY=${rawKey}\n`);
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('[Seed] ❌ Failed:', err);
    process.exit(1);
  });
