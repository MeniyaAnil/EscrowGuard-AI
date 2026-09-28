import React, { useState, useEffect, useCallback } from 'react';
import { 
  ShieldCheck, 
  Cpu, 
  ExternalLink, 
  PlusCircle, 
  Send, 
  CheckCircle2, 
  Scale, 
  Coins, 
  FileCode2, 
  Lock, 
  Layers, 
  Wallet, 
  AlertTriangle,
  Copy,
  Check,
  FolderX,
  RefreshCw,
  Sliders
} from 'lucide-react';
import { createClient, chains } from 'genlayer-js';
import { ethers } from 'ethers';

// Official GenLayer Network Specifications
export const GENLAYER_NETWORKS = {
  studionet: {
    id: 'studionet',
    chainId: '0xf22f', // 61999
    chainIdDecimal: 61999,
    chainName: 'Genlayer Studio Network',
    nativeCurrency: { name: 'GEN Token', symbol: 'GEN', decimals: 18 },
    rpcUrls: ['https://studio.genlayer.com/api'],
    blockExplorerUrls: ['https://explorer-studio.genlayer.com/'],
    consensusContract: '0x82F000000000000000000000000000000000FF38',
    defaultContract: '0x4D9A1054C119853EB5369E9b83B38150Af871E42',
    faucet: 'https://studio.genlayer.com',
    type: 'Studio Network (Builder Track)'
  },
  bradbury: {
    id: 'bradbury',
    chainId: '0x107d', // 4221
    chainIdDecimal: 4221,
    chainName: 'GenLayer Bradbury Testnet',
    nativeCurrency: { name: 'GEN Token', symbol: 'GEN', decimals: 18 },
    rpcUrls: ['https://rpc-bradbury.genlayer.com'],
    blockExplorerUrls: ['https://explorer-bradbury.genlayer.com/'],
    consensusContract: '0x8BCb2cAC4222D081F0579e0f2fA71fF67b0C016c',
    defaultContract: '0x4D9A1054C119853EB5369E9b83B38150Af871E42',
    faucet: 'https://testnet-faucet.genlayer.foundation',
    type: 'Production Testnet (Validator Track)'
  }
};

declare global {
  interface Window {
    ethereum?: any;
  }
}

export interface EscrowAgreement {
  id: number;
  title: string;
  client: string;
  freelancer: string;
  amount_wei: string;
  amount_gen: string;
  requirements: string;
  status: 'FUNDED' | 'SUBMITTED' | 'RELEASED' | 'REFUNDED';
  delivery_url?: string;
  delivery_notes?: string;
  verdict?: string;
  verdict_score?: number;
  created_at?: string;
}

export default function App() {
  // Network selection
  const [networkKey, setNetworkKey] = useState<'studionet' | 'bradbury'>('studionet');
  const network = GENLAYER_NETWORKS[networkKey];

  // Active Contract Address on GenLayer Studionet
  const [contractAddress, setContractAddress] = useState<string>(network.defaultContract);
  const [customContractInput, setCustomContractInput] = useState<string>(network.defaultContract);
  const [isEditingContract, setIsEditingContract] = useState<boolean>(false);

  // Web3 Wallet State
  const [account, setAccount] = useState<string>('');
  const [chainId, setChainId] = useState<number | null>(null);
  const [userBalance, setUserBalance] = useState<string>('0');
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // Contract On-Chain State
  const [contractBalance, setContractBalance] = useState<string>('0');
  const [onChainEscrows, setOnChainEscrows] = useState<EscrowAgreement[]>([]);
  const [isLoadingContract, setIsLoadingContract] = useState<boolean>(false);
  const [contractError, setContractError] = useState<string>('');

  // Active Tab
  const [activeTab, setActiveTab] = useState<'explore' | 'create' | 'submit' | 'contract' | 'code'>('explore');

  // Transaction Status State
  const [txPending, setTxPending] = useState<boolean>(false);
  const [txActionName, setTxActionName] = useState<string>('');
  const [lastTxHash, setLastTxHash] = useState<string>('');
  const [txError, setTxError] = useState<string>('');

  // Form State: Create Escrow
  const [formFreelancer, setFormFreelancer] = useState<string>('');
  const [formTitle, setFormTitle] = useState<string>('');
  const [formAmount, setFormAmount] = useState<string>('10');
  const [formRequirements, setFormRequirements] = useState<string>(
    'Implement the complete authentication flow and provide GitHub PR with 100% test coverage.'
  );

  // Form State: Submit Deliverable
  const [selectedEscrowId, setSelectedEscrowId] = useState<number | null>(null);
  const [deliveryUrl, setDeliveryUrl] = useState<string>('https://github.com/MeniyaAnil/EscrowGuard-AI/pull/1');
  const [deliveryNotes, setDeliveryNotes] = useState<string>(
    'Implemented all milestone acceptance criteria according to specifications. Passing all unit and integration tests.'
  );

  // Initialize GenLayer Client
  const getGenLayerClient = useCallback(() => {
    const selectedChain = networkKey === 'studionet' ? chains.studionet : chains.testnetBradbury;
    return createClient({
      chain: selectedChain,
      account: account ? (account as `0x${string}`) : undefined,
      provider: typeof window !== 'undefined' ? window.ethereum : undefined,
    });
  }, [networkKey, account]);

  // Read Contract State directly from GenLayer Studionet RPC
  const refreshOnChainState = useCallback(async () => {
    if (!contractAddress || !ethers.isAddress(contractAddress)) return;

    setIsLoadingContract(true);
    setContractError('');

    try {
      const client = getGenLayerClient();

      // 1. Read all stored escrows from contract
      try {
        const escrowsResult = await client.readContract({
          address: contractAddress as `0x${string}`,
          functionName: 'get_all_escrows',
          args: [],
        });

        if (Array.isArray(escrowsResult)) {
          const parsed: EscrowAgreement[] = escrowsResult.map((item: any) => ({
            id: Number(item.id || 0),
            title: String(item.title || 'Untitled Agreement'),
            client: String(item.client || ''),
            freelancer: String(item.freelancer || ''),
            amount_wei: String(item.amount_wei || '0'),
            amount_gen: String(item.amount_gen || '0'),
            requirements: String(item.requirements || ''),
            status: (item.status as any) || 'FUNDED',
            delivery_url: item.delivery_url ? String(item.delivery_url) : undefined,
            delivery_notes: item.delivery_notes ? String(item.delivery_notes) : undefined,
            verdict: item.verdict ? String(item.verdict) : undefined,
            verdict_score: item.verdict_score !== undefined ? Number(item.verdict_score) : undefined,
            created_at: item.created_at ? String(item.created_at) : undefined,
          }));
          setOnChainEscrows(parsed);
        } else {
          setOnChainEscrows([]);
        }
      } catch (err: any) {
        console.warn('get_all_escrows read error (contract might be newly deployed or empty):', err.message);
        // If contract not deployed yet at this specific address, inform user clearly
        if (err.message && err.message.includes('not found')) {
          setContractError(`Contract ${contractAddress.slice(0, 10)}... not found on ${network.chainName}. Deploy it via Studio or update address below.`);
        }
      }

      // 2. Read contract balance held on-chain
      try {
        const bal = await client.getBalance({ address: contractAddress as `0x${string}` });
        setContractBalance(ethers.formatEther(bal));
      } catch {
        setContractBalance('0.0');
      }

      // 3. Read connected wallet balance
      if (account) {
        try {
          const ubal = await client.getBalance({ address: account as `0x${string}` });
          setUserBalance(ethers.formatEther(ubal));
        } catch {
          // fallback
        }
      }
    } catch (err: any) {
      console.error('refreshOnChainState failed:', err);
    } finally {
      setIsLoadingContract(false);
    }
  }, [contractAddress, getGenLayerClient, network.chainName, account]);

  // Initial and periodic sync
  useEffect(() => {
    refreshOnChainState();
  }, [refreshOnChainState]);

  // Connect Wallet
  const connectWallet = async () => {
    if (typeof window === 'undefined' || !window.ethereum) {
      alert('No Web3 wallet found. Please install Rabby Wallet or MetaMask to interact with GenLayer.');
      return;
    }

    setIsConnecting(true);
    setTxError('');
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      if (accounts && accounts.length > 0) {
        setAccount(accounts[0]);
        await switchToGenLayer();
      }
    } catch (err: any) {
      setTxError(err.message || 'Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  // Switch to GenLayer Network
  const switchToGenLayer = async () => {
    if (!window.ethereum) return;
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: network.chainId }],
      });
      const cId = await window.ethereum.request({ method: 'eth_chainId' });
      setChainId(parseInt(cId, 16));
    } catch (switchError: any) {
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: network.chainId,
              chainName: network.chainName,
              nativeCurrency: network.nativeCurrency,
              rpcUrls: network.rpcUrls,
              blockExplorerUrls: network.blockExplorerUrls,
            },
          ],
        });
        const cId = await window.ethereum.request({ method: 'eth_chainId' });
        setChainId(parseInt(cId, 16));
      } catch (addError: any) {
        setTxError('Could not switch to GenLayer network in wallet.');
      }
    }
  };

  // 1. Real Write: Create Escrow (Payable - Locks actual GEN on-chain)
  const handleCreateEscrow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!account) {
      await connectWallet();
      return;
    }

    if (!ethers.isAddress(formFreelancer)) {
      alert('Please enter a valid freelancer EVM address (0x...)');
      return;
    }

    const amountNum = parseFloat(formAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      alert('Please enter a valid deposit amount > 0 GEN');
      return;
    }

    setTxPending(true);
    setTxActionName('Depositing Staked GEN & Deploying Escrow on GenLayer');
    setTxError('');
    setLastTxHash('');

    try {
      const client = getGenLayerClient();
      const amountWei = ethers.parseEther(formAmount.toString());

      // Execute on-chain writeContract with attached value
      const writeArgs = {
        address: contractAddress as `0x${string}`,
        functionName: 'create_escrow',
        args: [formFreelancer, formTitle, formRequirements],
        value: amountWei,
      };

      let txHash = '';
      try {
        txHash = await client.writeContract(writeArgs);
      } catch (err: any) {
        // Fallback: standard EIP-1193 transaction prompt with calldata
        console.warn('writeContract direct call fallback to sendTransaction:', err.message);
        const iface = new ethers.Interface([
          'function create_escrow(address freelancer, string title, string requirements) payable returns (uint256)'
        ]);
        const data = iface.encodeFunctionData('create_escrow', [formFreelancer, formTitle, formRequirements]);

        txHash = await window.ethereum.request({
          method: 'eth_sendTransaction',
          params: [
            {
              from: account,
              to: contractAddress,
              value: ethers.toBeHex(amountWei),
              data: data,
            },
          ],
        });
      }

      setLastTxHash(txHash);
      setActiveTab('explore');
      setFormTitle('');
      setFormFreelancer('');

      // Refresh on-chain state
      setTimeout(() => refreshOnChainState(), 2000);
    } catch (err: any) {
      console.error('create_escrow error:', err);
      setTxError(err.message || 'Transaction failed or was rejected by user.');
    } finally {
      setTxPending(false);
    }
  };

  // 2. Real Write: Submit Deliverable
  const handleSubmitDelivery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!account) {
      await connectWallet();
      return;
    }
    if (selectedEscrowId === null) {
      alert('Please select an escrow agreement first');
      return;
    }

    setTxPending(true);
    setTxActionName('Submitting Deliverable Evidence On-Chain');
    setTxError('');
    setLastTxHash('');

    try {
      const client = getGenLayerClient();
      const writeArgs = {
        address: contractAddress as `0x${string}`,
        functionName: 'submit_delivery',
        args: [selectedEscrowId, deliveryUrl, deliveryNotes],
        value: 0n,
      };

      let txHash = '';
      try {
        txHash = await client.writeContract(writeArgs);
      } catch (err: any) {
        const iface = new ethers.Interface([
          'function submit_delivery(uint256 escrow_id, string delivery_url, string delivery_notes)'
        ]);
        const data = iface.encodeFunctionData('submit_delivery', [selectedEscrowId, deliveryUrl, deliveryNotes]);

        txHash = await window.ethereum.request({
          method: 'eth_sendTransaction',
          params: [{ from: account, to: contractAddress, data }],
        });
      }

      setLastTxHash(txHash);
      setActiveTab('explore');
      setTimeout(() => refreshOnChainState(), 2000);
    } catch (err: any) {
      setTxError(err.message || 'Submission failed');
    } finally {
      setTxPending(false);
    }
  };

  // 3. Real Write: Adjudicate Escrow (AI Validator Consensus + Auto Payout/Refund)
  const handleAdjudicate = async (escrowId: number) => {
    if (!account) {
      await connectWallet();
      return;
    }

    setTxPending(true);
    setTxActionName(`Triggering GenLayer AI Validator Consensus for Escrow #${escrowId}`);
    setTxError('');
    setLastTxHash('');

    try {
      const client = getGenLayerClient();
      const writeArgs = {
        address: contractAddress as `0x${string}`,
        functionName: 'adjudicate_escrow',
        args: [escrowId],
        value: 0n,
      };

      let txHash = '';
      try {
        txHash = await client.writeContract(writeArgs);
      } catch (err: any) {
        const iface = new ethers.Interface([
          'function adjudicate_escrow(uint256 escrow_id)'
        ]);
        const data = iface.encodeFunctionData('adjudicate_escrow', [escrowId]);

        txHash = await window.ethereum.request({
          method: 'eth_sendTransaction',
          params: [{ from: account, to: contractAddress, data }],
        });
      }

      setLastTxHash(txHash);
      setTimeout(() => refreshOnChainState(), 3000);
    } catch (err: any) {
      setTxError(err.message || 'Adjudication transaction failed');
    } finally {
      setTxPending(false);
    }
  };

  // 4. Real Write: Manual Release (Direct payout from contract to freelancer)
  const handleManualRelease = async (escrowId: number) => {
    if (!account) {
      await connectWallet();
      return;
    }

    setTxPending(true);
    setTxActionName(`Releasing Held GEN to Freelancer for Escrow #${escrowId}`);
    setTxError('');

    try {
      const client = getGenLayerClient();
      let txHash = '';
      try {
        txHash = await client.writeContract({
          address: contractAddress as `0x${string}`,
          functionName: 'manual_release',
          args: [escrowId],
          value: 0n,
        });
      } catch {
        const iface = new ethers.Interface(['function manual_release(uint256 escrow_id)']);
        txHash = await window.ethereum.request({
          method: 'eth_sendTransaction',
          params: [{ from: account, to: contractAddress, data: iface.encodeFunctionData('manual_release', [escrowId]) }],
        });
      }
      setLastTxHash(txHash);
      setTimeout(() => refreshOnChainState(), 2000);
    } catch (err: any) {
      setTxError(err.message || 'Release failed');
    } finally {
      setTxPending(false);
    }
  };

  // 5. Real Write: Manual Refund (Direct refund from contract to client)
  const handleManualRefund = async (escrowId: number) => {
    if (!account) {
      await connectWallet();
      return;
    }

    setTxPending(true);
    setTxActionName(`Refunding Held GEN to Client for Escrow #${escrowId}`);
    setTxError('');

    try {
      const client = getGenLayerClient();
      let txHash = '';
      try {
        txHash = await client.writeContract({
          address: contractAddress as `0x${string}`,
          functionName: 'manual_refund',
          args: [escrowId],
          value: 0n,
        });
      } catch {
        const iface = new ethers.Interface(['function manual_refund(uint256 escrow_id)']);
        txHash = await window.ethereum.request({
          method: 'eth_sendTransaction',
          params: [{ from: account, to: contractAddress, data: iface.encodeFunctionData('manual_refund', [escrowId]) }],
        });
      }
      setLastTxHash(txHash);
      setTimeout(() => refreshOnChainState(), 2000);
    } catch (err: any) {
      setTxError(err.message || 'Refund failed');
    } finally {
      setTxPending(false);
    }
  };

  // Copy helper
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#070a10] text-slate-100 flex flex-col font-sans selection:bg-blue-500/30 selection:text-blue-200">
      
      {/* Top Banner / Network Strip */}
      <div className="border-b border-slate-800/60 bg-[#090d16] px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-slate-400">Network:</span>
          <select
            value={networkKey}
            onChange={(e) => setNetworkKey(e.target.value as 'studionet' | 'bradbury')}
            className="bg-slate-900 border border-slate-700 text-blue-400 font-mono rounded px-2 py-0.5 text-xs focus:outline-none"
          >
            <option value="studionet">Studionet (Chain 61999)</option>
            <option value="bradbury">Bradbury Testnet (Chain 4221)</option>
          </select>
          {chainId && (
            <span className="text-slate-500 font-mono text-[11px]">(Wallet: {chainId})</span>
          )}
          <span className="text-slate-600 hidden sm:inline">|</span>
          <span className="text-slate-400 hidden sm:inline">Ghost Contract Consensus Active</span>
        </div>

        <div className="flex items-center gap-3">
          <a
            href={network.faucet}
            target="_blank"
            rel="noreferrer"
            className="text-amber-400 hover:text-amber-300 flex items-center gap-1 font-medium transition-colors"
          >
            <span>💧 Studio Faucet</span>
            <ExternalLink className="w-3 h-3" />
          </a>
          <span className="text-slate-700">|</span>
          <a
            href={network.blockExplorerUrls[0]}
            target="_blank"
            rel="noreferrer"
            className="text-slate-400 hover:text-slate-200 flex items-center gap-1 transition-colors"
          >
            <span>Live Explorer</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Main Header */}
      <header className="border-b border-slate-800/80 bg-[#0c101a]/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-blue-400 via-indigo-300 to-teal-300 bg-clip-text text-transparent">
                  GenHub AI
                </span>
                <span className="text-[10px] uppercase font-semibold tracking-wider px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30">
                  GenVM Python
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">Autonomous Milestone Escrow Adjudication Protocol</p>
            </div>
          </div>

          {/* Wallet Actions */}
          <div className="flex items-center gap-3">
            {account && (
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300">
                <Coins className="w-3.5 h-3.5 text-amber-400" />
                <span>Wallet: <strong className="text-white font-mono">{parseFloat(userBalance).toFixed(3)} GEN</strong></span>
              </div>
            )}

            {account ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => copyToClipboard(account)}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs text-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Click to copy wallet address"
                >
                  <Wallet className="w-3.5 h-3.5 text-blue-400" />
                  <span className="font-mono">{account.slice(0, 6)}...{account.slice(-4)}</span>
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-slate-500" />}
                </button>
              </div>
            ) : (
              <button
                onClick={connectWallet}
                disabled={isConnecting}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-blue-600/20 transition-all cursor-pointer disabled:opacity-50"
              >
                <Wallet className="w-4 h-4" />
                <span>{isConnecting ? 'Connecting...' : 'Connect Wallet'}</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Contract & Balance Notification Banner */}
      <div className="bg-[#0b0f19] border-b border-slate-800/80 px-4 py-2.5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-slate-400 flex items-center gap-1">
              <FileCode2 className="w-3.5 h-3.5 text-indigo-400" />
              Intelligent Contract:
            </span>
            {isEditingContract ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={customContractInput}
                  onChange={(e) => setCustomContractInput(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded px-2 py-0.5 text-xs font-mono text-white w-72"
                  placeholder="0x..."
                />
                <button
                  onClick={() => {
                    setContractAddress(customContractInput);
                    setIsEditingContract(false);
                  }}
                  className="px-2 py-0.5 rounded bg-blue-600 text-white font-medium hover:bg-blue-500"
                >
                  Save
                </button>
                <button
                  onClick={() => setIsEditingContract(false)}
                  className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <a
                  href={`${network.blockExplorerUrls[0]}address/${contractAddress}`}
                  target="_blank"
                  rel="noreferrer"
                  className="font-mono text-blue-400 hover:underline flex items-center gap-1"
                >
                  <span>{contractAddress}</span>
                  <ExternalLink className="w-3 h-3 opacity-60" />
                </a>
                <button
                  onClick={() => setIsEditingContract(true)}
                  className="text-slate-500 hover:text-slate-300 ml-1"
                  title="Configure or switch deployed contract address"
                >
                  <Sliders className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20">
              <Lock className="w-3.5 h-3.5" />
              <span>Contract Locked Value: <strong>{parseFloat(contractBalance).toFixed(2)} GEN</strong></span>
            </div>
            <button
              onClick={refreshOnChainState}
              disabled={isLoadingContract}
              className="text-slate-400 hover:text-slate-200 flex items-center gap-1 transition-colors cursor-pointer"
              title="Refresh on-chain state"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingContract ? 'animate-spin text-blue-400' : ''}`} />
              <span>Sync Chain</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-8">
        
        {/* Navigation Tabs */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 flex-wrap gap-4">
          <div className="flex items-center gap-2 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('explore')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'explore'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Active Agreements ({onChainEscrows.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('create')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'create'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Create Agreement (Payable)</span>
            </button>
            <button
              onClick={() => setActiveTab('submit')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'submit'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>Submit Deliverable</span>
            </button>
            <button
              onClick={() => setActiveTab('contract')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'contract'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>On-Chain Methods</span>
            </button>
            <button
              onClick={() => setActiveTab('code')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'code'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileCode2 className="w-3.5 h-3.5" />
              <span>Python Contract</span>
            </button>
          </div>

          <a
            href="https://github.com/MeniyaAnil/EscrowGuard-AI"
            target="_blank"
            rel="noreferrer"
            className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 transition-colors"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
            <span>GitHub Repository</span>
          </a>
        </div>

        {/* Live Transaction Status Alert */}
        {txPending && (
          <div className="p-4 rounded-xl border border-blue-500/40 bg-blue-950/30 text-blue-200 flex items-center justify-between text-xs animate-pulse">
            <div className="flex items-center gap-3">
              <RefreshCw className="w-5 h-5 text-blue-400 animate-spin" />
              <div>
                <strong className="block text-sm text-white">{txActionName}</strong>
                <span>Awaiting signature and consensus on GenLayer Studionet...</span>
              </div>
            </div>
          </div>
        )}

        {lastTxHash && (
          <div className="p-4 rounded-xl border border-emerald-500/40 bg-emerald-950/20 text-emerald-200 flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <strong className="block text-sm text-white">On-Chain Transaction Submitted!</strong>
                <span className="font-mono text-slate-300">Hash: {lastTxHash}</span>
              </div>
            </div>
            <a
              href={`${network.blockExplorerUrls[0]}tx/${lastTxHash}`}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium flex items-center gap-1.5 shrink-0 transition-colors"
            >
              <span>View in Explorer</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        )}

        {txError && (
          <div className="p-4 rounded-xl border border-rose-500/40 bg-rose-950/20 text-rose-200 flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
              <div>
                <strong className="block text-sm text-white">Transaction Error:</strong>
                <span>{txError}</span>
              </div>
            </div>
            <button
              onClick={() => setTxError('')}
              className="px-2 py-1 rounded bg-rose-900/50 hover:bg-rose-900 text-rose-200"
            >
              Dismiss
            </button>
          </div>
        )}

        {contractError && (
          <div className="p-4 rounded-xl border border-amber-500/40 bg-amber-950/20 text-amber-200 flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
              <div>
                <strong className="block text-sm text-white">Contract State Notice:</strong>
                <span>{contractError}</span>
              </div>
            </div>
            <a
              href="https://studio.genlayer.com"
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1 rounded bg-amber-600 hover:bg-amber-500 text-black font-semibold shrink-0"
            >
              Open Studio
            </a>
          </div>
        )}

        {/* TAB 1: Explore Active Escrow Agreements */}
        {activeTab === 'explore' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                  <span>Live Escrow Agreements</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">
                    On-Chain: {onChainEscrows.length}
                  </span>
                </h2>
                <p className="text-xs text-slate-400">
                  Agreements currently stored and held in Intelligent Contract state on GenLayer Studionet.
                </p>
              </div>

              <button
                onClick={() => setActiveTab('create')}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>New Escrow (Payable)</span>
              </button>
            </div>

            {onChainEscrows.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-800 bg-[#0c101a]/50 p-12 text-center space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-500">
                  <FolderX className="w-7 h-7" />
                </div>
                <div className="max-w-md mx-auto space-y-1">
                  <h3 className="text-base font-bold text-white">No Escrows Recorded on Contract</h3>
                  <p className="text-xs text-slate-400">
                    The deployed contract at <code className="text-blue-400 font-mono">{contractAddress.slice(0, 10)}...</code> has 0 stored escrows. Click below to lock real GEN tokens and create the first milestone agreement.
                  </p>
                </div>
                <div className="pt-2">
                  <button
                    onClick={() => setActiveTab('create')}
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs inline-flex items-center gap-2 shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Create First On-Chain Agreement</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {onChainEscrows.map((escrow) => (
                  <div
                    key={escrow.id}
                    className="rounded-2xl border border-slate-800 bg-[#0b0e17] p-5 space-y-4 hover:border-slate-700 transition-all"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-[10px] font-mono text-blue-400 uppercase tracking-wider block">
                          Agreement #{escrow.id}
                        </span>
                        <h4 className="text-base font-bold text-white mt-0.5">{escrow.title}</h4>
                      </div>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                          escrow.status === 'RELEASED'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : escrow.status === 'REFUNDED'
                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                            : escrow.status === 'SUBMITTED'
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                            : 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                        }`}
                      >
                        {escrow.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs">
                      <div>
                        <span className="text-slate-500 block text-[11px]">Locked Amount:</span>
                        <strong className="text-white font-mono text-sm">{escrow.amount_gen} GEN</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[11px]">Freelancer:</span>
                        <span className="font-mono text-slate-300 text-[11px]">
                          {escrow.freelancer.slice(0, 6)}...{escrow.freelancer.slice(-4)}
                        </span>
                      </div>
                    </div>

                    <div className="text-xs space-y-1">
                      <span className="text-slate-500 text-[11px] block font-medium">Agreed Requirements:</span>
                      <p className="text-slate-300 bg-slate-950/60 p-2.5 rounded-lg border border-slate-900 leading-relaxed text-[11px]">
                        {escrow.requirements}
                      </p>
                    </div>

                    {escrow.delivery_url && (
                      <div className="text-xs space-y-1 border-t border-slate-800/60 pt-3">
                        <span className="text-amber-400 text-[11px] block font-medium">Submitted Deliverable Proof:</span>
                        <a
                          href={escrow.delivery_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-400 hover:underline flex items-center gap-1 font-mono text-[11px] truncate"
                        >
                          <ExternalLink className="w-3 h-3 shrink-0" />
                          <span className="truncate">{escrow.delivery_url}</span>
                        </a>
                      </div>
                    )}

                    {escrow.verdict && (
                      <div className="text-xs space-y-1 p-2.5 rounded-lg bg-blue-950/20 border border-blue-900/40">
                        <span className="text-blue-400 text-[11px] block font-semibold">AI Validator Verdict:</span>
                        <p className="text-slate-300 text-[11px] leading-relaxed">{escrow.verdict}</p>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="border-t border-slate-800/80 pt-3 flex items-center justify-between gap-2 flex-wrap">
                      {escrow.status === 'FUNDED' && (
                        <button
                          onClick={() => {
                            setSelectedEscrowId(escrow.id);
                            setActiveTab('submit');
                          }}
                          className="px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Submit Deliverable</span>
                        </button>
                      )}

                      {escrow.status === 'SUBMITTED' && (
                        <button
                          onClick={() => handleAdjudicate(escrow.id)}
                          disabled={txPending}
                          className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-600/30 transition-all cursor-pointer disabled:opacity-50"
                        >
                          <Scale className="w-3.5 h-3.5" />
                          <span>Adjudicate Verdict (AI Jury)</span>
                        </button>
                      )}

                      {(escrow.status === 'FUNDED' || escrow.status === 'SUBMITTED') && (
                        <div className="flex items-center gap-2 ml-auto">
                          <button
                            onClick={() => handleManualRelease(escrow.id)}
                            disabled={txPending}
                            className="px-2.5 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 text-xs font-semibold transition-colors cursor-pointer"
                            title="Directly release held GEN to freelancer"
                          >
                            Release Funds
                          </button>
                          <button
                            onClick={() => handleManualRefund(escrow.id)}
                            disabled={txPending}
                            className="px-2.5 py-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 border border-rose-500/30 text-xs font-semibold transition-colors cursor-pointer"
                            title="Refund held GEN back to client"
                          >
                            Refund
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Create Escrow (Payable Method) */}
        {activeTab === 'create' && (
          <div className="max-w-2xl mx-auto rounded-2xl border border-slate-800 bg-[#0b0e17] p-6 sm:p-8 space-y-6">
            <div>
              <div className="flex items-center gap-2 text-blue-400 text-xs font-semibold uppercase tracking-wider">
                <PlusCircle className="w-4 h-4" />
                <span>On-Chain Payable Method</span>
              </div>
              <h2 className="text-xl font-bold text-white mt-1">Create Milestone Escrow Agreement</h2>
              <p className="text-xs text-slate-400 mt-1">
                Calls <code className="text-blue-400 font-mono">create_escrow(freelancer, title, requirements)</code> on GenLayer Studionet with attached native GEN value. The funds are locked in the contract balance until milestone completion.
              </p>
            </div>

            <form onSubmit={handleCreateEscrow} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1.5">Project / Milestone Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Full-Stack DApp Integration with GenLayer"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-900/80 px-4 py-2.5 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-medium mb-1.5">Freelancer EVM Address (0x...)</label>
                  <input
                    type="text"
                    required
                    placeholder="0x..."
                    value={formFreelancer}
                    onChange={(e) => setFormFreelancer(e.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-900/80 px-4 py-2.5 text-white font-mono placeholder-slate-500 focus:border-blue-500 focus:outline-none text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1.5">Deposit Amount (GEN Token)</label>
                  <div className="relative">
                    <input
                      type="number"
                      step="any"
                      min="0.1"
                      required
                      placeholder="10"
                      value={formAmount}
                      onChange={(e) => setFormAmount(e.target.value)}
                      className="w-full rounded-xl border border-slate-800 bg-slate-900/80 pl-8 pr-4 py-2.5 text-white font-mono placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                    />
                    <Coins className="w-4 h-4 text-amber-400 absolute left-2.5 top-3" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1.5">
                  Plain-English Milestone Requirements (Evaluated by GenLayer AI Validator Jury)
                </label>
                <textarea
                  rows={4}
                  required
                  value={formRequirements}
                  onChange={(e) => setFormRequirements(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-900/80 p-3 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none leading-relaxed"
                />
                <span className="text-[11px] text-slate-500">
                  Minimum 20 characters. Be specific so the 5 validator LLMs can objectively verify deliverable links against these criteria.
                </span>
              </div>

              <div className="p-4 rounded-xl bg-blue-950/20 border border-blue-900/40 text-blue-200 space-y-1.5">
                <span className="font-semibold block flex items-center gap-1.5 text-blue-300">
                  <Lock className="w-3.5 h-3.5" />
                  Native On-Chain Value Flow:
                </span>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Submitting this form triggers a real transaction prompt in your connected wallet for <strong>{formAmount || 0} GEN</strong>. The GenHub contract receives this value via <code className="text-blue-400 font-mono">gl.message.value</code> and holds it non-custodially until consensus triggers the payout.
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={txPending}
                  className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Coins className="w-4 h-4 text-amber-300" />
                  <span>{txPending ? 'Submitting to GenLayer...' : `Deposit ${formAmount || 0} GEN & Deploy Escrow`}</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 3: Submit Deliverable */}
        {activeTab === 'submit' && (
          <div className="max-w-2xl mx-auto rounded-2xl border border-slate-800 bg-[#0b0e17] p-6 sm:p-8 space-y-6">
            <div>
              <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold uppercase tracking-wider">
                <Send className="w-4 h-4" />
                <span>Freelancer Deliverable Submission</span>
              </div>
              <h2 className="text-xl font-bold text-white mt-1">Submit Proof of Work for Milestone</h2>
              <p className="text-xs text-slate-400 mt-1">
                Calls <code className="text-blue-400 font-mono">submit_delivery(escrow_id, delivery_url, notes)</code> on-chain. GenLayer validator nodes will crawl the URL with <code className="text-blue-400 font-mono">gl.nondet.web.render()</code> to evaluate acceptance criteria.
              </p>
            </div>

            <form onSubmit={handleSubmitDelivery} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1.5">Select Active Escrow Agreement</label>
                <select
                  value={selectedEscrowId ?? ''}
                  onChange={(e) => setSelectedEscrowId(Number(e.target.value))}
                  required
                  className="w-full rounded-xl border border-slate-800 bg-slate-900/80 px-4 py-2.5 text-white focus:border-blue-500 focus:outline-none"
                >
                  <option value="">-- Choose an escrow agreement --</option>
                  {onChainEscrows.map((e) => (
                    <option key={e.id} value={e.id}>
                      #{e.id}: {e.title} ({e.amount_gen} GEN) - Status: {e.status}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1.5">Deliverable Proof URL (GitHub PR / Commit / Demo)</label>
                <input
                  type="url"
                  required
                  placeholder="https://github.com/org/repo/pull/1"
                  value={deliveryUrl}
                  onChange={(e) => setDeliveryUrl(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-900/80 px-4 py-2.5 text-white font-mono placeholder-slate-500 focus:border-blue-500 focus:outline-none text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1.5">Submission Notes & Changelog</label>
                <textarea
                  rows={4}
                  required
                  value={deliveryNotes}
                  onChange={(e) => setDeliveryNotes(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-900/80 p-3 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none leading-relaxed"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={txPending}
                  className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-600/30 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{txPending ? 'Submitting to Chain...' : 'Record Deliverable Proof On-Chain'}</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 4: Contract On-Chain Methods & Inspection */}
        {activeTab === 'contract' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Cpu className="w-5 h-5 text-indigo-400" />
                <span>GenHub AI On-Chain Contract Specification</span>
              </h2>
              <p className="text-xs text-slate-400">
                Detailed breakdown of real read and write methods available in the deployed Intelligent Contract.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              
              {/* Write & Payable Methods */}
              <div className="rounded-2xl border border-slate-800 bg-[#0b0e17] p-5 space-y-4">
                <div className="flex items-center gap-2 font-bold text-sm text-blue-400">
                  <Coins className="w-4 h-4" />
                  <span>State-Changing & Payable Methods (Writes)</span>
                </div>

                <div className="space-y-3 font-mono">
                  <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-emerald-400 font-bold">create_escrow(...)</span>
                      <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30">
                        @gl.public.write.payable
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-sans">
                      Receives native GEN via <code className="text-slate-200">gl.message.value</code> and stores funds in contract balance.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-blue-400 font-bold">submit_delivery(...)</span>
                      <span className="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded border border-blue-500/30">
                        @gl.public.write
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-sans">
                      Designated freelancer submits deliverable URL and changelog notes.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-indigo-400 font-bold">adjudicate_escrow(...)</span>
                      <span className="text-[10px] bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded border border-indigo-500/30">
                        @gl.public.write
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-sans">
                      Fetches web proof with <code className="text-slate-200">gl.nondet.web.render</code>, queries 5 LLMs via <code className="text-slate-200">gl.nondet.exec_prompt</code>, and automatically dispatches native GEN transfer to freelancer or refund to client via <code className="text-slate-200">_Recipient.emit_transfer()</code>.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300 font-bold">manual_release(...) / manual_refund(...)</span>
                      <span className="text-[10px] bg-slate-500/10 text-slate-400 px-2 py-0.5 rounded border border-slate-500/30">
                        @gl.public.write
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-sans">
                      Allows direct on-chain fund transfer to freelancer or refund without opening an AI dispute.
                    </p>
                  </div>
                </div>
              </div>

              {/* View Methods */}
              <div className="rounded-2xl border border-slate-800 bg-[#0b0e17] p-5 space-y-4">
                <div className="flex items-center gap-2 font-bold text-sm text-teal-400">
                  <FileCode2 className="w-4 h-4" />
                  <span>State Inspection Methods (Views)</span>
                </div>

                <div className="space-y-3 font-mono">
                  <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-teal-400 font-bold">get_all_escrows() -&gt; list</span>
                      <span className="text-[10px] bg-teal-500/10 text-teal-400 px-2 py-0.5 rounded border border-teal-500/30">
                        @gl.public.view
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-sans">
                      Returns all active, submitted, released, and refunded escrow records on-chain.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-teal-400 font-bold">get_contract_balance() -&gt; u256</span>
                      <span className="text-[10px] bg-teal-500/10 text-teal-400 px-2 py-0.5 rounded border border-teal-500/30">
                        @gl.public.view
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-sans">
                      Reads <code className="text-slate-200">self.balance</code> to verify total staked GEN held by contract ghost address.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-teal-400 font-bold">get_escrow(id: int) -&gt; dict</span>
                      <span className="text-[10px] bg-teal-500/10 text-teal-400 px-2 py-0.5 rounded border border-teal-500/30">
                        @gl.public.view
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-sans">
                      Inspects single agreement status, requirements, and AI verdict scores.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: Python Contract Code Preview */}
        {activeTab === 'code' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">contracts/escrow_guard.py</h2>
                <p className="text-xs text-slate-400">
                  Full production GenVM Python contract with native value handling, web non-determinism, and AI jury consensus.
                </p>
              </div>

              <a
                href="https://github.com/MeniyaAnil/EscrowGuard-AI/blob/main/contracts/escrow_guard.py"
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs flex items-center gap-1.5 transition-colors"
              >
                <span>View on GitHub</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <pre className="p-5 rounded-2xl bg-[#080b12] border border-slate-800 font-mono text-xs text-slate-300 overflow-x-auto leading-relaxed max-h-[600px]">
{`from genlayer import *

# Interface for external GEN transfers to EOAs or EVM contracts on GenLayer Chain
@gl.evm.contract_interface
class _Recipient:
    class View:
        pass
    class Write:
        pass

class GenHubEscrow(gl.Contract):
    escrow_count: int
    escrows: TreeMap[int, dict]
    platform_admin: Address

    def __init__(self):
        self.escrow_count = 0
        self.escrows = TreeMap()
        self.platform_admin = gl.message.sender_address

    @gl.public.write.payable
    def create_escrow(self, freelancer: str, title: str, requirements: str) -> int:
        deposit_amount = gl.message.value
        if deposit_amount == u256(0):
            raise gl.vm.UserError("Escrow creation requires staked GEN (gl.message.value must be > 0)")

        self.escrow_count += 1
        new_id = self.escrow_count
        self.escrows[new_id] = {
            "id": new_id,
            "client": str(gl.message.sender_address),
            "freelancer": str(Address(freelancer)),
            "title": title,
            "requirements": requirements,
            "amount_wei": str(deposit_amount),
            "amount_gen": str(int(deposit_amount) / 10**18),
            "status": "FUNDED",
            "delivery_url": "",
            "delivery_notes": "",
            "verdict": ""
        }
        return new_id

    @gl.public.write
    def adjudicate_escrow(self, escrow_id: int) -> dict:
        escrow = self.escrows[escrow_id]
        escrow_amount = u256(int(escrow["amount_wei"]))

        # 1. Fetch live evidence on-chain
        web_evidence = gl.nondet.web.render(escrow["delivery_url"], mode="text")

        # 2. Run 5-LLM Jury Consensus
        evaluation = gl.nondet.exec_prompt(f"Evaluate: {escrow['requirements']} vs {web_evidence}")
        approved = evaluation.get("approved", False)

        # 3. Native GEN Transfer upon Consensus
        if approved:
            escrow["status"] = "RELEASED"
            _Recipient(Address(escrow["freelancer"])).emit_transfer(value=escrow_amount)
        else:
            escrow["status"] = "REFUNDED"
            _Recipient(Address(escrow["client"])).emit_transfer(value=escrow_amount)

        self.escrows[escrow_id] = escrow
        return escrow`}
            </pre>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-[#07090e] py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 GenHub AI. Built for the GenLayer Ecosystem & Builder Track.</p>
          <div className="flex items-center gap-4 text-slate-400">
            <a href="https://genlayer.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
              GenLayer Official
            </a>
            <span>•</span>
            <a href={network.blockExplorerUrls[0]} target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
              Live Explorer
            </a>
            <span>•</span>
            <a href="https://studio.genlayer.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
              GenLayer Studio
            </a>
            <span>•</span>
            <a href="https://portal.genlayer.foundation" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
              Points Portal
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
