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
  Smile,
  AlertTriangle,
  Briefcase
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
  const [emailTone, setEmailTone] = useState<'friendly' | 'formal' | 'urgent'>('friendly');
  const invoicePrintRef = useRef<HTMLDivElement>(null);

  const getCustomEmailBody = () => {
    const invNumber = invoice.invoiceNumber;
    const client = invoice.clientName;
    const seller = invoice.sellerName;
    const amount = `$${invoice.totalAmount.toFixed(2)} ${invoice.currency}`;
    const due = invoice.dueDate;

    if (emailTone === 'urgent') {
      return {
        subject: `[ACTION REQUIRED] Urgent Payment Notice: ${invNumber} (${amount})`,
        body: `Hi ${client},\n\nThis is an urgent reminder that your invoice ${invNumber} for ${amount} from ${seller} is due by ${due}.\n\nPlease settle this promptly using the one-click PayPal checkout button to avoid late billing delays.\n\nThank you,\n${seller} Accounting Team`
      };
    } else if (emailTone === 'formal') {
      return {
        subject: `Official Invoice Submission: ${invNumber} - ${seller}`,
        body: `Dear ${client},\n\nPlease review attached invoice ${invNumber} for services rendered totaling ${amount}.\n\nTerms of payment require settlement on or before ${due} via our official PayPal Merchant gateway.\n\nSincerely,\n${seller}`
      };
    }

    // Default friendly
    return invoice.emailDraft || {
      subject: `Invoice ${invNumber} from ${seller}`,
      body: `Hi ${client}!\n\nThanks for working with us! Here is invoice ${invNumber} for ${amount}, due on ${due}.\n\nYou can click the instant PayPal button to complete payment seamlessly.\n\nBest regards,\n${seller}`
    };
  };

  const currentEmail = getCustomEmailBody();

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(`Subject: ${currentEmail.subject}\n\n${currentEmail.body}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPDF = async () => {
    if (!invoicePrintRef.current) return;
    setIsDownloading(true);
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
      {/* Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Invoice Reference:
          </span>
          <span className="font-mono font-bold text-sm bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full border border-blue-200 dark:border-blue-800">
            {invoice.invoiceNumber}
          </span>
        </div>

        <button
          onClick={handleDownloadPDF}
          disabled={isDownloading}
          className="cursor-pointer inline-flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 shadow-sm transition"
        >
          <Download className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          {isDownloading ? 'Exporting PDF...' : 'Download PDF Invoice'}
        </button>
      </div>

      {/* Main Official PayPal-Styled Invoice Plate */}
      <div
        ref={invoicePrintRef}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-xl relative overflow-hidden transition-all text-slate-900 dark:text-slate-100"
      >
        {/* Top Gradient Stripe */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#003087] via-[#0070ba] to-[#ffc439]" />

        {/* Invoice Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 pb-8 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#003087] flex items-center justify-center text-white font-extrabold text-base">
                P
              </div>
              <span className="font-bold text-xl tracking-tight text-[#001435] dark:text-white">
                PayPal <span className="font-light text-slate-500">Merchant Invoice</span>
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-3 text-slate-900 dark:text-white">
              Invoice for <em className="italic font-serif text-[#003087] dark:text-blue-400">{invoice.clientName}</em>
            </h2>
            <div className="flex items-center gap-2 mt-2">
              {invoice.status === 'PAID' ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-300 dark:border-emerald-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> PAID VIA PAYPAL
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-3 py-1 rounded-full border border-amber-300 dark:border-amber-800">
                  <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" /> PENDING SETTLEMENT
                </span>
              )}
              <span className="text-xs text-slate-400 dark:text-slate-500">• Powered by PayPal Checkout</span>
            </div>
          </div>

          <div className="sm:text-right bg-slate-50 dark:bg-slate-800/60 p-4 sm:p-5 rounded-2xl border border-slate-200/70 dark:border-slate-700/60 min-w-[200px]">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Total Balance Due
            </span>
            <div className="text-3xl sm:text-4xl font-extrabold text-[#003087] dark:text-blue-400 tracking-tight mt-1">
              ${invoice.totalAmount.toFixed(2)}
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 ml-1.5">
                {invoice.currency || 'USD'}
              </span>
            </div>
          </div>
        </div>

        {/* Bill Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 my-8 text-sm">
          <div className="bg-slate-50 dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-200/60 dark:border-slate-700/50">
            <div className="flex items-center gap-2 text-xs uppercase font-bold text-slate-500 dark:text-slate-400 mb-2">
              <Building2 className="w-4 h-4 text-[#003087] dark:text-blue-400" />
              <span>Billed From (Seller)</span>
            </div>
            <p className="font-bold text-slate-900 dark:text-white text-base">{invoice.sellerName}</p>
            <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">{invoice.sellerEmail || 'billing@merchant.com'}</p>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-200/60 dark:border-slate-700/50">
            <div className="flex items-center gap-2 text-xs uppercase font-bold text-slate-500 dark:text-slate-400 mb-2">
              <UserCheck className="w-4 h-4 text-[#0070ba] dark:text-cyan-400" />
              <span>Billed To (Client)</span>
            </div>
            <p className="font-bold text-slate-900 dark:text-white text-base">{invoice.clientName}</p>
            <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">{invoice.clientEmail}</p>
          </div>
        </div>

        {/* Timeline Info */}
        <div className="flex flex-wrap gap-6 text-xs text-slate-500 dark:text-slate-400 mb-8 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#0070ba]" />
            <span>Issue Date: <strong className="text-slate-900 dark:text-slate-200">{invoice.date}</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#0070ba]" />
            <span>Payment Due Date: <strong className="text-slate-900 dark:text-slate-200">{invoice.dueDate}</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Buyer & Seller Protection: <strong className="text-slate-900 dark:text-slate-200">Active</strong></span>
          </div>
        </div>

        {/* Itemized Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b-2 border-slate-200 dark:border-slate-700 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <th className="py-3 px-3 font-bold">Item Description</th>
                <th className="py-3 px-3 text-center font-bold">Qty</th>
                <th className="py-3 px-3 text-right font-bold">Unit Price</th>
                <th className="py-3 px-3 text-right font-bold">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {invoice.items.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                  <td className="py-4 px-3 font-semibold text-slate-900 dark:text-white">{item.description}</td>
                  <td className="py-4 px-3 text-center text-slate-600 dark:text-slate-400">{item.quantity}</td>
                  <td className="py-4 px-3 text-right">${item.unitPrice.toFixed(2)}</td>
                  <td className="py-4 px-3 text-right font-bold text-slate-900 dark:text-slate-100">${item.total.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Calculations / Summary */}
        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col items-end text-sm space-y-2.5">
          <div className="flex justify-between w-72 text-slate-600 dark:text-slate-400">
            <span>Subtotal:</span>
            <span className="font-semibold text-slate-900 dark:text-slate-200">${invoice.subtotal.toFixed(2)}</span>
          </div>
          {invoice.discountAmount > 0 && (
            <div className="flex justify-between w-72 text-emerald-600 dark:text-emerald-400">
              <span>Applied Discount ({invoice.discountPercentage}%):</span>
              <span className="font-semibold">-${invoice.discountAmount.toFixed(2)}</span>
            </div>
          )}
          {invoice.taxAmount > 0 && (
            <div className="flex justify-between w-72 text-slate-600 dark:text-slate-400">
              <span>Taxes ({invoice.taxPercentage}%):</span>
              <span className="font-semibold">+${invoice.taxAmount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between w-72 pt-3 border-t-2 border-slate-200 dark:border-slate-700 text-lg font-black text-slate-900 dark:text-white">
            <span>Total Amount:</span>
            <span className="text-[#003087] dark:text-blue-400">${invoice.totalAmount.toFixed(2)}</span>
          </div>
        </div>

        {/* Notes & Terms */}
        {invoice.notes && (
          <div className="mt-8 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/50 text-xs text-slate-600 dark:text-slate-400">
            <span className="font-bold text-slate-800 dark:text-slate-200 block mb-1">
              Payment Terms & Instructions:
            </span>
            {invoice.notes}
          </div>
        )}

        {/* PAYPAL CHECKOUT SECTION */}
        <div className="mt-10 pt-8 border-t border-slate-100 dark:border-slate-800">
          {invoice.status === 'PAID' ? (
            <div className="p-8 rounded-3xl bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-500/40 text-center animate-fade-in">
              <CheckCircle2 className="w-14 h-14 text-emerald-600 dark:text-emerald-400 mx-auto mb-3" />
              <h3 className="text-xl font-black text-emerald-900 dark:text-emerald-200">
                Payment Settled Successfully!
              </h3>
              <p className="text-sm text-emerald-700 dark:text-emerald-300 mt-1">
                Your transaction has been securely captured by PayPal Sandbox.
              </p>
              <div className="inline-block mt-3 bg-white dark:bg-emerald-900/60 px-4 py-2 rounded-xl border border-emerald-300 dark:border-emerald-800 font-mono text-xs text-emerald-800 dark:text-emerald-200">
                Transaction ID: <strong>{invoice.paymentId || 'PAYPAL-CAPTURED'}</strong>
              </div>
              <p className="text-xs text-slate-400 mt-2">
                Settled on {invoice.paidAt || new Date().toLocaleString()}
              </p>
            </div>
          ) : (
            <div className="max-w-md mx-auto text-center">
              <div className="mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Instant One-Click Settlement
                </span>
                <p className="text-xs text-slate-400 mt-1">
                  Click below to authorize and complete checkout via PayPal Sandbox.
                </p>
              </div>

              {paymentError && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-500 text-xs text-center">
                  {paymentError}
                </div>
              )}

              <div className="relative z-10 cursor-pointer">
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

      {/* AI Client Email Draft Card with Tone Presets */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <Send className="w-5 h-5 text-[#0070ba]" />
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
              AI Client Notification Email
            </h3>
          </div>

          {/* Tone Selector Presets */}
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-full border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setEmailTone('friendly')}
              className={`cursor-pointer px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 transition ${
                emailTone === 'friendly' 
                  ? 'bg-white dark:bg-slate-700 text-[#003087] dark:text-blue-300 shadow-sm' 
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <Smile className="w-3.5 h-3.5" /> Friendly
            </button>
            <button
              onClick={() => setEmailTone('formal')}
              className={`cursor-pointer px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 transition ${
                emailTone === 'formal' 
                  ? 'bg-white dark:bg-slate-700 text-[#003087] dark:text-blue-300 shadow-sm' 
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" /> Formal
            </button>
            <button
              onClick={() => setEmailTone('urgent')}
              className={`cursor-pointer px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 transition ${
                emailTone === 'urgent' 
                  ? 'bg-white dark:bg-slate-700 text-red-600 dark:text-red-400 shadow-sm' 
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" /> Urgent Reminder
            </button>
          </div>

          <button
            onClick={handleCopyEmail}
            className="cursor-pointer inline-flex items-center gap-1.5 text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 px-4 py-2 rounded-full border border-slate-200 dark:border-slate-700 transition"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied to Clipboard!' : 'Copy Email'}
          </button>
        </div>

        <div className="bg-slate-50 dark:bg-slate-950 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-xs sm:text-sm text-slate-700 dark:text-slate-300 space-y-3">
          <p className="border-b border-slate-200 dark:border-slate-800 pb-2">
            <strong className="text-slate-900 dark:text-slate-100">Subject:</strong> {currentEmail.subject}
          </p>
          <div className="whitespace-pre-line leading-relaxed font-sans">
            {currentEmail.body}
          </div>
        </div>
      </div>
    </div>
  );
}
