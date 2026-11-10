'use client';

import React, { useState } from 'react';
import { Sparkles, ArrowRight, RefreshCw, Zap, ShieldCheck, CheckCircle2, History, Layers } from 'lucide-react';
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                PayGenie <span className="text-blue-500">AI</span>
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] font-semibold tracking-wider uppercase text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-full">
                PayPal + Gemini
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5 text-slate-400 bg-slate-900 px-3 py-1.5 rounded-full border border-slate-800">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>PayPal Sandbox Ready</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Hero Pitch */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-4">
            <Zap className="w-3.5 h-3.5" /> Autonomous Agentic Billing
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            Prompt to Paid in <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-cyan-400 bg-clip-text text-transparent">Seconds</span>
          </h1>
          <p className="mt-4 text-slate-400 text-sm sm:text-base leading-relaxed">
            Describe your client work naturally. Our Gemini AI model parses items, discounts, taxes, and drafts reminder emails — while PayPal handles immediate, secure payment collection.
          </p>
        </div>

        {/* Input Card */}
        <div className="max-w-3xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl mb-12">
          <label htmlFor="prompt-input" className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            Describe Your Job / Bill Details
          </label>
          <textarea
            id="prompt-input"
            rows={3}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g. Billed Sarah Connor $500 for custom Webflow site + 3 revisions, apply 10% discount and make due in 7 days..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          />

          {error && (
            <p className="text-red-400 text-xs mt-2 bg-red-500/10 p-2 rounded-lg border border-red-500/20">
              {error}
            </p>
          )}

          {/* Quick suggestions */}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-semibold text-slate-500">Quick Try:</span>
            {SAMPLE_PROMPTS.map((sample, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setPrompt(sample);
                  handleGenerate(sample);
                }}
                className="text-xs text-left bg-slate-800/80 hover:bg-slate-800 text-slate-300 px-2.5 py-1 rounded-lg border border-slate-700/50 transition truncate max-w-[240px]"
              >
                {sample}
              </button>
            ))}
          </div>

          <div className="mt-5 flex justify-end">
            <button
              onClick={() => handleGenerate()}
              disabled={loading || !prompt.trim()}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-sm px-6 py-2.5 rounded-xl transition shadow-lg shadow-blue-600/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Generating Invoice with AI...
                </>
              ) : (
                <>
                  Generate & Checkout
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Display Current Invoice */}
        {invoice && (
          <div className="max-w-4xl mx-auto mb-16 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-blue-400" />
                Live Generated Invoice
              </h2>
            </div>
            <InvoiceView invoice={invoice} onPaymentSuccess={handlePaymentSuccess} />
          </div>
        )}

        {/* Invoices History / Ledger */}
        {history.length > 0 && (
          <div className="max-w-4xl mx-auto mt-12 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-800">
              <History className="w-5 h-5 text-indigo-400" />
              <h3 className="font-bold text-white text-base">Session Invoices Ledger</h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-slate-400 border-b border-slate-800 uppercase">
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
                      <td className="py-3 text-right font-bold text-slate-100">${inv.totalAmount.toFixed(2)}</td>
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
                          onClick={() => setInvoice(inv)}
                          className="text-xs text-blue-400 hover:text-blue-300 underline font-medium"
                        >
                          View & Pay
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

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <p>Built for PayPal AI Hackathon 2026 • Powered by PayPal Sandbox & Gemini AI</p>
      </footer>
    </div>
  );
}
