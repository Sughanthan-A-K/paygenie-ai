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
  Calendar,
  ShieldCheck,
  Printer,
  DollarSign,
  Building2,
  FileCheck2,
} from 'lucide-react';

interface InvoiceViewProps {
  invoice: InvoiceData;
  onPaymentSuccess: (paymentId: string) => void;
  isDark: boolean;
}

export default function InvoiceView({ invoice, onPaymentSuccess, isDark }: InvoiceViewProps) {
  const [copied, setCopied] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [emailTone, setEmailTone] = useState<'friendly' | 'formal' | 'urgent'>('friendly');
  const invoiceRef = useRef<HTMLDivElement>(null);

  const getDynamicEmailBody = () => {
    const base = invoice.emailDraft?.body || '';
    if (emailTone === 'formal') {
      return `Dear Accounts Payable / ${invoice.clientName},\n\nPlease find attached official Invoice ${invoice.invoiceNumber} for the total sum of $${invoice.totalAmount.toFixed(2)} ${invoice.currency}.\n\nPayment can be fulfilled directly via PayPal checkout. We kindly request settlement by ${invoice.dueDate}.\n\nSincerely,\n${invoice.sellerName}`;
    }
    if (emailTone === 'urgent') {
      return `Urgent Payment Notice: ${invoice.clientName},\n\nThis is an expedited notice regarding Invoice ${invoice.invoiceNumber} ($${invoice.totalAmount.toFixed(2)} ${invoice.currency}). Please settle promptly via our official PayPal payment checkout link.\n\nRegards,\n${invoice.sellerName}`;
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

  const handlePrintDownload = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const fireSuccessCelebration = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Invoice Actions bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Status:
          </span>
          {invoice.status === 'PAID' ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-400 px-3 py-1 rounded-full border border-emerald-300 dark:border-emerald-700">
              <CheckCircle2 className="w-3.5 h-3.5" /> PAID VIA PAYPAL
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-100 dark:bg-amber-950/60 dark:text-amber-400 px-3 py-1 rounded-full border border-amber-300 dark:border-amber-700">
              <AlertCircle className="w-3.5 h-3.5" /> READY FOR PAYMENT
            </span>
          )}
        </div>

        <button
          onClick={handlePrintDownload}
          className="inline-flex items-center gap-2 text-xs font-semibold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700/80 transition cursor-pointer"
        >
          <Printer className="w-3.5 h-3.5 text-[#0070BA]" />
          <span>Print / Save PDF</span>
        </button>
      </div>

      {/* Main Official PayPal Invoice Card */}
      <div
        ref={invoiceRef}
        id="printable-invoice"
        className="bg-white dark:bg-[#001c47] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-xl relative overflow-hidden"
      >
        {/* PayPal Navy / Light Blue top brand accent */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#003087] via-[#0070BA] to-[#00CFDE]" />

        {/* Invoice Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8 border-b border-slate-100 dark:border-slate-800/80">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#003087] dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-3 py-1 rounded-md border border-blue-200 dark:border-blue-800">
                {invoice.invoiceNumber}
              </span>
              <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                <FileCheck2 className="w-3 h-3" /> PayPal Merchant Verified
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Invoice for {invoice.clientName}
            </h2>
          </div>

          <div className="sm:text-right bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold block">
              Amount Due
            </span>
            <div className="text-3xl font-extrabold text-[#003087] dark:text-blue-400">
              ${invoice.totalAmount.toFixed(2)}{' '}
              <span className="text-xs font-normal text-slate-500 dark:text-slate-400">{invoice.currency}</span>
            </div>
          </div>
        </div>

        {/* Billed From & Billed To */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6 text-sm">
          <div className="bg-slate-50 dark:bg-slate-900/40 p-5 rounded-2xl border border-slate-100 dark:border-slate-800/70">
            <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Billed From
            </p>
            <p className="font-bold text-slate-900 dark:text-white text-base">{invoice.sellerName}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{invoice.sellerEmail || 'billing@paypal-merchant.com'}</p>
          </div>
          <div className="bg-slate-50 dark:bg-slate-900/40 p-5 rounded-2xl border border-slate-100 dark:border-slate-800/70">
            <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Billed To
            </p>
            <p className="font-bold text-slate-900 dark:text-white text-base">{invoice.clientName}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{invoice.clientEmail}</p>
          </div>
        </div>

        {/* Issue & Due Dates */}
        <div className="flex flex-wrap gap-6 text-xs text-slate-600 dark:text-slate-400 mb-6 pb-6 border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span>
              Issued: <strong className="text-slate-800 dark:text-slate-200">{invoice.date}</strong>
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-[#0070BA]" />
            <span>
              Due Date: <strong className="text-[#0070BA] dark:text-blue-400">{invoice.dueDate}</strong>
            </span>
          </div>
        </div>

        {/* Line Items Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold">
                <th className="py-3 px-2">Description</th>
                <th className="py-3 px-2 text-center">Qty</th>
                <th className="py-3 px-2 text-right">Unit Price</th>
                <th className="py-3 px-2 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 text-slate-700 dark:text-slate-300">
              {invoice.items.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition">
                  <td className="py-3.5 px-2 font-medium text-slate-900 dark:text-white">{item.description}</td>
                  <td className="py-3.5 px-2 text-center font-mono text-slate-500 dark:text-slate-400">{item.quantity}</td>
                  <td className="py-3.5 px-2 text-right font-mono">${item.unitPrice.toFixed(2)}</td>
                  <td className="py-3.5 px-2 text-right font-mono font-bold text-slate-900 dark:text-slate-100">
                    ${item.total.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Calculations / Summary */}
        <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col items-end text-sm space-y-2">
          <div className="flex justify-between w-64 text-slate-600 dark:text-slate-400">
            <span>Subtotal:</span>
            <span className="font-mono font-semibold text-slate-900 dark:text-slate-200">
              ${invoice.subtotal.toFixed(2)}
            </span>
          </div>
          {invoice.discountAmount > 0 && (
            <div className="flex justify-between w-64 text-emerald-600 dark:text-emerald-400">
              <span>Discount ({invoice.discountPercentage}%):</span>
              <span className="font-mono">-${invoice.discountAmount.toFixed(2)}</span>
            </div>
          )}
          {invoice.taxAmount > 0 && (
            <div className="flex justify-between w-64 text-slate-600 dark:text-slate-400">
              <span>Tax ({invoice.taxPercentage}%):</span>
              <span className="font-mono">+${invoice.taxAmount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between w-64 pt-3 border-t border-slate-200 dark:border-slate-700 text-lg font-black text-slate-900 dark:text-white">
            <span>Total:</span>
            <span className="text-[#003087] dark:text-blue-400 font-mono">${invoice.totalAmount.toFixed(2)}</span>
          </div>
        </div>

        {/* Terms */}
        {invoice.notes && (
          <div className="mt-6 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
            <span className="font-bold text-slate-900 dark:text-slate-300 block mb-1">Notes & Terms:</span>
            {invoice.notes}
          </div>
        )}

        {/* PAYPAL CHECKOUT SECTION */}
        <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-800">
          {invoice.status === 'PAID' ? (
            <div className="p-8 rounded-3xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-700/60 text-center">
              <div className="inline-flex p-3 rounded-2xl bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 mb-3">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-emerald-800 dark:text-emerald-200">
                Payment Completed Successfully!
              </h3>
              <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-1">
                PayPal Transaction ID:{' '}
                <span className="font-mono font-bold bg-white dark:bg-emerald-900/60 px-2 py-0.5 rounded border border-emerald-300 dark:border-emerald-600 text-emerald-900 dark:text-emerald-100">
                  {invoice.paymentId || 'PAYPAL-CAPTURED'}
                </span>
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                Settled at {invoice.paidAt || new Date().toLocaleString()}
              </p>
            </div>
          ) : (
            <div>
              <div className="text-center mb-5">
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/80 text-[#003087] dark:text-blue-400 text-xs font-bold mb-2 border border-blue-100 dark:border-blue-800">
                  <DollarSign className="w-3.5 h-3.5" /> Secure PayPal Checkout
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Pay Now with PayPal
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Choose your PayPal balance, linked bank account, or debit/credit card.
                </p>
              </div>

              {paymentError && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-xs text-center">
                  {paymentError}
                </div>
              )}

              <div className="max-w-md mx-auto relative z-10">
                <PayPalButtons
                  style={{ layout: 'vertical', shape: 'rect', label: 'pay', height: 46 }}
                  createOrder={async () => {
                    setPaymentError(null);
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
                    }
                  }}
                  onError={(err) => {
                    console.error('PayPal Checkout error:', err);
                    setPaymentError('PayPal Checkout encountered an issue.');
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* AI Client Notification Draft Card */}
      {invoice.emailDraft && (
        <div className="bg-white dark:bg-[#001c47] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-900/40 text-[#0070BA] dark:text-blue-400">
                <Send className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">
                  Client Email & Payment Notification
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Automated notification ready to send</p>
              </div>
            </div>

            {/* Email Tone Selector */}
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
              {(['friendly', 'formal', 'urgent'] as const).map((tone) => (
                <button
                  key={tone}
                  onClick={() => setEmailTone(tone)}
                  className={`px-3 py-1 rounded-lg capitalize transition cursor-pointer font-medium ${
                    emailTone === tone
                      ? 'bg-[#0070BA] text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  {tone}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-900/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <p className="text-slate-600 dark:text-slate-400 font-sans">
                <strong className="text-slate-900 dark:text-slate-200">Subject:</strong> {invoice.emailDraft.subject}
              </p>
              <button
                onClick={handleCopyEmail}
                className="inline-flex items-center gap-1.5 text-xs bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-3.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 transition cursor-pointer font-medium shadow-sm"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy Draft'}</span>
              </button>
            </div>
            <div className="whitespace-pre-line font-sans leading-relaxed pt-1 text-slate-700 dark:text-slate-300">
              {getDynamicEmailBody()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
