'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  Calendar, 
  CreditCard,
  Building2,
  Lock,
  ArrowLeft
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
    // 1. Try to load from localStorage (created during this session or demo)
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

    // 2. Fallback: Provide verified mock data for direct URL testing
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

    // Sync to localStorage
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
      <div className="min-h-screen bg-[#f5f7fa] flex items-center justify-center text-xs text-slate-500">
        Loading secure checkout...
      </div>
    );
  }

  if (!invoice) return null;

  return (
    <div className="min-h-screen bg-[#f5f7fa] text-[#001435] flex flex-col items-center justify-center p-4 sm:p-6 font-sans">
      
      {/* Top Brand & Back to Workspace */}
      <div className="w-full max-w-md mx-auto mb-4 flex items-center justify-between text-xs">
        <Link 
          href="/" 
          className="inline-flex items-center gap-1.5 text-slate-600 hover:text-[#003087] font-semibold transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Merchant Workspace</span>
        </Link>
        <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 text-[11px]">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Official PayPal Checkout</span>
        </span>
      </div>

      {/* Standalone Mobile Checkout Chassis */}
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl shadow-lg overflow-hidden">
        
        {/* Navy Header Accent */}
        <div className="h-2 bg-[#003087]" />

        {/* Portal Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#003087] text-white flex items-center justify-center font-black text-lg">
              P
            </div>
            <div>
              <h1 className="text-base font-extrabold text-[#001435] tracking-tight">
                PayPal <span className="text-[#0070ba]">Client Checkout</span>
              </h1>
              <p className="text-xs text-slate-500">Invoice {invoice.invoiceNumber}</p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Due</span>
            <span className="text-xl font-black text-[#003087]">
              ${invoice.totalAmount.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Invoice Summary */}
        <div className="p-6 space-y-4 text-xs">
          
          {/* Status Banner */}
          {invoice.status === 'PAID' ? (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center animate-fade-in">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-1.5" />
              <h4 className="font-bold text-sm text-emerald-900">Payment Completed!</h4>
              <p className="text-xs text-emerald-700 mt-0.5">
                Thank you for settling invoice {invoice.invoiceNumber}.
              </p>
              <div className="inline-block mt-2 bg-white px-3 py-1 rounded-full border border-emerald-300 font-mono text-xs text-emerald-800 font-bold">
                TX: {invoice.paymentId || 'PAYPAL-CAPTURED'}
              </div>
            </div>
          ) : (
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-800">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <span className="font-bold">Payment Awaiting Settlement</span>
              </div>
              <span className="text-[11px] text-amber-700 font-medium">Due: {invoice.dueDate}</span>
            </div>
          )}

          {/* Billed From & To */}
          <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-[#f8fafc] border border-slate-200/80">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Merchant</span>
              <p className="font-bold text-[#001435]">{invoice.sellerName}</p>
              <p className="text-[11px] text-slate-500 truncate">{invoice.sellerEmail}</p>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Client</span>
              <p className="font-bold text-[#001435]">{invoice.clientName}</p>
              <p className="text-[11px] text-slate-500 truncate">{invoice.clientEmail}</p>
            </div>
          </div>

          {/* Line items list */}
          <div className="rounded-2xl border border-slate-200 overflow-hidden">
            <div className="p-3 bg-slate-50 border-b border-slate-200 font-bold text-[11px] text-slate-600 flex justify-between">
              <span>Item Description</span>
              <span>Amount</span>
            </div>
            <div className="divide-y divide-slate-100">
              {invoice.items.map((item, idx) => (
                <div key={idx} className="p-3 flex justify-between items-center">
                  <div>
                    <p className="font-bold text-[#001435]">{item.description}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {item.quantity} × ${(item.unitPrice || 0).toFixed(2)}
                    </p>
                  </div>
                  <span className="font-black text-[#003087]">
                    ${(item.total || 0).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
            <div className="p-3 bg-slate-50/50 border-t border-slate-200 space-y-1 text-slate-600">
              <div className="flex justify-between">
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
                <div className="flex justify-between">
                  <span>Tax ({invoice.taxPercentage}%):</span>
                  <span>+${invoice.taxAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-black text-[#001435] text-sm pt-1.5 border-t border-slate-200">
                <span>Total Due:</span>
                <span className="text-[#003087]">${invoice.totalAmount.toFixed(2)} {invoice.currency || 'USD'}</span>
              </div>
            </div>
          </div>

          {/* PAYPAL ONE-TOUCH BUTTON */}
          {invoice.status !== 'PAID' && (
            <div className="pt-2">
              <PayPalButtons
                style={{ layout: 'vertical', shape: 'pill', label: 'pay', height: 46, color: 'gold' }}
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

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 text-center text-[11px] text-slate-400">
          Powered by PayPal Developer Platform Sandbox • PayGenie AI
        </div>

      </div>

    </div>
  );
}
