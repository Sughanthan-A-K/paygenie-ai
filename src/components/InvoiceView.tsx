'use client';

import React, { useState, useRef } from 'react';
import { PayPalButtons } from '@paypal/react-paypal-js';
import confetti from 'canvas-confetti';
import { InvoiceData } from '@/types/invoice';
import {
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Send,
  Download,
  DollarSign,
  Calendar,
  ShieldCheck,
  Printer,
  Sparkles,
} from 'lucide-react';

interface InvoiceViewProps {
  invoice: InvoiceData;
  onPaymentSuccess: (paymentId: string) => void;
}

export default function InvoiceView({ invoice, onPaymentSuccess }: InvoiceViewProps) {
  const [copied, setCopied] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [emailTone, setEmailTone] = useState<'friendly' | 'formal' | 'urgent'>('friendly');
  const [isExporting, setIsExporting] = useState(false);
  const invoiceRef = useRef<HTMLDivElement>(null);

  // Dynamic email variations based on tone
  const getDynamicEmailBody = () => {
    const base = invoice.emailDraft?.body || '';
    if (emailTone === 'formal') {
      return `Dear Accounts Payable / ${invoice.clientName},\n\nPlease be advised that Invoice ${invoice.invoiceNumber} for the total sum of $${invoice.totalAmount.toFixed(2)} ${invoice.currency} is prepared and payable via PayPal.\n\nAll deliverables have been provided per schedule. We request settlement by ${invoice.dueDate}.\n\nSincerely,\n${invoice.sellerName}`;
    }
    if (emailTone === 'urgent') {
      return `Urgent Attention: ${invoice.clientName},\n\nThis is an expedited notice regarding Invoice ${invoice.invoiceNumber} ($${invoice.totalAmount.toFixed(2)} ${invoice.currency}). Payment is requested immediately to proceed with deployment.\n\nPlease settle securely using our embedded PayPal Checkout link.\n\nRegards,\n${invoice.sellerName}`;
    }
    return base;
  };

  const handleCopyEmail = () => {
    const body = getDynamicEmailBody();
    const subject = invoice.emailDraft?.subject || `Invoice ${invoice.invoiceNumber}`;
    navigator.clipboard.writeText(`Subject: ${subject}\n\n${body}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrintDownload = async () => {
    setIsExporting(true);
    try {
      if (typeof window !== 'undefined') {
        window.print();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsExporting(false);
    }
  };

  const fireSuccessCelebration = () => {
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 },
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Invoice Actions bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase font-bold tracking-wider text-slate-400">
            Invoice Status:
          </span>
          {invoice.status === 'PAID' ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30">
              <CheckCircle2 className="w-3.5 h-3.5" /> PAID VIA PAYPAL
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30">
              <AlertCircle className="w-3.5 h-3.5" /> PENDING SETTLEMENT
            </span>
          )}
        </div>

        <button
          onClick={handlePrintDownload}
          disabled={isExporting}
          className="inline-flex items-center gap-2 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3.5 py-1.5 rounded-xl border border-slate-700 shadow-sm transition cursor-pointer"
        >
          <Printer className="w-3.5 h-3.5 text-blue-400" />
          <span>Print / Save PDF</span>
        </button>
      </div>

      {/* Main Invoice Document */}
      <div
        ref={invoiceRef}
        id="printable-invoice"
        className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden"
      >
        {/* PayPal / Watermark Branding bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#003087] via-[#0070BA] to-[#00CFDE]" />

        {/* Invoice Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 px-3 py-1 rounded-lg border border-blue-500/20">
                {invoice.invoiceNumber}
              </span>
              <span className="text-[11px] font-semibold text-emerald-400/90 bg-emerald-500/10 px-2.5 py-0.5 rounded-md border border-emerald-500/20 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> AI Audited & Verified
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Invoice for {invoice.clientName}
            </h2>
          </div>

          <div className="sm:text-right bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
            <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold block">
              Total Amount
            </span>
            <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-400">
              ${invoice.totalAmount.toFixed(2)}{' '}
              <span className="text-xs font-semibold text-slate-400 uppercase">{invoice.currency}</span>
            </div>
          </div>
        </div>

        {/* Billed From / To Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6 text-sm">
          <div className="bg-slate-950/60 p-5 rounded-2xl border border-slate-800">
            <p className="text-[11px] uppercase font-bold tracking-wider text-slate-400 mb-1">
              Billed From
            </p>
            <p className="font-bold text-white text-base">{invoice.sellerName}</p>
            <p className="text-xs text-slate-400 mt-0.5">{invoice.sellerEmail || 'billing@paygenie.ai'}</p>
          </div>
          <div className="bg-slate-950/60 p-5 rounded-2xl border border-slate-800">
            <p className="text-[11px] uppercase font-bold tracking-wider text-slate-400 mb-1">
              Billed To
            </p>
            <p className="font-bold text-white text-base">{invoice.clientName}</p>
            <p className="text-xs text-slate-400 mt-0.5">{invoice.clientEmail}</p>
          </div>
        </div>

        {/* Dates */}
        <div className="flex flex-wrap gap-6 text-xs text-slate-400 mb-6 pb-6 border-b border-slate-800">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-slate-500" />
            <span>
              Issued: <strong className="text-slate-200">{invoice.date}</strong>
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-blue-400" />
            <span>
              Due Date: <strong className="text-blue-300">{invoice.dueDate}</strong>
            </span>
          </div>
        </div>

        {/* Line Items Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400 font-bold">
                <th className="py-3 px-2">Description</th>
                <th className="py-3 px-2 text-center">Qty / Hrs</th>
                <th className="py-3 px-2 text-right">Unit Rate</th>
                <th className="py-3 px-2 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {invoice.items.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-800/20 transition">
                  <td className="py-3.5 px-2 font-medium text-white">{item.description}</td>
                  <td className="py-3.5 px-2 text-center text-slate-400 font-mono">{item.quantity}</td>
                  <td className="py-3.5 px-2 text-right font-mono">${item.unitPrice.toFixed(2)}</td>
                  <td className="py-3.5 px-2 text-right font-mono font-bold text-slate-100">
                    ${item.total.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Math & Totals Summary */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex flex-col items-end text-sm space-y-2">
          <div className="flex justify-between w-64 text-slate-400">
            <span>Subtotal:</span>
            <span className="font-mono font-semibold text-slate-200">${invoice.subtotal.toFixed(2)}</span>
          </div>
          {invoice.discountAmount > 0 && (
            <div className="flex justify-between w-64 text-emerald-400">
              <span>Discount ({invoice.discountPercentage}%):</span>
              <span className="font-mono">-${invoice.discountAmount.toFixed(2)}</span>
            </div>
          )}
          {invoice.taxAmount > 0 && (
            <div className="flex justify-between w-64 text-slate-400">
              <span>Tax ({invoice.taxPercentage}%):</span>
              <span className="font-mono">+${invoice.taxAmount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between w-64 pt-3 border-t border-slate-700 text-lg font-black text-white">
            <span>Total Due:</span>
            <span className="text-blue-400 font-mono">${invoice.totalAmount.toFixed(2)}</span>
          </div>
        </div>

        {/* Terms & Notes */}
        {invoice.notes && (
          <div className="mt-6 p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-400">
            <span className="font-bold text-slate-300 block mb-1">Payment Instructions & Notes:</span>
            {invoice.notes}
          </div>
        )}

        {/* PAYPAL CHECKOUT SECTION */}
        <div className="mt-8 pt-8 border-t border-slate-800">
          {invoice.status === 'PAID' ? (
            <div className="p-8 rounded-3xl bg-gradient-to-b from-emerald-950/50 to-slate-950 border border-emerald-500/40 text-center relative overflow-hidden">
              <div className="inline-flex p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mb-3">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-emerald-200">Payment Succeeded & Verified</h3>
              <p className="text-xs text-emerald-400/90 mt-1">
                Settled through PayPal Sandbox. Transaction Reference:{' '}
                <span className="font-mono font-bold bg-emerald-900/40 px-2 py-0.5 rounded text-white">
                  {invoice.paymentId || 'PAYPAL-CAPTURED'}
                </span>
              </p>
              <p className="text-xs text-slate-400 mt-2">Recorded at {invoice.paidAt || new Date().toLocaleString()}</p>
            </div>
          ) : (
            <div>
              <div className="text-center mb-5">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-semibold mb-2">
                  <DollarSign className="w-3.5 h-3.5" /> Powered by PayPal Orders API
                </div>
                <h3 className="text-base font-bold text-white">Settle Instantly via PayPal</h3>
                <p className="text-xs text-slate-400">
                  Instant escrow authorization and server-side capture via Sandbox.
                </p>
              </div>

              {paymentError && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs text-center">
                  {paymentError}
                </div>
              )}

              <div className="max-w-md mx-auto relative z-10">
                <PayPalButtons
                  style={{ layout: 'vertical', shape: 'rect', label: 'pay', height: 46 }}
                  createOrder={async () => {
                    setPaymentError(null);
                    setIsProcessing(true);
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
                      setPaymentError(err.message);
                      setIsProcessing(false);
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

                      fireSuccessCelebration();
                      onPaymentSuccess(captureData.captureId || data.orderID);
                    } catch (err: any) {
                      setPaymentError(err.message);
                    } finally {
                      setIsProcessing(false);
                    }
                  }}
                  onError={(err) => {
                    console.error('PayPal Checkout error:', err);
                    setPaymentError('PayPal Checkout encountered an issue.');
                    setIsProcessing(false);
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* AI Client Email Notification Card with Tone Switcher */}
      {invoice.emailDraft && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
                <Send className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm sm:text-base">
                  AI Client Notification & Reminder Drafter
                </h3>
                <p className="text-xs text-slate-400">Pick a tone and copy into Gmail / Outlook</p>
              </div>
            </div>

            {/* Email Tone Switcher */}
            <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
              {(['friendly', 'formal', 'urgent'] as const).map((tone) => (
                <button
                  key={tone}
                  onClick={() => setEmailTone(tone)}
                  className={`px-3 py-1 rounded-lg capitalize transition cursor-pointer font-medium ${
                    emailTone === tone
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {tone}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800/80 text-xs text-slate-300 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <p className="text-slate-400 font-sans">
                <strong className="text-slate-200">Subject:</strong> {invoice.emailDraft.subject}
              </p>
              <button
                onClick={handleCopyEmail}
                className="inline-flex items-center gap-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg border border-slate-700 transition cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy Draft'}</span>
              </button>
            </div>
            <div className="whitespace-pre-line font-sans text-slate-300 leading-relaxed pt-1">
              {getDynamicEmailBody()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
