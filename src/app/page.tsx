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
  Zap,
  Layers,
  Clock
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
  const [activeTab, setActiveTab] = useState<'create' | 'ledger'>('create');

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
      setActiveTab('create');
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
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col font-sans fintech-grid">
      {/* Precision Header */}
      <header className="border-b border-[#1f2a40] bg-[#090d16]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#003087] to-[#0070ba] flex items-center justify-center font-bold text-white text-sm shadow-md shadow-[#0070ba]/30">
              PG
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base tracking-tight text-white">
                PayGenie
              </span>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-[#0070ba]/10 text-[#38bdf8] border border-[#0070ba]/30">
                AI + PayPal
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex bg-[#101726] p-1 rounded-lg border border-[#1f2a40]">
              <button
                onClick={() => setActiveTab('create')}
                className={`cursor-pointer px-3 py-1 rounded-md text-xs font-medium transition ${
                  activeTab === 'create'
                    ? 'bg-[#151e32] text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Billing Workspace
              </button>
              <button
                onClick={() => setActiveTab('ledger')}
                className={`cursor-pointer px-3 py-1 rounded-md text-xs font-medium transition ${
                  activeTab === 'ledger'
                    ? 'bg-[#151e32] text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
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

      {/* Main Workspace Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
        {activeTab === 'create' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Creator Input Console (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-[#38bdf8] font-semibold">
                  Autonomous Commerce
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
                  Prompt to Paid
                </h1>
                <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed">
                  Type unformatted project details. Gemini AI calculates line items, taxes, discounts, and wires up PayPal Checkout instantly.
                </p>
              </div>

              {/* Input Card */}
              <div className="bg-[#101726] border border-[#1f2a40] rounded-2xl p-5 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <label htmlFor="prompt-input" className="text-xs font-semibold text-slate-300">
                    Job / Invoice Details
                  </label>
                  <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-[#38bdf8]" /> Gemini 3.5 Flash
                  </span>
                </div>

                <textarea
                  id="prompt-input"
                  rows={4}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g. Billed Acme Tech $650 for React Dashboard development, 10 hours at $65/hr with a 5% early bird discount..."
                  className="w-full bg-[#090d16] border border-[#1f2a40] rounded-xl p-3.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#0070ba] focus:ring-1 focus:ring-[#0070ba] transition"
                />

                {error && (
                  <p className="text-xs text-red-400 bg-red-500/10 p-2.5 rounded-lg border border-red-500/20">
                    {error}
                  </p>
                )}

                {/* Example Quick Presets */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                    Quick Presets:
                  </span>
                  <div className="flex flex-col gap-1.5">
                    {SAMPLE_PROMPTS.map((sample, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setPrompt(sample);
                          handleGenerate(sample);
                        }}
                        className="cursor-pointer text-left text-xs bg-[#151e32] hover:bg-[#1f2a40] text-slate-300 hover:text-white p-2.5 rounded-lg border border-[#1f2a40] transition truncate"
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
                    className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Analyzing with Gemini...
                      </>
                    ) : (
                      <>
                        Generate & Wire PayPal
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Live Rendered Invoice & PayPal Integration (7 cols) */}
            <div className="lg:col-span-7">
              {invoice ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
                      Live Output
                    </span>
                    <span className="text-xs text-slate-400">
                      Generated at {invoice.date}
                    </span>
                  </div>
                  <InvoiceView invoice={invoice} onPaymentSuccess={handlePaymentSuccess} />
                </div>
              ) : (
                <div className="bg-[#101726]/40 border-2 border-dashed border-[#1f2a40] rounded-2xl p-12 text-center text-slate-500">
                  <Receipt className="w-12 h-12 mx-auto mb-3 text-slate-600" />
                  <h3 className="text-sm font-semibold text-slate-300">No Invoice Active</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    Type a prompt on the left or select a Quick Preset to extract an itemized invoice and trigger PayPal checkout.
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Merchant Ledger View */
          <div className="bg-[#101726] border border-[#1f2a40] rounded-2xl p-6 shadow-xl max-w-5xl mx-auto">
            <div className="flex items-center justify-between pb-4 border-b border-[#1f2a40]">
              <div>
                <h2 className="text-lg font-bold text-white">Merchant Ledger</h2>
                <p className="text-xs text-slate-400 mt-0.5">Session transactions and settlement statuses</p>
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
                No invoices created in this session.
              </div>
            ) : (
              <div className="overflow-x-auto mt-4">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#1f2a40] text-slate-500 uppercase text-[10px]">
                      <th className="py-2.5 px-3">Invoice #</th>
                      <th className="py-2.5 px-3">Client</th>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3 text-right">Amount</th>
                      <th className="py-2.5 px-3 text-center">Status</th>
                      <th className="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1f2a40]/60 text-slate-300">
                    {history.map((inv, idx) => (
                      <tr key={idx} className="hover:bg-[#151e32]/50 transition">
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
                              setActiveTab('create');
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
      <footer className="border-t border-[#1f2a40] bg-[#090d16] py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>PayGenie AI • Built for PayPal AI Hackathon 2026</span>
          <span>Powered by PayPal Orders v2 & Google Gemini 3.5</span>
        </div>
      </footer>
    </div>
  );
}
