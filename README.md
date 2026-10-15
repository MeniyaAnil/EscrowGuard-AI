# 🛡️ EscrowGuard AI

> **Autonomous Freelance Milestone & Deliverable Escrow on GenLayer**  
> *Trustless dispute adjudication powered by GenLayer Intelligent Contracts, native web rendering, and decentralized AI validator consensus.*

[![GenLayer Bradbury](https://img.shields.io/badge/Network-GenLayer%20Bradbury%20Testnet-blue.svg)](https://genlayer.com)
[![Live Demo](https://img.shields.io/badge/Live%20DApp-escrowguard--ai.vercel.app-emerald.svg)](https://escrowguard-ai.vercel.app)
[![Live Mirror](https://img.shields.io/badge/Live%20Mirror-genhub--ai.vercel.app-blue.svg)](https://genhub-ai.vercel.app)
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

---

## 🌐 Production Deployments & Canonical Access

- **Canonical Deployed DApp:** [`https://genhub-ai.vercel.app`](https://genhub-ai.vercel.app) *(Official entry point with strict HTTP security headers, anti-clickjacking, and zero unprompted wallet access)*
- **Mirror / Secondary Alias:** [`https://escrowguard-ai.vercel.app`](https://escrowguard-ai.vercel.app)
- **GitHub Repository:** [`https://github.com/MeniyaAnil/EscrowGuard-AI`](https://github.com/MeniyaAnil/EscrowGuard-AI)

---

## 🚀 Live Upgraded Intelligent Contract (GenLayer Studionet)

> **Verified Prompt-Hardened Contract Address:**  
> [`0xC96D7F9ddBE2E17E912aFd857D6Ae197E6B247cC`](https://explorer-studio.genlayer.com/address/0xC96D7F9ddBE2E17E912aFd857D6Ae197E6B247cC)

### 📊 End-to-End On-Chain Transaction Evidence (Upgraded Contract)

| Phase | Action | Transaction Hash | Consensus Verdict | On-Chain State | Explorer Link |
|:--- |:---|:---|:---|:---|:---|
| 1 | **Contract Deployment** | `0xded3dc5b5276676ac61e4e0a60b82aec72ce52da8c62384f1f23e356a1c03379` | `MAJORITY_AGREE` | Contract Initialized | [Inspect](https://explorer-studio.genlayer.com/tx/0xded3dc5b5276676ac61e4e0a60b82aec72ce52da8c62384f1f23e356a1c03379) |
| 2 | **Create Escrow (Deposit 1 GEN)** | `0xbb913455554e501c80f2aa61631a670bb867bacf2dc2fdeaa0aa4c62bc9aa6e5` | `MAJORITY_AGREE` | Status: `FUNDED` | [Inspect](https://explorer-studio.genlayer.com/tx/0xbb913455554e501c80f2aa61631a670bb867bacf2dc2fdeaa0aa4c62bc9aa6e5) |
| 3 | **Submit Delivery (Web Proof)** | `0x6e1ab6213c1cba840e6143166537708ee90d52c3ac6fdaa8783c6d054e0392e5` | `MAJORITY_AGREE` | Status: `SUBMITTED` | [Inspect](https://explorer-studio.genlayer.com/tx/0x6e1ab6213c1cba840e6143166537708ee90d52c3ac6fdaa8783c6d054e0392e5) |
| 4 | **AI Jury Adjudication (Vigilant Eval)** | `0x8057afb4e1623b89075ef2ebe700b1a825ff090bf98e8d3192ec0fbbe1973799` | `MAJORITY_AGREE` | Status: `REFUNDED` (Score 38) | [Inspect](https://explorer-studio.genlayer.com/tx/0x8057afb4e1623b89075ef2ebe700b1a825ff090bf98e8d3192ec0fbbe1973799) |

---

## 🛡️ Evaluator Security & Prompt-Injection Hardening

The contract implements multi-layer prompt injection protections in `contracts/escrow_guard.py`:
1. **XML Delimiter Isolation & Escaping:** All untrusted web content is encapsulated inside `<UNTRUSTED_EXTERNAL_EVIDENCE>` tags. Any closing tags in user deliverables are replaced with `[ESCAPED_DELIMITER]` to prevent delimiter breakouts.
2. **Mandatory Security Directives:** The system instructions explicitly command the AI validator to treat evidence as passive data and immediately reject (Score 0, `approved: false`) any submission attempting prompt injection.
3. **Evidence Boundary & Dual-Window Telemetry:** Eliminates silent omission beyond 3,000 characters. Text up to 8,000 characters is evaluated in full. For larger documents, dual-boundary sampling preserves both initial architecture/specs (first 5,000 chars) and final test/delivery proofs (last 3,000 chars) with explicit telemetry metadata.
4. **Automated Verification:** Verified by automated test suites in [`tests/test_evaluator_security.cjs`](./tests/test_evaluator_security.cjs) and [`tests/test_prompt_injection.py`](./tests/test_prompt_injection.py).

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

### 2. Run Evaluator Security & Prompt-Injection Tests

```bash
# Run automated evaluator security test suite (Node.js)
npm test

# Or run the Python verification suite
python tests/test_prompt_injection.py
```

### 3. Deploy Contract to GenLayer Studio

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
