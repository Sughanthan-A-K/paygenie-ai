'use client';

import React, { useState } from 'react';
import { PayPalButtons } from '@paypal/react-paypal-js';
import confetti from 'canvas-confetti';
import { InvoiceData } from '@/types/invoice';
import { CheckCircle2, AlertCircle, Copy, Check, Send, Download, DollarSign, Calendar, FileText } from 'lucide-react';

interface InvoiceViewProps {
  invoice: InvoiceData;
  onPaymentSuccess: (paymentId: string) => void;
}

export default function InvoiceView({ invoice, onPaymentSuccess }: InvoiceViewProps) {
  const [copied, setCopied] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const handleCopyEmail = () => {
    if (invoice.emailDraft) {
      navigator.clipboard.writeText(`Subject: ${invoice.emailDraft.subject}\n\n${invoice.emailDraft.body}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
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
      {/* Invoice Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
        {/* Status Badge */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
                {invoice.invoiceNumber}
              </span>
              {invoice.status === 'PAID' ? (
                <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                  <CheckCircle2 className="w-3.5 h-3.5" /> PAID VIA PAYPAL
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-xs font-bold text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                  <AlertCircle className="w-3.5 h-3.5" /> PENDING PAYMENT
                </span>
              )}
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-white mt-2">
              Invoice for {invoice.clientName}
            </h2>
          </div>

          <div className="text-right">
            <span className="text-xs text-slate-400 uppercase tracking-wider">Amount Due</span>
            <div className="text-3xl font-extrabold text-blue-400">
              ${invoice.totalAmount.toFixed(2)} <span className="text-sm font-normal text-slate-400">{invoice.currency}</span>
            </div>
          </div>
        </div>

        {/* Invoice Metadata */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6 text-sm">
          <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
            <p className="text-xs uppercase font-semibold text-slate-400 mb-1">Billed From</p>
            <p className="font-semibold text-white">{invoice.sellerName}</p>
            <p className="text-slate-400">{invoice.sellerEmail || 'billing@paygenie.ai'}</p>
          </div>
          <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
            <p className="text-xs uppercase font-semibold text-slate-400 mb-1">Billed To</p>
            <p className="font-semibold text-white">{invoice.clientName}</p>
            <p className="text-slate-400">{invoice.clientEmail}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 text-xs text-slate-400 mb-6 pb-6 border-b border-slate-800">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-slate-500" />
            <span>Issue Date: <strong className="text-slate-200">{invoice.date}</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-slate-500" />
            <span>Due Date: <strong className="text-slate-200">{invoice.dueDate}</strong></span>
          </div>
        </div>

        {/* Items Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-xs uppercase tracking-wider text-slate-400">
                <th className="py-3 px-2">Description</th>
                <th className="py-3 px-2 text-center">Qty</th>
                <th className="py-3 px-2 text-right">Rate</th>
                <th className="py-3 px-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50 text-slate-300">
              {invoice.items.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-800/30 transition">
                  <td className="py-3.5 px-2 font-medium text-white">{item.description}</td>
                  <td className="py-3.5 px-2 text-center text-slate-400">{item.quantity}</td>
                  <td className="py-3.5 px-2 text-right">${item.unitPrice.toFixed(2)}</td>
                  <td className="py-3.5 px-2 text-right font-semibold text-slate-200">${item.total.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Calculation summary */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex flex-col items-end text-sm space-y-2">
          <div className="flex justify-between w-64 text-slate-400">
            <span>Subtotal:</span>
            <span className="font-semibold text-slate-200">${invoice.subtotal.toFixed(2)}</span>
          </div>
          {invoice.discountAmount > 0 && (
            <div className="flex justify-between w-64 text-emerald-400">
              <span>Discount ({invoice.discountPercentage}%):</span>
              <span>-${invoice.discountAmount.toFixed(2)}</span>
            </div>
          )}
          {invoice.taxAmount > 0 && (
            <div className="flex justify-between w-64 text-slate-400">
              <span>Tax ({invoice.taxPercentage}%):</span>
              <span>+${invoice.taxAmount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between w-64 pt-2 border-t border-slate-700 text-base font-bold text-white">
            <span>Total:</span>
            <span className="text-blue-400">${invoice.totalAmount.toFixed(2)}</span>
          </div>
        </div>

        {/* Notes */}
        {invoice.notes && (
          <div className="mt-6 p-4 rounded-xl bg-slate-800/40 border border-slate-800 text-xs text-slate-400">
            <span className="font-semibold text-slate-300 block mb-1">Notes & Terms:</span>
            {invoice.notes}
          </div>
        )}

        {/* PAYPAL PAYMENT INTEGRATION SECTION */}
        <div className="mt-8 pt-6 border-t border-slate-800">
          {invoice.status === 'PAID' ? (
            <div className="p-6 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-center">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-2" />
              <h3 className="text-lg font-bold text-emerald-200">Payment Completed!</h3>
              <p className="text-xs text-emerald-400/80 mt-1">
                Transaction ID: <span className="font-mono bg-emerald-900/50 px-2 py-0.5 rounded">{invoice.paymentId || 'PAYPAL-CAPTURED'}</span>
              </p>
              <p className="text-xs text-slate-400 mt-2">Paid at {invoice.paidAt || new Date().toLocaleString()}</p>
            </div>
          ) : (
            <div>
              <div className="text-center mb-4">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300 flex items-center justify-center gap-2">
                  <DollarSign className="w-4 h-4 text-blue-400" /> Instant PayPal Checkout
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Pay safely using PayPal Sandbox test account</p>
              </div>

              {paymentError && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs text-center">
                  {paymentError}
                </div>
              )}

              <div className="max-w-md mx-auto relative z-10">
                <PayPalButtons
                  style={{ layout: 'vertical', shape: 'rect', label: 'pay', height: 44 }}
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

      {/* AI Drafted Client Email Card */}
      {invoice.emailDraft && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Send className="w-5 h-5 text-indigo-400" />
              <h3 className="font-bold text-white text-sm md:text-base">
                AI Client Notification & Reminder Draft
              </h3>
            </div>
            <button
              onClick={handleCopyEmail}
              className="flex items-center gap-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg border border-slate-700 transition"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied!' : 'Copy Email'}
            </button>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 font-mono text-xs text-slate-300 space-y-2">
            <p className="text-slate-400 font-sans">
              <strong className="text-slate-300">Subject:</strong> {invoice.emailDraft.subject}
            </p>
            <div className="border-t border-slate-800 pt-2 whitespace-pre-line font-sans text-slate-300 leading-relaxed">
              {invoice.emailDraft.body}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
