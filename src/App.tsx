import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Cpu, 
  ExternalLink, 
  PlusCircle, 
  Send, 
  CheckCircle2, 
  Clock, 
  Scale, 
  Coins, 
  FileCode2,
  Lock,
  Layers,
  Sparkles,
  Bot
} from 'lucide-react';

interface Escrow {
  id: number;
  title: string;
  client: string;
  freelancer: string;
  amount: number;
  requirements: string;
  status: 'FUNDED' | 'SUBMITTED' | 'ADJUDICATING' | 'RELEASED' | 'REFUNDED';
  deliveryUrl?: string;
  deliveryNotes?: string;
  verdictScore?: number;
  verdictReasoning?: string;
  validators?: { name: string; model: string; vote: 'APPROVE' | 'REJECT'; confidence: number }[];
}

const INITIAL_ESCROWS: Escrow[] = [
  {
    id: 1,
    title: 'E-Commerce Next.js 15 Checkout Integration',
    client: '0x948A...3F19',
    freelancer: '0xManiyaAnil',
    amount: 500,
    requirements: 'Must implement Stripe Checkout, pass ESLint with zero errors, and deploy preview on Vercel with responsive mobile UI.',
    status: 'RELEASED',
    deliveryUrl: 'https://github.com/example/ecommerce-checkout/pull/4',
    deliveryNotes: 'Completed checkout flow, responsive mobile tests passing, Vercel preview verified.',
    verdictScore: 94,
    verdictReasoning: 'All requirements met: Stripe session initiates properly, zero lint errors detected on PR branch, Vercel preview renders clean checkout.',
    validators: [
      { name: 'Validator #1', model: 'Claude 3.5 Sonnet', vote: 'APPROVE', confidence: 96 },
      { name: 'Validator #2', model: 'Llama 3.3 70B', vote: 'APPROVE', confidence: 92 },
      { name: 'Validator #3', model: 'Mistral Large 2', vote: 'APPROVE', confidence: 95 },
      { name: 'Validator #4', model: 'GPT-4o Mini', vote: 'APPROVE', confidence: 94 },
      { name: 'Validator #5', model: 'DeepSeek V3', vote: 'APPROVE', confidence: 93 },
    ]
  },
  {
    id: 2,
    title: 'FastAPI Microservice for GenLayer Webhook',
    client: '0x172C...98E2',
    freelancer: '0x712B...44D1',
    amount: 750,
    requirements: 'Create Dockerized FastAPI service with HMAC signature verification, /health endpoint, and Swagger documentation.',
    status: 'SUBMITTED',
    deliveryUrl: 'https://github.com/web3-builds/fastapi-genlayer-webhook',
    deliveryNotes: 'Repository published with Dockerfile and Swagger docs at /docs. HMAC verification added in middleware.',
  },
  {
    id: 3,
    title: 'DeFi Liquidity Analytics Dashboard in React',
    client: '0x889E...B720',
    freelancer: '0xManiyaAnil',
    amount: 1200,
    requirements: 'Build real-time TVL and APY charts using Recharts or Chart.js. Dark mode default with wallet connect.',
    status: 'FUNDED',
  }
];

export default function App() {
  const [escrows, setEscrows] = useState<Escrow[]>(INITIAL_ESCROWS);
  const [activeTab, setActiveTab] = useState<'explore' | 'create' | 'submit' | 'jury'>('explore');
  const [walletConnected, setWalletConnected] = useState(true);
  const [account] = useState('0xManiyaAnil');
  const [isAdjudicating, setIsAdjudicating] = useState(false);
  const [selectedEscrowId, setSelectedEscrowId] = useState<number>(2);

  // Form states for creation
  const [newTitle, setNewTitle] = useState('');
  const [newFreelancer, setNewFreelancer] = useState('');
  const [newAmount, setNewAmount] = useState('250');
  const [newRequirements, setNewRequirements] = useState('');

  // Form states for submission
  const [submitEscrowId, setSubmitEscrowId] = useState<number>(3);
  const [submitUrl, setSubmitUrl] = useState('');
  const [submitNotes, setSubmitNotes] = useState('');

  // Handle New Escrow Creation
  const handleCreateEscrow = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newRequirements) return;

    const newEscrow: Escrow = {
      id: escrows.length + 1,
      title: newTitle,
      client: account,
      freelancer: newFreelancer || '0x712B...44D1',
      amount: Number(newAmount) || 100,
      requirements: newRequirements,
      status: 'FUNDED',
    };

    setEscrows([newEscrow, ...escrows]);
    setActiveTab('explore');
    setNewTitle('');
    setNewRequirements('');
  };

  // Handle Deliverable Submission
  const handleSubmitDelivery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!submitUrl) return;

    setEscrows(escrows.map(esc => {
      if (esc.id === submitEscrowId) {
        return {
          ...esc,
          status: 'SUBMITTED',
          deliveryUrl: submitUrl,
          deliveryNotes: submitNotes || 'Deliverable ready for AI adjudication.'
        };
      }
      return esc;
    }));

    setSelectedEscrowId(submitEscrowId);
    setActiveTab('jury');
    setSubmitUrl('');
    setSubmitNotes('');
  };

  // Trigger GenLayer AI Adjudication Simulation
  const triggerAdjudication = (id: number) => {
    setIsAdjudicating(true);
    setSelectedEscrowId(id);
    setActiveTab('jury');

    setTimeout(() => {
      setEscrows(prev => prev.map(esc => {
        if (esc.id === id) {
          return {
            ...esc,
            status: 'RELEASED',
            verdictScore: 92,
            verdictReasoning: 'GenLayer AI Validator Jury consensus reached (5/5). Web inspection confirmed valid deliverable matching contractual requirements.',
            validators: [
              { name: 'Validator #1', model: 'Claude 3.5 Sonnet', vote: 'APPROVE', confidence: 95 },
              { name: 'Validator #2', model: 'Llama 3.3 70B', vote: 'APPROVE', confidence: 91 },
              { name: 'Validator #3', model: 'Mistral Large 2', vote: 'APPROVE', confidence: 93 },
              { name: 'Validator #4', model: 'GPT-4o Mini', vote: 'APPROVE', confidence: 89 },
              { name: 'Validator #5', model: 'DeepSeek V3', vote: 'APPROVE', confidence: 94 },
            ]
          };
        }
        return esc;
      }));
      setIsAdjudicating(false);
    }, 2800);
  };

  const currentJuryEscrow = escrows.find(e => e.id === selectedEscrowId) || escrows[0];

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Top Navigation */}
      <header className="border-b border-slate-800/80 bg-[#0c101a]/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-blue-400 via-indigo-300 to-teal-300 bg-clip-text text-transparent">
                  EscrowGuard AI
                </span>
                <span className="text-[10px] uppercase font-semibold tracking-wider px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30">
                  GenLayer Bradbury
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">Autonomous Milestone Adjudication Protocol</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300">
              <Coins className="w-3.5 h-3.5 text-amber-400" />
              <span>Pool: <strong className="text-white">45,800 GEN</strong></span>
            </div>

            <button
              onClick={() => setWalletConnected(!walletConnected)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-xs font-semibold text-white shadow-md shadow-blue-600/20 transition-all cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>{walletConnected ? `${account}` : 'Connect Wallet'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-8">
        {/* Hero Section */}
        <section className="relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-b from-[#0f1422] to-[#0a0d16] p-6 sm:p-10 shadow-2xl">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-medium">
              <Sparkles className="w-3.5 h-3.5" />
              Powered by GenLayer Intelligent Contracts & LLM Consensus
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Trustless Freelance Escrow Built on Real-World Proof
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              No support tickets. No arbitrary centralized chargebacks. Clients lock payment with plain-English acceptance criteria. GenLayer’s decentralized AI validators read deliverables directly from the live web and adjudicate payouts automatically.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button 
                onClick={() => setActiveTab('create')}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                Create Escrow Agreement
              </button>
              <button 
                onClick={() => setActiveTab('jury')}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-medium text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer"
              >
                <Scale className="w-4 h-4 text-indigo-400" />
                Inspect AI Validator Jury
              </button>
              <a
                href="https://github.com/MeniyaAnil/EscrowGuard-AI"
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2.5 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 text-slate-400 hover:text-slate-200 text-xs sm:text-sm flex items-center gap-1.5 transition-all"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
                <span>GitHub Source</span>
                <ExternalLink className="w-3 h-3 ml-0.5 opacity-60" />
              </a>
            </div>
          </div>
        </section>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveTab('explore')}
            className={`px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-lg flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'explore'
                ? 'bg-blue-600/10 text-blue-400 border border-blue-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
            }`}
          >
            <Layers className="w-4 h-4" />
            Active Escrows ({escrows.length})
          </button>
          <button
            onClick={() => setActiveTab('create')}
            className={`px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-lg flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'create'
                ? 'bg-blue-600/10 text-blue-400 border border-blue-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            Create Escrow (Client)
          </button>
          <button
            onClick={() => setActiveTab('submit')}
            className={`px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-lg flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'submit'
                ? 'bg-blue-600/10 text-blue-400 border border-blue-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
            }`}
          >
            <Send className="w-4 h-4" />
            Submit Deliverable (Freelancer)
          </button>
          <button
            onClick={() => setActiveTab('jury')}
            className={`px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-lg flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'jury'
                ? 'bg-blue-600/10 text-blue-400 border border-blue-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
            }`}
          >
            <Bot className="w-4 h-4" />
            AI Jury Chamber
          </button>
        </div>

        {/* Tab 1: Explore Escrows */}
        {activeTab === 'explore' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {escrows.map((escrow) => (
                <div
                  key={escrow.id}
                  className="rounded-xl border border-slate-800 bg-[#0d121f] p-5 flex flex-col justify-between hover:border-slate-700 transition-all hover:shadow-xl"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-mono text-slate-500">#{escrow.id}</span>
                      <span
                        className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                          escrow.status === 'RELEASED'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : escrow.status === 'SUBMITTED'
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                            : 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                        }`}
                      >
                        {escrow.status}
                      </span>
                    </div>

                    <h3 className="font-semibold text-sm sm:text-base text-white leading-snug line-clamp-2">
                      {escrow.title}
                    </h3>

                    <div className="bg-slate-900/70 p-3 rounded-lg border border-slate-800/80 text-xs space-y-1.5">
                      <div className="flex justify-between text-slate-400">
                        <span>Deposit:</span>
                        <strong className="text-blue-400 font-mono">{escrow.amount} GEN</strong>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Freelancer:</span>
                        <span className="text-slate-300 font-mono">{escrow.freelancer}</span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Criteria</span>
                      <p className="text-xs text-slate-300 bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/50 line-clamp-3">
                        {escrow.requirements}
                      </p>
                    </div>

                    {escrow.deliveryUrl && (
                      <div className="pt-1">
                        <a
                          href={escrow.deliveryUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-blue-400 hover:underline flex items-center gap-1 truncate"
                        >
                          <FileCode2 className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{escrow.deliveryUrl}</span>
                        </a>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-slate-800/80 mt-4 flex items-center justify-between gap-2">
                    <button
                      onClick={() => {
                        setSelectedEscrowId(escrow.id);
                        setActiveTab('jury');
                      }}
                      className="text-xs text-slate-400 hover:text-white flex items-center gap-1 font-medium transition-colors cursor-pointer"
                    >
                      <Scale className="w-3.5 h-3.5" />
                      View Jury
                    </button>

                    {escrow.status === 'SUBMITTED' && (
                      <button
                        onClick={() => triggerAdjudication(escrow.id)}
                        className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs flex items-center gap-1.5 shadow-md shadow-blue-600/30 transition-all cursor-pointer"
                      >
                        <Cpu className="w-3.5 h-3.5" />
                        Run AI Adjudication
                      </button>
                    )}

                    {escrow.status === 'FUNDED' && (
                      <button
                        onClick={() => {
                          setSubmitEscrowId(escrow.id);
                          setActiveTab('submit');
                        }}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                        Submit Work
                      </button>
                    )}

                    {escrow.status === 'RELEASED' && (
                      <div className="flex items-center gap-1 text-xs text-emerald-400 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Payout Released</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Create Escrow */}
        {activeTab === 'create' && (
          <div className="max-w-2xl mx-auto rounded-2xl border border-slate-800 bg-[#0d121f] p-6 sm:p-8 shadow-xl">
            <div className="flex items-center gap-3 pb-6 border-b border-slate-800 mb-6">
              <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <PlusCircle className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Create New Escrow Contract</h2>
                <p className="text-xs text-slate-400">Lock GEN tokens with plain-English acceptance criteria on GenLayer.</p>
              </div>
            </div>

            <form onSubmit={handleCreateEscrow} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Project Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Build Telegram Bot with Gemini API & Python"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                  className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Freelancer Wallet Address
                  </label>
                  <input
                    type="text"
                    placeholder="0xManiyaAnil / 0x..."
                    value={newFreelancer}
                    onChange={(e) => setNewFreelancer(e.target.value)}
                    className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm font-mono text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Staked Deposit (GEN)
                  </label>
                  <input
                    type="number"
                    min="10"
                    placeholder="250"
                    value={newAmount}
                    onChange={(e) => setNewAmount(e.target.value)}
                    required
                    className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm font-mono text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Acceptance Criteria (Natural Language Prompt for AI Validators)
                </label>
                <textarea
                  rows={4}
                  placeholder="Clearly explain the deliverables. E.g. Must include working GitHub repo with main branch commits, Dockerfile, passes tests, and has live Vercel demo URL."
                  value={newRequirements}
                  onChange={(e) => setNewRequirements(e.target.value)}
                  required
                  className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl p-3.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all"
                />
                <p className="text-[11px] text-slate-500 mt-1.5">
                  GenLayer’s 5 AI validator jury will evaluate the freelancer's submission link against these exact sentences.
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 font-semibold text-sm text-white shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Lock className="w-4 h-4" />
                  Deposit & Deploy Escrow Contract
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tab 3: Submit Work */}
        {activeTab === 'submit' && (
          <div className="max-w-2xl mx-auto rounded-2xl border border-slate-800 bg-[#0d121f] p-6 sm:p-8 shadow-xl">
            <div className="flex items-center gap-3 pb-6 border-b border-slate-800 mb-6">
              <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <Send className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Submit Work for AI Adjudication</h2>
                <p className="text-xs text-slate-400">Provide verifiable proof of completion (GitHub PR, commit, or demo URL).</p>
              </div>
            </div>

            <form onSubmit={handleSubmitDelivery} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Select Funded Escrow Agreement
                </label>
                <select
                  value={submitEscrowId}
                  onChange={(e) => setSubmitEscrowId(Number(e.target.value))}
                  className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition-all"
                >
                  {escrows.filter(e => e.status === 'FUNDED').map(e => (
                    <option key={e.id} value={e.id}>
                      #{e.id} - {e.title} ({e.amount} GEN)
                    </option>
                  ))}
                  {escrows.filter(e => e.status === 'FUNDED').length === 0 && (
                    <option disabled value="">No currently FUNDED escrows</option>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Deliverable Proof Link (Public URL)
                </label>
                <input
                  type="url"
                  placeholder="https://github.com/org/repo/pull/1 or https://demo.vercel.app"
                  value={submitUrl}
                  onChange={(e) => setSubmitUrl(e.target.value)}
                  required
                  className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm font-mono text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all"
                />
                <p className="text-[11px] text-slate-500 mt-1.5">
                  GenLayer’s Intelligent Contract uses <code className="text-blue-400">gl.nondet.web.render()</code> to fetch this URL directly on-chain.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Submission Notes & Proof Summary
                </label>
                <textarea
                  rows={4}
                  placeholder="Describe your implementation, tests completed, and how you met the client's criteria..."
                  value={submitNotes}
                  onChange={(e) => setSubmitNotes(e.target.value)}
                  className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl p-3.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 font-semibold text-sm text-white shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  Submit Deliverable & Summon AI Jury
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tab 4: AI Jury Chamber */}
        {activeTab === 'jury' && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-800 bg-[#0d121f] p-6 sm:p-8 shadow-xl">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
                    <Scale className="w-7 h-7" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-bold text-white">GenLayer AI Validator Jury</h2>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/30">
                        Optimistic Democracy
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">
                      5 independent AI models acting as decentralized blockchain jurors.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={selectedEscrowId}
                    onChange={(e) => setSelectedEscrowId(Number(e.target.value))}
                    className="bg-slate-900 border border-slate-700 text-xs rounded-lg px-3 py-2 text-slate-200"
                  >
                    {escrows.map(e => (
                      <option key={e.id} value={e.id}>
                        Escrow #{e.id}: {e.title.slice(0, 30)}...
                      </option>
                    ))}
                  </select>

                  {currentJuryEscrow.status === 'SUBMITTED' && (
                    <button
                      onClick={() => triggerAdjudication(currentJuryEscrow.id)}
                      disabled={isAdjudicating}
                      className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-medium text-xs flex items-center gap-1.5 transition-all shadow-md shadow-blue-600/20 cursor-pointer"
                    >
                      <Cpu className="w-3.5 h-3.5" />
                      {isAdjudicating ? 'Jurors Voting...' : 'Execute Verdict'}
                    </button>
                  )}
                </div>
              </div>

              {/* Escrow Details In Jury */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
                <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Contract Requirements
                  </span>
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                    {currentJuryEscrow.requirements}
                  </p>
                </div>

                <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Deliverable Evidence URL
                  </span>
                  {currentJuryEscrow.deliveryUrl ? (
                    <a
                      href={currentJuryEscrow.deliveryUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs sm:text-sm text-blue-400 hover:underline flex items-center gap-1.5 break-all"
                    >
                      <ExternalLink className="w-4 h-4 shrink-0" />
                      <span>{currentJuryEscrow.deliveryUrl}</span>
                    </a>
                  ) : (
                    <span className="text-xs text-slate-500 italic">No deliverable submitted yet.</span>
                  )}
                  {currentJuryEscrow.deliveryNotes && (
                    <p className="text-xs text-slate-400 mt-2 border-t border-slate-800/80 pt-2">
                      <strong className="text-slate-300">Notes:</strong> {currentJuryEscrow.deliveryNotes}
                    </p>
                  )}
                </div>
              </div>

              {/* Adjudication Status Banner */}
              {isAdjudicating ? (
                <div className="p-6 rounded-xl border border-blue-500/30 bg-blue-500/5 flex flex-col items-center justify-center text-center space-y-3 animate-pulse">
                  <Cpu className="w-8 h-8 text-blue-400 animate-spin" />
                  <h4 className="text-sm font-semibold text-white">5 Decentralized AI Validators Evaluating Web Evidence...</h4>
                  <p className="text-xs text-slate-400 max-w-md">
                    Calling <code className="text-blue-300">gl.nondet.web.render()</code> and <code className="text-blue-300">gl.nondet.exec_prompt()</code> under GenLayer’s Equivalence Principle.
                  </p>
                </div>
              ) : currentJuryEscrow.verdictScore ? (
                <div className="p-5 rounded-xl border border-emerald-500/30 bg-emerald-500/5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      <span className="font-semibold text-sm text-white">Consensus Verdict Reached: APPROVED</span>
                    </div>
                    <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      Score: {currentJuryEscrow.verdictScore}/100
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                    {currentJuryEscrow.verdictReasoning}
                  </p>
                </div>
              ) : (
                <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/40 flex items-center gap-3 text-xs text-slate-400">
                  <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Awaiting deliverable submission or adjudication trigger.</span>
                </div>
              )}

              {/* 5 Validator Nodes Visualization */}
              <div className="pt-6">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-blue-400" />
                  Decentralized Validator Node Jury Breakdown
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                  {(currentJuryEscrow.validators || [
                    { name: 'Validator #1', model: 'Claude 3.5 Sonnet', vote: 'APPROVE', confidence: 95 },
                    { name: 'Validator #2', model: 'Llama 3.3 70B', vote: 'APPROVE', confidence: 92 },
                    { name: 'Validator #3', model: 'Mistral Large 2', vote: 'APPROVE', confidence: 94 },
                    { name: 'Validator #4', model: 'GPT-4o Mini', vote: 'APPROVE', confidence: 91 },
                    { name: 'Validator #5', model: 'DeepSeek V3', vote: 'APPROVE', confidence: 93 },
                  ]).map((val, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/70 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-white">{val.name}</span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {val.vote}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 font-mono truncate">{val.model}</p>
                      <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-blue-500 h-1.5 rounded-full"
                          style={{ width: `${val.confidence}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-slate-500 block text-right font-mono">
                        {val.confidence}% Confidence
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Technical Architecture & GenLayer Specification Showcase */}
        <section className="rounded-2xl border border-slate-800 bg-[#0a0d16] p-6 sm:p-8 space-y-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <FileCode2 className="w-5 h-5 text-blue-400" />
            <span>How EscrowGuard AI Uses GenLayer’s Unique Architecture</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl border border-slate-800/80 bg-slate-900/40 space-y-2">
              <strong className="text-blue-400 text-sm block">1. Native Web Proof Inspection</strong>
              <p className="text-slate-400 leading-relaxed">
                Uses <code className="text-slate-200">gl.nondet.web.render(url)</code> inside the Python contract to read live GitHub Pull Requests, commit histories, and deployment URLs directly from the validator nodes.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-800/80 bg-slate-900/40 space-y-2">
              <strong className="text-indigo-400 text-sm block">2. LLM Juror Consensus</strong>
              <p className="text-slate-400 leading-relaxed">
                Calls <code className="text-slate-200">gl.nondet.exec_prompt()</code> across 5 independent AI models. Prompts are hardened against injection to ensure objective evaluation against client criteria.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-800/80 bg-slate-900/40 space-y-2">
              <strong className="text-teal-400 text-sm block">3. Optimistic Democracy</strong>
              <p className="text-slate-400 leading-relaxed">
                Applies GenLayer's Equivalence Principle to achieve Byzantine fault-tolerant consensus across diverse LLMs, triggering automated token release without manual arbitration.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-[#07090e] py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 EscrowGuard AI. Built for the GenLayer Ecosystem & Builder Track.</p>
          <div className="flex items-center gap-4 text-slate-400">
            <a href="https://genlayer.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
              GenLayer Official
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
