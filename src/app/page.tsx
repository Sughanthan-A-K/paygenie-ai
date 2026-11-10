'use client';

import React, { useState } from 'react';
import { 
  ArrowRight, 
  RefreshCw, 
  ShieldCheck, 
  CheckCircle2, 
  Sparkles,
  Receipt,
  FileSpreadsheet,
  Check,
  CreditCard,
  Send,
  Zap,
  ArrowDown
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
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="border-b border-white/10 bg-[#0b0f19]/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#0070ba] flex items-center justify-center font-black text-white text-sm">
              P
            </div>
            <div>
              <span className="font-bold text-base text-white tracking-tight">PayGenie</span>
              <span className="ml-2 text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-[#0070ba]/20 text-[#38bdf8] border border-[#0070ba]/40">
                PayPal + AI
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex bg-[#111827] p-1 rounded-lg border border-white/10">
              <button
                onClick={() => setActiveTab('flow')}
                className={`cursor-pointer px-3 py-1 rounded-md text-xs font-medium transition ${
                  activeTab === 'flow' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Workflow
              </button>
              <button
                onClick={() => setActiveTab('ledger')}
                className={`cursor-pointer px-3 py-1 rounded-md text-xs font-medium transition ${
                  activeTab === 'ledger' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Ledger ({history.length})
              </button>
            </div>

            <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
              <ShieldCheck className="w-3.5 h-3.5" /> Sandbox Ready
            </span>
          </div>
        </div>
      </header>

      {/* Main Single Column Sequential Flow */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-10">
        {activeTab === 'flow' ? (
          <div className="space-y-10">
            
            {/* Header Hero */}
            <div className="text-center max-w-2xl mx-auto">
              <span className="text-xs font-mono uppercase tracking-wider text-[#38bdf8] font-bold">
                PayPal Developer Platform + Gemini AI
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mt-2">
                Automated Payment Workflow
              </h1>
              <p className="text-sm text-slate-400 mt-2">
                From conversational description to structured invoice, PayPal Sandbox settlement, and client confirmation.
              </p>
            </div>

            {/* Stepper Progress Indicator */}
            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              <div className="p-2.5 rounded-xl border border-[#0070ba]/40 bg-[#0070ba]/10 text-[#38bdf8] font-semibold">
                1. Describe Job
              </div>
              <div className={`p-2.5 rounded-xl border ${invoice ? 'border-[#0070ba]/40 bg-[#0070ba]/10 text-[#38bdf8] font-semibold' : 'border-white/5 bg-[#111827] text-slate-500'}`}>
                2. AI Invoice
              </div>
              <div className={`p-2.5 rounded-xl border ${invoice?.status === 'PAID' ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400 font-semibold' : invoice ? 'border-[#0070ba]/40 bg-[#0070ba]/10 text-[#38bdf8] font-semibold' : 'border-white/5 bg-[#111827] text-slate-500'}`}>
                3. PayPal Checkout
              </div>
              <div className={`p-2.5 rounded-xl border ${invoice?.status === 'PAID' ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400 font-semibold' : 'border-white/5 bg-[#111827] text-slate-500'}`}>
                4. Confirmation
              </div>
            </div>

            {/* STEP 1: DESCRIBE WORK */}
            <div className="bg-[#111827] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-xl space-y-5">
              <div className="flex items-center gap-3 pb-4 border-b border-white/10">
                <div className="w-8 h-8 rounded-full bg-[#0070ba] text-white flex items-center justify-center font-bold text-xs">
                  01
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Describe Your Project / Bill</h3>
                  <p className="text-xs text-slate-400">Natural language input processed by Gemini AI</p>
                </div>
              </div>

              <textarea
                rows={3}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g. Billed Acme Tech $650 for React Dashboard development, 10 hours at $65/hr with a 5% early bird discount..."
                className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#0070ba] transition"
              />

              {error && (
                <p className="text-xs text-red-400 bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                  {error}
                </p>
              )}

              {/* Presets */}
              <div className="space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Or Test with a preset:
                </span>
                <div className="flex flex-col sm:flex-row gap-2">
                  {SAMPLE_PROMPTS.map((sample, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        setPrompt(sample);
                        handleGenerate(sample);
                      }}
                      className="cursor-pointer text-xs text-left bg-white/5 hover:bg-white/10 text-slate-300 p-2.5 rounded-lg border border-white/5 transition flex-1 truncate"
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
                  className="btn-primary w-full sm:w-auto px-6 py-2.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                      Parsing with Gemini AI...
                    </>
                  ) : (
                    <>
                      Extract Invoice & Settle
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* STEP 2, 3, 4: RENDERED SEQUENTIALLY ONCE GENERATED */}
            {invoice && (
              <div id="step-2-section" className="space-y-8 animate-fade-in scroll-mt-20">
                <div className="flex items-center gap-3 pt-4">
                  <div className="w-8 h-8 rounded-full bg-[#0070ba]/20 text-[#38bdf8] flex items-center justify-center font-bold text-xs border border-[#0070ba]/40">
                    02
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Generated Structured Invoice</h3>
                    <p className="text-xs text-slate-400">Validated calculations with exportable PDF</p>
                  </div>
                </div>

                <InvoiceView invoice={invoice} onPaymentSuccess={handlePaymentSuccess} />
              </div>
            )}
          </div>
        ) : (
          /* Merchant Ledger Tab */
          <div className="bg-[#111827] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-xl">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div>
                <h2 className="text-lg font-bold text-white">Merchant Ledger</h2>
                <p className="text-xs text-slate-400 mt-0.5">Session settlement records</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Settled</span>
                <span className="text-lg font-mono font-bold text-emerald-400">
                  ${history
                    .filter((i) => i.status === 'PAID')
                    .reduce((sum, i) => sum + i.totalAmount, 0)
                    .toFixed(2)}
                </span>
              </div>
            </div>

            {history.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs">
                No invoices recorded yet. Start in the Workflow tab.
              </div>
            ) : (
              <div className="overflow-x-auto mt-4">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-white/10 text-slate-500 uppercase text-[10px]">
                      <th className="py-2.5 px-3">Invoice #</th>
                      <th className="py-2.5 px-3">Client</th>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3 text-right">Amount</th>
                      <th className="py-2.5 px-3 text-center">Status</th>
                      <th className="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-slate-300">
                    {history.map((inv, idx) => (
                      <tr key={idx} className="hover:bg-white/5 transition">
                        <td className="py-3 px-3 font-mono font-semibold text-[#38bdf8]">{inv.invoiceNumber}</td>
                        <td className="py-3 px-3 text-white font-medium">{inv.clientName}</td>
                        <td className="py-3 px-3 text-slate-400">{inv.date}</td>
                        <td className="py-3 px-3 text-right font-mono text-slate-200">${inv.totalAmount.toFixed(2)}</td>
                        <td className="py-3 px-3 text-center">
                          {inv.status === 'PAID' ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                              PAID
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
                              PENDING
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => {
                              setInvoice(inv);
                              setActiveTab('flow');
                            }}
                            className="cursor-pointer text-xs text-[#38bdf8] hover:underline"
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
      <footer className="border-t border-white/10 bg-[#0b0f19] py-6 text-xs text-slate-500">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>PayGenie • PayPal AI Hackathon 2026</span>
          <span>Integrated with PayPal Orders v2 & Gemini 3.5</span>
        </div>
      </footer>
    </div>
  );
}
