'use client';

import React, { useState } from 'react';
import { 
  CheckCircle2, 
  AlertCircle, 
  Calendar, 
  Download, 
  Send, 
  Copy, 
  Check, 
  CreditCard,
  Wifi,
  Battery,
  Sparkles,
  RefreshCw,
  Smartphone
} from 'lucide-react';
import { PayPalButtons } from '@paypal/react-paypal-js';
import { InvoiceData } from '@/types/invoice';
import { toast } from 'sonner';

interface MobileDeviceFrameProps {
  prompt: string;
  setPrompt: (val: string) => void;
  invoice: InvoiceData | null;
  loading: boolean;
  onGenerate: (text?: string) => void;
  onPaymentSuccess: (paymentId: string) => void;
  onDownloadPDF?: () => void;
}

export default function MobileDeviceFrame({
  prompt,
  setPrompt,
  invoice,
  loading,
  onGenerate,
  onPaymentSuccess,
  onDownloadPDF,
}: MobileDeviceFrameProps) {
  const [mobileTab, setMobileTab] = useState<'checkout' | 'chat'>('checkout');
  const [copied, setCopied] = useState(false);

  const handleCopyEmail = () => {
    if (invoice?.emailDraft) {
      navigator.clipboard.writeText(`Subject: ${invoice.emailDraft.subject}\n\n${invoice.emailDraft.body}`);
      setCopied(true);
      toast.success('Mobile: Copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="relative mx-auto w-full max-w-[380px] select-none">
      {/* Dynamic Status Tag above Mobile */}
      <div className="flex items-center justify-between pb-3 px-2 text-xs font-semibold text-slate-500">
        <span className="inline-flex items-center gap-1.5 text-[#003087]">
          <Smartphone className="w-3.5 h-3.5" />
          <span>Real-time Mobile Client</span>
        </span>
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Live Bi-directional Sync
        </span>
      </div>

      {/* Realistic Smartphone Chassis (Titanium Slate finish with subtle drop shadow) */}
      <div className="relative rounded-[48px] bg-[#111827] p-3 shadow-2xl ring-1 ring-slate-800/80">
        {/* Device Outer Edge Highlights */}
        <div className="absolute -left-1 top-24 h-12 w-1 rounded-l bg-slate-700" /> {/* Volume Up */}
        <div className="absolute -left-1 top-40 h-12 w-1 rounded-l bg-slate-700" /> {/* Volume Down */}
        <div className="absolute -right-1 top-32 h-16 w-1 rounded-r bg-slate-700" /> {/* Power Button */}

        {/* Screen Bezel & Dynamic Island Container */}
        <div className="relative overflow-hidden rounded-[38px] bg-white border border-slate-200 h-[680px] flex flex-col text-[#001435]">
          
          {/* iOS / Modern Status Bar */}
          <div className="h-11 bg-white flex items-center justify-between px-6 pt-2 shrink-0 z-20">
            <span className="font-semibold text-xs tracking-tight text-[#001435]">9:41</span>
            
            {/* Dynamic Island Pill */}
            <div className="w-24 h-5 rounded-full bg-black flex items-center justify-end pr-2 gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#10b981]" />
              <span className="w-2.5 h-2.5 rounded-full bg-slate-900 ring-1 ring-slate-800" />
            </div>

            <div className="flex items-center gap-1.5 text-[#001435]">
              <Wifi className="w-3.5 h-3.5" />
              <Battery className="w-4 h-4" />
            </div>
          </div>

          {/* Mobile In-App Top Bar */}
          <div className="px-4 py-2.5 bg-[#f5f7fa] border-b border-slate-200 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-[#003087] text-white flex items-center justify-center font-black text-xs">
                P
              </div>
              <div className="leading-tight">
                <span className="font-extrabold text-xs tracking-tight text-[#001435] block">
                  PayGenie <span className="text-[#0070ba]">Pay</span>
                </span>
                <span className="text-[9px] text-slate-500 font-medium">Customer View</span>
              </div>
            </div>

            {/* Mobile Tab Pills */}
            <div className="flex bg-slate-200/70 p-0.5 rounded-full text-[11px] font-bold">
              <button
                type="button"
                onClick={() => setMobileTab('checkout')}
                className={`px-2.5 py-1 rounded-full transition cursor-pointer ${
                  mobileTab === 'checkout'
                    ? 'bg-white text-[#003087] shadow-xs'
                    : 'text-slate-600'
                }`}
              >
                Bill & Pay
              </button>
              <button
                type="button"
                onClick={() => setMobileTab('chat')}
                className={`px-2.5 py-1 rounded-full transition cursor-pointer ${
                  mobileTab === 'chat'
                    ? 'bg-white text-[#003087] shadow-xs'
                    : 'text-slate-600'
                }`}
              >
                Prompt
              </button>
            </div>
          </div>

          {/* Scrollable Mobile Screen Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
            {mobileTab === 'chat' ? (
              /* Mobile Prompt / Live Typing Synced View */
              <div className="space-y-3">
                <div className="bg-[#f5f7fa] p-3.5 rounded-2xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-[#003087] uppercase tracking-wider">
                      Live AI Prompt (Synced)
                    </span>
                    <Sparkles className="w-3.5 h-3.5 text-[#0070ba]" />
                  </div>
                  <textarea
                    rows={4}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Type invoice instructions here or on the desktop view..."
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs text-[#001435] focus:outline-none focus:border-[#0070ba]"
                  />
                  <button
                    type="button"
                    disabled={loading || !prompt.trim()}
                    onClick={() => onGenerate()}
                    className="w-full pp-button-primary !py-2 !text-xs disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="w-3 h-3 animate-spin" />
                        <span>Parsing...</span>
                      </>
                    ) : (
                      <span>Generate on Mobile & Web</span>
                    )}
                  </button>
                </div>

                <div className="text-[11px] text-slate-500 bg-blue-50/50 p-3 rounded-xl border border-blue-100">
                  ⚡ <strong>Two-way sync:</strong> Anything typed here will instantaneously sync to the Web view on the left, and vice versa.
                </div>
              </div>
            ) : invoice ? (
              /* Mobile Invoice & Checkout Screen */
              <div className="space-y-3">
                
                {/* Total Balance Hero Banner */}
                <div className="bg-gradient-to-br from-[#003087] to-[#001c64] text-white p-4 rounded-2xl shadow-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] text-blue-200 uppercase tracking-wider font-semibold block">
                        Amount Due
                      </span>
                      <div className="text-2xl font-black tracking-tight mt-0.5">
                        ${invoice.totalAmount.toFixed(2)}
                        <span className="text-xs font-normal text-blue-200 ml-1">
                          {invoice.currency || 'USD'}
                        </span>
                      </div>
                    </div>
                    {invoice.status === 'PAID' ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-200 border border-emerald-400/30">
                        <CheckCircle2 className="w-3 h-3" /> PAID
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-200 border border-amber-300/30">
                        <AlertCircle className="w-3 h-3" /> DUE
                      </span>
                    )}
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-white/10 flex justify-between text-[11px] text-blue-100">
                    <span>{invoice.invoiceNumber}</span>
                    <span>Due: {invoice.dueDate}</span>
                  </div>
                </div>

                {/* Counterparty summary */}
                <div className="bg-[#f7f9fa] p-3 rounded-xl border border-slate-200 flex justify-between text-[11px]">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">From</span>
                    <span className="font-bold text-[#001435]">{invoice.sellerName}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">To</span>
                    <span className="font-bold text-[#001435]">{invoice.clientName}</span>
                  </div>
                </div>

                {/* Line Items List */}
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                  <div className="px-3 py-2 bg-slate-50 border-b border-slate-200 font-bold text-[11px] text-slate-600">
                    Invoice Items ({invoice.items.length})
                  </div>
                  <div className="divide-y divide-slate-100">
                    {invoice.items.map((item, idx) => (
                      <div key={idx} className="p-2.5 flex justify-between items-center text-[11px]">
                        <div className="pr-2">
                          <p className="font-bold text-[#001435] leading-tight">{item.description}</p>
                          <p className="text-[10px] text-slate-500 mt-0.5">
                            {item.quantity} × ${(item.unitPrice || 0).toFixed(2)}
                          </p>
                        </div>
                        <div className="font-black text-[#003087] whitespace-nowrap">
                          ${(item.total || 0).toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-2.5 bg-slate-50/50 border-t border-slate-200 text-[11px] space-y-1">
                    <div className="flex justify-between text-slate-500">
                      <span>Subtotal:</span>
                      <span>${invoice.subtotal.toFixed(2)}</span>
                    </div>
                    {invoice.discountAmount > 0 && (
                      <div className="flex justify-between text-emerald-600 font-medium">
                        <span>Discount ({invoice.discountPercentage}%):</span>
                        <span>-${invoice.discountAmount.toFixed(2)}</span>
                      </div>
                    )}
                    {invoice.taxAmount > 0 && (
                      <div className="flex justify-between text-slate-500">
                        <span>Tax ({invoice.taxPercentage}%):</span>
                        <span>+${invoice.taxAmount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-black text-[#001435] pt-1 border-t border-slate-200 text-xs">
                      <span>Total:</span>
                      <span className="text-[#003087]">${invoice.totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Mobile PayPal Checkout Component */}
                <div className="bg-white p-3 rounded-2xl border border-slate-200 space-y-2">
                  <div className="text-center">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Mobile One-Touch Settle
                    </span>
                  </div>

                  {invoice.status === 'PAID' ? (
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
                      <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto mb-1" />
                      <p className="font-bold text-xs text-emerald-900">Payment Settled</p>
                      <p className="text-[10px] font-mono text-emerald-700 truncate mt-0.5">
                        ID: {invoice.paymentId || 'PAYPAL-CAPTURED'}
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-hidden rounded-full py-0.5">
                      <PayPalButtons
                        style={{ layout: 'vertical', shape: 'pill', label: 'paypal', height: 42, color: 'gold' }}
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
                            toast.error(err.message || 'Mobile PayPal Checkout failed');
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
                            if (!res.ok) throw new Error(captureData.error || 'Capture failed');
                            toast.success('Mobile checkout captured!');
                            onPaymentSuccess(captureData.captureId || data.orderID);
                          } catch (err: any) {
                            toast.error(err.message || 'Capture failed');
                          }
                        }}
                        onError={(err) => {
                          console.error('PayPal Mobile Error:', err);
                          toast.error('Mobile PayPal checkout encountered an issue.');
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* Mobile Quick Action Buttons */}
                <div className="flex gap-2">
                  {onDownloadPDF && (
                    <button
                      type="button"
                      onClick={onDownloadPDF}
                      className="cursor-pointer flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] flex items-center justify-center gap-1.5 transition border border-slate-200"
                    >
                      <Download className="w-3.5 h-3.5 text-[#0070ba]" />
                      <span>PDF</span>
                    </button>
                  )}
                  {invoice.emailDraft && (
                    <button
                      type="button"
                      onClick={handleCopyEmail}
                      className="cursor-pointer flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] flex items-center justify-center gap-1.5 transition border border-slate-200"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-[#0070ba]" />}
                      <span>{copied ? 'Copied' : 'Email'}</span>
                    </button>
                  )}
                </div>

              </div>
            ) : (
              /* Mobile Empty State */
              <div className="text-center py-16 px-4 space-y-3 text-slate-400">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                  <CreditCard className="w-6 h-6" />
                </div>
                <p className="font-bold text-xs text-slate-600">No Active Bill</p>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Generate an invoice on the Web workspace or switch to the Prompt tab above.
                </p>
              </div>
            )}
          </div>

          {/* iOS Bottom Home Bar Indicator */}
          <div className="h-6 bg-white flex items-center justify-center shrink-0">
            <div className="w-32 h-1 rounded-full bg-slate-300" />
          </div>

        </div>
      </div>
    </div>
  );
}
