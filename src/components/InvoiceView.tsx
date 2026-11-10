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
  Printer,
} from 'lucide-react';

interface InvoiceViewProps {
  invoice: InvoiceData;
  onPaymentSuccess: (paymentId: string) => void;
  onPaymentError?: (msg: string) => void;
}

export default function InvoiceView({
  invoice,
  onPaymentSuccess,
  onPaymentError,
}: InvoiceViewProps) {
  const [copied, setCopied] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [emailTone, setEmailTone] = useState<'friendly' | 'formal' | 'urgent'>('friendly');
  const invoiceRef = useRef<HTMLDivElement>(null);

  const getDynamicEmailBody = () => {
    const base = invoice.emailDraft?.body || '';
    if (emailTone === 'formal') {
      return `Dear Accounts Payable / ${invoice.clientName},\n\nPlease find attached official invoice ${invoice.invoiceNumber} for the sum of $${invoice.totalAmount.toFixed(2)} ${invoice.currency}.\n\nPayment can be fulfilled directly via our PayPal checkout link. Settlement is requested by ${invoice.dueDate}.\n\nSincerely,\n${invoice.sellerName}`;
    }
    if (emailTone === 'urgent') {
      return `Urgent Payment Notice: ${invoice.clientName},\n\nThis is an expedited notice regarding Invoice ${invoice.invoiceNumber} ($${invoice.totalAmount.toFixed(2)} ${invoice.currency}). Please settle promptly via our secure PayPal Checkout.\n\nRegards,\n${invoice.sellerName}`;
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
      particleCount: 120,
      spread: 75,
      origin: { y: 0.6 },
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Top Invoice Actions bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Status</span>
          {invoice.status === 'PAID' ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 px-3.5 py-1 rounded-full border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> PAID VIA PAYPAL
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 bg-amber-50 px-3.5 py-1 rounded-full border border-amber-200">
              <AlertCircle className="w-3.5 h-3.5 text-amber-600" /> READY FOR SETTLEMENT
            </span>
          )}
        </div>

        <button
          onClick={handlePrintDownload}
          className="pp-btn-pill-secondary !py-2 !px-4 !text-xs !min-w-0 flex items-center gap-2 cursor-pointer hover:bg-slate-50 transition"
          title="Print or Save Invoice PDF"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Print / PDF</span>
        </button>
      </div>

      {/* Main Official PayPal Invoice Card */}
      <div
        ref={invoiceRef}
        id="printable-invoice"
        className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 shadow-[0_4px_24px_rgba(0,20,53,0.06)] relative overflow-hidden"
      >
        {/* PayPal Signature Navy / Cyan top bar */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#003087] via-[#0070BA] to-[#00CFDE]" />

        {/* Invoice Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-8 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="font-mono text-xs font-bold text-[#003087] bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                {invoice.invoiceNumber}
              </span>
              <span className="text-xs font-semibold text-slate-500">Official Merchant Invoice</span>
            </div>
            <h2 className="text-3xl font-extrabold text-[#001435] tracking-tight">
              Invoice for {invoice.clientName}
            </h2>
          </div>

          <div className="sm:text-right bg-[#f7f9fa] p-5 rounded-2xl border border-slate-200/80">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Amount Due
            </span>
            <div className="text-4xl font-extrabold text-[#003087]">
              ${invoice.totalAmount.toFixed(2)}{' '}
              <span className="text-sm font-normal text-slate-500">{invoice.currency}</span>
            </div>
          </div>
        </div>

        {/* Billed From & Billed To Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 my-8 text-sm">
          <div className="bg-[#f7f9fa] p-6 rounded-2xl border border-slate-200/80">
            <p className="text-[11px] uppercase font-bold tracking-wider text-slate-500 mb-1">Billed From</p>
            <p className="font-extrabold text-[#001435] text-base">{invoice.sellerName}</p>
            <p className="text-xs text-slate-600 mt-1">{invoice.sellerEmail || 'billing@paypal-merchant.com'}</p>
          </div>
          <div className="bg-[#f7f9fa] p-6 rounded-2xl border border-slate-200/80">
            <p className="text-[11px] uppercase font-bold tracking-wider text-slate-500 mb-1">Billed To</p>
            <p className="font-extrabold text-[#001435] text-base">{invoice.clientName}</p>
            <p className="text-xs text-slate-600 mt-1">{invoice.clientEmail}</p>
          </div>
        </div>

        {/* Dates */}
        <div className="flex flex-wrap gap-8 text-xs text-slate-600 mb-8 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span>Issued Date: <strong className="text-[#001435]">{invoice.date}</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#0070BA]" />
            <span>Due Date: <strong className="text-[#003087]">{invoice.dueDate}</strong></span>
          </div>
        </div>

        {/* Line Items Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-bold">
                <th className="py-3 px-3">Description</th>
                <th className="py-3 px-3 text-center">Qty</th>
                <th className="py-3 px-3 text-right">Unit Rate</th>
                <th className="py-3 px-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {invoice.items.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50/70 transition">
                  <td className="py-4 px-3 font-semibold text-[#001435]">{item.description}</td>
                  <td className="py-4 px-3 text-center font-mono text-slate-600">{item.quantity}</td>
                  <td className="py-4 px-3 text-right font-mono">${item.unitPrice.toFixed(2)}</td>
                  <td className="py-4 px-3 text-right font-mono font-bold text-[#001435]">
                    ${item.total.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Math & Totals Summary */}
        <div className="mt-8 pt-6 border-t border-slate-200 flex flex-col items-end text-sm space-y-2.5">
          <div className="flex justify-between w-72 text-slate-600">
            <span>Subtotal:</span>
            <span className="font-mono font-semibold text-[#001435]">${invoice.subtotal.toFixed(2)}</span>
          </div>
          {invoice.discountAmount > 0 && (
            <div className="flex justify-between w-72 text-emerald-600 font-semibold">
              <span>Discount ({invoice.discountPercentage}%):</span>
              <span className="font-mono">-${invoice.discountAmount.toFixed(2)}</span>
            </div>
          )}
          {invoice.taxAmount > 0 && (
            <div className="flex justify-between w-72 text-slate-600">
              <span>Tax ({invoice.taxPercentage}%):</span>
              <span className="font-mono">+${invoice.taxAmount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between w-72 pt-3 border-t-2 border-[#001435] text-xl font-extrabold text-[#001435]">
            <span>Total:</span>
            <span className="text-[#003087] font-mono">${invoice.totalAmount.toFixed(2)}</span>
          </div>
        </div>

        {/* Notes */}
        {invoice.notes && (
          <div className="mt-8 p-5 rounded-2xl bg-[#f7f9fa] border border-slate-200 text-xs text-slate-600">
            <span className="font-bold text-[#001435] block mb-1">Payment Instructions & Notes:</span>
            {invoice.notes}
          </div>
        )}

        {/* PAYPAL CHECKOUT SECTION */}
        <div className="mt-10 pt-8 border-t border-slate-200">
          {invoice.status === 'PAID' ? (
            <div className="p-8 rounded-3xl bg-emerald-50 border border-emerald-200 text-center">
              <div className="inline-flex p-3 rounded-full bg-emerald-100 text-emerald-700 mb-3">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black text-emerald-900">
                Payment Completed Successfully!
              </h3>
              <p className="text-xs text-emerald-800 mt-1">
                PayPal Transaction Reference:{' '}
                <span className="font-mono font-bold bg-white px-2.5 py-1 rounded border border-emerald-300">
                  {invoice.paymentId || 'PAYPAL-CAPTURED'}
                </span>
              </p>
              <p className="text-xs text-slate-500 mt-2">
                Settled on {invoice.paidAt || new Date().toLocaleString()}
              </p>
            </div>
          ) : (
            <div>
              <div className="text-center mb-6">
                <h3 className="text-lg font-extrabold text-[#001435]">
                  Instant PayPal Checkout
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Pay securely with PayPal balance, bank account, or card.
                </p>
              </div>

              <div className="max-w-md mx-auto relative z-10">
                <PayPalButtons
                  style={{ layout: 'vertical', shape: 'pill', label: 'pay', height: 48 }}
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
                      if (onPaymentError) onPaymentError(err.message);
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
                      if (onPaymentError) onPaymentError(err.message);
                    }
                  }}
                  onError={(err) => {
                    // When user clicks cancel in the popup, ignore the cancel event quietly
                    console.log('PayPal Checkout window closed or cancelled:', err);
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* AI Client Notification Draft Card */}
      {invoice.emailDraft && (
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-[#003087]">
                <Send className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-[#001435] text-base">
                  Client Email Notice
                </h3>
                <p className="text-xs text-slate-500">Auto-drafted notice ready to send to {invoice.clientName}</p>
              </div>
            </div>

            {/* Email Tone Selector */}
            <div className="flex items-center gap-1.5 bg-[#f7f9fa] p-1 rounded-full border border-slate-200 text-xs">
              {(['friendly', 'formal', 'urgent'] as const).map((tone) => (
                <button
                  key={tone}
                  onClick={() => setEmailTone(tone)}
                  className={`px-3.5 py-1.5 rounded-full capitalize font-semibold transition cursor-pointer ${
                    emailTone === tone
                      ? 'bg-[#003087] text-white shadow-sm'
                      : 'text-slate-600 hover:text-[#001435]'
                  }`}
                >
                  {tone}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-[#f7f9fa] p-6 rounded-2xl border border-slate-200 text-xs text-slate-700 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <p className="text-slate-500">
                <strong className="text-[#001435]">Subject:</strong> {invoice.emailDraft.subject}
              </p>
              <button
                onClick={handleCopyEmail}
                className="pp-btn-pill-primary !py-1.5 !px-3.5 !text-xs !min-w-0 flex items-center gap-1.5 cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy Email'}</span>
              </button>
            </div>
            <div className="whitespace-pre-line leading-relaxed text-slate-700">
              {getDynamicEmailBody()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
