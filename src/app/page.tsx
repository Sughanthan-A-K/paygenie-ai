'use client';

import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, 
  RefreshCw, 
  ShieldCheck, 
  CheckCircle2, 
  Layers, 
  Moon, 
  Sun,
  Lock,
  Zap,
  FileSpreadsheet,
  Receipt,
  Sparkles,
  Monitor,
  Smartphone
} from 'lucide-react';
import InvoiceView from '@/components/InvoiceView';
import GenieAssistant from '@/components/GenieAssistant';
import { InvoiceData } from '@/types/invoice';

const SAMPLE_PROMPTS = [
  {
    title: "Web App Dev",
    text: "Billed Acme Tech $650 for React Dashboard development, 10 hours at $65/hr with a 5% early bird discount."
  },
  {
    title: "Brand Design",
    text: "Designed brand identity & 5 custom illustrations for Bloom Bakery for $380, due in 10 days."
  },
  {
    title: "Cloud Consulting",
    text: "Cloud consultation for Nexus Labs: 3 architecture review sessions at $150 each plus $50 server setup fee."
  }
];

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [history, setHistory] = useState<InvoiceData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'create' | 'ledger'>('create');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [deviceMode, setDeviceMode] = useState<'desktop' | 'mobile'>('desktop');
  const [genieStatus, setGenieStatus] = useState<'idle' | 'generating' | 'ready' | 'paid' | 'error'>('idle');

  useEffect(() => {
    if (document.documentElement.classList.contains('dark')) {
      setIsDarkMode(true);
    }
  }, []);

  const toggleDarkMode = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      setIsDarkMode(true);
    }
  };

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
      setActiveTab('create');

      setTimeout(() => {
        const el = document.getElementById('generated-invoice-container');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 150);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
      setGenieStatus('error');
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

  return (
    <div className="min-h-screen flex flex-col font-sans transition-colors duration-200">
      {/* Official Enterprise PayPal Navigation Bar */}
      <header className="sticky top-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          
          {/* Logo & Brand Identity */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#003087] flex items-center justify-center shadow-md">
              <span className="text-white font-extrabold text-xl tracking-tighter">P</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight text-[#001435] dark:text-white">
                  PayGenie <span className="text-[#0070ba]">AI</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/40 text-[#003087] dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  PayPal + Gemini
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium hidden sm:block">
                Autonomous Billing & Instant Settlement
              </p>
            </div>
          </div>

          {/* Real Functional Navigation Tabs */}
          <div className="pp-tab-group hidden sm:inline-flex">
            <button
              onClick={() => setActiveTab('create')}
              className={`pp-tab-btn cursor-pointer ${activeTab === 'create' ? 'pp-tab-btn-active' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'}`}
            >
              Instant Billing
            </button>
            <button
              onClick={() => setActiveTab('ledger')}
              className={`pp-tab-btn cursor-pointer ${activeTab === 'ledger' ? 'pp-tab-btn-active' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'}`}
            >
              Merchant Ledger ({history.length})
            </button>
          </div>

          {/* Controls: Device Switcher + Theme Switch */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Device Switcher for Judges */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-full border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setDeviceMode('desktop')}
                title="Desktop View"
                className={`cursor-pointer p-1.5 sm:px-2.5 sm:py-1 rounded-full text-xs font-semibold flex items-center gap-1 transition ${
                  deviceMode === 'desktop'
                    ? 'bg-white dark:bg-slate-700 text-[#003087] dark:text-blue-300 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Desktop</span>
              </button>
              <button
                onClick={() => setDeviceMode('mobile')}
                title="Mobile Simulator View"
                className={`cursor-pointer p-1.5 sm:px-2.5 sm:py-1 rounded-full text-xs font-semibold flex items-center gap-1 transition ${
                  deviceMode === 'mobile'
                    ? 'bg-white dark:bg-slate-700 text-[#003087] dark:text-blue-300 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Mobile</span>
              </button>
            </div>

            <button
              onClick={toggleDarkMode}
              aria-label="Toggle theme"
              className="cursor-pointer p-2.5 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </button>

            <div className="hidden lg:flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-3 py-1.5 rounded-full border border-emerald-200 dark:border-emerald-800">
              <Lock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Sandbox Verified</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main App Container with Dynamic Device Frame Mode */}
      <main className={`flex-1 w-full mx-auto px-4 sm:px-6 py-8 md:py-12 transition-all duration-300 ${
        deviceMode === 'mobile' 
          ? 'max-w-md bg-slate-100 dark:bg-slate-950/80 my-4 sm:my-8 rounded-[48px] border-8 border-slate-900 shadow-2xl p-4 sm:p-6' 
          : 'max-w-5xl'
      }`}>
        
        {/* Mobile Tab Slider */}
        <div className="flex sm:hidden justify-center mb-6">
          <div className="pp-tab-group">
            <button
              onClick={() => setActiveTab('create')}
              className={`pp-tab-btn cursor-pointer ${activeTab === 'create' ? 'pp-tab-btn-active' : 'text-slate-600 dark:text-slate-400'}`}
            >
              Instant Billing
            </button>
            <button
              onClick={() => setActiveTab('ledger')}
              className={`pp-tab-btn cursor-pointer ${activeTab === 'ledger' ? 'pp-tab-btn-active' : 'text-slate-600 dark:text-slate-400'}`}
            >
              Ledger ({history.length})
            </button>
          </div>
        </div>

        {activeTab === 'create' ? (
          <div>
            {/* Clean Hero Headline */}
            <section className="mb-10 text-center max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#003087]/10 dark:bg-blue-500/20 text-[#003087] dark:text-blue-300 text-xs font-bold uppercase tracking-wider mb-4">
                <Zap className="w-3.5 h-3.5 text-[#0070ba]" />
                Agentic Invoice Intelligence
              </div>

              <h1 className={`${deviceMode === 'mobile' ? 'text-2xl font-black' : 'text-3xl sm:text-5xl font-black'} tracking-tight text-[#001435] dark:text-white leading-tight`}>
                There’s a faster way to <br className="hidden sm:inline" />
                <em className="italic font-serif text-[#003087] dark:text-blue-400">bill and get paid</em> with PayPal.
              </h1>

              <p className="mt-3 text-slate-600 dark:text-slate-300 text-xs sm:text-base max-w-xl mx-auto leading-relaxed">
                Describe any project, sale, or hourly work naturally. Gemini AI structures line items, calculates discounts & taxes, and provides an instant PayPal checkout button.
              </p>
            </section>

            {/* Input Card — Clean PayPal Slate Plate */}
            <div className="max-w-3xl mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-8 shadow-xl mb-12">
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="prompt-input" className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Describe Job Or Client Purchase
                </label>
                <span className="text-[11px] font-semibold text-[#0070ba] dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-blue-100 dark:border-blue-800">
                  <Sparkles className="w-3 h-3" /> Gemini 3.5 Flash
                </span>
              </div>
              
              <textarea
                id="prompt-input"
                rows={3}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g. Billed Acme Tech $650 for React Dashboard development, 10 hours at $65/hr with a 5% early bird discount..."
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 sm:p-4 text-xs sm:text-base text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#0070ba] transition"
              />

              {error && (
                <div className="mt-3 p-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs font-medium">
                  {error}
                </div>
              )}

              {/* Sample Prompts Chips */}
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-slate-400 dark:text-slate-500 mr-1">
                  Example Scenarios:
                </span>
                {SAMPLE_PROMPTS.map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setPrompt(sample.text);
                      handleGenerate(sample.text);
                    }}
                    className="cursor-pointer text-xs font-semibold px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition"
                  >
                    {sample.title}
                  </button>
                ))}
              </div>

              {/* Action Button - PayPal Official Pill Style */}
              <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <ShieldCheck className="w-4 h-4 text-[#0070ba]" />
                  <span>Real-time mathematical validation & tax compliance</span>
                </div>

                <button
                  onClick={() => handleGenerate()}
                  disabled={loading || !prompt.trim()}
                  className="pp-pill-btn-primary w-full sm:w-auto text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                      Analyzing with Gemini AI...
                    </>
                  ) : (
                    <>
                      Generate & Checkout
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Live Generated Invoice Container */}
            {invoice && (
              <div id="generated-invoice-container" className="max-w-3xl mx-auto mb-16 animate-fade-in scroll-mt-24">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg sm:text-xl font-black text-[#001435] dark:text-white flex items-center gap-2">
                    <Receipt className="w-5 h-5 sm:w-6 sm:h-6 text-[#003087] dark:text-blue-400" />
                    Generated Customer Invoice
                  </h2>
                </div>
                <InvoiceView invoice={invoice} onPaymentSuccess={handlePaymentSuccess} />
              </div>
            )}
          </div>
        ) : (
          /* Merchant Ledger View */
          <div className="max-w-4xl mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-[#001435] dark:text-white">
                  Merchant Transaction Ledger
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  All AI generated invoices with instant PayPal settlement status
                </p>
              </div>

              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Collected</span>
                <span className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
                  ${history
                    .filter(i => i.status === 'PAID')
                    .reduce((sum, i) => sum + i.totalAmount, 0)
                    .toFixed(2)}
                </span>
              </div>
            </div>

            {history.length === 0 ? (
              <div className="text-center py-16">
                <FileSpreadsheet className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">No Invoices in this Session</h3>
                <p className="text-xs text-slate-400 mt-1">Generate your first invoice using the Instant Billing tab.</p>
                <button
                  onClick={() => setActiveTab('create')}
                  className="mt-4 pp-pill-btn-primary text-xs cursor-pointer"
                >
                  Create Invoice Now
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto mt-6">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="text-xs uppercase font-bold tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800">
                      <th className="py-3 px-3">Invoice #</th>
                      <th className="py-3 px-3">Customer</th>
                      <th className="py-3 px-3">Date</th>
                      <th className="py-3 px-3 text-right">Amount</th>
                      <th className="py-3 px-3 text-center">Status</th>
                      <th className="py-3 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {history.map((inv, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                        <td className="py-4 px-3 font-mono font-bold text-[#003087] dark:text-blue-400">
                          {inv.invoiceNumber}
                        </td>
                        <td className="py-4 px-3 font-semibold text-slate-900 dark:text-white">
                          {inv.clientName}
                        </td>
                        <td className="py-4 px-3 text-slate-500 text-xs">{inv.date}</td>
                        <td className="py-4 px-3 text-right font-extrabold text-slate-900 dark:text-slate-100">
                          ${inv.totalAmount.toFixed(2)}
                        </td>
                        <td className="py-4 px-3 text-center">
                          {inv.status === 'PAID' ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                              <CheckCircle2 className="w-3 h-3" /> PAID
                            </span>
                          ) : (
                            <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2.5 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
                              PENDING
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-3 text-right">
                          <button
                            onClick={() => {
                              setInvoice(inv);
                              setActiveTab('create');
                              setTimeout(() => {
                                const el = document.getElementById('generated-invoice-container');
                                if (el) el.scrollIntoView({ behavior: 'smooth' });
                              }, 100);
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

      {/* Floating Interactive Enterprise PayGenie Mascot */}
      <GenieAssistant
        status={genieStatus}
        invoiceDetails={{
          clientName: invoice?.clientName,
          amount: invoice?.totalAmount,
          transactionId: invoice?.paymentId,
        }}
      />

      {/* Clean Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 py-8 text-xs text-slate-500 dark:text-slate-400 transition-colors">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="font-extrabold text-slate-900 dark:text-white">PayGenie AI</span>
            <span>•</span>
            <span>Built for PayPal AI Hackathon 2026</span>
          </div>

          <div className="flex items-center gap-4 text-slate-500">
            <span>Powered by PayPal Developer Platform & Google Gemini</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
