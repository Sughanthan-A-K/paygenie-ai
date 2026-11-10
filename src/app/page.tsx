'use client';

import React, { useState, useEffect } from 'react';
import {
  ArrowRight,
  RefreshCw,
  History,
  Eye,
  CheckCircle2,
  ChevronDown,
  Printer,
  Copy,
  Check,
  Send,
  Calendar,
  AlertCircle,
  X,
  MessageSquare,
  Bot,
} from 'lucide-react';
import { PayPalButtons } from '@paypal/react-paypal-js';
import confetti from 'canvas-confetti';
import { InvoiceData } from '@/types/invoice';

const SAMPLE_PROMPTS = [
  "Billed Acme Tech $650 for React Dashboard development, 10 hours at $65/hr with a 5% early bird discount.",
  "Designed brand identity & 5 custom illustrations for Bloom Bakery for $380, due in 10 days.",
  "Cloud consultation for Nexus Labs: 3 architecture review sessions at $150 each plus $50 server setup fee."
];

// Official PayPal Full SVG Vector Logo
function PayPalLogo({ className = "h-7" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 101 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M11.666 3.033H4.407a1.64 1.64 0 0 0-1.616 1.373L.027 22.392a1.093 1.093 0 0 0 1.077 1.258h3.633a1.64 1.64 0 0 0 1.616-1.373l.794-5.033a1.64 1.64 0 0 1 1.616-1.373h2.302c4.802 0 8.524-1.95 9.626-7.587.49-2.483.08-4.354-1.22-5.617-1.428-1.385-3.882-1.634-7.805-1.634z" fill="#003087"/>
      <path d="M12.936 9.673c-.602 3.076-2.905 4.808-6.19 4.808H4.99l1.196-7.581a.82.82 0 0 1 .808-.687h1.498c1.97 0 3.513.109 4.303.957.708.761.85 1.769.141 2.503z" fill="#001C64"/>
      <path d="M22.95 8.353h-7.259a1.64 1.64 0 0 0-1.616 1.373l-2.764 17.5a1.093 1.093 0 0 0 1.077 1.258h3.978a1.23 1.23 0 0 0 1.212-1.03l.775-4.912a1.64 1.64 0 0 1 1.616-1.373h2.302c4.802 0 8.524-1.95 9.626-7.587.49-2.483.08-4.354-1.22-5.617-1.428-1.385-3.882-1.612-7.927-1.612z" fill="#0079C1"/>
      <path d="M24.22 14.993c-.602 3.076-2.905 4.808-6.19 4.808h-1.756l1.196-7.581a.82.82 0 0 1 .808-.687h1.498c1.97 0 3.513.109 4.303.957.708.761.85 1.769.141 2.503z" fill="#00457C"/>
      <path d="M42.44 14.33h-3.473a.82.82 0 0 0-.808.687l-.426 2.703h-.14a3.834 3.834 0 0 0-3.037-1.385c-3.791 0-7.009 2.87-7.643 6.902-.349 2.155.158 4.195 1.408 5.6 1.157 1.306 2.82 1.957 4.795 1.957 3.447 0 5.37-2.227 5.37-2.227l-.438 2.736a.82.82 0 0 0 .808.948h3.327a1.23 1.23 0 0 0 1.212-1.03l2.257-14.31a.82.82 0 0 0-.808-.948l-2.409.367zm-3.882 7.15c-.349 2.155-2.028 3.593-4.148 3.593-1.077 0-1.933-.37-2.417-1.042-.484-.672-.61-1.61-.349-2.652.338-2.144 2.05-3.604 4.137-3.604 1.077 0 1.922.37 2.406 1.053.484.672.633 1.61.371 2.652zM57.65 14.33h-3.484a1.23 1.23 0 0 0-1.026.544l-4.908 7.162-2.095-6.901a1.23 1.23 0 0 0-1.178-.805h-3.527a.82.82 0 0 0-.786 1.053l4.303 12.637-3.714 5.215a.82.82 0 0 0 .666 1.291h3.484a1.23 1.23 0 0 0 1.004-.522l11.96-17.067a.82.82 0 0 0-.709-1.307z" fill="#003087"/>
      <path d="M68.74 3.033h-7.259a1.64 1.64 0 0 0-1.616 1.373L57.1 22.392a1.093 1.093 0 0 0 1.077 1.258h3.644a1.64 1.64 0 0 0 1.616-1.373l.794-5.033a1.64 1.64 0 0 1 1.616-1.373h2.302c4.802 0 8.524-1.95 9.626-7.587.49-2.483.08-4.354-1.22-5.617-1.428-1.385-3.882-1.634-7.807-1.634z" fill="#003087"/>
      <path d="M70.01 9.673c-.602 3.076-2.905 4.808-6.19 4.808h-1.756l1.196-7.581a.82.82 0 0 1 .808-.687h1.498c1.97 0 3.513.109 4.303.957.708.761.85 1.769.141 2.503z" fill="#001C64"/>
      <path d="M85.08 14.33h-3.473a.82.82 0 0 0-.808.687l-.426 2.703h-.14a3.834 3.834 0 0 0-3.037-1.385c-3.791 0-7.009 2.87-7.643 6.902-.349 2.155.158 4.195 1.408 5.6 1.157 1.306 2.82 1.957 4.795 1.957 3.447 0 5.37-2.227 5.37-2.227l-.438 2.736a.82.82 0 0 0 .808.948h3.327a1.23 1.23 0 0 0 1.212-1.03l2.257-14.31a.82.82 0 0 0-.808-.948l-2.409.367zm-3.882 7.15c-.349 2.155-2.028 3.593-4.148 3.593-1.077 0-1.933-.37-2.417-1.042-.484-.672-.61-1.61-.349-2.652.338-2.144 2.05-3.604 4.137-3.604 1.077 0 1.922.37 2.406 1.053.484.672.633 1.61.371 2.652zM90.35 4.373l-3.003 19.049a.82.82 0 0 0 .808.948h3.197a1.23 1.23 0 0 0 1.212-1.03l2.97-18.829a.82.82 0 0 0-.808-.948h-3.568a.82.82 0 0 0-.808.81z" fill="#003087"/>
    </svg>
  );
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<'business' | 'personal'>('business');
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [history, setHistory] = useState<InvoiceData[]>([]);
  const [emailTone, setEmailTone] = useState<'friendly' | 'formal' | 'urgent'>('friendly');
  const [copied, setCopied] = useState(false);
  
  // Genie State (Clean, no floating, no stars, professional assistant banner)
  const [genieMessage, setGenieMessage] = useState<string>(
    'PayGenie Assistant is ready. Enter your billing details or click a sample prompt to generate an itemized PayPal invoice.'
  );
  const [genieType, setGenieType] = useState<'info' | 'success' | 'error'>('info');

  const handleGenerate = async (textToUse?: string) => {
    const finalPrompt = textToUse || prompt;
    if (!finalPrompt.trim()) return;

    setLoading(true);
    setGenieType('info');
    setGenieMessage('Gemini 3.5 is calculating tax, discounts, itemizing line items, and drafting your payment notice...');

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
      setGenieType('success');
      setGenieMessage(`Invoice ${data.invoice.invoiceNumber} generated for ${data.invoice.clientName} ($${data.invoice.totalAmount.toFixed(2)} USD). PayPal checkout is armed and ready for settlement.`);
      setHistory((prev) => [data.invoice, ...prev]);
    } catch (err: any) {
      const msg = err.message || 'Something went wrong';
      setGenieType('error');
      setGenieMessage(`Error: ${msg}. Please review and try again.`);
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
    setGenieType('success');
    setGenieMessage(`Payment successfully verified and captured via PayPal Sandbox! Transaction Reference: ${paymentId}`);
    setHistory((prev) =>
      prev.map((inv) =>
        inv.invoiceNumber === updatedInvoice.invoiceNumber ? updatedInvoice : inv
      )
    );
    confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
  };

  const handlePaymentError = (msg: string) => {
    setGenieType('error');
    setGenieMessage(`PayPal Notice: ${msg}`);
  };

  const getDynamicEmailBody = () => {
    if (!invoice?.emailDraft) return '';
    const base = invoice.emailDraft.body || '';
    if (emailTone === 'formal') {
      return `Dear Accounts Payable / ${invoice.clientName},\n\nPlease find attached official invoice ${invoice.invoiceNumber} for the sum of $${invoice.totalAmount.toFixed(2)} ${invoice.currency}.\n\nPayment can be fulfilled directly via our PayPal checkout link. Settlement is requested by ${invoice.dueDate}.\n\nSincerely,\n${invoice.sellerName}`;
    }
    if (emailTone === 'urgent') {
      return `Urgent Payment Notice: ${invoice.clientName},\n\nThis is an expedited notice regarding Invoice ${invoice.invoiceNumber} ($${invoice.totalAmount.toFixed(2)} ${invoice.currency}). Please settle promptly via our secure PayPal Checkout.\n\nRegards,\n${invoice.sellerName}`;
    }
    return base;
  };

  const handleCopyEmail = () => {
    if (!invoice?.emailDraft) return;
    const body = getDynamicEmailBody();
    navigator.clipboard.writeText(`Subject: ${invoice.emailDraft.subject}\n\n${body}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') window.print();
  };

  return (
    <div className="min-h-screen bg-[#f7f9fa] text-[#001435] flex flex-col font-sans">
      {/* 1. Official PayPal Global Header */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-50">
        <div className="max-w-[1400px] mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-10">
            {/* Official PayPal Logo */}
            <a href="#" className="flex items-center cursor-pointer">
              <PayPalLogo className="h-7 w-auto" />
            </a>

            {/* Official Nav Links with cursor-pointer */}
            <nav className="hidden lg:flex items-center gap-7 text-sm font-bold text-[#001435]">
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

      {/* 2. Professional Genie Assistant Status Bar (Clean, integrated, not floating) */}
      <div className={`border-b transition-colors ${
        genieType === 'error'
          ? 'bg-red-50 border-red-200 text-red-800'
          : genieType === 'success'
          ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
          : 'bg-blue-50/70 border-blue-200 text-[#003087]'
      }`}>
        <div className="max-w-[1400px] mx-auto px-6 py-3 flex items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2.5">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-white shrink-0 ${
              genieType === 'error' ? 'bg-red-600' : genieType === 'success' ? 'bg-emerald-600' : 'bg-[#003087]'
            }`}>
              <Bot className="w-3.5 h-3.5" />
            </div>
            <p className="font-medium leading-relaxed">
              <strong className="font-bold mr-1">PayGenie AI:</strong>
              {genieMessage}
            </p>
          </div>
        </div>
      </div>

      {/* 3. Main Workspace: Parallel Split Layout (65% Web Lap Workspace + 35% Mobile Companion) */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ======================================================== */}
          {/* LEFT 65% COLUMN: LAPTOP / DESKTOP WEB WORKSPACE           */}
          {/* ======================================================== */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Desktop Laptop Frame Container */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              {/* Browser window chrome bar */}
              <div className="bg-[#f0f2f5] px-5 py-3 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-emerald-400" />
                  <span className="ml-3 font-mono text-[11px] text-slate-500 font-medium">
                    https://paypal.com/business/invoicing/paygenie-ai
                  </span>
                </div>
                <div className="inline-flex p-1 bg-white rounded-full border border-slate-200 text-xs">
                  <button
                    onClick={() => setActiveTab('business')}
                    className={`px-3 py-0.5 rounded-full font-bold cursor-pointer transition ${
                      activeTab === 'business' ? 'bg-[#003087] text-white' : 'text-slate-600'
                    }`}
                  >
                    Business
                  </button>
                  <button
                    onClick={() => setActiveTab('personal')}
                    className={`px-3 py-0.5 rounded-full font-bold cursor-pointer transition ${
                      activeTab === 'personal' ? 'bg-[#003087] text-white' : 'text-slate-600'
                    }`}
                  >
                    Personal
                  </button>
                </div>
              </div>

              {/* Inside Desktop Content */}
              <div className="p-8 space-y-6">
                <div>
                  <h1 className="pp-headline-1">
                    There’s a plus side to every <em className="text-[#003087]">bill you send with PayPal.</em>
                  </h1>
                  <p className="text-base text-slate-600 mt-2 font-normal leading-relaxed">
                    Describe your project or goods sold in conversational words. Gemini 3.5 AI automatically extracts line items, computes discounts, calculates taxes, and generates an official merchant invoice with instant PayPal settlement.
                  </p>
                </div>

                {/* Input Card */}
                <div className="bg-[#f7f9fa] rounded-2xl p-6 border border-slate-200 space-y-4">
                  <label htmlFor="desktop-prompt" className="block text-xs font-bold uppercase tracking-wider text-[#001435]">
                    Billing Description or Job Summary
                  </label>
                  <textarea
                    id="desktop-prompt"
                    rows={3}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g. Billed Acme Tech $650 for React Dashboard development, 10 hours at $65/hr with a 5% early bird discount..."
                    className="w-full bg-white border border-slate-300 rounded-xl p-4 text-sm text-[#001435] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0070BA] transition"
                  />

                  {/* Quick Try Samples */}
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
                        className="text-xs text-left bg-white hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded-full border border-slate-200 transition cursor-pointer truncate max-w-[280px] shadow-2xs"
                      >
                        {sample}
                      </button>
                    ))}
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      onClick={() => handleGenerate()}
                      disabled={loading || !prompt.trim()}
                      className="pp-btn-pill-primary flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {loading ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Generating Invoice with AI...</span>
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

                {/* Live Generated Invoice in Desktop View */}
                {invoice ? (
                  <div className="pt-4 space-y-6">
                    <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                      <div>
                        <span className="font-mono text-xs font-bold text-[#003087] bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                          {invoice.invoiceNumber}
                        </span>
                        <h2 className="text-2xl font-black text-[#001435] mt-2">
                          Invoice for {invoice.clientName}
                        </h2>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={handlePrint}
                          className="pp-btn-pill-secondary !py-1.5 !px-3.5 !text-xs flex items-center gap-1.5 cursor-pointer"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Print / Save PDF</span>
                        </button>
                        {invoice.status === 'PAID' ? (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> PAID
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-800 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                            <AlertCircle className="w-3.5 h-3.5 text-amber-600" /> UNPAID
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Metadata cards */}
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div className="bg-[#f7f9fa] p-4 rounded-xl border border-slate-200">
                        <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Billed From</span>
                        <p className="font-bold text-[#001435] text-sm">{invoice.sellerName}</p>
                        <p className="text-slate-500 mt-0.5">{invoice.sellerEmail || 'billing@paypal-merchant.com'}</p>
                      </div>
                      <div className="bg-[#f7f9fa] p-4 rounded-xl border border-slate-200">
                        <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Billed To</span>
                        <p className="font-bold text-[#001435] text-sm">{invoice.clientName}</p>
                        <p className="text-slate-500 mt-0.5">{invoice.clientEmail}</p>
                      </div>
                    </div>

                    <div className="flex gap-6 text-xs text-slate-600 pb-2">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        Issued: <strong className="text-[#001435]">{invoice.date}</strong>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-[#0070BA]" />
                        Due Date: <strong className="text-[#003087]">{invoice.dueDate}</strong>
                      </span>
                    </div>

                    {/* Line Items Table */}
                    <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
                      <thead className="bg-[#f7f9fa] border-b border-slate-200 uppercase font-bold text-slate-500">
                        <tr>
                          <th className="py-2.5 px-3">Description</th>
                          <th className="py-2.5 px-3 text-center">Qty</th>
                          <th className="py-2.5 px-3 text-right">Unit Rate</th>
                          <th className="py-2.5 px-3 text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {invoice.items.map((item, idx) => (
                          <tr key={idx}>
                            <td className="py-3 px-3 font-semibold text-[#001435]">{item.description}</td>
                            <td className="py-3 px-3 text-center font-mono text-slate-600">{item.quantity}</td>
                            <td className="py-3 px-3 text-right font-mono">${item.unitPrice.toFixed(2)}</td>
                            <td className="py-3 px-3 text-right font-mono font-bold text-[#001435]">${item.total.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {/* Math breakdown */}
                    <div className="flex flex-col items-end text-xs space-y-1.5 pt-2">
                      <div className="flex justify-between w-60 text-slate-600">
                        <span>Subtotal:</span>
                        <span className="font-mono font-semibold">${invoice.subtotal.toFixed(2)}</span>
                      </div>
                      {invoice.discountAmount > 0 && (
                        <div className="flex justify-between w-60 text-emerald-600 font-semibold">
                          <span>Discount ({invoice.discountPercentage}%):</span>
                          <span className="font-mono">-${invoice.discountAmount.toFixed(2)}</span>
                        </div>
                      )}
                      {invoice.taxAmount > 0 && (
                        <div className="flex justify-between w-60 text-slate-600">
                          <span>Tax ({invoice.taxPercentage}%):</span>
                          <span className="font-mono">+${invoice.taxAmount.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between w-60 pt-2 border-t-2 border-[#001435] text-base font-extrabold text-[#001435]">
                        <span>Total Due:</span>
                        <span className="text-[#003087] font-mono">${invoice.totalAmount.toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Desktop PayPal Checkout Section */}
                    <div className="mt-6 pt-6 border-t border-slate-200">
                      {invoice.status === 'PAID' ? (
                        <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center">
                          <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                          <h4 className="text-base font-bold text-emerald-900">Payment Succeeded & Captured</h4>
                          <p className="text-xs text-emerald-700 font-mono mt-1">Ref: {invoice.paymentId || 'PAYPAL-CAPTURED'}</p>
                        </div>
                      ) : (
                        <div className="max-w-md mx-auto">
                          <p className="text-center text-xs text-slate-500 mb-3 font-medium">
                            Ready to settle? Pay directly via PayPal Sandbox:
                          </p>
                          <PayPalButtons
                            style={{ layout: 'vertical', shape: 'pill', label: 'pay', height: 44 }}
                            createOrder={async () => {
                              try {
                                const res = await fetch('/api/paypal/create-order', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({
                                    amount: invoice.totalAmount,
                                    currency: invoice.currency || 'USD',
                                    invoiceNumber: invoice.invoiceNumber,
                                    clientName: invoice.clientName,
                                  }),
                                });
                                const data = await res.json();
                                if (!res.ok) throw new Error(data.error || 'Failed to initiate order');
                                return data.orderId;
                              } catch (err: any) {
                                handlePaymentError(err.message);
                                throw err;
                              }
                            }}
                            onApprove={async (data) => {
                              try {
                                const res = await fetch('/api/paypal/capture-order', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ orderId: data.orderID }),
                                });
                                const captureData = await res.json();
                                if (!res.ok) throw new Error(captureData.error || 'Failed to capture payment');
                                handlePaymentSuccess(captureData.captureId || data.orderID);
                              } catch (err: any) {
                                handlePaymentError(err.message);
                              }
                            }}
                            onError={(err) => {
                              console.log('PayPal popup closed or cancelled:', err);
                            }}
                          />
                        </div>
                      )}
                    </div>

                    {/* Email Notice Card */}
                    {invoice.emailDraft && (
                      <div className="bg-[#f7f9fa] rounded-2xl p-5 border border-slate-200 text-xs space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[#001435]">Client Notification Email</span>
                          <div className="flex items-center gap-1.5">
                            {(['friendly', 'formal', 'urgent'] as const).map((tone) => (
                              <button
                                key={tone}
                                onClick={() => setEmailTone(tone)}
                                className={`px-2.5 py-1 rounded-full capitalize font-semibold cursor-pointer transition ${
                                  emailTone === tone ? 'bg-[#003087] text-white' : 'text-slate-600 hover:text-black'
                                }`}
                              >
                                {tone}
                              </button>
                            ))}
                            <button
                              onClick={handleCopyEmail}
                              className="pp-btn-pill-primary !py-1 !px-3 !text-xs ml-2 cursor-pointer flex items-center gap-1"
                            >
                              {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                              <span>{copied ? 'Copied' : 'Copy'}</span>
                            </button>
                          </div>
                        </div>
                        <p className="text-slate-500 font-mono">Subject: {invoice.emailDraft.subject}</p>
                        <p className="whitespace-pre-line text-slate-700 bg-white p-3.5 rounded-xl border border-slate-200">
                          {getDynamicEmailBody()}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-[#fafbfc]">
                    <p className="text-sm font-bold text-slate-500">No invoice generated yet</p>
                    <p className="text-xs text-slate-400 mt-1">Type in the description above and click &quot;Generate Invoice&quot;.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Session Ledger Table */}
            {history.length > 0 && (
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <History className="w-4 h-4 text-[#003087]" />
                    <h3 className="font-bold text-[#001435] text-sm">Session Invoices Ledger</h3>
                  </div>
                  <span className="text-xs text-slate-400">{history.length} Invoice{history.length > 1 ? 's' : ''}</span>
                </div>
                <table className="w-full text-left text-xs">
                  <thead className="text-slate-400 border-b border-slate-100 uppercase font-bold">
                    <tr>
                      <th className="py-2">Invoice #</th>
                      <th className="py-2">Client</th>
                      <th className="py-2">Date</th>
                      <th className="py-2 text-right">Amount</th>
                      <th className="py-2 text-center">Status</th>
                      <th className="py-2 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {history.map((inv, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="py-2.5 font-mono font-bold text-[#003087]">{inv.invoiceNumber}</td>
                        <td className="py-2.5 font-semibold text-[#001435]">{inv.clientName}</td>
                        <td className="py-2.5 text-slate-500">{inv.date}</td>
                        <td className="py-2.5 text-right font-mono font-bold">${inv.totalAmount.toFixed(2)}</td>
                        <td className="py-2.5 text-center">
                          {inv.status === 'PAID' ? (
                            <span className="inline-flex items-center text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                              PAID
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                              PENDING
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 text-right">
                          <button
                            onClick={() => setInvoice(inv)}
                            className="text-[#0070BA] hover:underline font-bold cursor-pointer"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* ======================================================== */}
          {/* RIGHT 35% COLUMN: REAL-TIME MOBILE COMPANION SIMULATOR   */}
          {/* ======================================================== */}
          <div className="lg:col-span-4 sticky top-28 flex flex-col items-center">
            
            <div className="w-full max-w-[340px] bg-[#001435] rounded-[48px] p-3 shadow-2xl border-4 border-slate-800">
              {/* Phone screen */}
              <div className="bg-[#f7f9fa] rounded-[40px] overflow-hidden border border-slate-200 text-[#001435] min-h-[620px] flex flex-col justify-between">
                
                {/* Camera notch */}
                <div className="bg-white py-2 flex items-center justify-center border-b border-slate-100">
                  <div className="w-20 h-3.5 bg-slate-900 rounded-full" />
                </div>

                {/* Mobile app header with official full PayPal logo */}
                <div className="p-4 bg-white border-b border-slate-100 flex items-center justify-between">
                  <PayPalLogo className="h-5 w-auto" />
                  <span className="text-[10px] font-bold text-[#003087] bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
                    Mobile App
                  </span>
                </div>

                {/* Mobile body content: ONLY SHOWS INVOICE & BUTTON WHEN INVOICE EXISTS */}
                <div className="p-4 flex-1 space-y-3">
                  {invoice ? (
                    <div className="space-y-3 animate-in fade-in duration-300">
                      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
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
                        <div className="text-2xl font-black text-[#003087] mt-1">
                          ${invoice.totalAmount.toFixed(2)}
                        </div>
                        <p className="text-[10px] text-slate-500 mt-0.5">Due: {invoice.dueDate}</p>
                      </div>

                      {/* Items breakdown mini list */}
                      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 space-y-1.5 text-[11px]">
                        <span className="font-bold text-slate-400 uppercase text-[9px] block">Items</span>
                        {invoice.items.slice(0, 2).map((item, i) => (
                          <div key={i} className="flex justify-between text-slate-700">
                            <span className="truncate max-w-[150px]">{item.description}</span>
                            <span className="font-mono font-semibold">${item.total.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>

                      {/* Phone Interactive PayPal Button (Appears ONLY after generation) */}
                      {invoice.status === 'PAID' ? (
                        <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl text-center">
                          <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto mb-1" />
                          <p className="text-xs font-bold text-emerald-900">Settled via PayPal</p>
                          <p className="text-[9px] text-emerald-700 font-mono mt-0.5">Ref: {invoice.paymentId || 'CAPTURED'}</p>
                        </div>
                      ) : (
                        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 text-center space-y-2">
                          <button
                            onClick={() => {
                              const btn = document.querySelector('.paypal-buttons') as HTMLElement;
                              if (btn) btn.scrollIntoView({ behavior: 'smooth' });
                            }}
                            className="w-full py-2.5 rounded-full bg-[#ffc439] hover:bg-[#f4b628] font-black text-xs text-[#001435] flex items-center justify-center shadow-xs cursor-pointer transition"
                          >
                            Pay with <span className="text-[#003087] ml-1">Pay</span><span className="text-[#0070BA]">Pal</span>
                          </button>
                          <p className="text-[9px] text-slate-400">Tap to complete on mobile checkout</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Initial Empty State: NO DUMMY AMOUNT, NO PAYPAL BUTTON BEFORE GENERATION */
                    <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3 my-auto">
                      <div className="w-12 h-12 rounded-full bg-blue-50 text-[#003087] flex items-center justify-center">
                        <PayPalLogo className="h-4 w-auto" />
                      </div>
                      <h4 className="text-xs font-bold text-[#001435]">Live Mobile Screen</h4>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        When you generate an invoice on the left, the mobile view updates immediately here with real-time checkout!
                      </p>
                    </div>
                  )}
                </div>

                {/* Home Indicator */}
                <div className="p-3 bg-white border-t border-slate-100 text-center">
                  <div className="w-28 h-1 bg-slate-300 rounded-full mx-auto" />
                </div>
              </div>
            </div>

            <p className="text-center text-xs text-slate-400 mt-4">
              Real-time companion simulator (Parallel View)
            </p>
          </div>

        </div>
      </main>

      {/* 4. Official PayPal Footer */}
      <footer className="border-t border-slate-200 bg-white py-10 text-xs text-slate-500 mt-12">
        <div className="max-w-[1400px] mx-auto px-6 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5 font-bold text-[#001435]">
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
