'use client';

import React, { useState } from 'react';
import { 
  ArrowRight, 
  RefreshCw, 
  ShieldCheck, 
  Sparkles,
  Receipt,
  FileSpreadsheet,
  CheckCircle2,
  Lock,
  Layers
} from 'lucide-react';
import InvoiceView from '@/components/InvoiceView';
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
  const [activeTab, setActiveTab] = useState<'flow' | 'ledger'>('flow');

  const handleGenerate = async (textToUse?: string) => {
    const finalPrompt = textToUse || prompt;
    if (!finalPrompt.trim()) return;

    setLoading(true);
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
      setHistory((prev) => [data.invoice, ...prev]);
      setActiveTab('flow');

      setTimeout(() => {
        const el = document.getElementById('step-2-section');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 150);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
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
    setHistory((prev) =>
      prev.map((inv) =>
        inv.invoiceNumber === updatedInvoice.invoiceNumber ? updatedInvoice : inv
      )
    );
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-white flex flex-col font-sans ambient-mesh selection:bg-[#0070ba] selection:text-white">
      {/* Top Floating Glass Navigation */}
      <header className="sticky top-0 z-50 border-b border-white/[0.08] bg-[#07090e]/85 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between">
          
          {/* Brand Mark */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-[#0070ba] flex items-center justify-center font-black text-white text-base shadow-sm">
              P
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base sm:text-lg tracking-tight text-white">
                  PayGenie
                </span>
                <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#0070ba]/20 text-[#38bdf8] border border-[#0070ba]/40">
                  PayPal + Gemini
                </span>
              </div>
            </div>
          </div>

          {/* Nav Tabs */}
          <div className="flex items-center gap-3">
            <div className="flex bg-black/40 p-1 rounded-xl border border-white/[0.08]">
              <button
                onClick={() => setActiveTab('flow')}
                className={`cursor-pointer px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                  activeTab === 'flow' ? 'bg-white/10 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                Workflow
              </button>
              <button
                onClick={() => setActiveTab('ledger')}
                className={`cursor-pointer px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                  activeTab === 'ledger' ? 'bg-white/10 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                Ledger ({history.length})
              </button>
            </div>

            <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
              <Lock className="w-3.5 h-3.5" /> Sandbox Active
            </span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-10 sm:py-14">
        {activeTab === 'flow' ? (
          <div className="space-y-12">
            
            {/* Editorial Hero Stage */}
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-[1.15] text-balance">
                Turn Plain Words into Settled Payments
              </h1>
              <h2 className="text-sm sm:text-base text-slate-300 font-normal max-w-lg mx-auto leading-relaxed">
                Describe any project or sale naturally. Gemini AI structures the mathematics while PayPal handles immediate one-click checkout.
              </h2>
            </div>

            {/* Stepper Indicator */}
            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              <div className="p-3 rounded-2xl border border-[#0070ba]/40 bg-[#0070ba]/15 text-[#38bdf8] font-bold shadow-sm">
                01. Prompt
              </div>
              <div className={`p-3 rounded-2xl border ${invoice ? 'border-[#0070ba]/40 bg-[#0070ba]/15 text-[#38bdf8] font-bold shadow-sm' : 'border-white/[0.06] bg-black/30 text-slate-400 font-medium'}`}>
                02. AI Invoice
              </div>
              <div className={`p-3 rounded-2xl border ${invoice?.status === 'PAID' ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-300 font-bold shadow-sm' : invoice ? 'border-[#0070ba]/40 bg-[#0070ba]/15 text-[#38bdf8] font-bold shadow-sm' : 'border-white/[0.06] bg-black/30 text-slate-400 font-medium'}`}>
                03. PayPal Settle
              </div>
              <div className={`p-3 rounded-2xl border ${invoice?.status === 'PAID' ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-300 font-bold shadow-sm' : 'border-white/[0.06] bg-black/30 text-slate-400 font-medium'}`}>
                04. Receipt
              </div>
            </div>

            {/* STEP 1: DESCRIBE THE BILL */}
            <div className="glass-panel rounded-3xl p-6 sm:p-9 space-y-5">
              <div className="flex items-center gap-3 pb-4 border-b border-white/[0.08]">
                <div className="w-8 h-8 rounded-xl bg-[#0070ba] text-white flex items-center justify-center font-extrabold text-xs">
                  01
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Describe Project & Pricing</h3>
                  <p className="text-xs text-slate-300">Natural language input analyzed by Gemini 3.5 Flash</p>
                </div>
              </div>

              <textarea
                rows={3}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g. Billed Acme Tech $650 for React Dashboard development, 10 hours at $65/hr with a 5% early bird discount..."
                className="w-full bg-black/40 border border-white/[0.08] rounded-2xl p-4 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-[#0070ba] focus:ring-1 focus:ring-[#0070ba] transition"
              />

              {error && (
                <p className="text-xs text-red-300 bg-red-500/15 p-3 rounded-xl border border-red-500/30">
                  {error}
                </p>
              )}

              {/* Quick Presets */}
              <div className="space-y-2">
                <span className="text-[11px] uppercase font-bold text-slate-300 tracking-wider">
                  Test Scenarios (1-Click):
                </span>
                <div className="flex flex-col sm:flex-row gap-2">
                  {SAMPLE_PROMPTS.map((sample, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setPrompt(sample);
                        handleGenerate(sample);
                      }}
                      className="cursor-pointer text-xs text-left bg-white/[0.06] hover:bg-white/[0.12] text-slate-200 hover:text-white p-3 rounded-xl border border-white/[0.06] transition flex-1 truncate font-medium"
                    >
                      {sample}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => handleGenerate()}
                  disabled={loading || !prompt.trim()}
                  className="btn-craft-primary w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Parsing with Gemini AI...
                    </>
                  ) : (
                    <>
                      Extract Invoice & Settle
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* STEP 2, 3, 4: SEQUENTIALLY DISPLAYED */}
            {invoice && (
              <div id="step-2-section" className="space-y-8 animate-fade-in scroll-mt-24">
                <div className="flex items-center gap-3 pt-2">
                  <div className="w-8 h-8 rounded-xl bg-[#0070ba]/20 text-[#38bdf8] flex items-center justify-center font-extrabold text-xs border border-[#0070ba]/40">
                    02
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white">Verified Structured Invoice</h3>
                    <p className="text-xs text-slate-300">Ready for instant client settlement & PDF export</p>
                  </div>
                </div>

                <InvoiceView invoice={invoice} onPaymentSuccess={handlePaymentSuccess} />
              </div>
            )}
          </div>
        ) : (
          /* Ledger Tab */
          <div className="glass-panel rounded-3xl p-6 sm:p-9">
            <div className="flex items-center justify-between pb-5 border-b border-white/[0.08]">
              <div>
                <h2 className="text-xl font-black text-white">Merchant Settlement Ledger</h2>
                <p className="text-xs text-slate-300 mt-0.5">Session records & confirmed PayPal transactions</p>
              </div>
              <div className="text-right">
                <span className="text-[11px] uppercase font-bold text-slate-400 block">Total Collected</span>
                <span className="text-xl font-mono font-extrabold text-emerald-400">
                  ${history
                    .filter((i) => i.status === 'PAID')
                    .reduce((sum, i) => sum + i.totalAmount, 0)
                    .toFixed(2)}
                </span>
              </div>
            </div>

            {history.length === 0 ? (
              <div className="text-center py-16 text-slate-400 text-xs">
                No invoices in this session. Generate an invoice from the Workflow tab.
              </div>
            ) : (
              <div className="overflow-x-auto mt-6">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-white/[0.08] text-slate-400 uppercase text-[11px]">
                      <th className="py-3 px-3 font-bold">Invoice #</th>
                      <th className="py-3 px-3 font-bold">Client</th>
                      <th className="py-3 px-3 font-bold">Date</th>
                      <th className="py-3 px-3 text-right font-bold">Amount</th>
                      <th className="py-3 px-3 text-center font-bold">Status</th>
                      <th className="py-3 px-3 text-right font-bold">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04] text-slate-200">
                    {history.map((inv, idx) => (
                      <tr key={idx} className="hover:bg-white/[0.03] transition">
                        <td className="py-3.5 px-3 font-mono font-semibold text-[#38bdf8]">{inv.invoiceNumber}</td>
                        <td className="py-3.5 px-3 text-white font-bold">{inv.clientName}</td>
                        <td className="py-3.5 px-3 text-slate-300">{inv.date}</td>
                        <td className="py-3.5 px-3 text-right font-mono font-bold text-white">${inv.totalAmount.toFixed(2)}</td>
                        <td className="py-3.5 px-3 text-center">
                          {inv.status === 'PAID' ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                              PAID
                            </span>
                          ) : (
                            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                              PENDING
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-3 text-right">
                          <button
                            onClick={() => {
                              setInvoice(inv);
                              setActiveTab('flow');
                            }}
                            className="cursor-pointer text-xs font-bold text-[#38bdf8] hover:underline"
                          >
                            View & Settle →
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/[0.08] bg-[#07090e] py-8 text-xs text-slate-400">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="font-bold text-slate-300">PayGenie • PayPal AI Hackathon 2026</span>
          <span className="text-slate-400">PayPal Orders v2 SDK & Google Gemini 3.5 Integration</span>
        </div>
      </footer>
    </div>
  );
}
