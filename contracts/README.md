# GenHub AI - Intelligent Contracts

This directory contains the Python Intelligent Contract for **GenHub AI**, designed to run on the **GenLayer Bradbury Testnet** and **GenLayer Studio**.

## Contract Overview
`escrow_guard.py` implements a trustless, decentralized milestone escrow protocol that replaces centralized dispute platforms (like Upwork or Fiverr dispute teams) with GenLayer's decentralized AI validator jury.

### Key Capabilities:
- **Natural Language Milestones**: Clients specify acceptance criteria in plain human language.
- **Native Web Proof Inspection**: The contract calls `gl.nondet.web.render()` directly from validator nodes to inspect live GitHub PRs, commits, or web URLs.
- **Decentralized AI Adjudication**: 5 independent AI validator nodes evaluate the proof against agreed requirements using `gl.nondet.exec_prompt()`.
- **Equivalence Principle & Consensus**: If a majority of validators reach consensus that criteria are fulfilled, staked funds are released automatically to the freelancer without human mediation.

## How to Deploy in GenLayer Studio

1. Open [GenLayer Studio](https://studio.genlayer.com).
2. Connect your wallet (e.g. MetaMask on GenLayer Bradbury Testnet).
3. Create a new file named `escrow_guard.py` in the Studio editor and paste the contract code.
4. In the **Run & Debug** panel, click **Deploy**.
5. Copy the deployed contract address and set it in your frontend configuration.
