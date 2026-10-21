const { createClient, createAccount, chains, parseEther } = require('genlayer-js');

async function main() {
  const CONTRACT_ADDRESS = '0x58078Acaf7D3ea7d5c11547Cc92A8cC9fFB6F1a0';
  console.log('Interacting with upgraded contract:', CONTRACT_ADDRESS);

  const clientAccount = createAccount();
  const freelancerAccount = createAccount();
  console.log('Client address:', clientAccount.address);
  console.log('Freelancer address:', freelancerAccount.address);

  const client = createClient({ chain: chains.studionet, account: clientAccount });
  const freelancer = createClient({ chain: chains.studionet, account: freelancerAccount });

  // 1. Create Escrow with 1 GEN deposit
  console.log('\n[1/3] Creating escrow with 1 GEN deposit...');
  const createTxHash = await client.writeContract({
    address: CONTRACT_ADDRESS,
    functionName: 'create_escrow',
    args: [
      freelancerAccount.address,
      'Autonomous Security Audit & Prompt Hardening',
      'Provide verified automated test suites with chunked evaluation and prompt injection resistance.'
    ],
    value: 1000000000000000000n
  });
  console.log('Create Escrow Tx Hash:', createTxHash);
  const createReceipt = await client.waitForTransactionReceipt({ hash: createTxHash, status: 'FINALIZED' });
  console.log('Create Escrow Consensus Result:', createReceipt.result_name);

  // 2. Submit Delivery
  console.log('\n[2/3] Submitting deliverable...');
  const submitTxHash = await freelancer.writeContract({
    address: CONTRACT_ADDRESS,
    functionName: 'submit_delivery',
    args: [
      1n,
      'https://raw.githubusercontent.com/MeniyaAnil/EscrowGuard-AI/main/README.md',
      'Completed production implementation of chunked evaluator, prompt-injection defense, and test suites.'
    ]
  });
  console.log('Submit Delivery Tx Hash:', submitTxHash);
  const submitReceipt = await freelancer.waitForTransactionReceipt({ hash: submitTxHash, status: 'FINALIZED' });
  console.log('Submit Delivery Consensus Result:', submitReceipt.result_name);

  // 3. Adjudicate Escrow (AI Jury Consensus)
  console.log('\n[3/3] Running AI Jury Adjudication...');
  const adjTxHash = await client.writeContract({
    address: CONTRACT_ADDRESS,
    functionName: 'adjudicate_escrow',
    args: [1n]
  });
  console.log('Adjudicate Escrow Tx Hash:', adjTxHash);
  const adjReceipt = await client.waitForTransactionReceipt({ hash: adjTxHash, status: 'FINALIZED' });
  console.log('Adjudication Consensus Result:', adjReceipt.result_name);

  // 4. Query Final Escrow State
  const escrowState = await client.readContract({
    address: CONTRACT_ADDRESS,
    functionName: 'get_escrow',
    args: [1n]
  });
  console.log('\n--- FINAL SETTLED ON-CHAIN ESCROW #1 ---');
  console.log('Status:', escrowState.status);
  console.log('Verdict Score:', escrowState.verdict_score.toString());
  console.log('Verdict:', escrowState.verdict);

  console.log('\n--- SUMMARY FOR DOCUMENTATION ---');
  console.log('Contract Address:', CONTRACT_ADDRESS);
  console.log('Deploy Tx:', '0xaed6bca96745aa5c4a242327eb64483d2eaf09b78abf75f69c73b0af39ccdde7');
  console.log('Create Escrow Tx:', createTxHash);
  console.log('Submit Delivery Tx:', submitTxHash);
  console.log('Adjudicate Escrow Tx:', adjTxHash);
}

main().catch(console.error);
