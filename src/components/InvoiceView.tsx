'use client';

import React, { useRef, useState } from 'react';
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
  Calendar, 
  ShieldCheck, 
  Building2, 
  UserCheck, 
  Sparkles,
  FileText
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface InvoiceViewProps {
  invoice: InvoiceData;
  onPaymentSuccess: (paymentId: string) => void;
}

export default function InvoiceView({ invoice, onPaymentSuccess }: InvoiceViewProps) {
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const invoicePrintRef = useRef<HTMLDivElement>(null);

  const handleCopyEmail = () => {
    if (invoice.emailDraft) {
      navigator.clipboard.writeText(`Subject: ${invoice.emailDraft.subject}\n\n${invoice.emailDraft.body}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadPDF = async () => {
    if (!invoicePrintRef.current) return;
    setIsDownloading(true);
    try {
      const canvas = await html2canvas(invoicePrintRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#101726',
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${invoice.invoiceNumber}.pdf`);
    } catch (e) {
      console.error('PDF export failed:', e);
    } finally {
      setIsDownloading(false);
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
      {/* Precision Invoice Card */}
      <div
        ref={invoicePrintRef}
        className="bg-[#101726] border border-[#1f2a40] rounded-2xl p-6 md:p-8 shadow-2xl relative overflow-hidden"
      >
        {/* Subtle Top Accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#0070ba] to-[#38bdf8]" />

        {/* Header Strip */}
        <div className="flex flex-wrap items-start justify-between gap-4 pb-6 border-b border-[#1f2a40]">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-semibold px-2.5 py-1 rounded-md bg-[#0070ba]/10 text-[#38bdf8] border border-[#0070ba]/30">
                {invoice.invoiceNumber}
              </span>
              {invoice.status === 'PAID' ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  <CheckCircle2 className="w-3.5 h-3.5" /> PAID VIA PAYPAL
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  <AlertCircle className="w-3.5 h-3.5" /> PENDING SETTLEMENT
                </span>
              )}
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-white mt-2">
              {invoice.clientName}
            </h2>
          </div>

          <div className="text-right">
            <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block">
              Amount Due
            </span>
            <div className="text-2xl md:text-3xl font-mono font-bold text-white mt-0.5">
              ${invoice.totalAmount.toFixed(2)}{' '}
              <span className="text-xs font-sans text-slate-400 font-normal">
                {invoice.currency || 'USD'}
              </span>
            </div>
          </div>
        </div>

        {/* Counterparty metadata */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6 text-xs">
          <div className="p-3.5 rounded-xl bg-[#090d16]/70 border border-[#1f2a40]">
            <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">From</span>
            <p className="font-semibold text-slate-200">{invoice.sellerName}</p>
            <p className="text-slate-400">{invoice.sellerEmail || 'billing@merchant.com'}</p>
          </div>
          <div className="p-3.5 rounded-xl bg-[#090d16]/70 border border-[#1f2a40]">
            <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">To</span>
            <p className="font-semibold text-slate-200">{invoice.clientName}</p>
            <p className="text-slate-400">{invoice.clientEmail}</p>
          </div>
        </div>

        {/* Dates */}
        <div className="flex flex-wrap items-center gap-6 text-xs text-slate-400 mb-6 pb-6 border-b border-[#1f2a40]">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-[#38bdf8]" />
            <span>Issued: <strong className="text-slate-200">{invoice.date}</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-[#38bdf8]" />
            <span>Due: <strong className="text-slate-200">{invoice.dueDate}</strong></span>
          </div>
          <button
            onClick={handleDownloadPDF}
            disabled={isDownloading}
            className="ml-auto cursor-pointer inline-flex items-center gap-1.5 text-xs text-slate-300 hover:text-white bg-[#151e32] hover:bg-[#1f2a40] px-3 py-1.5 rounded-lg border border-[#1f2a40] transition"
          >
            <Download className="w-3.5 h-3.5 text-[#38bdf8]" />
            {isDownloading ? 'Exporting...' : 'PDF Invoice'}
          </button>
        </div>

        {/* Items Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#1f2a40] text-slate-400 uppercase tracking-wider text-[10px]">
                <th className="py-2.5">Description</th>
                <th className="py-2.5 text-center">Qty</th>
                <th className="py-2.5 text-right">Price</th>
                <th className="py-2.5 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1f2a40]/60 text-slate-300">
              {invoice.items.map((item, idx) => (
                <tr key={idx}>
                  <td className="py-3 font-medium text-slate-100">{item.description}</td>
                  <td className="py-3 text-center text-slate-400">{item.quantity}</td>
                  <td className="py-3 text-right font-mono">${item.unitPrice.toFixed(2)}</td>
                  <td className="py-3 text-right font-mono font-semibold text-slate-100">${item.total.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Calculation Summary */}
        <div className="mt-6 pt-4 border-t border-[#1f2a40] flex flex-col items-end text-xs space-y-1.5">
          <div className="flex justify-between w-60 text-slate-400">
            <span>Subtotal:</span>
            <span className="font-mono text-slate-200">${invoice.subtotal.toFixed(2)}</span>
          </div>
          {invoice.discountAmount > 0 && (
            <div className="flex justify-between w-60 text-emerald-400">
              <span>Discount ({invoice.discountPercentage}%):</span>
              <span className="font-mono">-${invoice.discountAmount.toFixed(2)}</span>
            </div>
          )}
          {invoice.taxAmount > 0 && (
            <div className="flex justify-between w-60 text-slate-400">
              <span>Tax ({invoice.taxPercentage}%):</span>
              <span className="font-mono">+${invoice.taxAmount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between w-60 pt-2 border-t border-[#1f2a40] text-sm font-bold text-white">
            <span>Total:</span>
            <span className="font-mono text-[#38bdf8]">${invoice.totalAmount.toFixed(2)}</span>
          </div>
        </div>

        {/* Notes */}
        {invoice.notes && (
          <div className="mt-6 p-3 rounded-lg bg-[#090d16]/70 border border-[#1f2a40] text-[11px] text-slate-400">
            <span className="font-semibold text-slate-300 block mb-0.5">Terms:</span>
            {invoice.notes}
          </div>
        )}

        {/* PAYPAL CHECKOUT SECTION */}
        <div className="mt-8 pt-6 border-t border-[#1f2a40]">
          {invoice.status === 'PAID' ? (
            <div className="p-6 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-center">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
              <h3 className="text-base font-bold text-emerald-300">Payment Completed</h3>
              <p className="text-xs text-slate-400 mt-1">
                Captured via PayPal Sandbox • ID:{' '}
                <span className="font-mono text-emerald-300">{invoice.paymentId || 'CAPTURED'}</span>
              </p>
              <p className="text-[11px] text-slate-500 mt-1">{invoice.paidAt}</p>
            </div>
          ) : (
            <div>
              <div className="text-center mb-4">
                <p className="text-xs font-semibold text-slate-300">
                  Instant Checkout via PayPal
                </p>
                <p className="text-[11px] text-slate-500">
                  Test transaction powered by PayPal Orders v2 Sandbox
                </p>
              </div>

              {paymentError && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-xs text-center">
                  {paymentError}
                </div>
              )}

              <div className="max-w-sm mx-auto relative z-10">
                <PayPalButtons
                  style={{ layout: 'vertical', shape: 'pill', label: 'paypal', height: 48, color: 'gold' }}
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

      {/* AI Client Email Draft */}
      {invoice.emailDraft && (
        <div className="bg-[#101726] border border-[#1f2a40] rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Send className="w-4 h-4 text-[#38bdf8]" />
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-300">
                AI Client Email Draft
              </h3>
            </div>
            <button
              onClick={handleCopyEmail}
              className="cursor-pointer inline-flex items-center gap-1.5 text-xs bg-[#151e32] hover:bg-[#1f2a40] text-slate-200 px-3 py-1.5 rounded-lg border border-[#1f2a40] transition"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>

          <div className="bg-[#090d16] p-4 rounded-xl border border-[#1f2a40] text-xs text-slate-300 space-y-2">
            <p className="border-b border-[#1f2a40] pb-2 font-medium">
              <span className="text-slate-500">Subject:</span> {invoice.emailDraft.subject}
            </p>
            <div className="whitespace-pre-line leading-relaxed text-slate-400 font-sans">
              {invoice.emailDraft.body}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
