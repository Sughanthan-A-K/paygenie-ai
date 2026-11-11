'use client';

import React, { useState } from 'react';
import { 
  ArrowRight, 
  RefreshCw, 
  Lock, 
  Sparkles,
  Smartphone,
  Monitor,
  CheckCircle2,
  FileSpreadsheet,
  Trash2,
  PlusCircle,
  Clock,
  ArrowUpRight
} from 'lucide-react';
import InvoiceView from '@/components/InvoiceView';
import MobileDeviceFrame from '@/components/MobileDeviceFrame';
import { InvoiceData } from '@/types/invoice';
import { toast } from 'sonner';

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
    if (loading) return;
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
      toast.success('Invoice created & pushed to Client Mobile device!');
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
      toast.error(err.message || 'Invoice generation failed');
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
    toast.success(`Payment verified! Invoice ${invoice.invoiceNumber} updated in Ledger.`);
  };

  const handleDeleteLedgerItem = (invoiceNumber: string) => {
    setHistory((prev) => prev.filter((i) => i.invoiceNumber !== invoiceNumber));
    if (invoice?.invoiceNumber === invoiceNumber) {
      setInvoice(null);
    }
    toast.success(`Invoice ${invoiceNumber} deleted from ledger`);
  };

  return (
    <div className="min-h-screen bg-[#fafbfc] text-[#001435] flex flex-col font-sans">
      {/* Official PayPal Enterprise Global Navigation */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-50 shadow-xs">
        <div className="max-w-[1380px] mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          
          {/* Authentic PayPal Brand Monogram & Product Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#003087] flex items-center justify-center text-white font-extrabold text-xl tracking-tighter shadow-sm">
              P
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight text-[#001435]">
                  PayGenie <span className="text-[#0070ba]">AI</span>
                </span>
                <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-50 text-[#003087] border border-blue-200">
                  PayPal Sandbox Ready
                </span>
              </div>
            </div>
          </div>

          {/* Real-time Interaction Indicator & Tabs */}
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 border border-slate-300 text-xs font-semibold text-slate-800">
              <span className="w-2 h-2 rounded-full bg-emerald-600" />
              <span>Merchant Console (Left) ⇄ Client Checkout (Right)</span>
            </div>

            <div className="pp-segment-tabs">
              <button
                onClick={() => setActiveTab('create')}
                className={`pp-segment-tab ${activeTab === 'create' ? 'pp-segment-tab-active' : ''}`}
              >
                Merchant Workspace
              </button>
              <button
                onClick={() => setActiveTab('ledger')}
                className={`pp-segment-tab ${activeTab === 'ledger' ? 'pp-segment-tab-active' : ''}`}
              >
                Settlement Ledger ({history.length})
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-[1380px] w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {activeTab === 'create' ? (
          <div className="flex flex-col lg:flex-row gap-6 xl:gap-8 items-start">
            
            {/* ======================================================== */}
            {/* LEFT: MERCHANT BILLING CONSOLE (You create & send bills) */}
            {/* ======================================================== */}
            <div className="flex-1 min-w-0 space-y-8">
              
              {/* Web Header Badge */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 text-xs font-semibold text-slate-700">
                <span className="inline-flex items-center gap-2 text-[#003087]">
                  <Monitor className="w-4 h-4 text-[#0070ba]" />
                  <span>Merchant Invoicing Console</span>
                </span>
                <span className="text-slate-500">Natural language to verified PayPal invoices</span>
              </div>

              {/* Editorial Typography Headline */}
              <section className="space-y-3">
                <h1 className="text-3xl sm:text-4xl font-black text-[#001435] tracking-tight leading-[1.15]">
                  There’s a plus side to every <br className="hidden sm:inline" />
                  <em className="italic text-[#003087]">bill you send with PayPal.</em>
                </h1>
                <h2 className="text-sm sm:text-base text-slate-700 leading-relaxed max-w-xl font-normal">
                  Describe hours, projects, or merchandise in freeform text. Google Gemini structures line items and pricing, ready to dispatch to clients for one-click checkout.
                </h2>
              </section>

              {/* STEP 1: PROMPT INPUT CARD */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-5 shadow-xs">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#003087] text-white flex items-center justify-center font-black text-xs">
                      01
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-[#001435]">Describe Your Project & Rates</h3>
                      <p className="text-xs text-slate-500">Processed by Google Gemini into verified billing data</p>
                    </div>
                  </div>
                  <Sparkles className="w-5 h-5 text-[#0070ba]" />
                </div>

                <textarea
                  rows={3}
                  value={prompt}
                  disabled={loading}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g. Billed Acme Tech $650 for React Dashboard development, 10 hours at $65/hr with a 5% early bird discount..."
                  className="w-full min-h-[96px] max-h-[220px] bg-[#f8fafc] border border-slate-300 rounded-2xl p-4 text-sm text-[#001435] placeholder-slate-500 focus:outline-none focus:bg-white focus:border-[#0070ba] focus:ring-2 focus:ring-[#0070ba]/20 transition resize-y disabled:opacity-60"
                />

                {error && (
                  <p className="text-xs text-red-600 bg-red-50 p-3 rounded-xl border border-red-200 font-medium">
                    {error}
                  </p>
                )}

                {/* Quick Presets */}
                <div className="space-y-2">
                  <span className="text-xs uppercase font-bold text-slate-700 tracking-wider">
                    Quick Scenario Presets:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {SAMPLE_PROMPTS.map((sample, idx) => (
                      <button
                        key={idx}
                        type="button"
                        disabled={loading}
                        onClick={() => {
                          setPrompt(sample);
                          handleGenerate(sample);
                        }}
                        className="cursor-pointer text-xs text-left bg-slate-50 hover:bg-blue-50/60 hover:border-blue-300 text-slate-700 p-3.5 rounded-xl border border-slate-200 transition font-medium leading-relaxed disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {sample}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <span className="text-xs text-slate-600 flex items-center gap-1.5 font-medium">
                    <Lock className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Real-time sync to client mobile screen</span>
                  </span>

                  <button
                    onClick={() => handleGenerate()}
                    disabled={loading || !prompt.trim()}
                    className="pp-button-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Generating Invoice...</span>
                      </>
                    ) : (
                      <>
                        <span>Generate & Dispatch</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* STEP 2: STRUCTURED INVOICE & DISPATCH ACTIONS */}
              {invoice && (
                <div id="invoice-step-section" className="space-y-6 animate-fade-in">
                  <div className="flex items-center gap-3 pt-2">
                    <div className="w-8 h-8 rounded-full bg-[#003087] text-white flex items-center justify-center font-black text-xs">
                      02
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-[#001435]">Verified Structured Invoice</h3>
                      <p className="text-xs text-slate-500">Live preview & merchant client dispatch</p>
                    </div>
                  </div>

                  <InvoiceView 
                    invoice={invoice} 
                    onUpdateInvoice={(updated) => {
                      setInvoice(updated);
                      setHistory((prev) =>
                        prev.map((i) => i.invoiceNumber === updated.invoiceNumber ? updated : i)
                      );
                    }}
                  />
                </div>
              )}
            </div>

            {/* ======================================================== */}
            {/* RIGHT: CLIENT MOBILE PHONE (Client receives bill & pays) */}
            {/* ======================================================== */}
            <div className="w-full lg:w-[380px] shrink-0 sticky top-24 self-start">
              <MobileDeviceFrame
                invoice={invoice}
                onPaymentSuccess={handlePaymentSuccess}
              />
            </div>

          </div>
        ) : (
          /* ======================================================== */
          /* MERCHANT SETTLEMENT LEDGER                              */
          /* ======================================================== */
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-9 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200">
              <div>
                <h2 className="text-2xl font-black text-[#001435]">Merchant Settlement Ledger</h2>
                <p className="text-xs text-slate-500 mt-0.5">Session records & confirmed PayPal client payments</p>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <span className="text-[11px] uppercase font-bold text-slate-400 block">Total Invoices</span>
                  <span className="text-xl font-bold text-slate-700">{history.length}</span>
                </div>
                <div className="text-right pl-6 border-l border-slate-200">
                  <span className="text-[11px] uppercase font-bold text-slate-400 block">Total Collected</span>
                  <span className="text-2xl font-black text-emerald-600">
                    ${history
                      .filter((i) => i.status === 'PAID')
                      .reduce((sum, i) => sum + i.totalAmount, 0)
                      .toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {history.length === 0 ? (
              <div className="text-center py-16 text-slate-400 text-xs space-y-3">
                <FileSpreadsheet className="w-12 h-12 text-slate-300 mx-auto" />
                <p className="font-bold text-sm text-slate-600">No invoices generated yet</p>
                <p className="text-slate-400">Head over to the Merchant Workspace to generate your first invoice.</p>
                <button
                  type="button"
                  onClick={() => setActiveTab('create')}
                  className="pp-button-secondary !py-2 !text-xs"
                >
                  Create Invoice →
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b-2 border-slate-200 text-slate-500 uppercase text-[11px]">
                      <th className="py-3 px-3 font-bold">Invoice #</th>
                      <th className="py-3 px-3 font-bold">Client & Email</th>
                      <th className="py-3 px-3 font-bold">Issue / Due Date</th>
                      <th className="py-3 px-3 text-right font-bold">Amount</th>
                      <th className="py-3 px-3 text-center font-bold">Payment Status</th>
                      <th className="py-3 px-3 text-right font-bold">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {history.map((inv, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 transition">
                        <td className="py-4 px-3 font-mono font-bold text-[#003087]">
                          {inv.invoiceNumber}
                          {inv.paymentId && (
                            <span className="block font-sans text-[10px] text-slate-400 font-normal">
                              TX: {inv.paymentId.slice(0, 14)}...
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-3">
                          <p className="text-[#001435] font-bold">{inv.clientName}</p>
                          <p className="text-slate-400 text-[11px]">{inv.clientEmail}</p>
                        </td>
                        <td className="py-4 px-3 text-slate-500">
                          <span>{inv.date}</span>
                          <span className="block text-slate-400 text-[10px]">Due: {inv.dueDate}</span>
                        </td>
                        <td className="py-4 px-3 text-right font-bold text-[#001435]">
                          ${inv.totalAmount.toFixed(2)}
                          <span className="text-[10px] text-slate-400 block font-normal">{inv.currency}</span>
                        </td>
                        <td className="py-4 px-3 text-center">
                          {inv.status === 'PAID' ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3" /> PAID
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                              <Clock className="w-3 h-3" /> AWAITING PAYMENT
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setInvoice(inv);
                                setActiveTab('create');
                              }}
                              className="cursor-pointer text-xs font-bold text-[#0070ba] hover:bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200 transition"
                            >
                              Inspect & Dispatch →
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteLedgerItem(inv.invoiceNumber)}
                              className="cursor-pointer p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                              title="Delete from Ledger"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
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
        <div className="max-w-[1380px] mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="font-bold text-[#001435]">PayGenie AI • PayPal AI Hackathon 2026</span>
          <span className="text-slate-500">Powered by PayPal Developer Platform & Google Gemini</span>
        </div>
      </footer>
    </div>
  );
}
