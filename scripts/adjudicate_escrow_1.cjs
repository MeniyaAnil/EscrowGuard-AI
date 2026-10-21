const { createClient, createAccount, chains } = require('genlayer-js');

async function main() {
  const CONTRACT_ADDRESS = '0x58078Acaf7D3ea7d5c11547Cc92A8cC9fFB6F1a0';
  const clientAccount = createAccount();
  const client = createClient({ chain: chains.studionet, account: clientAccount });

  console.log('Sending adjudicate_escrow transaction for Escrow #1...');
  const txHash = await client.writeContract({
    address: CONTRACT_ADDRESS,
    functionName: 'adjudicate_escrow',
    args: [1n]
  });
  console.log('Adjudicate Transaction Hash:', txHash);
  console.log('Waiting for AI validator consensus...');

  // Poll until finalized (status === 7 or success)
  let finalized = false;
  let attempts = 0;
  while (!finalized && attempts < 40) {
    await new Promise(r => setTimeout(r, 4000));
    attempts++;
    try {
      const tx = await client.getTransaction({ hash: txHash });
      console.log(`[Attempt ${attempts}] Tx status:`, tx?.status);
      if (tx?.status === 7) {
        finalized = true;
        break;
      }
    } catch (e) {}
  }

  const escrow = await client.readContract({
    address: CONTRACT_ADDRESS,
    functionName: 'get_escrow',
    args: [1n]
  });

  console.log('\n--- FINAL ADJUDICATED STATE ---');
  console.log('Tx Hash:', txHash);
  console.log('Status:', escrow.status);
  console.log('Score:', escrow.verdict_score.toString());
  console.log('Verdict:', escrow.verdict);
}

main().catch(console.error);
