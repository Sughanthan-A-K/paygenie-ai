'use client';

import React, { useState, useEffect } from 'react';
import {
  ArrowRight,
  RefreshCw,
  History,
  Layers,
  Monitor,
  Smartphone,
  Eye,
  Sun,
  Moon,
  ShieldCheck,
  CheckCircle2,
  FileText,
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
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Sync dark class on html root
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDark]);

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
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-300 ${
      isDark ? 'bg-[#001435] text-slate-100' : 'bg-[#f5f7fa] text-slate-900'
    }`}>
      {/* Official PayPal Enterprise Style Top Bar */}
      <header className={`border-b sticky top-0 z-40 transition-colors backdrop-blur-md ${
        isDark ? 'bg-[#001435]/90 border-slate-800' : 'bg-white/95 border-slate-200 shadow-sm'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Authentic PayPal Double-P monogram */}
            <div className="w-10 h-10 rounded-xl bg-[#003087] flex items-center justify-center shadow-md">
              <span className="font-black italic text-xl text-[#00CFDE]">P</span>
              <span className="font-black italic text-xl text-[#0070BA] -ml-2">P</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-xl tracking-tight text-[#003087] dark:text-white">
                  PayPal <span className="font-medium text-[#0070BA] dark:text-[#00CFDE]">PayGenie</span>
                </span>
                <span className="text-[10px] font-bold tracking-wider uppercase text-blue-700 bg-blue-100 dark:bg-blue-950 dark:text-blue-300 px-2 py-0.5 rounded-full">
                  AI Commerce
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Autonomous Invoicing & Direct Settlement Engine
              </p>
            </div>
          </div>

          {/* Controls: Device Switcher + Theme Toggle */}
          <div className="flex items-center gap-3">
            {/* Device Switcher */}
            <div className={`p-1 rounded-xl flex items-center gap-1 border ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-200'
            }`}>
              <button
                onClick={() => setViewMode('desktop')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  viewMode === 'desktop'
                    ? 'bg-[#0070BA] text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Desktop</span>
              </button>
              <button
                onClick={() => setViewMode('mobile')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  viewMode === 'mobile'
                    ? 'bg-[#0070BA] text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Mobile Frame</span>
              </button>
            </div>

            {/* Light / Dark Mode Toggle */}
            <button
              onClick={() => setIsDark(!isDark)}
              className={`p-2 rounded-xl border transition cursor-pointer ${
                isDark
                  ? 'bg-slate-900 border-slate-800 text-amber-400 hover:bg-slate-800'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
              title={isDark ? 'Switch to PayPal Light Mode' : 'Switch to Dark Mode'}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className={`flex-1 w-full mx-auto transition-all duration-500 ${
        viewMode === 'mobile'
          ? 'max-w-[420px] my-8 bg-white dark:bg-slate-900 rounded-[44px] border-[10px] border-slate-300 dark:border-slate-800 shadow-2xl overflow-hidden min-h-[840px]'
          : 'max-w-7xl'
      }`}>
        {/* Mobile notch if mobile view */}
        {viewMode === 'mobile' && (
          <div className="bg-slate-100 dark:bg-slate-950 py-2.5 flex items-center justify-center border-b border-slate-200 dark:border-slate-800">
            <div className="w-24 h-4 bg-slate-300 dark:bg-slate-800 rounded-full flex items-center justify-center">
              <div className="w-2.5 h-2.5 bg-slate-400 dark:bg-slate-900 rounded-full" />
            </div>
          </div>
        )}

        <main className={`w-full px-4 sm:px-6 lg:px-8 py-10 ${viewMode === 'mobile' ? 'px-4 py-4 text-xs' : ''}`}>
          {/* Header Title in Official PayPal Tone */}
          <div className="text-center max-w-3xl mx-auto mb-10">
            <h1 className={`${viewMode === 'mobile' ? 'text-2xl' : 'text-3xl sm:text-4xl'} font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight`}>
              Smart Invoicing & Instant Settle
            </h1>
            <p className="mt-3 text-slate-600 dark:text-slate-400 text-sm leading-relaxed max-w-2xl mx-auto">
              Transform conversational project details into an official PayPal invoice with automatic discount math, tax computation, and client payment notifications.
            </p>
          </div>

          {/* AI Generator Input Form */}
          <div className={`max-w-3xl mx-auto rounded-3xl p-6 sm:p-8 border shadow-sm mb-12 ${
            isDark ? 'bg-[#001c47] border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <label htmlFor="prompt-input" className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              Billing Description or Job Summary
            </label>
            <textarea
              id="prompt-input"
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. Billed Acme Tech $650 for React Dashboard development, 10 hours at $65/hr with a 5% early bird discount..."
              className={`w-full rounded-2xl p-4 text-sm border focus:outline-none focus:ring-2 focus:ring-[#0070BA] transition ${
                isDark
                  ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-500'
                  : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
              }`}
            />

            {error && (
              <p className="text-red-500 text-xs mt-2 bg-red-50 dark:bg-red-950/40 p-2.5 rounded-xl border border-red-200 dark:border-red-800">
                {error}
              </p>
            )}

            {/* Quick Prompts */}
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Quick Samples:
              </span>
              {SAMPLE_PROMPTS.map((sample, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setPrompt(sample);
                    handleGenerate(sample);
                  }}
                  className={`text-xs text-left px-3 py-1.5 rounded-xl border transition cursor-pointer truncate max-w-[260px] ${
                    isDark
                      ? 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  {sample}
                </button>
              ))}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => handleGenerate()}
                disabled={loading || !prompt.trim()}
                className="inline-flex items-center gap-2 bg-[#0070BA] hover:bg-[#003087] text-white font-bold text-sm px-7 py-3 rounded-2xl transition shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Processing with AI...</span>
                  </>
                ) : (
                  <>
                    <span>Generate Invoice</span>
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
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#0070BA]" />
                  Official Generated Invoice
                </h2>
              </div>
              <InvoiceView invoice={invoice} onPaymentSuccess={handlePaymentSuccess} isDark={isDark} />
            </div>
          )}

          {/* Invoices Ledger */}
          {history.length > 0 && (
            <div className={`max-w-4xl mx-auto mt-10 rounded-3xl p-6 sm:p-8 border shadow-sm ${
              isDark ? 'bg-[#001c47] border-slate-800' : 'bg-white border-slate-200'
            }`}>
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <History className="w-5 h-5 text-[#0070BA]" />
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    Recent Invoices Ledger
                  </h3>
                </div>
                <span className="text-xs text-slate-500">{history.length} Record{history.length > 1 ? 's' : ''}</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="text-slate-500 border-b border-slate-100 dark:border-slate-800 uppercase tracking-wider font-semibold">
                      <th className="py-2.5">Invoice #</th>
                      <th className="py-2.5">Client</th>
                      <th className="py-2.5">Date</th>
                      <th className="py-2.5 text-right">Amount</th>
                      <th className="py-2.5 text-center">Status</th>
                      <th className="py-2.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                    {history.map((inv, index) => (
                      <tr key={index} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition">
                        <td className="py-3 font-mono font-bold text-[#0070BA] dark:text-blue-400">{inv.invoiceNumber}</td>
                        <td className="py-3 font-medium text-slate-900 dark:text-white">{inv.clientName}</td>
                        <td className="py-3 text-slate-500">{inv.date}</td>
                        <td className="py-3 text-right font-mono font-bold text-slate-900 dark:text-slate-100">${inv.totalAmount.toFixed(2)}</td>
                        <td className="py-3 text-center">
                          {inv.status === 'PAID' ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-400 px-2 py-0.5 rounded border border-emerald-300 dark:border-emerald-700">
                              <CheckCircle2 className="w-3 h-3" /> PAID
                            </span>
                          ) : (
                            <span className="text-[11px] font-bold text-amber-700 bg-amber-100 dark:bg-amber-950/60 dark:text-amber-400 px-2 py-0.5 rounded border border-amber-300 dark:border-amber-700">
                              PENDING
                            </span>
                          )}
                        </td>
                        <td className="py-3 text-right">
                          <button
                            onClick={() => handleSelectFromLedger(inv)}
                            className="inline-flex items-center gap-1 text-xs text-[#0070BA] hover:underline font-semibold cursor-pointer"
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

      {/* Floating Genie Assistant */}
      <GenieAssistant
        status={genieStatus}
        clientName={invoice?.clientName}
        amount={invoice?.totalAmount}
        currency={invoice?.currency}
      />

      {/* Official PayPal Enterprise Footer */}
      <footer className={`border-t py-6 text-center text-xs transition-colors mt-12 ${
        isDark ? 'bg-[#001435] border-slate-800 text-slate-400' : 'bg-white border-slate-200 text-slate-500'
      }`}>
        <p>© 1999–2026 PayPal, Inc. All rights reserved. • PayGenie AI Autonomous Billing Assistant</p>
      </footer>
    </div>
  );
}
