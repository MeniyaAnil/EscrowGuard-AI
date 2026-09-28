# GenHub AI - Intelligent Contracts

This directory contains the production Python Intelligent Contract for **GenHub AI**, designed to run on the **GenLayer Studionet** (Chain ID: 61999) and **GenLayer Bradbury Testnet**.

## Contract Overview: `escrow_guard.py`

`escrow_guard.py` implements a trustless, decentralized milestone escrow protocol that replaces centralized dispute platforms (like Upwork or Fiverr dispute teams) with GenLayer's decentralized AI validator jury.

### Key Capabilities & On-Chain Mechanics:
1. **Real Native Value Holding (`@gl.public.write.payable`)**:
   - `create_escrow(freelancer, title, requirements)` accepts native GEN sent via `gl.message.value`.
   - The contract holds the staked GEN balance directly in `self.balance`.
2. **Native Web Proof Inspection (`gl.nondet.web.render`)**:
   - The contract directly accesses the live internet from validator nodes to inspect submitted GitHub PRs, commits, and web URLs.
3. **Decentralized AI Adjudication (`gl.nondet.exec_prompt`)**:
   - 5 independent validator LLM nodes evaluate the proof against agreed requirements using the Equivalence Principle.
4. **On-Chain Value Distribution (`_Recipient.emit_transfer`)**:
   - **Upon Approval (`score >= 60`)**: The contract triggers `_Recipient(Address(freelancer)).emit_transfer(value=amount)` to transfer the held GEN directly to the freelancer.
   - **Upon Rejection (`score < 60`)**: The contract triggers `_Recipient(Address(client)).emit_transfer(value=amount)` to automatically refund the held GEN to the client.
   - **Manual Options**: Includes `manual_release` for clients and `manual_refund` for mutual cancellation.
5. **Real Contract State Getters**:
   - `get_escrow(escrow_id: int) -> dict`
   - `get_all_escrows() -> list[dict]`
   - `get_escrow_count() -> int`
   - `get_contract_balance() -> u256`

## How to Deploy in GenLayer Studio

1. Open [GenLayer Studio](https://studio.genlayer.com).
2. Connect your wallet (Rabby or MetaMask on GenLayer Studionet / Bradbury).
3. Create a new file named `escrow_guard.py` in the Studio editor and paste the contract code.
4. In the **Run & Debug** panel, select `GenHubEscrow` and click **Deploy**.
5. Copy the deployed contract address and plug it into your frontend.
