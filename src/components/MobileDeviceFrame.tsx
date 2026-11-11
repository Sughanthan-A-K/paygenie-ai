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
  Smartphone,
  ShieldCheck
} from 'lucide-react';
import { PayPalButtons } from '@paypal/react-paypal-js';
import confetti from 'canvas-confetti';
import { InvoiceData } from '@/types/invoice';
import { toast } from 'sonner';

interface MobileDeviceFrameProps {
  invoice: InvoiceData | null;
  onPaymentSuccess: (paymentId: string) => void;
  onDownloadPDF?: () => void;
}

export default function MobileDeviceFrame({
  invoice,
  onPaymentSuccess,
  onDownloadPDF,
}: MobileDeviceFrameProps) {
  const [copied, setCopied] = useState(false);

  const fireSuccessCelebration = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  return (
    <div className="relative mx-auto w-full max-w-[380px] select-none">
      
      {/* Real-world label */}
      <div className="flex items-center justify-between pb-3 px-2 text-xs font-semibold text-slate-700">
        <span className="inline-flex items-center gap-1.5 text-[#003087]">
          <Smartphone className="w-3.5 h-3.5" />
          <span>Client Mobile Phone (Customer View)</span>
        </span>
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
          PayPal Live Checkout
        </span>
      </div>

      {/* Realistic Smartphone Chassis */}
      <div className="relative rounded-[48px] bg-[#111827] p-3 shadow-2xl ring-1 ring-slate-800/80">
        {/* Device Outer Edge Highlights */}
        <div className="absolute -left-1 top-24 h-12 w-1 rounded-l bg-slate-700" />
        <div className="absolute -left-1 top-40 h-12 w-1 rounded-l bg-slate-700" />
        <div className="absolute -right-1 top-32 h-16 w-1 rounded-r bg-slate-700" />

        {/* Screen Bezel & Dynamic Island Container */}
        <div className="relative overflow-hidden rounded-[38px] bg-white border border-slate-200 h-[680px] flex flex-col text-[#001435]">
          
          {/* iOS / Modern Status Bar */}
          <div className="h-11 bg-white flex items-center justify-between px-6 pt-2 shrink-0 z-20">
            <span className="font-semibold text-xs tracking-tight text-[#001435]">9:41</span>
            
            {/* Dynamic Island */}
            <div className="w-24 h-5 rounded-full bg-black flex items-center justify-end pr-2 gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#10b981]" />
              <span className="w-2.5 h-2.5 rounded-full bg-slate-900 ring-1 ring-slate-800" />
            </div>

            <div className="flex items-center gap-1.5 text-[#001435]">
              <Wifi className="w-3.5 h-3.5" />
              <Battery className="w-4 h-4" />
            </div>
          </div>

          {/* Customer In-App Browser Bar */}
          <div className="px-4 py-2.5 bg-[#f5f7fa] border-b border-slate-200 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-[#003087] text-white flex items-center justify-center font-black text-xs">
                P
              </div>
              <div className="leading-tight">
                <span className="font-extrabold text-xs tracking-tight text-[#001435] block">
                  PayPal <span className="text-[#0070ba]">Checkout</span>
                </span>
                <span className="text-[10px] text-slate-500 font-medium">Secure Payment Link</span>
              </div>
            </div>

            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              <span>Verified Merchant</span>
            </span>
          </div>

          {/* Scrollable Customer Screen Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs no-scrollbar">
            {invoice ? (
              <div className="space-y-3 animate-fade-in">
                
                {/* Bill Header Hero Banner */}
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
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-200 border border-emerald-400/30">
                        <CheckCircle2 className="w-3 h-3" /> PAID
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-200 border border-amber-300/30">
                        <AlertCircle className="w-3 h-3" /> UNPAID
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
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Pay To (Merchant)</span>
                    <span className="font-bold text-[#001435]">{invoice.sellerName}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Billed To You</span>
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

                {/* CUSTOMER PAYPAL ONE-TOUCH SETTLEMENT */}
                <div className="bg-white p-3.5 rounded-2xl border border-slate-200 space-y-2">
                  <div className="text-center">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Customer Instant Settle
                    </span>
                  </div>

                  {invoice.status === 'PAID' ? (
                    <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-center animate-fade-in">
                      <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-1.5" />
                      <p className="font-bold text-xs text-emerald-900">Payment Successfully Completed!</p>
                      <p className="text-[10px] text-emerald-700 mt-0.5">
                        Thank you for settling invoice {invoice.invoiceNumber}.
                      </p>
                      <div className="inline-block mt-2 bg-white px-3 py-1 rounded-full border border-emerald-300 font-mono text-[10px] text-emerald-800 font-bold">
                        TX: {invoice.paymentId || 'PAYPAL-CAPTURED'}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <PayPalButtons
                        style={{ layout: 'vertical', shape: 'pill', label: 'pay', height: 44, color: 'gold' }}
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
                            fireSuccessCelebration();
                            toast.success('Customer checkout captured via PayPal Sandbox!');
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

              </div>
            ) : (
              /* Empty state before invoice creation */
              <div className="text-center py-20 px-4 space-y-3 text-slate-400">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                  <CreditCard className="w-6 h-6" />
                </div>
                <p className="font-bold text-xs text-slate-600">Waiting for Merchant Bill</p>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Generate an invoice on the Web workspace to see customer one-click PayPal checkout here.
                </p>
              </div>
            )}
          </div>

          {/* iOS Bottom Home Bar */}
          <div className="h-6 bg-white flex items-center justify-center shrink-0">
            <div className="w-32 h-1 rounded-full bg-slate-300" />
          </div>

        </div>
      </div>
    </div>
  );
}
