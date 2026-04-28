import { createOrganization } from '../services/organization.service.js';
import { createAgent } from '../services/agent.service.js';
import { storeCredential } from '../services/credential.service.js';
import { grantPermission } from '../services/permission.service.js';
/**
 * Seed the database with sample data for local development.
 * Creates a demo org, agent, credential, and permissions.
 */
async function seed() {
  console.log('[Seed] Starting seeding process...');



  console.log('[Seed] Creating demo organization...');
  const { org, apiKey } = await createOrganization('Demo Corp');
  console.log(`  → Org:     ${org.id} (${org.name})`);
  console.log(`  → API Key: ${apiKey}`);

  console.log('[Seed] Creating demo agent...');
  const agent = await createAgent({
    orgId: org.id,
    name: 'invoice-processor',
    model: 'gpt-4',
    version: '1.0.0',
    metadata: { purpose: 'Process and read Stripe invoices' },
    createdBy: 'seed-script',
  });
  console.log(`  → Agent: ${agent.id} (${agent.name})`);

  console.log('[Seed] Creating sub-agent...');
  const subAgent = await createAgent({
    orgId: org.id,
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
    org.id,
    'stripe',
    'sk_test_fake_stripe_key_12345',
    'Stripe Test',
  );
  const gmailCred = await storeCredential(
    org.id,
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
  await grantPermission(subAgent.id, 'gmail', 'send'); // Sub-agent only gets email
  console.log('  → invoice-processor: stripe:invoices:read, stripe:invoices:list, gmail:send');
  console.log('  → email-notifier:    gmail:send');

  console.log('\n[Seed] ✅ Seed complete! Save this API key to test:\n');
  console.log(`  API_KEY=${apiKey}\n`);
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('[Seed] ❌ Failed:', err);
    process.exit(1);
  });
