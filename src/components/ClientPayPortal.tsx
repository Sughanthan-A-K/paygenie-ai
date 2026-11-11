'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  ArrowLeft,
  Wifi,
  Battery
} from 'lucide-react';
import { PayPalButtons } from '@paypal/react-paypal-js';
import confetti from 'canvas-confetti';
import { InvoiceData } from '@/types/invoice';
import { toast } from 'sonner';
import Link from 'next/link';

export default function ClientPayPortal() {
  const searchParams = useSearchParams();
  const invoiceId = searchParams.get('invoice');
  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('paygenie_invoices');
      if (stored) {
        const invoices: InvoiceData[] = JSON.parse(stored);
        const match = invoices.find((i) => i.invoiceNumber === invoiceId);
        if (match) {
          setInvoice(match);
          setLoading(false);
          return;
        }
      }
    } catch (e) {
      console.error(e);
    }

    // Fallback for direct testing
    const defaultInvoice: InvoiceData = {
      invoiceNumber: invoiceId || 'INV-2026-1042',
      date: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      clientName: 'Acme Tech',
      clientEmail: 'billing@acmetech.com',
      sellerName: 'Your Company / Studio',
      sellerEmail: 'billing@merchant.com',
      currency: 'USD',
      items: [
        {
          id: '1',
          description: 'React Dashboard development',
          quantity: 10,
          unitPrice: 65,
          total: 650,
        },
      ],
      subtotal: 650,
      discountPercentage: 5,
      discountAmount: 32.5,
      taxPercentage: 0,
      taxAmount: 0,
      totalAmount: 617.5,
      notes: 'Payment due within 14 days. Settle securely via PayPal.',
      status: 'PENDING',
    };
    setInvoice(defaultInvoice);
    setLoading(false);
  }, [invoiceId]);

  const fireSuccessCelebration = () => {
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 },
    });
  };

  const handlePaymentSuccess = (paymentId: string) => {
    if (!invoice) return;
    const updated: InvoiceData = {
      ...invoice,
      status: 'PAID',
      paymentId,
      paidAt: new Date().toLocaleString(),
    };
    setInvoice(updated);

    try {
      const stored = localStorage.getItem('paygenie_invoices');
      if (stored) {
        const list: InvoiceData[] = JSON.parse(stored);
        const updatedList = list.map((i) =>
          i.invoiceNumber === updated.invoiceNumber ? updated : i
        );
        localStorage.setItem('paygenie_invoices', JSON.stringify(updatedList));
      }
    } catch (e) {
      console.error(e);
    }

    fireSuccessCelebration();
    toast.success('Payment settled successfully via PayPal!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center text-xs text-slate-400">
        Loading client checkout...
      </div>
    );
  }

  if (!invoice) return null;

  return (
    <div className="min-h-screen bg-[#0b0f19] text-[#001435] flex flex-col items-center justify-center p-4 sm:p-8 font-sans">
      
      {/* Top Controls Bar */}
      <div className="w-full max-w-[390px] mx-auto mb-4 flex items-center justify-between text-xs">
        <Link 
          href="/" 
          className="inline-flex items-center gap-1.5 text-slate-300 hover:text-white font-semibold transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Merchant Workspace</span>
        </Link>
        <span className="inline-flex items-center gap-1 font-bold text-emerald-400 bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-500/30 text-[11px]">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>PayPal Verified Link</span>
        </span>
      </div>

      {/* Realistic Smartphone Chassis Frame (Titanium Bezel) */}
      <div className="relative mx-auto w-full max-w-[390px] rounded-[52px] bg-[#1a2234] p-3.5 shadow-2xl ring-1 ring-slate-700/80">
        
        {/* Device Outer Edge Physical Buttons */}
        <div className="absolute -left-1 top-24 h-12 w-1 rounded-l bg-slate-600" />
        <div className="absolute -left-1 top-40 h-12 w-1 rounded-l bg-slate-600" />
        <div className="absolute -right-1 top-32 h-16 w-1 rounded-r bg-slate-600" />

        {/* Inner Phone Screen Container */}
        <div className="relative overflow-hidden rounded-[40px] bg-white border border-slate-200 h-[720px] flex flex-col text-[#001435]">
          
          {/* iOS / Smartphone Status Bar */}
          <div className="h-11 bg-white flex items-center justify-between px-6 pt-2 shrink-0 z-20">
            <span className="font-semibold text-xs tracking-tight text-[#001435]">9:41</span>
            
            {/* Dynamic Island Notch */}
            <div className="w-24 h-5 rounded-full bg-black flex items-center justify-end pr-2 gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#10b981]" />
              <span className="w-2.5 h-2.5 rounded-full bg-slate-900 ring-1 ring-slate-800" />
            </div>

            <div className="flex items-center gap-1.5 text-[#001435]">
              <Wifi className="w-3.5 h-3.5" />
              <Battery className="w-4 h-4" />
            </div>
          </div>

          {/* Browser Address Bar */}
          <div className="px-4 py-2.5 bg-[#f5f7fa] border-b border-slate-200 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-[#003087] text-white flex items-center justify-center font-black text-xs">
                P
              </div>
              <div className="leading-tight">
                <span className="font-extrabold text-xs tracking-tight text-[#001435] block">
                  PayPal <span className="text-[#0070ba]">Checkout</span>
                </span>
                <span className="text-[10px] text-slate-500 font-medium truncate max-w-[170px] block">
                  paygenie.ai/?invoice={invoice.invoiceNumber}
                </span>
              </div>
            </div>

            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              <span>Encrypted</span>
            </span>
          </div>

          {/* Scrollable Mobile Bill Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs no-scrollbar">
            
            {/* Amount Due Banner */}
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

            {/* Counterparties */}
            <div className="bg-[#f7f9fa] p-3 rounded-xl border border-slate-200 flex justify-between text-[11px]">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Pay To</span>
                <span className="font-bold text-[#001435]">{invoice.sellerName}</span>
              </div>
              <div className="text-right">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Billed To You</span>
                <span className="font-bold text-[#001435]">{invoice.clientName}</span>
              </div>
            </div>

            {/* Line items list */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="px-3 py-2 bg-slate-50 border-b border-slate-200 font-bold text-[11px] text-slate-600">
                Invoice Breakdown ({invoice.items.length})
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
                  <span>Total Due:</span>
                  <span className="text-[#003087]">${invoice.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* PAYPAL CHECKOUT CARD */}
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 space-y-2">
              <div className="text-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Customer One-Touch Settle
                </span>
              </div>

              {invoice.status === 'PAID' ? (
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-center animate-fade-in">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-1" />
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
                        toast.error(err.message || 'PayPal Checkout failed');
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
                        handlePaymentSuccess(captureData.captureId || data.orderID);
                      } catch (err: any) {
                        toast.error(err.message || 'Payment capture failed');
                      }
                    }}
                    onError={(err) => {
                      console.error('PayPal error:', err);
                      toast.error('PayPal Checkout encountered an issue.');
                    }}
                  />
                </div>
              )}
            </div>

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
