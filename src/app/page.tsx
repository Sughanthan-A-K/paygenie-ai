'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  RefreshCw,
  Zap,
  ShieldCheck,
  CheckCircle2,
  History,
  Layers,
  Monitor,
  Smartphone,
  Eye,
  Check,
  Send,
} from 'lucide-react';
import InvoiceView from '@/components/InvoiceView';
import GenieAssistant from '@/components/GenieAssistant';
import { InvoiceData } from '@/types/invoice';

const SAMPLE_PROMPTS = [
  "Billed Acme Tech $650 for React Dashboard development, 10 hours at $65/hr with a 5% early bird discount.",
  "Designed brand identity & 5 custom illustrations for Bloom Bakery for $380, due in 10 days.",
  "Cloud consultation for Nexus Labs: 3 architecture review sessions at $150 each plus $50 server setup fee."
];

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [history, setHistory] = useState<InvoiceData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [genieStatus, setGenieStatus] = useState<'idle' | 'generating' | 'ready' | 'paid'>('idle');

  const handleGenerate = async (textToUse?: string) => {
    const finalPrompt = textToUse || prompt;
    if (!finalPrompt.trim()) return;

    setLoading(true);
    setGenieStatus('generating');
    setError(null);

    try {
      const res = await fetch('/api/generate-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: finalPrompt }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate invoice with AI');
      }

      setInvoice(data.invoice);
      setGenieStatus('ready');
      setHistory((prev) => [data.invoice, ...prev]);

      // Smooth scroll to generated invoice
      setTimeout(() => {
        const el = document.getElementById('invoice-section');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
      setGenieStatus('idle');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = (paymentId: string) => {
    if (!invoice) return;
    const updatedInvoice: InvoiceData = {
      ...invoice,
      status: 'PAID',
      paymentId,
      paidAt: new Date().toLocaleString(),
    };
    setInvoice(updatedInvoice);
    setGenieStatus('paid');
    setHistory((prev) =>
      prev.map((inv) =>
        inv.invoiceNumber === updatedInvoice.invoiceNumber ? updatedInvoice : inv
      )
    );
  };

  const handleSelectFromLedger = (selectedInv: InvoiceData) => {
    setInvoice(selectedInv);
    setGenieStatus(selectedInv.status === 'PAID' ? 'paid' : 'ready');
    const el = document.getElementById('invoice-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Navbar */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#003087] via-[#0070BA] to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/25">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-black text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                PayGenie <span className="text-blue-500">AI</span>
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] font-bold tracking-wider uppercase text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded-full">
                PayPal + Gemini 3.5
              </span>
            </div>
          </div>

          {/* Device Simulator Toggle Bar */}
          <div className="flex items-center gap-2">
            <div className="bg-slate-900 border border-slate-800 p-1 rounded-2xl flex items-center gap-1 shadow-inner">
              <button
                onClick={() => setViewMode('desktop')}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold transition cursor-pointer ${
                  viewMode === 'desktop'
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Full Responsive Web View"
              >
                <Monitor className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Desktop</span>
              </button>
              <button
                onClick={() => setViewMode('mobile')}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold transition cursor-pointer ${
                  viewMode === 'mobile'
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Mobile Phone Experience Simulation"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Mobile Frame</span>
              </button>
            </div>

            <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-400 bg-slate-900 px-3 py-1.5 rounded-2xl border border-slate-800">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Sandbox Live</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container - Supports regular view or phone frame simulation */}
      <div className={`flex-1 w-full mx-auto transition-all duration-500 ${
        viewMode === 'mobile'
          ? 'max-w-[420px] my-8 bg-slate-900/90 rounded-[44px] border-[10px] border-slate-800 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] overflow-hidden min-h-[840px]'
          : 'max-w-7xl'
      }`}>
        {/* Mobile top camera notch indicator if in mobile view */}
        {viewMode === 'mobile' && (
          <div className="bg-slate-950 py-2 flex items-center justify-center border-b border-slate-800">
            <div className="w-24 h-4 bg-slate-800 rounded-full flex items-center justify-center">
              <div className="w-2.5 h-2.5 bg-slate-900 rounded-full" />
            </div>
          </div>
        )}

        <main className={`w-full px-4 sm:px-6 lg:px-8 py-8 ${viewMode === 'mobile' ? 'px-4 py-4 text-xs' : ''}`}>
          {/* Hero Section */}
          <div className="text-center max-w-3xl mx-auto mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-4">
              <Zap className="w-3.5 h-3.5" /> Autonomous Commerce Agent
            </div>
            <h1 className={`${viewMode === 'mobile' ? 'text-2xl' : 'text-3xl sm:text-5xl'} font-black tracking-tight text-white leading-tight`}>
              Prompt to Paid in <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-400 bg-clip-text text-transparent">Seconds</span>
            </h1>
            <p className="mt-3 text-slate-400 text-xs sm:text-sm leading-relaxed max-w-2xl mx-auto">
              Type your job or sale in natural conversational words. Gemini 3.5 AI structures calculations, items, and email notices — while PayPal handles instant authorization and settlement.
            </p>
          </div>

          {/* AI Generator Box */}
          <div className="max-w-3xl mx-auto bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-2xl mb-12">
            <label htmlFor="prompt-input" className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Describe Your Work or Client Bill
            </label>
            <textarea
              id="prompt-input"
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. Billed Acme Tech $650 for React Dashboard development, 10 hours at $65/hr with a 5% early bird discount..."
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />

            {error && (
              <p className="text-red-400 text-xs mt-2 bg-red-500/10 p-2.5 rounded-xl border border-red-500/20">
                {error}
              </p>
            )}

            {/* Quick Prompts */}
            <div className="mt-3.5 flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Quick Try:</span>
              {SAMPLE_PROMPTS.map((sample, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setPrompt(sample);
                    handleGenerate(sample);
                  }}
                  className="text-xs text-left bg-slate-800 hover:bg-slate-700/80 text-slate-300 px-3 py-1.5 rounded-xl border border-slate-700/60 transition cursor-pointer truncate max-w-[260px]"
                >
                  {sample}
                </button>
              ))}
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => handleGenerate()}
                disabled={loading || !prompt.trim()}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-[#003087] via-[#0070BA] to-cyan-500 hover:from-blue-600 hover:to-cyan-400 text-white font-bold text-sm px-6 py-3 rounded-2xl transition shadow-lg shadow-blue-600/30 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Agent Structuring...</span>
                  </>
                ) : (
                  <>
                    <span>Generate & Arm PayPal</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Generated Live Invoice Card */}
          {invoice && (
            <div id="invoice-section" className="max-w-4xl mx-auto mb-16 scroll-mt-24">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Layers className="w-5 h-5 text-blue-400" />
                  Live Generated Invoice & Checkout
                </h2>
              </div>
              <InvoiceView invoice={invoice} onPaymentSuccess={handlePaymentSuccess} />
            </div>
          )}

          {/* Historical Session Ledger */}
          {history.length > 0 && (
            <div className="max-w-4xl mx-auto mt-10 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <History className="w-5 h-5 text-indigo-400" />
                  <h3 className="font-bold text-white text-base">Invoices Ledger</h3>
                </div>
                <span className="text-xs text-slate-400">{history.length} Record{history.length > 1 ? 's' : ''}</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="text-slate-400 border-b border-slate-800 uppercase tracking-wider font-semibold">
                      <th className="py-2.5">Invoice #</th>
                      <th className="py-2.5">Client</th>
                      <th className="py-2.5">Date</th>
                      <th className="py-2.5 text-right">Amount</th>
                      <th className="py-2.5 text-center">Status</th>
                      <th className="py-2.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300">
                    {history.map((inv, index) => (
                      <tr key={index} className="hover:bg-slate-800/40 transition">
                        <td className="py-3 font-mono font-bold text-blue-400">{inv.invoiceNumber}</td>
                        <td className="py-3 font-medium text-white">{inv.clientName}</td>
                        <td className="py-3 text-slate-400">{inv.date}</td>
                        <td className="py-3 text-right font-mono font-bold text-slate-100">${inv.totalAmount.toFixed(2)}</td>
                        <td className="py-3 text-center">
                          {inv.status === 'PAID' ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                              <CheckCircle2 className="w-3 h-3" /> PAID
                            </span>
                          ) : (
                            <span className="text-[11px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                              PENDING
                            </span>
                          )}
                        </td>
                        <td className="py-3 text-right">
                          <button
                            onClick={() => handleSelectFromLedger(inv)}
                            className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 underline font-semibold cursor-pointer"
                          >
                            <Eye className="w-3 h-3" />
                            <span>View & Pay</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Futuristic Fintech Floating Genie Avatar with Live Dynamic State */}
      <GenieAssistant
        status={genieStatus}
        clientName={invoice?.clientName}
        amount={invoice?.totalAmount}
        currency={invoice?.currency}
      />

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500 mt-12">
        <p>Built for PayPal AI Hackathon 2026 • Powered by PayPal Sandbox & Gemini 3.5 AI</p>
      </footer>
    </div>
  );
}
