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
- **Deployed Contract Address:**  
  [`0x2b58A537E2050D27F65DB8803508d05B1D712B75`](https://explorer-studio.genlayer.com/address/0x2b58A537E2050D27F65DB8803508d05B1D712B75)

---

## 🏛️ End-to-End On-Chain Lifecycle Evidence

Every step of the autonomous milestone escrow lifecycle has been executed and finalized on GenLayer Studionet under decentralized validator jury consensus (`MAJORITY_AGREE`).

| # | Lifecycle Step | Function Name | Transaction Hash | Consensus Result | On-Chain State | Explorer Link |
|---|----------------|---------------|------------------|------------------|----------------|---------------|
| 1 | **Contract Deployment** | `deployContract()` | `0x1fde04b61913bdd791370675d1719ed9a382ede3dce2f030ef2ff9bf739b859e` | `MAJORITY_AGREE` | Contract Initialized (`count = 0`) | [View on Explorer](https://explorer-studio.genlayer.com/tx/0x1fde04b61913bdd791370675d1719ed9a382ede3dce2f030ef2ff9bf739b859e) |
| 2 | **Escrow Creation & Deposit** | `create_escrow` | `0x44e704d2258b9f4446a196c1af75d11504913c80fa5c136ef5b44cedb0ba081d` | `MAJORITY_AGREE` | Locked `1.0 GEN` deposit (`status: FUNDED`) | [View on Explorer](https://explorer-studio.genlayer.com/tx/0x44e704d2258b9f4446a196c1af75d11504913c80fa5c136ef5b44cedb0ba081d) |
| 3 | **Deliverable Submission** | `submit_delivery` | `0xaaf361e96bdcff0ae5764ba768714eee8d2e5ed8b1cb52ef795fb89464ba1315` | `MAJORITY_AGREE` | Stored live web proof URL (`status: SUBMITTED`) | [View on Explorer](https://explorer-studio.genlayer.com/tx/0xaaf361e96bdcff0ae5764ba768714eee8d2e5ed8b1cb52ef795fb89464ba1315) |
| 4 | **Decentralized AI Jury Adjudication** | `adjudicate_escrow` | `0xe248524dbfdd39475cb30388d1108ed9dd7f6936528c65ae1c97105e619ee29b` | `MAJORITY_AGREE` | Released payout to freelancer (`status: RELEASED`) | [View on Explorer](https://explorer-studio.genlayer.com/tx/0xe248524dbfdd39475cb30388d1108ed9dd7f6936528c65ae1c97105e619ee29b) |

---

## 🧠 Real On-Chain AI Jury Verdict (Escrow #1)

- **Escrow ID:** `1`
- **Milestone Title:** `GenLayer Intelligent Contract Integration`
- **Requirements:** `Implement decentralized AI validator consensus with Equivalence Principle and web deliverable proof.`
- **Deliverable URL:** `https://raw.githubusercontent.com/genlayerlabs/genlayer-project-boilerplate/main/README.md`
- **Final Consensus Score:** `82 / 100` (Threshold: 60)
- **Final Status:** **`RELEASED`**
- **Native Transfer:** `1.0 GEN` emitted from contract balance to freelancer address (`0xc79D1F8d757A72191035E2D4BCDACc8acb764173`).
- **Official Jury Consensus Verdict Text:**
  > *"Approved (82/100): The deliverable demonstrates a solid GenLayer project implementation with several key requirements met: (1) Decentralized AI validator consensus is implemented via GenLayer's intelligent contract framework with proper GenVM v0.6 runner pinning as noted; (2) Equivalence Principle for non-deterministic consensus is explicitly referenced in the linter rules ('Non-deterministic operations outside equivalence principle blocks') indicating strict enforcement; (3) Web deliverable proof is present via the production-ready Next.js 15 frontend with TypeScript, TanStack Query, and Radix UI; (4) Automated test suite is comprehensive with direct mode tests, integration tests, contract linting, and CI pipeline via GitHub Actions..."*

---

## ⚡ Instant Steward Verification Commands

Any steward can immediately verify this contract on Studionet in Node.js using `genlayer-js`:

```javascript
const { createClient, chains } = require('genlayer-js');
const client = createClient({ chain: chains.studionet });
const CONTRACT_ADDRESS = '0x2b58A537E2050D27F65DB8803508d05B1D712B75';

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
// Returns: status: 'RELEASED', verdict_score: 82, full verdict text
```
