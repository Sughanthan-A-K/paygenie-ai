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
  Building2,
  UserCheck
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { toast } from 'sonner';

interface InvoiceViewProps {
  invoice: InvoiceData;
  onPaymentSuccess: (paymentId: string) => void;
}

export default function InvoiceView({ invoice, onPaymentSuccess }: InvoiceViewProps) {
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const invoicePrintRef = useRef<HTMLDivElement>(null);

  const handleCopyEmail = () => {
    if (invoice.emailDraft) {
      navigator.clipboard.writeText(`Subject: ${invoice.emailDraft.subject}\n\n${invoice.emailDraft.body}`);
      setCopied(true);
      toast.success('Email copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadPDF = async () => {
    if (!invoicePrintRef.current) return;
    setIsDownloading(true);
    toast.info('Generating high-resolution PDF...');
    try {
      const canvas = await html2canvas(invoicePrintRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${invoice.invoiceNumber}.pdf`);
      toast.success('PDF downloaded successfully!');
    } catch (e) {
      console.error('PDF export failed:', e);
      toast.error('Failed to export PDF');
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
    <div className="space-y-8">
      {/* Printable Invoice Card in Pure PayPal White */}
      <div
        ref={invoicePrintRef}
        className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-sm relative overflow-hidden text-[#001435]"
      >
        {/* Subtle Navy Top Accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#003087]" />

        {/* Invoice Title & Status Bar */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold px-3 py-1 rounded-full bg-slate-100 text-[#003087] border border-slate-200">
                {invoice.invoiceNumber}
              </span>
              {invoice.status === 'PAID' ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5" /> PAID VIA PAYPAL
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                  <AlertCircle className="w-3.5 h-3.5" /> PAYMENT PENDING
                </span>
              )}
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#001435] mt-3 tracking-tight">
              Invoice for <em className="italic text-[#003087]">{invoice.clientName}</em>
            </h3>
          </div>

          <div className="sm:text-right bg-[#f5f7fa] p-4 sm:p-5 rounded-2xl min-w-[180px]">
            <span className="text-xs uppercase tracking-wider text-slate-500 font-bold block">
              Total Balance
            </span>
            <div className="text-3xl font-black text-[#003087] mt-1 tracking-tight">
              ${invoice.totalAmount.toFixed(2)}
              <span className="text-xs font-normal text-slate-500 ml-1">
                {invoice.currency || 'USD'}
              </span>
            </div>
          </div>
        </div>

        {/* Counterparty Information */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6 text-xs">
          <div className="p-4 rounded-2xl bg-[#f5f7fa] border border-slate-200/80">
            <span className="text-[11px] uppercase tracking-wider font-bold text-slate-500 block mb-1">
              Billed From (Merchant)
            </span>
            <p className="font-bold text-[#001435] text-sm">{invoice.sellerName}</p>
            <p className="text-slate-500 mt-0.5">{invoice.sellerEmail || 'billing@merchant.com'}</p>
          </div>
          <div className="p-4 rounded-2xl bg-[#f5f7fa] border border-slate-200/80">
            <span className="text-[11px] uppercase tracking-wider font-bold text-slate-500 block mb-1">
              Billed To (Customer)
            </span>
            <p className="font-bold text-[#001435] text-sm">{invoice.clientName}</p>
            <p className="text-slate-500 mt-0.5">{invoice.clientEmail}</p>
          </div>
        </div>

        {/* Timeline & Actions */}
        <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-slate-600 mb-6 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-[#0070ba]" />
              <span>Issue Date: <strong className="text-[#001435]">{invoice.date}</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-[#0070ba]" />
              <span>Due: <strong className="text-[#001435]">{invoice.dueDate}</strong></span>
            </div>
          </div>

          <button
            onClick={handleDownloadPDF}
            disabled={isDownloading}
            className="cursor-pointer pp-button-secondary text-xs"
          >
            <Download className="w-4 h-4" />
            <span>{isDownloading ? 'Exporting PDF...' : 'Download PDF Invoice'}</span>
          </button>
        </div>

        {/* Itemized Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b-2 border-slate-200 text-slate-500 uppercase tracking-wider text-[11px]">
                <th className="py-3 px-1 font-bold">Item Description</th>
                <th className="py-3 px-2 text-center font-bold">Qty</th>
                <th className="py-3 px-2 text-right font-bold">Unit Price</th>
                <th className="py-3 px-2 text-right font-bold">Line Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {invoice.items.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50/70 transition">
                  <td className="py-4 px-1 font-semibold text-[#001435]">{item.description}</td>
                  <td className="py-4 px-2 text-center text-slate-600">{item.quantity}</td>
                  <td className="py-4 px-2 text-right">${item.unitPrice.toFixed(2)}</td>
                  <td className="py-4 px-2 text-right font-bold text-[#001435]">${item.total.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Financial Calculation Summary */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col items-end text-xs space-y-2">
          <div className="flex justify-between w-64 text-slate-600">
            <span>Subtotal:</span>
            <span className="font-semibold text-[#001435]">${invoice.subtotal.toFixed(2)}</span>
          </div>
          {invoice.discountAmount > 0 && (
            <div className="flex justify-between w-64 text-emerald-600">
              <span>Discount ({invoice.discountPercentage}%):</span>
              <span className="font-semibold">-${invoice.discountAmount.toFixed(2)}</span>
            </div>
          )}
          {invoice.taxAmount > 0 && (
            <div className="flex justify-between w-64 text-slate-600">
              <span>Tax ({invoice.taxPercentage}%):</span>
              <span className="font-semibold">+${invoice.taxAmount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between w-64 pt-2 border-t-2 border-slate-200 text-base font-black text-[#001435]">
            <span>Total Due:</span>
            <span className="text-[#003087]">${invoice.totalAmount.toFixed(2)}</span>
          </div>
        </div>

        {/* Notes */}
        {invoice.notes && (
          <div className="mt-6 p-4 rounded-2xl bg-[#f5f7fa] border border-slate-200/80 text-xs text-slate-600">
            <span className="font-bold text-[#001435] block mb-0.5">Payment Terms & Notes:</span>
            {invoice.notes}
          </div>
        )}
      </div>

      {/* STEP 3: PAYPAL CHECKOUT CARD */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
          <div className="w-8 h-8 rounded-full bg-[#003087] text-white flex items-center justify-center font-black text-xs">
            03
          </div>
          <div>
            <h3 className="text-base font-bold text-[#001435]">Instant Checkout via PayPal</h3>
            <p className="text-xs text-slate-500">Official PayPal Sandbox settlement engine</p>
          </div>
        </div>

        {invoice.status === 'PAID' ? (
          <div className="p-8 rounded-2xl bg-emerald-50 border border-emerald-200 text-center animate-fade-in">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
            <h4 className="text-lg font-bold text-emerald-900">Invoice Settle Complete!</h4>
            <p className="text-xs text-emerald-700 mt-1">
              Payment was captured in real-time via PayPal Sandbox Orders v2 API.
            </p>
            <div className="inline-block mt-3 bg-white px-4 py-2 rounded-full border border-emerald-300 font-mono text-xs text-emerald-800 font-bold shadow-xs">
              Transaction ID: {invoice.paymentId || 'PAYPAL-CAPTURED'}
            </div>
            <p className="text-xs text-slate-500 mt-2">{invoice.paidAt}</p>
          </div>
        ) : (
          <div className="max-w-md mx-auto text-center">
            <div className="relative z-10 overflow-hidden rounded-full p-0.5">
              <PayPalButtons
                style={{ layout: 'vertical', shape: 'pill', label: 'paypal', height: 48, color: 'gold' }}
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
                    toast.error(err.message || 'PayPal Checkout encountered an issue.');
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
                    toast.success('Payment captured successfully via PayPal!');
                    onPaymentSuccess(captureData.captureId || data.orderID);
                  } catch (err: any) {
                    toast.error(err.message || 'Failed to capture payment');
                  }
                }}
                onError={(err) => {
                  console.error('PayPal Checkout error:', err);
                  toast.error('PayPal Checkout encountered an issue or was closed.');
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* STEP 4: AI CLIENT NOTIFICATION EMAIL */}
      {invoice.emailDraft && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#0070ba]/10 text-[#0070ba] flex items-center justify-center font-black text-xs">
                04
              </div>
              <div>
                <h3 className="text-base font-bold text-[#001435]">AI Client Dispatch Email</h3>
                <p className="text-xs text-slate-500">Auto-drafted by Gemini with payment instructions</p>
              </div>
            </div>

            <button
              onClick={handleCopyEmail}
              className="cursor-pointer pp-button-secondary text-xs"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied' : 'Copy Email'}</span>
            </button>
          </div>

          <div className="bg-[#f5f7fa] p-5 rounded-2xl border border-slate-200/80 text-xs text-slate-700 space-y-2">
            <p className="border-b border-slate-200 pb-2 font-medium">
              <span className="text-slate-500 font-bold">Subject:</span> {invoice.emailDraft.subject}
            </p>
            <div className="whitespace-pre-line leading-relaxed font-sans text-slate-600">
              {invoice.emailDraft.body}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
