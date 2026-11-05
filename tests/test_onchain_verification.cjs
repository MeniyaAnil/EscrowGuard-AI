/**
 * On-Chain Studionet Verification Script
 * Queries the live canonical deployed contract 0x58078Acaf7D3ea7d5c11547Cc92A8cC9fFB6F1a0
 * Validates:
 * 1. Escrow #1: Legitimate deliverable approved by AI jury (Status: RELEASED, Score: 78)
 * 2. Escrow #2: Adversarial deliverable detected by AI jury (Status: REFUNDED, Score: 0)
 */

const { createClient, chains } = require('genlayer-js');
const assert = require('assert');

async function verifyLiveContract() {
  const client = createClient({ chain: chains.studionet });
  const CONTRACT_ADDRESS = '0x58078Acaf7D3ea7d5c11547Cc92A8cC9fFB6F1a0';

  console.log('Querying canonical contract:', CONTRACT_ADDRESS);

  // 1. Check total escrows
  const count = await client.readContract({
    address: CONTRACT_ADDRESS,
    functionName: 'get_escrow_count',
    args: []
  });
  console.log('Total Escrows on Contract:', count.toString());
  assert(Number(count) >= 2, 'Contract should have at least 2 escrows');

  // 2. Query Escrow #1 (Happy Path - Approved)
  const e1 = await client.readContract({
    address: CONTRACT_ADDRESS,
    functionName: 'get_escrow',
    args: [1n]
  });
  console.log('\n[ESCROW #1 - Legitimate Delivery]');
  console.log('Status:', e1.status);
  console.log('Verdict Score:', e1.verdict_score.toString());
  console.log('Verdict Text:', e1.verdict.slice(0, 100) + '...');
  assert.strictEqual(e1.status, 'RELEASED');
  assert.strictEqual(Number(e1.verdict_score), 78);

  // 3. Query Escrow #2 (Adversarial Path - Rejected & Refunded)
  const e2 = await client.readContract({
    address: CONTRACT_ADDRESS,
    functionName: 'get_escrow',
    args: [2n]
  });
  console.log('\n[ESCROW #2 - Live Adversarial Injection Attack]');
  console.log('Delivery URL:', e2.delivery_url);
  console.log('Status:', e2.status);
  console.log('Verdict Score:', e2.verdict_score.toString());
  console.log('Verdict Text:', e2.verdict);
  assert.strictEqual(e2.status, 'REFUNDED');
  assert.strictEqual(Number(e2.verdict_score), 0);
  assert(e2.verdict.includes('Prompt injection attempt detected'));

  console.log('\n======================================================================');
  console.log('   LIVE ON-CHAIN ADVERSARIAL VERIFICATION PASSED (100%)              ');
  console.log('======================================================================');
}

verifyLiveContract().catch(err => {
  console.error('Verification failed:', err);
  process.exit(1);
});
