'use client';

import React, { useState } from 'react';
import { 
  ArrowRight, 
  RefreshCw, 
  ShieldCheck, 
  Sparkles, 
  Lock,
  Receipt,
  FileSpreadsheet
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

      setTimeout(() => {
        const el = document.getElementById('invoice-step-section');
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
    <div className="min-h-screen bg-white text-[#001435] flex flex-col font-sans">
      {/* Official PayPal Enterprise Global Navigation */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          
          {/* Authentic PayPal Brand Monogram */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#003087] flex items-center justify-center text-white font-extrabold text-xl tracking-tighter shadow-sm">
              P
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight text-[#001435]">
                  PayGenie <span className="text-[#0070ba]">AI</span>
                </span>
                <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-50 text-[#003087] border border-blue-100">
                  PayPal Developer Platform
                </span>
              </div>
            </div>
          </div>

          {/* Segment Control Tabs */}
          <div className="flex items-center gap-4">
            <div className="pp-segment-tabs">
              <button
                onClick={() => setActiveTab('create')}
                className={`pp-segment-tab ${activeTab === 'create' ? 'pp-segment-tab-active' : ''}`}
              >
                Instant Invoicing
              </button>
              <button
                onClick={() => setActiveTab('ledger')}
                className={`pp-segment-tab ${activeTab === 'ledger' ? 'pp-segment-tab-active' : ''}`}
              >
                Ledger ({history.length})
              </button>
            </div>

            <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-200">
              <Lock className="w-3.5 h-3.5 text-emerald-600" />
              <span>Sandbox Verified</span>
            </span>
          </div>
        </div>
      </header>

      {/* Main Single-Column Editorial Stage */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-10 sm:py-16">
        {activeTab === 'create' ? (
          <div className="space-y-12">
            
            {/* Authentic PayPal Editorial Typography Headline */}
            <section className="text-center max-w-3xl mx-auto space-y-4">
              <h1 className="text-3xl sm:text-5xl font-black text-[#001435] tracking-tight leading-[1.15] text-balance">
                There’s a plus side to every <br className="hidden sm:inline" />
                <em className="italic text-[#003087]">bill you send with PayPal.</em>
              </h1>
              <h2 className="text-base sm:text-lg text-slate-700 max-w-xl mx-auto leading-relaxed text-pretty">
                Describe your project, hours, or products naturally. Gemini AI structures line items and pricing while PayPal handles immediate one-click checkout.
              </h2>
            </section>

            {/* Step Progress Sequence */}
            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              <div className="p-3 rounded-full bg-[#003087] text-white font-bold shadow-xs">
                01. Prompt
              </div>
              <div className={`p-3 rounded-full border ${invoice ? 'bg-[#003087] text-white font-bold shadow-xs' : 'bg-[#f5f7fa] border-slate-200 text-slate-500 font-semibold'}`}>
                02. AI Invoice
              </div>
              <div className={`p-3 rounded-full border ${invoice?.status === 'PAID' ? 'bg-emerald-600 text-white font-bold shadow-xs' : invoice ? 'bg-[#003087] text-white font-bold shadow-xs' : 'bg-[#f5f7fa] border-slate-200 text-slate-500 font-semibold'}`}>
                03. PayPal Settle
              </div>
              <div className={`p-3 rounded-full border ${invoice?.status === 'PAID' ? 'bg-emerald-600 text-white font-bold shadow-xs' : 'bg-[#f5f7fa] border-slate-200 text-slate-500 font-semibold'}`}>
                04. Receipt
              </div>
            </div>

            {/* STEP 1: DESCRIBE THE INVOICE (Clean PayPal Slate Plate) */}
            <div className="bg-[#f7f9fa] border border-slate-200 rounded-3xl p-6 sm:p-9 space-y-5 shadow-xs">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-200">
                <div className="w-8 h-8 rounded-full bg-[#003087] text-white flex items-center justify-center font-black text-xs">
                  01
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#001435]">Describe Your Project & Rates</h3>
                  <p className="text-xs text-slate-500">Processed by Google Gemini into verified billing data</p>
                </div>
              </div>

              <textarea
                rows={3}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g. Billed Acme Tech $650 for React Dashboard development, 10 hours at $65/hr with a 5% early bird discount..."
                className="w-full bg-white border border-slate-300 rounded-2xl p-4 text-sm text-[#001435] placeholder-slate-600 focus:outline-none focus:border-[#0070ba] focus:ring-2 focus:ring-[#0070ba]/20 transition"
              />

              {error && (
                <p className="text-xs text-red-600 bg-red-50 p-3 rounded-xl border border-red-200 font-medium">
                  {error}
                </p>
              )}

              {/* Quick Presets */}
              <div className="space-y-2">
                <span className="text-[11px] uppercase font-bold text-slate-500 tracking-wider">
                  Quick Scenarios:
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
                      className="cursor-pointer text-xs text-left bg-white hover:bg-slate-50 text-slate-700 p-3 rounded-xl border border-slate-200 transition flex-1 truncate font-medium shadow-2xs"
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
                  className="pp-button-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Parsing with Gemini AI...</span>
                    </>
                  ) : (
                    <>
                      <span>Generate & Checkout</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* STEP 2, 3, 4: SEQUENTIAL INVOICE & PAYPAL CHECKOUT */}
            {invoice && (
              <div id="invoice-step-section" className="space-y-8 animate-fade-in scroll-mt-24">
                <div className="flex items-center gap-3 pt-2">
                  <div className="w-8 h-8 rounded-full bg-[#003087] text-white flex items-center justify-center font-black text-xs">
                    02
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#001435]">Verified Structured Invoice</h3>
                    <p className="text-xs text-slate-500">Ready for instant client checkout & PDF export</p>
                  </div>
                </div>

                <InvoiceView invoice={invoice} onPaymentSuccess={handlePaymentSuccess} />
              </div>
            )}
          </div>
        ) : (
          /* Merchant Ledger View */
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-9 shadow-xs">
            <div className="flex items-center justify-between pb-5 border-b border-slate-200">
              <div>
                <h2 className="text-2xl font-black text-[#001435]">Merchant Settlement Ledger</h2>
                <p className="text-xs text-slate-500 mt-0.5">Session records & confirmed PayPal transactions</p>
              </div>
              <div className="text-right">
                <span className="text-[11px] uppercase font-bold text-slate-400 block">Total Collected</span>
                <span className="text-2xl font-black text-emerald-600">
                  ${history
                    .filter((i) => i.status === 'PAID')
                    .reduce((sum, i) => sum + i.totalAmount, 0)
                    .toFixed(2)}
                </span>
              </div>
            </div>

            {history.length === 0 ? (
              <div className="text-center py-16 text-slate-400 text-xs">
                No invoices in this session. Generate an invoice from the Invoicing tab.
              </div>
            ) : (
              <div className="overflow-x-auto mt-6">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b-2 border-slate-200 text-slate-500 uppercase text-[11px]">
                      <th className="py-3 px-3 font-bold">Invoice #</th>
                      <th className="py-3 px-3 font-bold">Client</th>
                      <th className="py-3 px-3 font-bold">Date</th>
                      <th className="py-3 px-3 text-right font-bold">Amount</th>
                      <th className="py-3 px-3 text-center font-bold">Status</th>
                      <th className="py-3 px-3 text-right font-bold">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {history.map((inv, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 transition">
                        <td className="py-4 px-3 font-mono font-bold text-[#003087]">{inv.invoiceNumber}</td>
                        <td className="py-4 px-3 text-[#001435] font-bold">{inv.clientName}</td>
                        <td className="py-4 px-3 text-slate-500">{inv.date}</td>
                        <td className="py-4 px-3 text-right font-bold text-[#001435]">${inv.totalAmount.toFixed(2)}</td>
                        <td className="py-4 px-3 text-center">
                          {inv.status === 'PAID' ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                              PAID
                            </span>
                          ) : (
                            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                              PENDING
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-3 text-right">
                          <button
                            onClick={() => {
                              setInvoice(inv);
                              setActiveTab('create');
                            }}
                            className="cursor-pointer text-xs font-bold text-[#0070ba] hover:underline"
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

      {/* Official PayPal Enterprise Footer */}
      <footer className="border-t border-slate-200 bg-white py-8 text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="font-bold text-[#001435]">PayGenie • PayPal AI Hackathon 2026</span>
          <span className="text-slate-500">Powered by PayPal Developer Platform & Google Gemini</span>
        </div>
      </footer>
    </div>
  );
}
