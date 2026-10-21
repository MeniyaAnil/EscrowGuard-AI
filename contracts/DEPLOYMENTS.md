# 🚀 GenHub AI - On-Chain Deployments & Transaction Proofs

> **Official Evidence Document for GenLayer Stewards & Points Portal Review**  
> **Target Track:** Builder · Projects (Points Allocation: 20–4,000 pts)  
> **Network:** GenLayer Studionet (Chain ID `61999`)  
> **Live DApp:** [https://genhub-ai.vercel.app](https://genhub-ai.vercel.app)  
> **GitHub Repository:** [https://github.com/MeniyaAnil/EscrowGuard-AI](https://github.com/MeniyaAnil/EscrowGuard-AI)

---

## 📌 Deployed Intelligent Contract Specifications

- **Contract Name:** `GenHubEscrow`
- **Source File:** [`contracts/escrow_guard.py`](./escrow_guard.py)
- **Pinned GenVM Runner:** `# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }`
- **Network Name:** GenLayer Studio Network (Studionet)
- **Chain ID:** `61999` (`0xf22f`)
- **RPC URL:** `https://studio.genlayer.com/api`
- **Block Explorer:** [https://explorer-studio.genlayer.com/](https://explorer-studio.genlayer.com/)
- **Canonical Deployed Contract Address:**  
  [`0x58078Acaf7D3ea7d5c11547Cc92A8cC9fFB6F1a0`](https://explorer-studio.genlayer.com/address/0x58078Acaf7D3ea7d5c11547Cc92A8cC9fFB6F1a0)

---

## 🏛️ End-to-End On-Chain Lifecycle Evidence

Every step of the autonomous milestone escrow lifecycle has been executed and finalized on GenLayer Studionet under decentralized validator jury consensus (`MAJORITY_AGREE`, Status `7` / `FINALIZED`).

| # | Lifecycle Step | Function Name | Transaction Hash | Consensus Result | On-Chain State | Explorer Link |
|---|----------------|---------------|------------------|------------------|----------------|---------------|
| 1 | **Contract Deployment** | `deployContract()` | `0xaed6bca96745aa5c4a242327eb64483d2eaf09b78abf75f69c73b0af39ccdde7` | `MAJORITY_AGREE` | Contract Initialized (`count = 0`) | [View on Explorer](https://explorer-studio.genlayer.com/tx/0xaed6bca96745aa5c4a242327eb64483d2eaf09b78abf75f69c73b0af39ccdde7) |
| 2 | **Escrow Creation & Deposit** | `create_escrow` | `0x8d7f56ebba877d1ce6f8922d93ef44d700b6814b3114aa8042d78f6d42006f80` | `MAJORITY_AGREE` | Locked `1.0 GEN` deposit (`status: FUNDED`) | [View on Explorer](https://explorer-studio.genlayer.com/tx/0x8d7f56ebba877d1ce6f8922d93ef44d700b6814b3114aa8042d78f6d42006f80) |
| 3 | **Deliverable Submission** | `submit_delivery` | `0x7ed047de7c8340ece83fdf3f3feec661235b9984b1d8940df1add7f79e6b5a67` | `MAJORITY_AGREE` | Stored live web proof URL (`status: SUBMITTED`) | [View on Explorer](https://explorer-studio.genlayer.com/tx/0x7ed047de7c8340ece83fdf3f3feec661235b9984b1d8940df1add7f79e6b5a67) |
| 4 | **Decentralized AI Jury Adjudication** | `adjudicate_escrow` | `0x5771f402fe56e4967954aca7a94abd93205a518bfe3f1468738f643bf7df1d29` | `MAJORITY_AGREE` | Chunked evaluation passed, released payout to freelancer (`status: RELEASED`) | [View on Explorer](https://explorer-studio.genlayer.com/tx/0x5771f402fe56e4967954aca7a94abd93205a518bfe3f1468738f643bf7df1d29) |

---

## 🧠 Real On-Chain AI Jury Verdict (Escrow #1)

- **Escrow ID:** `1`
- **Milestone Title:** `Autonomous Security Audit & Prompt Hardening`
- **Requirements:** `Provide verified automated test suites with chunked evaluation and prompt injection resistance.`
- **Deliverable URL:** `https://raw.githubusercontent.com/MeniyaAnil/EscrowGuard-AI/main/README.md`
- **Final Consensus Score:** `78 / 100` (Threshold: 60)
- **Final Status:** **`RELEASED`**
- **Native Transfer:** `1.0 GEN` emitted from contract balance to freelancer address (`0x325890338CCe2FeD41c0bc19b0E2807172a1496A`).
- **Official Jury Consensus Verdict Text:**
  > *"Approved (78/100): Chunk 1: The submitted README evidence partially satisfies the contract requirements for verified automated test suites with chunked evaluation and prompt-injection resistance. Evidence of prompt-injection defense is well-documented: the contract implements XML delimiter isolation, mandatory security directives, evidence boundary telemetry, and dual-window chunked sampling... Chunk 2: This is chunk 2 of 2 of the README evidence. The content describes: (1) automated test suite commands ('npm test' and 'python tests/test_prompt_injection.py'), indicating test suites exist; (2) explicit prompt injection defense mechanisms including delimiter-based isolation of untrusted evidence and validator instructions to ignore embedded instructions; (3) chunked evaluation is referenced implicitly via the GenLayer contract structure... Score reflects that documentation of the required features is present and credible..."*

---

## ⚡ Instant Steward Verification Commands

Any steward can immediately verify this contract on Studionet in Node.js using `genlayer-js`:

```javascript
const { createClient, chains } = require('genlayer-js');
const client = createClient({ chain: chains.studionet });
const CONTRACT_ADDRESS = '0x58078Acaf7D3ea7d5c11547Cc92A8cC9fFB6F1a0';

// 1. Query Total Escrows
const count = await client.readContract({
  address: CONTRACT_ADDRESS,
  functionName: 'get_escrow_count',
  args: []
});
console.log('Total Escrows:', count); // Returns 1

// 2. Query Escrow #1 State & Jury Verdict
const escrow = await client.readContract({
  address: CONTRACT_ADDRESS,
  functionName: 'get_escrow',
  args: [1n]
});
console.log('Escrow #1:', escrow);
// Returns: status: 'RELEASED', verdict_score: 78, full chunked evaluation verdict text
```
