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
  Zap,
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
  const [error, setError] = useState<string | null>(null);
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
    <div className="min-h-screen bg-white text-[#001435] flex flex-col font-sans">
      {/* 1. Official PayPal Global Header */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-8">
            {/* PayPal Official Wordmark + Double-P */}
            <a href="#" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-[#003087] flex items-center justify-center">
                <span className="font-black italic text-lg text-[#00CFDE]">P</span>
                <span className="font-black italic text-lg text-[#0070BA] -ml-2">P</span>
              </div>
              <span className="font-black text-2xl tracking-tight text-[#003087]">
                PayPal
              </span>
            </a>

            {/* Official Nav Links */}
            <nav className="hidden md:flex items-center gap-6 text-sm font-bold text-[#001435]">
              <a href="#" className="flex items-center gap-1 hover:text-[#0070BA] transition">
                Personal <ChevronDown className="w-3.5 h-3.5" />
              </a>
              <a href="#" className="flex items-center gap-1 text-[#0070BA] transition">
                Business <ChevronDown className="w-3.5 h-3.5" />
              </a>
              <a href="#" className="flex items-center gap-1 hover:text-[#0070BA] transition">
                Enterprise <ChevronDown className="w-3.5 h-3.5" />
              </a>
              <a href="#" className="hover:text-[#0070BA] transition">
                Developer
              </a>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <a href="https://www.sandbox.paypal.com/signin" target="_blank" className="pp-btn-pill-secondary !py-2 !px-5 !text-sm">
              Log In
            </a>
            <a href="https://www.sandbox.paypal.com/signup" target="_blank" className="pp-btn-pill-primary !py-2 !px-5 !text-sm">
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
              
              {/* Official Segment Control Tabs (Personal vs Business) */}
              <div className="inline-flex p-1 bg-[#f0f2f5] rounded-full">
                <button
                  onClick={() => setActiveTab('personal')}
                  className={`px-5 py-1.5 rounded-full text-xs font-bold transition ${
                    activeTab === 'personal'
                      ? 'bg-white text-[#001435] shadow-sm'
                      : 'text-slate-600 hover:text-[#001435]'
                  }`}
                >
                  Personal
                </button>
                <button
                  onClick={() => setActiveTab('business')}
                  className={`px-5 py-1.5 rounded-full text-xs font-bold transition ${
                    activeTab === 'business'
                      ? 'bg-white text-[#001435] shadow-sm'
                      : 'text-slate-600 hover:text-[#001435]'
                  }`}
                >
                  Business
                </button>
              </div>

              {/* Exact PayPal Typography: pp-headline-1 with italic em */}
              <h1 className="pp-headline-1">
                There’s a plus side to every <em className="text-[#003087]">bill you send with PayPal.</em>
              </h1>
              <p className="text-lg text-slate-600 max-w-xl font-normal leading-relaxed">
                Meet <strong className="text-[#003087]">PayGenie AI</strong>. Type what you delivered in plain conversational words. Gemini AI calculates line items, taxes, discounts, and drafts client emails — with instant one-click PayPal settlement.
              </p>

              {/* Interactive AI Invoicing Form Card */}
              <div className="bg-[#f7f9fa] rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-4">
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

                {error && (
                  <p className="text-red-600 text-xs bg-red-50 p-2.5 rounded-xl border border-red-200">
                    {error}
                  </p>
                )}

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
                    className="pp-btn-pill-primary flex items-center gap-2 disabled:opacity-50"
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

                    {/* In-app header */}
                    <div className="p-4 bg-white border-b border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-[#003087] flex items-center justify-center text-white text-xs font-black italic">
                          P
                        </div>
                        <span className="font-extrabold text-sm text-[#001435]">PayPal App</span>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        Live Sync
                      </span>
                    </div>

                    {/* Phone Body content displaying the invoice preview */}
                    <div className="p-4 flex-1 space-y-3">
                      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                        <span className="text-[10px] font-mono font-bold text-[#0070BA]">
                          {invoice?.invoiceNumber || 'INV-2026-PREVIEW'}
                        </span>
                        <h4 className="font-extrabold text-sm text-[#001435] mt-1">
                          {invoice?.clientName || 'Acme Tech'}
                        </h4>
                        <div className="text-2xl font-black text-[#003087] mt-2">
                          ${invoice ? invoice.totalAmount.toFixed(2) : '617.50'}
                        </div>
                        <p className="text-[10px] text-slate-500 mt-0.5">Due in 14 days • PayPal Checkout</p>
                      </div>

                      {/* Mockup PayPal Button inside phone */}
                      <div className="bg-white p-4 rounded-2xl border border-slate-200 text-center space-y-2">
                        <div className="w-full py-2.5 rounded-full bg-[#ffc439] hover:bg-[#f4b628] font-black text-xs text-[#001435] flex items-center justify-center shadow-xs cursor-pointer">
                          Pay with <span className="text-[#003087] ml-1">Pay</span><span className="text-[#0070BA]">Pal</span>
                        </div>
                        <p className="text-[9px] text-slate-400">One-click biometric authorization</p>
                      </div>

                      <div className="bg-blue-50/60 p-3 rounded-2xl border border-blue-100 text-[11px] text-slate-600">
                        <span className="font-bold text-[#003087] block mb-0.5">Gemini AI Status:</span>
                        Instant real-time sync with desktop invoice generator.
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
                    <p className="text-xs font-bold text-[#001435]">Zero Friction</p>
                    <p className="text-[10px] text-slate-500">Dual Screen Harmony</p>
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
            <InvoiceView invoice={invoice} onPaymentSuccess={handlePaymentSuccess} />
          </div>
        </section>
      )}

      {/* 4. Split Section Feature (From your extracted code): "Add another 3% on top" */}
      <section className="py-16 sm:py-24 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-6 flex justify-center">
              {/* PayPal Cashback Mastercard Card Mockup */}
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
                Add another <em className="text-[#0070BA]">zero friction to your cash flow.</em>
              </h2>
              <p className="text-base text-slate-600 leading-relaxed">
                Traditional invoicing takes 30+ minutes per invoice. With PayGenie AI, conversational inputs instantly compile into mathematically accurate invoices and live PayPal order endpoints in seconds.
              </p>
              <div className="pt-2">
                <a href="#prompt-input" className="pp-btn-pill-primary">
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
            <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
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

      {/* Floating Genie Assistant */}
      <GenieAssistant
        status={genieStatus}
        clientName={invoice?.clientName}
        amount={invoice?.totalAmount}
        currency={invoice?.currency}
      />

      {/* 6. Authentic PayPal Footer (From your extracted PayPal page) */}
      <footer className="border-t border-slate-200 bg-white py-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-6 font-bold text-[#001435]">
            <div className="flex flex-wrap gap-6">
              <a href="#" className="hover:text-[#0070BA]">Help</a>
              <a href="#" className="hover:text-[#0070BA]">Contact</a>
              <a href="#" className="hover:text-[#0070BA]">Fees</a>
              <a href="#" className="hover:text-[#0070BA]">Security</a>
              <a href="#" className="hover:text-[#0070BA]">Features</a>
              <a href="#" className="hover:text-[#0070BA]">Shop</a>
            </div>
            <span>United States</span>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p>© 1999–2026 PayPal, Inc. All rights reserved. Built for PayPal AI Hackathon 2026.</p>
            <div className="flex gap-4">
              <a href="#" className="hover:underline">Privacy</a>
              <a href="#" className="hover:underline">Legal</a>
              <a href="#" className="hover:underline">Policy Updates</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
