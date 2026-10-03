# 🛡️ GenHub AI

> **Autonomous Freelance Milestone & Deliverable Escrow on GenLayer**  
> *Trustless dispute adjudication powered by GenLayer Intelligent Contracts, native web rendering, and decentralized AI validator consensus.*

[![GenLayer Bradbury](https://img.shields.io/badge/Network-GenLayer%20Bradbury%20Testnet-blue.svg)](https://genlayer.com)
[![Live Demo](https://img.shields.io/badge/Live%20DApp-genhub--ai.vercel.app-emerald.svg)](https://genhub-ai.vercel.app)
[![GenVM](https://img.shields.io/badge/Execution-GenVM%20Python-3776AB.svg)](https://studio.genlayer.com)
[![Consensus](https://img.shields.io/badge/Consensus-Optimistic%20Democracy-9333ea.svg)](https://genlayer.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 📌 Executive Summary

Traditional freelance platforms (Upwork, Fiverr) rely on slow, expensive, and opaque centralized support staff to resolve milestone disputes. Web3 smart contracts on standard EVM chains cannot natively read the internet or evaluate non-deterministic deliverables like source code, documentation, or deployed applications.

**GenHub AI** solves this by leveraging **GenLayer's Intelligent Contracts**. Clients lock escrow funds with plain-English acceptance criteria. When the freelancer delivers the work, GenLayer's AI validator jury:
1. Directly inspects the deliverable URL (GitHub PR, commit, live demo) using `gl.nondet.web.render()`.
2. Evaluates compliance against contractual criteria using `gl.nondet.exec_prompt()`.
3. Reaches consensus across independent LLM nodes via the **Equivalence Principle**.
4. Automatically releases payment or issues a refund on-chain with zero human mediation.

---

## 🚀 Live Verified Deployment (GenLayer Studionet)

> **Verified Intelligent Contract Address:**  
> [`0x2b58A537E2050D27F65DB8803508d05B1D712B75`](https://explorer-studio.genlayer.com/address/0x2b58A537E2050D27F65DB8803508d05B1D712B75)

### 📊 End-to-End On-Chain Transaction Evidence

| Phase | Action | Transaction Hash | Consensus Verdict | On-Chain State | Explorer Link |
|:--- |:---|:---|:---|:---|:---|
| 1 | **Contract Deployment** | `0x1fde04b61913bdd791370675d1719ed9a382ede3dce2f030ef2ff9bf739b859e` | `MAJORITY_AGREE` | Contract Initialized | [Inspect](https://explorer-studio.genlayer.com/tx/0x1fde04b61913bdd791370675d1719ed9a382ede3dce2f030ef2ff9bf739b859e) |
| 2 | **Create Escrow (Deposit 1 GEN)** | `0x44e704d2258b9f4446a196c1af75d11504913c80fa5c136ef5b44cedb0ba081d` | `MAJORITY_AGREE` | Status: `FUNDED` | [Inspect](https://explorer-studio.genlayer.com/tx/0x44e704d2258b9f4446a196c1af75d11504913c80fa5c136ef5b44cedb0ba081d) |
| 3 | **Submit Delivery (Web Proof)** | `0xaaf361e96bdcff0ae5764ba768714eee8d2e5ed8b1cb52ef795fb89464ba1315` | `MAJORITY_AGREE` | Status: `SUBMITTED` | [Inspect](https://explorer-studio.genlayer.com/tx/0xaaf361e96bdcff0ae5764ba768714eee8d2e5ed8b1cb52ef795fb89464ba1315) |
| 4 | **AI Jury Adjudication & Payout** | `0xe248524dbfdd39475cb30388d1108ed9dd7f6936528c65ae1c97105e619ee29b` | `MAJORITY_AGREE` | Status: `RELEASED` (Score 82) | [Inspect](https://explorer-studio.genlayer.com/tx/0xe248524dbfdd39475cb30388d1108ed9dd7f6936528c65ae1c97105e619ee29b) |

Full documentation and verification scripts are available in [`contracts/DEPLOYMENTS.md`](./contracts/DEPLOYMENTS.md).

---

## 🏛️ Architecture & Flow

```mermaid
sequenceDiagram
    autonumber
    actor Client as 👤 Client
    participant Contract as 📜 GenHub Intelligent Contract
    actor Freelancer as 💻 Freelancer
    participant GenLayerWeb as 🌐 GenLayer Native Web (gl.nondet.web)
    participant Jury as 🧠 5 AI Validator Nodes (gl.nondet.exec_prompt)

    Client->>Contract: create_escrow(freelancer, title, criteria) [@gl.public.write.payable with msg.value]
    Note over Contract: Real GEN Funds Locked in Contract Balance
    Freelancer->>Contract: submit_delivery(escrow_id, pr_url, notes)
    Note over Contract: Status: SUBMITTED
    Contract->>GenLayerWeb: Fetch live evidence from PR / URL
    GenLayerWeb-->>Contract: Clean text / screenshot evidence
    Contract->>Jury: Adjudication Prompt (Criteria vs Evidence)
    Note over Jury: 5 Independent LLMs vote (Claude, Llama, Mistral, GPT, DeepSeek)
    Jury-->>Contract: Optimistic Consensus (Score >= 60)
    alt Approved by Consensus
        Contract->>Freelancer: _Recipient(freelancer).emit_transfer(value=amount)
        Note over Contract: Status: RELEASED (Native Payout)
    else Rejected by Consensus
        Contract->>Client: _Recipient(client).emit_transfer(value=amount)
        Note over Contract: Status: REFUNDED (Native Refund)
    end
```

---

## ⚡ GenLayer Superpowers Leveraged

| Feature | Standard EVM / Solidity | GenLayer Intelligent Contract |
| :--- | :--- | :--- |
| **Language** | Solidity / Vyper (Deterministic only) | Python (`genlayer` SDK) |
| **Web Connectivity** | Impossible without centralized Oracles | Native direct web scraping (`gl.nondet.web.render`) |
| **Milestone Review** | Centralized manual arbitration | Decentralized 5-juror LLM consensus (`gl.nondet.exec_prompt`) |
| **Consensus Protocol** | Proof-of-Stake / Proof-of-Work | **Optimistic Democracy & Equivalence Principle** |
| **Dispute Cost** | High arbitration fees ($50-$500) | Zero arbitration fees (On-chain AI consensus) |

---

## 📂 Repository Structure

```
GenHub AI/
├── contracts/
│   ├── escrow_guard.py     # Production GenLayer Python Intelligent Contract
│   └── README.md           # Contract deployment & testing documentation
├── src/
│   ├── App.tsx             # Cyberpunk Web3 DApp with live AI Jury Simulator
│   ├── main.tsx            # Vite entry point
│   └── index.css           # Tailwind CSS directives & custom styling
├── public/                 # Static assets & icons
├── tailwind.config.js      # Custom theme colors & breakpoints
├── vite.config.ts          # Vite configuration
└── package.json            # Node.js dependencies
```

---

## 🚀 Getting Started

### 1. Run the Frontend Locally

```bash
# Clone the repository
git clone https://github.com/MeniyaAnil/EscrowGuard-AI.git
cd "EscrowGuard AI"

# Install dependencies
npm install

# Start local development server
npm run dev
```

### 2. Deploy Contract to GenLayer Studio

1. Navigate to [GenLayer Studio](https://studio.genlayer.com).
2. Connect your wallet to the **GenLayer Bradbury Testnet**.
3. Create a new file in Studio named `escrow_guard.py`.
4. Copy and paste the contents from [`contracts/escrow_guard.py`](./contracts/escrow_guard.py).
5. In the **Run & Debug** tab, select `GenHubEscrow` and click **Deploy**.
6. Interact with `create_escrow`, `submit_delivery`, and `adjudicate_escrow` directly in the Studio simulator.

---

## 🛡️ Security & Prompt Injection Defenses

Because GenLayer Intelligent Contracts process arbitrary internet content, `escrow_guard.py` incorporates strict safeguards:
- **SSRF Hardening**: Only valid HTTP/HTTPS schemes permitted.
- **Prompt Injection Defense**: Evaluator system prompts explicitly isolate untrusted web evidence within delimiters and instruct validators to ignore embedded instructions.
- **Bounded Inputs**: Payload length limits prevent context window overflow attacks.

---

## 📜 License
MIT License. Built for the **GenLayer Points Portal & Builder Track**.
