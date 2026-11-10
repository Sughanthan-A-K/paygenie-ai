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
  Receipt,
  Sparkles,
  ArrowRight
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
        backgroundColor: '#0e131f',
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
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 },
    });
  };

  return (
    <div className="space-y-6">
      {/* Impeccable High-Craft Invoice Panel */}
      <div
        ref={invoicePrintRef}
        className="glass-panel rounded-3xl p-6 sm:p-9 relative overflow-hidden"
      >
        {/* Subtle Top Specular Line */}
        <div className="absolute top-0 left-8 right-8 h-[1px] bg-gradient-to-r from-transparent via-[#38bdf8]/40 to-transparent" />

        {/* Invoice Title & Meta Bar */}
        <div className="flex flex-wrap items-start justify-between gap-4 pb-6 border-b border-white/[0.08]">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="font-mono text-xs font-bold px-3 py-1 rounded-full bg-[#0070ba]/20 text-[#38bdf8] border border-[#0070ba]/40">
                {invoice.invoiceNumber}
              </span>
              {invoice.status === 'PAID' ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Settled via PayPal
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-400" /> Payment Awaiting
                </span>
              )}
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white mt-3 tracking-tight">
              {invoice.clientName}
            </h3>
          </div>

          <div className="text-right">
            <span className="text-xs uppercase tracking-wider text-slate-400 font-bold block">
              Total Amount
            </span>
            <div className="text-3xl font-mono font-extrabold text-white mt-0.5 tracking-tight">
              ${invoice.totalAmount.toFixed(2)}{' '}
              <span className="text-xs font-sans text-slate-400 font-semibold">
                {invoice.currency || 'USD'}
              </span>
            </div>
          </div>
        </div>

        {/* Counterparty Metadata Plate */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6 text-xs">
          <div className="p-4 rounded-2xl bg-black/30 border border-white/[0.06]">
            <span className="text-[11px] uppercase tracking-wider font-bold text-slate-400 block mb-1">
              Billed From
            </span>
            <p className="font-bold text-white text-sm">{invoice.sellerName}</p>
            <p className="text-slate-300 mt-0.5">{invoice.sellerEmail || 'billing@merchant.com'}</p>
          </div>
          <div className="p-4 rounded-2xl bg-black/30 border border-white/[0.06]">
            <span className="text-[11px] uppercase tracking-wider font-bold text-slate-400 block mb-1">
              Billed To
            </span>
            <p className="font-bold text-white text-sm">{invoice.clientName}</p>
            <p className="text-slate-300 mt-0.5">{invoice.clientEmail}</p>
          </div>
        </div>

        {/* Date Row + PDF Download */}
        <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-slate-300 mb-6 pb-6 border-b border-white/[0.08]">
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-[#38bdf8]" />
              <span>Issue Date: <strong className="text-white">{invoice.date}</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-[#38bdf8]" />
              <span>Due: <strong className="text-white">{invoice.dueDate}</strong></span>
            </div>
          </div>

          <button
            onClick={handleDownloadPDF}
            disabled={isDownloading}
            className="cursor-pointer inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-white/10 hover:bg-white/15 px-4 py-2 rounded-xl border border-white/10 shadow-sm transition"
          >
            <Download className="w-3.5 h-3.5 text-[#38bdf8]" />
            {isDownloading ? 'Exporting PDF...' : 'Download PDF'}
          </button>
        </div>

        {/* Itemized Breakdown Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/[0.08] text-slate-400 uppercase tracking-wider text-[11px]">
                <th className="py-3 px-1 font-bold">Line Item Description</th>
                <th className="py-3 px-2 text-center font-bold">Qty</th>
                <th className="py-3 px-2 text-right font-bold">Unit Rate</th>
                <th className="py-3 px-2 text-right font-bold">Line Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04] text-slate-200">
              {invoice.items.map((item, idx) => (
                <tr key={idx} className="hover:bg-white/[0.02] transition">
                  <td className="py-3.5 px-1 font-semibold text-white">{item.description}</td>
                  <td className="py-3.5 px-2 text-center text-slate-300">{item.quantity}</td>
                  <td className="py-3.5 px-2 text-right font-mono">${item.unitPrice.toFixed(2)}</td>
                  <td className="py-3.5 px-2 text-right font-mono font-bold text-white">${item.total.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Financial Calculation Summary */}
        <div className="mt-6 pt-5 border-t border-white/[0.08] flex flex-col items-end text-xs space-y-2">
          <div className="flex justify-between w-64 text-slate-300">
            <span>Subtotal:</span>
            <span className="font-mono font-semibold text-white">${invoice.subtotal.toFixed(2)}</span>
          </div>
          {invoice.discountAmount > 0 && (
            <div className="flex justify-between w-64 text-emerald-400">
              <span>Discount ({invoice.discountPercentage}%):</span>
              <span className="font-mono font-semibold">-${invoice.discountAmount.toFixed(2)}</span>
            </div>
          )}
          {invoice.taxAmount > 0 && (
            <div className="flex justify-between w-64 text-slate-300">
              <span>Tax ({invoice.taxPercentage}%):</span>
              <span className="font-mono font-semibold">+${invoice.taxAmount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between w-64 pt-2.5 border-t border-white/10 text-base font-extrabold text-white">
            <span>Total Amount:</span>
            <span className="font-mono text-[#38bdf8]">${invoice.totalAmount.toFixed(2)}</span>
          </div>
        </div>

        {/* Terms */}
        {invoice.notes && (
          <div className="mt-6 p-4 rounded-xl bg-black/30 border border-white/[0.06] text-xs text-slate-300">
            <span className="font-bold text-white block mb-0.5">Payment Terms & Notes:</span>
            {invoice.notes}
          </div>
        )}
      </div>

      {/* STEP 3: PAYPAL SETTLEMENT GATEWAY */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/[0.08]">
          <div className="w-8 h-8 rounded-xl bg-[#0070ba]/20 text-[#38bdf8] flex items-center justify-center font-extrabold text-xs border border-[#0070ba]/40">
            03
          </div>
          <div>
            <h3 className="text-base font-black text-white">PayPal Instant Settle Gateway</h3>
            <p className="text-xs text-slate-300">Official PayPal Orders v2 Sandbox integration</p>
          </div>
        </div>

        {invoice.status === 'PAID' ? (
          <div className="p-8 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center animate-fade-in">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
            <h4 className="text-lg font-black text-emerald-300">Invoice Settled via PayPal</h4>
            <p className="text-xs text-slate-200 mt-1">
              Transaction captured live into PayPal Sandbox merchant balance.
            </p>
            <div className="inline-block mt-3 bg-black/40 px-4 py-2 rounded-xl border border-emerald-500/30 font-mono text-xs text-emerald-300 font-semibold">
              Transaction ID: {invoice.paymentId || 'PAYPAL-CAPTURED'}
            </div>
            <p className="text-xs text-slate-400 mt-2">{invoice.paidAt}</p>
          </div>
        ) : (
          <div className="max-w-md mx-auto text-center">
            {paymentError && (
              <div className="mb-4 p-3 bg-red-500/15 border border-red-500/30 rounded-xl text-red-300 text-xs">
                {paymentError}
              </div>
            )}

            <div className="relative z-10 cursor-pointer">
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

      {/* STEP 4: AI CLIENT NOTIFICATION EMAIL */}
      {invoice.emailDraft && (
        <div className="glass-panel rounded-3xl p-6 sm:p-8">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/[0.08]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-extrabold text-xs border border-indigo-500/40">
                04
              </div>
              <div>
                <h3 className="text-base font-black text-white">AI Client Dispatch Email</h3>
                <p className="text-xs text-slate-300">Drafted by Gemini with payment invoice instructions</p>
              </div>
            </div>

            <button
              onClick={handleCopyEmail}
              className="cursor-pointer inline-flex items-center gap-1.5 text-xs font-semibold bg-white/10 hover:bg-white/15 text-white px-4 py-2 rounded-xl border border-white/10 shadow-sm transition"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied to Clipboard' : 'Copy Email Body'}
            </button>
          </div>

          <div className="bg-black/35 p-5 rounded-2xl border border-white/[0.06] text-xs text-slate-200 space-y-2.5">
            <p className="border-b border-white/[0.08] pb-2 font-medium">
              <span className="text-slate-400 font-bold">Subject:</span> {invoice.emailDraft.subject}
            </p>
            <div className="whitespace-pre-line leading-relaxed text-slate-300 font-sans">
              {invoice.emailDraft.body}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
