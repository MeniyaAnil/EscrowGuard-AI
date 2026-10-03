const { createClient, createAccount, chains } = require('genlayer-js');
const fs = require('fs');

async function main() {
  console.log('================================================================');
  console.log('   GENHUB AI - FULL DEPLOYMENT & LIFECYCLE ON GENLAYER STUDIONET');
  console.log('================================================================');

  const deployer = createAccount();
  const clientAccount = createAccount();
  const freelancerAccount = createAccount();

  console.log('Deployer Address:  ', deployer.address);
  console.log('Client Address:    ', clientAccount.address);
  console.log('Freelancer Address:', freelancerAccount.address);

  const deployerClient = createClient({ chain: chains.studionet, account: deployer });
  const client = createClient({ chain: chains.studionet, account: clientAccount });
  const freelancerClient = createClient({ chain: chains.studionet, account: freelancerAccount });

  // 1. Subscribe to WebSocket to capture deployed contract address
  const ws = new WebSocket('wss://studio.genlayer.com/ws');
  let contractAddress = null;

  await new Promise((resolve) => {
    ws.onopen = () => {
      console.log('\n[WebSocket] Connected to wss://studio.genlayer.com/ws');
      ws.send(JSON.stringify({ event: 'subscribe', data: [deployer.address] }));
      resolve();
    };
  });

  ws.onmessage = (event) => {
    try {
      const msg = JSON.parse(event.data);
      if (msg.event === 'deployed_contract' || (msg.data && msg.data.name === 'deployed_contract')) {
        console.log('[WebSocket] DEPLOYED_CONTRACT EVENT:', JSON.stringify(msg));
        if (msg.data?.id) contractAddress = msg.data.id;
        else if (msg.data?.data?.id) contractAddress = msg.data.data.id;
      }
    } catch (e) {}
  };

  // 2. Deploy Contract
  const code = fs.readFileSync('contracts/escrow_guard.py', 'utf8');
  console.log('\n--- PHASE 1: Deploying GenHubEscrow Contract ---');
  const deployTxHash = await deployerClient.deployContract({ code, args: [] });
  console.log('Deploy Tx Broadcasted:', deployTxHash);
  ws.send(JSON.stringify({ event: 'subscribe', data: [deployTxHash] }));

  console.log('Waiting for deployment finalization...');
  const deployReceipt = await deployerClient.waitForTransactionReceipt({
    hash: deployTxHash,
    status: 'FINALIZED',
    retries: 60,
    interval: 2000
  });
  console.log('Deployment Finalized! Result:', deployReceipt.result_name);

  // Fallback to tx.recipient or tx.to_address if WS was slow
  if (!contractAddress) {
    const txObj = await deployerClient.getTransaction({ hash: deployTxHash });
    contractAddress = txObj.recipient || txObj.to_address;
  }
  console.log('✅ Deployed Contract Address:', contractAddress);

  if (!contractAddress) {
    throw new Error('Failed to resolve deployed contract address!');
  }

  // 3. Initial State Check
  console.log('\n--- Checking Initial State ---');
  const initialCount = await client.readContract({
    address: contractAddress,
    functionName: 'get_escrow_count',
    args: []
  });
  console.log('Initial Escrow Count:', initialCount.toString());

  // 4. Create Escrow (Deposit 1 GEN)
  console.log('\n--- PHASE 2: create_escrow (Deposit 1 GEN) ---');
  const title = 'GenLayer Intelligent Contract Integration';
  const requirements = 'Implement decentralized AI validator consensus with Equivalence Principle and web deliverable proof.';
  
  const createTxHash = await client.writeContract({
    address: contractAddress,
    functionName: 'create_escrow',
    args: [freelancerAccount.address, title, requirements],
    value: 1000000000000000000n // 1 GEN
  });
  console.log('create_escrow Tx Broadcasted:', createTxHash);
  console.log('Waiting for finalization...');
  const createReceipt = await client.waitForTransactionReceipt({
    hash: createTxHash,
    status: 'FINALIZED',
    retries: 60,
    interval: 2000
  });
  console.log('create_escrow Finalized! Result:', createReceipt.result_name);

  const postCreateCount = await client.readContract({
    address: contractAddress,
    functionName: 'get_escrow_count',
    args: []
  });
  console.log('Escrow Count after create:', postCreateCount.toString());

  const escrowAfterCreate = await client.readContract({
    address: contractAddress,
    functionName: 'get_escrow',
    args: [1n]
  });
  console.log('Escrow 1 State (FUNDED):', escrowAfterCreate);

  // 5. Submit Delivery (by designated Freelancer)
  console.log('\n--- PHASE 3: submit_delivery (Freelancer Submits Proof) ---');
  const deliveryUrl = 'https://raw.githubusercontent.com/genlayerlabs/genlayer-project-boilerplate/main/README.md';
  const deliveryNotes = 'Completed deliverable with pinned GenVM v0.6 runner, strict Equivalence Principle non-deterministic consensus, and automated test suite.';

  const submitTxHash = await freelancerClient.writeContract({
    address: contractAddress,
    functionName: 'submit_delivery',
    args: [1n, deliveryUrl, deliveryNotes]
  });
  console.log('submit_delivery Tx Broadcasted:', submitTxHash);
  console.log('Waiting for finalization...');
  const submitReceipt = await freelancerClient.waitForTransactionReceipt({
    hash: submitTxHash,
    status: 'FINALIZED',
    retries: 60,
    interval: 2000
  });
  console.log('submit_delivery Finalized! Result:', submitReceipt.result_name);

  const escrowAfterSubmit = await client.readContract({
    address: contractAddress,
    functionName: 'get_escrow',
    args: [1n]
  });
  console.log('Escrow 1 State (SUBMITTED):', escrowAfterSubmit);

  // 6. Adjudicate Escrow (AI Validator Jury Consensus)
  console.log('\n--- PHASE 4: adjudicate_escrow (Decentralized AI Jury Consensus) ---');
  const adjudicateTxHash = await client.writeContract({
    address: contractAddress,
    functionName: 'adjudicate_escrow',
    args: [1n]
  });
  console.log('adjudicate_escrow Tx Broadcasted:', adjudicateTxHash);
  console.log('Waiting for validator jury consensus finalization...');
  const adjudicateReceipt = await client.waitForTransactionReceipt({
    hash: adjudicateTxHash,
    status: 'FINALIZED',
    retries: 60,
    interval: 3000
  });
  console.log('adjudicate_escrow Finalized! Result:', adjudicateReceipt.result_name);

  // 7. Final State Verification
  console.log('\n--- PHASE 5: Final State Verification ---');
  const finalEscrow = await client.readContract({
    address: contractAddress,
    functionName: 'get_escrow',
    args: [1n]
  });
  console.log('Final Escrow 1 Status: ', finalEscrow.status);
  console.log('Final Escrow 1 Verdict:', finalEscrow.verdict);
  console.log('Final Escrow 1 Score:  ', finalEscrow.verdict_score?.toString());

  ws.close();

  console.log('\n================================================================');
  console.log('              ALL TRANSACTIONS SUCCESSFULLY FINALIZED!          ');
  console.log('================================================================');
  console.log('Contract Address:   ', contractAddress);
  console.log('Deploy Tx:          ', deployTxHash);
  console.log('Create Escrow Tx:   ', createTxHash);
  console.log('Submit Delivery Tx: ', submitTxHash);
  console.log('Adjudicate/Payout:  ', adjudicateTxHash);
  console.log('================================================================\n');

  // Write deployment data to JSON file
  const summary = {
    network: 'GenLayer Studionet',
    chainId: 61999,
    contractAddress,
    deployTx: deployTxHash,
    createTx: createTxHash,
    submitTx: submitTxHash,
    adjudicateTx: adjudicateTxHash,
    escrowState: {
      status: finalEscrow.status,
      verdict: finalEscrow.verdict,
      score: finalEscrow.verdict_score?.toString()
    },
    explorerUrls: {
      contract: `https://explorer-studio.genlayer.com/address/${contractAddress}`,
      deployTx: `https://explorer-studio.genlayer.com/tx/${deployTxHash}`,
      createTx: `https://explorer-studio.genlayer.com/tx/${createTxHash}`,
      submitTx: `https://explorer-studio.genlayer.com/tx/${submitTxHash}`,
      adjudicateTx: `https://explorer-studio.genlayer.com/tx/${adjudicateTxHash}`
    }
  };

  fs.writeFileSync('contracts/DEPLOYMENTS.json', JSON.stringify(summary, null, 2));
  console.log('Saved summary to contracts/DEPLOYMENTS.json');
}

main().catch(err => {
  console.error('\n❌ Execution Error:', err);
  process.exit(1);
});
