'use client';

import React, { useState } from 'react';
import {
  ArrowRight,
  RefreshCw,
  History,
  Eye,
  CheckCircle2,
  ChevronDown,
  Sparkles,
  Smartphone,
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
  const [activeTab, setActiveTab] = useState<'business' | 'personal'>('business');
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [history, setHistory] = useState<InvoiceData[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [genieStatus, setGenieStatus] = useState<'idle' | 'generating' | 'ready' | 'paid' | 'error'>('idle');

  const handleGenerate = async (textToUse?: string) => {
    const finalPrompt = textToUse || prompt;
    if (!finalPrompt.trim()) return;

    setLoading(true);
    setGenieStatus('generating');
    setErrorMsg(null);

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
      const msg = err.message || 'Something went wrong';
      setErrorMsg(msg);
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

  const handlePaymentError = (err: string) => {
    setErrorMsg(err);
    setGenieStatus('error');
  };

  const handleSelectFromLedger = (selectedInv: InvoiceData) => {
    setInvoice(selectedInv);
    setGenieStatus(selectedInv.status === 'PAID' ? 'paid' : 'ready');
    const el = document.getElementById('invoice-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white text-[#001435] flex flex-col font-sans">
      {/* 1. Official PayPal Global Header */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-8">
            {/* PayPal Double-P Logo + Wordmark */}
            <a href="#" className="flex items-center gap-2 cursor-pointer">
              <div className="w-9 h-9 rounded-full bg-[#003087] flex items-center justify-center shadow-xs">
                <span className="font-black italic text-lg text-[#00CFDE]">P</span>
                <span className="font-black italic text-lg text-[#0070BA] -ml-2">P</span>
              </div>
              <span className="font-black text-2xl tracking-tight text-[#003087]">
                PayPal
              </span>
            </a>

            {/* Official Nav Links */}
            <nav className="hidden md:flex items-center gap-6 text-sm font-bold text-[#001435]">
              <span className="flex items-center gap-1 hover:text-[#0070BA] transition cursor-pointer">
                Personal <ChevronDown className="w-3.5 h-3.5" />
              </span>
              <span className="flex items-center gap-1 text-[#0070BA] transition cursor-pointer">
                Business <ChevronDown className="w-3.5 h-3.5" />
              </span>
              <span className="flex items-center gap-1 hover:text-[#0070BA] transition cursor-pointer">
                Enterprise <ChevronDown className="w-3.5 h-3.5" />
              </span>
              <span className="hover:text-[#0070BA] transition cursor-pointer">
                Developer
              </span>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="https://www.sandbox.paypal.com/signin"
              target="_blank"
              rel="noreferrer"
              className="pp-btn-pill-secondary !py-2 !px-5 !text-sm cursor-pointer"
            >
              Log In
            </a>
            <a
              href="https://www.sandbox.paypal.com/signup"
              target="_blank"
              rel="noreferrer"
              className="pp-btn-pill-primary !py-2 !px-5 !text-sm cursor-pointer"
            >
              Sign Up
            </a>
          </div>
        </div>
      </header>

      {/* 2. Official Hero Section — Quantum Leap Grid */}
      <section className="bg-white py-12 sm:py-20 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Segment tabs + Headline + Prompt Box */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Segment Control Tabs */}
              <div className="inline-flex p-1 bg-[#f0f2f5] rounded-full">
                <button
                  onClick={() => setActiveTab('personal')}
                  className={`px-5 py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${
                    activeTab === 'personal'
                      ? 'bg-white text-[#001435] shadow-xs'
                      : 'text-slate-600 hover:text-[#001435]'
                  }`}
                >
                  Personal
                </button>
                <button
                  onClick={() => setActiveTab('business')}
                  className={`px-5 py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${
                    activeTab === 'business'
                      ? 'bg-white text-[#001435] shadow-xs'
                      : 'text-slate-600 hover:text-[#001435]'
                  }`}
                >
                  Business
                </button>
              </div>

              {/* Exact PayPal Typography */}
              <h1 className="pp-headline-1">
                There’s a plus side to every <em className="text-[#003087]">bill you send with PayPal.</em>
              </h1>
              <p className="text-lg text-slate-600 max-w-xl font-normal leading-relaxed">
                Meet <strong className="text-[#003087]">PayGenie AI</strong>. Type what you delivered in plain conversational words. Gemini AI calculates line items, taxes, discounts, and drafts client emails — with instant one-click PayPal settlement.
              </p>

              {/* Interactive AI Invoicing Form Card */}
              <div className="bg-[#f7f9fa] rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <label htmlFor="prompt-input" className="text-xs font-extrabold uppercase tracking-wider text-[#001435]">
                    Describe What You Did Or Sold
                  </label>
                  <span className="text-[11px] font-semibold text-[#0070BA] bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Gemini 3.5 Powered
                  </span>
                </div>

                <textarea
                  id="prompt-input"
                  rows={3}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g. Billed Acme Tech $650 for React Dashboard development, 10 hours at $65/hr with a 5% early bird discount..."
                  className="w-full bg-white border border-slate-300 rounded-2xl p-4 text-sm text-[#001435] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0070BA] transition"
                />

                {/* Quick Samples */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Quick Try:
                  </span>
                  {SAMPLE_PROMPTS.map((sample, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        setPrompt(sample);
                        handleGenerate(sample);
                      }}
                      className="text-xs text-left bg-white hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded-full border border-slate-200 transition cursor-pointer truncate max-w-[240px] shadow-2xs"
                    >
                      {sample}
                    </button>
                  ))}
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => handleGenerate()}
                    disabled={loading || !prompt.trim()}
                    className="pp-btn-pill-primary flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>AI Generating...</span>
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
            </div>

            {/* Right Column: Authentic PayPal Phone Mockup Frame */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-[340px]">
                {/* Physical Phone frame */}
                <div className="bg-[#001435] rounded-[48px] p-3 shadow-2xl border-4 border-slate-800">
                  {/* Phone screen */}
                  <div className="bg-[#f7f9fa] rounded-[40px] overflow-hidden border border-slate-200 text-[#001435] min-h-[580px] flex flex-col justify-between">
                    
                    {/* Top camera notch */}
                    <div className="bg-white py-2 flex items-center justify-center border-b border-slate-100">
                      <div className="w-20 h-3.5 bg-slate-900 rounded-full" />
                    </div>

                    {/* In-app header with authentic Double-P logo */}
                    <div className="p-4 bg-white border-b border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-[#003087] flex items-center justify-center">
                          <span className="font-black italic text-xs text-[#00CFDE]">P</span>
                          <span className="font-black italic text-xs text-[#0070BA] -ml-1.5">P</span>
                        </div>
                        <span className="font-extrabold text-sm text-[#001435]">PayPal App</span>
                      </div>
                      <span className="text-[10px] font-bold text-[#003087] bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                        Instant Checkout
                      </span>
                    </div>

                    {/* Phone Body content */}
                    <div className="p-4 flex-1 space-y-3">
                      {invoice ? (
                        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs animate-in fade-in">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono font-bold text-[#0070BA]">
                              {invoice.invoiceNumber}
                            </span>
                            {invoice.status === 'PAID' ? (
                              <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                                PAID
                              </span>
                            ) : (
                              <span className="text-[9px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                                DUE
                              </span>
                            )}
                          </div>
                          <h4 className="font-extrabold text-sm text-[#001435] mt-1">
                            {invoice.clientName}
                          </h4>
                          <div className="text-2xl font-black text-[#003087] mt-2">
                            ${invoice.totalAmount.toFixed(2)}
                          </div>
                          <p className="text-[10px] text-slate-500 mt-0.5">Due: {invoice.dueDate}</p>
                        </div>
                      ) : (
                        <div className="bg-white p-6 rounded-2xl border border-dashed border-slate-300 text-center space-y-2">
                          <div className="w-10 h-10 rounded-full bg-blue-50 text-[#003087] flex items-center justify-center mx-auto">
                            <Smartphone className="w-5 h-5" />
                          </div>
                          <p className="text-xs font-bold text-[#001435]">Awaiting Your Invoice</p>
                          <p className="text-[10px] text-slate-400">
                            Type a prompt on the left to see the mobile checkout card appear here!
                          </p>
                        </div>
                      )}

                      {/* Mockup PayPal Button inside phone */}
                      <div className="bg-white p-4 rounded-2xl border border-slate-200 text-center space-y-2">
                        <div
                          onClick={() => {
                            const el = document.getElementById('invoice-section');
                            if (el) el.scrollIntoView({ behavior: 'smooth' });
                          }}
                          className="w-full py-2.5 rounded-full bg-[#ffc439] hover:bg-[#f4b628] font-black text-xs text-[#001435] flex items-center justify-center shadow-xs cursor-pointer transition"
                        >
                          Pay with <span className="text-[#003087] ml-1">Pay</span><span className="text-[#0070BA]">Pal</span>
                        </div>
                        <p className="text-[9px] text-slate-400">One-click biometric authorization</p>
                      </div>

                      <div className="bg-blue-50/60 p-3 rounded-2xl border border-blue-100 text-[11px] text-slate-600">
                        <span className="font-bold text-[#003087] block mb-0.5">Gemini AI Engine:</span>
                        Calculates taxes, line items, and terms automatically.
                      </div>
                    </div>

                    {/* Phone footer */}
                    <div className="p-3 bg-white border-t border-slate-100 text-center">
                      <div className="w-28 h-1 bg-slate-300 rounded-full mx-auto" />
                    </div>
                  </div>
                </div>

                {/* Floating badge */}
                <div className="absolute -bottom-4 -left-4 bg-white p-3 rounded-2xl border border-slate-200 shadow-lg flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold">
                    ✓
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#001435]">Seamless Commerce</p>
                    <p className="text-[10px] text-slate-500">Web & Mobile Ready</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. Generated Invoice Section */}
      {invoice && (
        <section id="invoice-section" className="py-16 bg-[#f7f9fa] border-b border-slate-200 scroll-mt-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-8">
            <div className="mb-6">
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#0070BA]">
                Generated Output
              </span>
              <h2 className="pp-headline-2 mt-1">Official Merchant Invoice</h2>
            </div>
            <InvoiceView
              invoice={invoice}
              onPaymentSuccess={handlePaymentSuccess}
              onPaymentError={handlePaymentError}
            />
          </div>
        </section>
      )}

      {/* 4. Value-Add Split Section */}
      <section className="py-16 sm:py-24 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-6 flex justify-center">
              <div className="w-full max-w-md h-56 rounded-3xl bg-gradient-to-tr from-[#001435] via-[#003087] to-[#0070e0] p-6 text-white shadow-xl flex flex-col justify-between relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-7 rounded bg-amber-400/80 border border-amber-300" />
                  <span className="font-black italic text-2xl text-white">PayPal</span>
                </div>
                <div>
                  <p className="text-xs tracking-widest uppercase text-slate-300">Autonomous Settlement Card</p>
                  <p className="font-mono text-base tracking-widest mt-1">•••• •••• •••• 6538</p>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span>SUGHANTHAN</span>
                  <div className="flex -space-x-2">
                    <div className="w-6 h-6 rounded-full bg-red-500 opacity-90" />
                    <div className="w-6 h-6 rounded-full bg-amber-500 opacity-90" />
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 space-y-4">
              <h2 className="pp-headline-2">
                Accelerate <em className="text-[#0070BA]">your business cash flow.</em>
              </h2>
              <p className="text-base text-slate-600 leading-relaxed">
                Traditional invoicing takes 30+ minutes per invoice. With PayGenie AI, conversational inputs instantly compile into mathematically accurate invoices and live PayPal order endpoints in seconds.
              </p>
              <div className="pt-2">
                <a href="#prompt-input" className="pp-btn-pill-primary cursor-pointer">
                  Create Invoice Now
                </a>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 5. Invoices Ledger */}
      {history.length > 0 && (
        <section className="py-16 bg-[#f7f9fa]">
          <div className="max-w-5xl mx-auto px-4 sm:px-8">
            <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xs">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center text-[#003087]">
                    <History className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-extrabold text-[#001435]">
                    Invoices Ledger
                  </h3>
                </div>
                <span className="text-xs font-semibold text-slate-500">{history.length} Record{history.length > 1 ? 's' : ''}</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="text-slate-400 border-b border-slate-100 uppercase tracking-wider font-bold">
                      <th className="py-3 px-2">Invoice #</th>
                      <th className="py-3 px-2">Client</th>
                      <th className="py-3 px-2">Date</th>
                      <th className="py-3 px-2 text-right">Amount</th>
                      <th className="py-3 px-2 text-center">Status</th>
                      <th className="py-3 px-2 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {history.map((inv, index) => (
                      <tr key={index} className="hover:bg-slate-50 transition">
                        <td className="py-3.5 px-2 font-mono font-bold text-[#003087]">{inv.invoiceNumber}</td>
                        <td className="py-3.5 px-2 font-bold text-[#001435]">{inv.clientName}</td>
                        <td className="py-3.5 px-2 text-slate-500">{inv.date}</td>
                        <td className="py-3.5 px-2 text-right font-mono font-bold text-[#001435]">${inv.totalAmount.toFixed(2)}</td>
                        <td className="py-3.5 px-2 text-center">
                          {inv.status === 'PAID' ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> PAID
                            </span>
                          ) : (
                            <span className="text-[11px] font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                              PENDING
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-2 text-right">
                          <button
                            onClick={() => handleSelectFromLedger(inv)}
                            className="inline-flex items-center gap-1 text-xs text-[#0070BA] hover:underline font-bold cursor-pointer"
                          >
                            <Eye className="w-3 h-3" />
                            <span>View & Settle</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Floating Genie Assistant with Error & Speech Bubble Sync */}
      <GenieAssistant
        status={genieStatus}
        errorMessage={errorMsg}
        clientName={invoice?.clientName}
        amount={invoice?.totalAmount}
        currency={invoice?.currency}
      />

      {/* 6. Authentic PayPal Footer */}
      <footer className="border-t border-slate-200 bg-white py-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-6 font-bold text-[#001435]">
            <div className="flex flex-wrap gap-6">
              <span className="hover:text-[#0070BA] cursor-pointer">Help</span>
              <span className="hover:text-[#0070BA] cursor-pointer">Contact</span>
              <span className="hover:text-[#0070BA] cursor-pointer">Fees</span>
              <span className="hover:text-[#0070BA] cursor-pointer">Security</span>
              <span className="hover:text-[#0070BA] cursor-pointer">Features</span>
              <span className="hover:text-[#0070BA] cursor-pointer">Shop</span>
            </div>
            <span>United States</span>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p>© 1999–2026 PayPal, Inc. All rights reserved. Built for PayPal AI Hackathon 2026.</p>
            <div className="flex gap-4">
              <span className="hover:underline cursor-pointer">Privacy</span>
              <span className="hover:underline cursor-pointer">Legal</span>
              <span className="hover:underline cursor-pointer">Policy Updates</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
