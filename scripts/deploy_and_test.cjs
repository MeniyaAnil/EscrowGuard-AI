const { createClient, createAccount, chains, parseEther } = require('genlayer-js');
const fs = require('fs');

async function main() {
  console.log('Connecting to GenLayer Studionet (Chain 61999)...');
  const account = createAccount();
  const client = createClient({ chain: chains.studionet, account });
  console.log('Deployer account:', account.address);

  // Connect WebSocket to capture deployed_contract event
  const ws = new WebSocket('wss://studio.genlayer.com/ws');
  let contractAddress = null;

  await new Promise((resolve) => {
    ws.onopen = () => {
      console.log('WebSocket connected to wss://studio.genlayer.com/ws');
      ws.send(JSON.stringify({ event: 'subscribe', data: [account.address] }));
      resolve();
    };
  });

  ws.onmessage = (event) => {
    try {
      const msg = JSON.parse(event.data);
      if (msg.event === 'deployed_contract' || (msg.data && msg.data.name === 'deployed_contract')) {
        console.log('DEPLOYED_CONTRACT EVENT CAPTURED:', JSON.stringify(msg));
        if (msg.data?.id) contractAddress = msg.data.id;
        else if (msg.data?.data?.id) contractAddress = msg.data.data.id;
      }
    } catch (e) {}
  };

  const code = fs.readFileSync('contracts/escrow_guard.py', 'utf8');
  console.log('Deploying contracts/escrow_guard.py to Studionet...');
  const deployTxHash = await client.deployContract({ code, args: [] });
  console.log('Deploy Transaction Hash:', deployTxHash);
  ws.send(JSON.stringify({ event: 'subscribe', data: [deployTxHash] }));

  console.log('Waiting for deployment consensus finalization...');
  const receipt = await client.waitForTransactionReceipt({
    hash: deployTxHash,
    status: 'FINALIZED'
  });
  console.log('Deployment finalized! Result:', receipt.result_name);

  // Give WS a moment to deliver deployed_contract payload
  await new Promise(r => setTimeout(r, 4000));
  ws.close();

  console.log('\n--- Deployment Summary ---');
  console.log('Deploy Tx:', deployTxHash);
  console.log('Contract Address:', contractAddress);
}

main().catch(console.error);
