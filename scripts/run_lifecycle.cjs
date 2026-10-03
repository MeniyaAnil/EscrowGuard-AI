const { createClient, createAccount, chains, parseEther } = require('genlayer-js');

const CONTRACT_ADDRESS = '0x5E5327d40182599e3Af3DfAA7fCAcd6E4649cB92';

async function runLifecycle() {
  console.log('=== STARTING GENHUB ESCROW LIFECYCLE ON STUDIONET ===');
  console.log('Target Contract:', CONTRACT_ADDRESS);

  const clientAccount = createAccount();
  const freelancerAccount = createAccount();
  console.log('Client Account:', clientAccount.address);
  console.log('Freelancer Account:', freelancerAccount.address);

  const client = createClient({ chain: chains.studionet, account: clientAccount });
  const freelancerClient = createClient({ chain: chains.studionet, account: freelancerAccount });

  // 1. Create Escrow (Deposit 1 GEN)
  console.log('\n--- Step 1: create_escrow (Deposit 1 GEN) ---');
  const title = 'Smart Contract Audit & Integration';
  const requirements = 'Implement complete Equivalence Principle with independent validator consensus and deliverable inspection.';
  
  const createTxHash = await client.writeContract({
    address: CONTRACT_ADDRESS,
    functionName: 'create_escrow',
    args: [freelancerAccount.address, title, requirements],
    value: parseEther('1')
  });
  console.log('create_escrow Tx Broadcasted:', createTxHash);
  console.log('Waiting for finalization...');
  const createReceipt = await client.waitForTransactionReceipt({
    hash: createTxHash,
    status: 'FINALIZED'
  });
  console.log('create_escrow Finalized! Result:', createReceipt.result_name);

  // Check count
  const count = await client.readContract({
    address: CONTRACT_ADDRESS,
    functionName: 'get_escrow_count',
    args: []
  });
  console.log('Escrow count in contract:', count.toString());

  // 2. Submit Delivery (by designated Freelancer)
  console.log('\n--- Step 2: submit_delivery (by Freelancer) ---');
  const deliveryUrl = 'https://raw.githubusercontent.com/genlayerlabs/genlayer-project-boilerplate/main/README.md';
  const deliveryNotes = 'Completed milestone deliverable. Integrated canonical validator consensus and verified test suite.';

  const submitTxHash = await freelancerClient.writeContract({
    address: CONTRACT_ADDRESS,
    functionName: 'submit_delivery',
    args: [1n, deliveryUrl, deliveryNotes]
  });
  console.log('submit_delivery Tx Broadcasted:', submitTxHash);
  console.log('Waiting for finalization...');
  const submitReceipt = await freelancerClient.waitForTransactionReceipt({
    hash: submitTxHash,
    status: 'FINALIZED'
  });
  console.log('submit_delivery Finalized! Result:', submitReceipt.result_name);

  // 3. Adjudicate Escrow (Decentralized AI Validator Jury Consensus)
  console.log('\n--- Step 3: adjudicate_escrow (Equivalence Principle Jury Consensus) ---');
  const adjudicateTxHash = await client.writeContract({
    address: CONTRACT_ADDRESS,
    functionName: 'adjudicate_escrow',
    args: [1n]
  });
  console.log('adjudicate_escrow Tx Broadcasted:', adjudicateTxHash);
  console.log('Waiting for validator consensus finalization...');
  const adjudicateReceipt = await client.waitForTransactionReceipt({
    hash: adjudicateTxHash,
    status: 'FINALIZED'
  });
  console.log('adjudicate_escrow Finalized! Result:', adjudicateReceipt.result_name);

  // Check finalized escrow state
  const escrow = await client.readContract({
    address: CONTRACT_ADDRESS,
    functionName: 'get_escrow',
    args: [1n]
  });
  console.log('\n=== FINAL ESCROW STATE ===');
  console.log('Status:', escrow.status);
  console.log('Verdict:', escrow.verdict);
  console.log('Score:', escrow.verdict_score.toString());

  console.log('\n=== ALL LIFECYCLE TRANSACTION HASHES ===');
  console.log('Contract Address:', CONTRACT_ADDRESS);
  console.log('Create Escrow Tx:', createTxHash);
  console.log('Submit Delivery Tx:', submitTxHash);
  console.log('Adjudicate & Payout Tx:', adjudicateTxHash);
}

runLifecycle().catch(console.error);
