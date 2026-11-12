'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  ArrowLeft,
  Wifi,
  Battery,
  Download,
  RefreshCw
} from 'lucide-react';
import { PayPalScriptProvider, PayPalButtons, usePayPalScriptReducer, DISPATCH_ACTION } from '@paypal/react-paypal-js';
import confetti from 'canvas-confetti';
import { InvoiceData } from '@/types/invoice';
import { toast } from 'sonner';
import Link from 'next/link';
import jsPDF from 'jspdf';
import { PayGenieLogo } from '@/components/PayGenieLogo';

export default function ClientPayPortal() {
  const searchParams = useSearchParams();
  const invoiceId = searchParams.get('invoice');
  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPayPalCheckout, setShowPayPalCheckout] = useState(false);

  useEffect(() => {
    try {
      // 1. Try checking direct flat invoices list
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

      // 2. Also check across all clients roster
      const storedClients = localStorage.getItem('paygenie_clients_v2');
      if (storedClients) {
        const clients = JSON.parse(storedClients);
        for (const c of clients) {
          const match = (c.invoices || []).find((i: InvoiceData) => i.invoiceNumber === invoiceId);
          if (match) {
            setInvoice(match);
            setLoading(false);
            return;
          }
          // Also check drafts inside messages
          const draftMatch = (c.messages || []).find((m: any) => m.invoiceDraft?.invoiceNumber === invoiceId)?.invoiceDraft;
          if (draftMatch) {
            setInvoice(draftMatch);
            setLoading(false);
            return;
          }
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
    const phoneScreen = document.getElementById('phone-screen-container');
    if (phoneScreen) {
      const rect = phoneScreen.getBoundingClientRect();
      // Calculate normalized origin coordinates inside the mobile screen
      const originX = (rect.left + rect.width / 2) / window.innerWidth;
      const originY = (rect.top + rect.height * 0.4) / window.innerHeight;

      // Confetti burst confined towards the phone screen
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { x: originX, y: originY },
        zIndex: 50,
      });
      return;
    }

    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  const handleClientDownloadPdf = () => {
    if (!invoice) return;
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      
      // Header brand
      pdf.setFillColor(0, 48, 135); // PayPal Navy
      pdf.rect(0, 0, pageWidth, 18, 'F');
      
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('PayGenie — PayPal Business Invoice', 15, 12);

      // Invoice Number & Status
      pdf.setTextColor(0, 20, 53);
      pdf.setFontSize(20);
      pdf.text(`INVOICE: ${invoice.invoiceNumber}`, 15, 32);

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(100, 116, 139);
      pdf.text(`Date: ${invoice.date}   |   Due Date: ${invoice.dueDate}`, 15, 38);

      pdf.setFont('helvetica', 'bold');
      if (invoice.status === 'PAID') {
        // Vibrant Green PAID Stamp Box
        pdf.setDrawColor(16, 185, 129);
        pdf.setFillColor(236, 253, 245);
        pdf.roundedRect(pageWidth - 85, 24, 70, 14, 2, 2, 'FD');
        pdf.setTextColor(5, 150, 105);
        pdf.setFontSize(10.5);
        pdf.text('STATUS: PAID VIA PAYPAL', pageWidth - 50, 31, { align: 'center' });
        if (invoice.paymentId) {
          pdf.setFontSize(7.5);
          pdf.setFont('helvetica', 'normal');
          pdf.setTextColor(16, 185, 129);
          pdf.text(`TX: ${invoice.paymentId.slice(0, 18)}`, pageWidth - 50, 35.5, { align: 'center' });
        }
      } else {
        // Amber UNPAID Stamp Box
        pdf.setDrawColor(245, 158, 11);
        pdf.setFillColor(254, 243, 199);
        pdf.roundedRect(pageWidth - 85, 24, 70, 12, 2, 2, 'FD');
        pdf.setTextColor(180, 83, 9);
        pdf.setFontSize(10.5);
        pdf.text('STATUS: AWAITING PAYMENT', pageWidth - 50, 31.5, { align: 'center' });
      }

      // Counterparty boxes
      pdf.setDrawColor(226, 232, 240);
      pdf.setFillColor(248, 250, 252);
      pdf.roundedRect(15, 45, (pageWidth - 35) / 2, 26, 3, 3, 'FD');
      pdf.roundedRect(20 + (pageWidth - 35) / 2, 45, (pageWidth - 35) / 2, 26, 3, 3, 'FD');

      pdf.setFontSize(8);
      pdf.setTextColor(148, 163, 184);
      pdf.text('BILLED FROM:', 19, 51);
      pdf.text('BILLED TO:', 24 + (pageWidth - 35) / 2, 51);

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(0, 20, 53);
      pdf.text(invoice.sellerName || 'Merchant', 19, 57);
      pdf.text(invoice.clientName || 'Client', 24 + (pageWidth - 35) / 2, 57);

      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(100, 116, 139);
      pdf.text(invoice.sellerEmail || 'billing@merchant.com', 19, 63);
      pdf.text(invoice.clientEmail || '', 24 + (pageWidth - 35) / 2, 63);

      // Line items table
      let y = 82;
      const rightMargin = 20;
      const totalColX = pageWidth - rightMargin;

      pdf.setFillColor(241, 245, 249);
      pdf.rect(15, y, pageWidth - 30, 8, 'F');
      
      pdf.setFontSize(8.5);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(71, 85, 105);
      pdf.text('DESCRIPTION', 18, y + 5.5);
      pdf.text('QTY', totalColX - 60, y + 5.5, { align: 'right' });
      pdf.text('RATE', totalColX - 32, y + 5.5, { align: 'right' });
      pdf.text('TOTAL', totalColX, y + 5.5, { align: 'right' });

      y += 8;
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9);
      pdf.setTextColor(15, 23, 42);

      invoice.items.forEach((item) => {
        pdf.text(item.description, 18, y + 6);
        pdf.text(String(item.quantity), totalColX - 60, y + 6, { align: 'right' });
        pdf.text(`$${(item.unitPrice || 0).toFixed(2)}`, totalColX - 32, y + 6, { align: 'right' });
        pdf.setFont('helvetica', 'bold');
        pdf.text(`$${(item.total || 0).toFixed(2)}`, totalColX, y + 6, { align: 'right' });
        pdf.setFont('helvetica', 'normal');
        
        pdf.setDrawColor(241, 245, 249);
        pdf.line(15, y + 8, pageWidth - 15, y + 8);
        y += 8;
      });

      // Divider line after items
      y += 10;
      pdf.setDrawColor(226, 232, 240);
      pdf.line(15, y, pageWidth - 15, y);

      // Totals section with generous breathing room
      y += 10;
      pdf.setFontSize(9.5);
      pdf.setTextColor(100, 116, 139);
      pdf.text('Subtotal:', totalColX - 52, y, { align: 'right' });
      pdf.text(`$${invoice.subtotal.toFixed(2)}`, totalColX, y, { align: 'right' });

      if (invoice.discountAmount > 0) {
        y += 8;
        pdf.setTextColor(16, 185, 129);
        pdf.text(`Discount (${invoice.discountPercentage}%):`, totalColX - 52, y, { align: 'right' });
        pdf.text(`-$${invoice.discountAmount.toFixed(2)}`, totalColX, y, { align: 'right' });
      }

      if (invoice.taxAmount > 0) {
        y += 8;
        pdf.setTextColor(100, 116, 139);
        pdf.text(`Tax (${invoice.taxPercentage}%):`, totalColX - 52, y, { align: 'right' });
        pdf.text(`+$${invoice.taxAmount.toFixed(2)}`, totalColX, y, { align: 'right' });
      }

      // Separator line with proper clearance
      y += 6;
      pdf.setDrawColor(226, 232, 240);
      pdf.line(totalColX - 85, y, totalColX, y);

      // Clean gap below the separator line before the bold Total text
      y += 9;
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(0, 48, 135);
      pdf.text('Total Amount Due:', totalColX - 52, y, { align: 'right' });
      pdf.text(`$${invoice.totalAmount.toFixed(2)} ${invoice.currency}`, totalColX, y, { align: 'right' });

      pdf.save(`Invoice_${invoice.invoiceNumber}.pdf`);
      toast.success('Invoice PDF downloaded!');
    } catch (e) {
      console.error(e);
      toast.error('Failed to download PDF');
    }
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
      // 1. Update paygenie_invoices
      const stored = localStorage.getItem('paygenie_invoices');
      if (stored) {
        const list: InvoiceData[] = JSON.parse(stored);
        const updatedList = list.map((i) =>
          i.invoiceNumber === updated.invoiceNumber ? updated : i
        );
        localStorage.setItem('paygenie_invoices', JSON.stringify(updatedList));
      }

      // 2. Also directly update paygenie_clients_v2 in localStorage so ledger displays immediately
      const storedClients = localStorage.getItem('paygenie_clients_v2');
      if (storedClients) {
        const clients = JSON.parse(storedClients);
        const updatedClients = clients.map((c: any) => ({
          ...c,
          invoices: (c.invoices || []).map((i: InvoiceData) =>
            i.invoiceNumber === updated.invoiceNumber ? updated : i
          ),
          messages: (c.messages || []).map((m: any) =>
            m.invoiceDraft?.invoiceNumber === updated.invoiceNumber
              ? { ...m, invoiceDraft: updated }
              : m
          ),
        }));
        localStorage.setItem('paygenie_clients_v2', JSON.stringify(updatedClients));
      }
    } catch (e) {
      console.error(e);
    }

    fireSuccessCelebration();
    toast.success('Payment settled successfully via PayPal!');

    // Cross-tab real-time sync channel (BroadcastChannel API)
    try {
      const channel = new BroadcastChannel('paygenie_live_sync');
      channel.postMessage({
        type: 'PAYMENT_SETTLED',
        invoiceNumber: updated.invoiceNumber,
        paymentId: updated.paymentId,
        paidAt: updated.paidAt,
        updatedInvoice: updated,
      });
      channel.close();
    } catch (e) {
      console.error('BroadcastChannel sync failed:', e);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f7fa] flex items-center justify-center text-sm font-bold text-slate-500">
        Loading client checkout...
      </div>
    );
  }

  if (!invoice) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8fafc] via-[#f1f5f9] to-[#e2e8f0] text-[#001435] flex items-center justify-center p-0 sm:p-6 md:p-8 font-sans overflow-x-hidden relative selection:bg-[#0070ba]/20">
      
      {/* Ambient Radial Soft Glow on Desktop */}
      <div className="hidden sm:block absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-sky-400/10 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(#0070ba0a_1px,transparent_1px)] bg-[size:24px_24px]" />
      </div>

      {/* Two-Column Showcase on Desktop / Full-Width on Mobile */}
      <div className="w-full max-w-5xl mx-auto flex flex-col lg:flex-row items-center justify-center lg:justify-between gap-8 lg:gap-12 relative z-10">
        
        {/* Left Side: Brand Value & Direct Live Security Details (Desktop only) */}
        <div className="hidden lg:flex flex-col max-w-md space-y-6">
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/80 border border-slate-200/80 backdrop-blur-md shadow-sm text-xs font-semibold text-blue-700 w-fit">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Official PayPal Verified 256-Bit Gateway</span>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <PayGenieLogo size={42} showText={false} />
              <h1 className="text-3xl font-black tracking-tight text-slate-900">
                PayGenie <span className="text-[#0070ba]">AI</span>
              </h1>
            </div>
            <p className="text-slate-600 text-sm leading-relaxed">
              Instant, verified natural language billing settlement. You can securely review line items, download your official invoice PDF, and settle in one tap via PayPal.
            </p>
          </div>

          {/* Value Badges */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Settlement</span>
              <p className="text-sm font-bold text-slate-900">Instant Capture</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Direct PayPal Orders v2</p>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Protection</span>
              <p className="text-sm font-bold text-emerald-600">Buyer Protection</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Encrypted zero-card access</p>
            </div>
          </div>

          {/* Counterparty Summary Pill */}
          <div className="p-4 rounded-2xl bg-white border border-blue-100 shadow-sm flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">Billed By</span>
              <span className="font-bold text-slate-900 text-sm mt-0.5 block">{invoice.sellerName || 'Merchant'}</span>
            </div>
            <div className="text-right">
              <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">Invoice</span>
              <span className="font-mono font-bold text-[#0070ba] text-sm mt-0.5 block">{invoice.invoiceNumber}</span>
            </div>
          </div>
        </div>

        {/* Right Side: Smartphone Device Mockup on Desktop / Full Screen on Mobile */}
        <div className="w-full sm:max-w-[400px]">
          <div className="relative mx-auto w-full sm:max-w-[400px] rounded-none sm:rounded-[52px] bg-white sm:bg-slate-800 p-0 sm:p-3.5 shadow-none sm:shadow-[0_20px_50px_rgba(0,0,0,0.15)] sm:ring-1 sm:ring-slate-300">
            
            {/* Device Outer Edge Physical Buttons */}
            <div className="hidden sm:block absolute -left-1 top-24 h-12 w-1 rounded-l bg-slate-600" />
            <div className="hidden sm:block absolute -left-1 top-40 h-12 w-1 rounded-l bg-slate-600" />
            <div className="hidden sm:block absolute -right-1 top-32 h-16 w-1 rounded-r bg-slate-600" />

            {/* Inner Phone Screen Container */}
            <div 
              id="phone-screen-container" 
              className="relative overflow-hidden rounded-none sm:rounded-[40px] bg-white border-0 sm:border border-slate-200 min-h-screen sm:min-h-0 sm:h-[740px] flex flex-col text-[#001435]"
            >
              
              {/* iOS Status Bar (Desktop frame only) */}
              <div className="hidden sm:flex h-11 bg-white items-center justify-between px-6 pt-2 shrink-0 z-20">
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

              {/* Browser Address Bar with Official PayGenie Logo */}
              <div className="px-4 py-2.5 bg-[#f5f7fa] border-b border-slate-200 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2.5 min-w-0">
                  {/* Inline Official PayGenie Squircle Emblem */}
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 512 512"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="shrink-0 drop-shadow-sm select-none"
                    style={{ minWidth: '32px', minHeight: '32px' }}
                  >
                    <defs>
                      <linearGradient id="pgPortalBg" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#001C64" />
                        <stop offset="50%" stopColor="#003087" />
                        <stop offset="100%" stopColor="#0070BA" />
                      </linearGradient>
                      <linearGradient id="pgPortalP1" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#0079C1" />
                        <stop offset="100%" stopColor="#00457C" />
                      </linearGradient>
                      <linearGradient id="pgPortalP2" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#00457C" />
                        <stop offset="100%" stopColor="#002447" />
                      </linearGradient>
                      <linearGradient id="pgPortalGold" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#FFE885" />
                        <stop offset="40%" stopColor="#FFC439" />
                        <stop offset="100%" stopColor="#FF9E1B" />
                      </linearGradient>
                      <linearGradient id="pgPortalCyan" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#FFFFFF" />
                        <stop offset="60%" stopColor="#38BDF8" />
                        <stop offset="100%" stopColor="#0284C7" />
                      </linearGradient>
                    </defs>
                    <rect width="512" height="512" rx="128" fill="url(#pgPortalBg)" />
                    <rect width="504" height="504" x="4" y="4" rx="124" fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="8" />
                    <g transform="translate(68, 70)">
                      <path d="M 96 48 L 220 48 C 290 48 338 88 322 158 C 308 220 252 258 184 258 L 132 258 L 94 416 L 36 416 L 96 48 Z" fill="url(#pgPortalP2)" opacity="0.9" />
                      <path d="M 148 102 L 268 102 C 336 102 376 138 360 206 C 344 274 290 310 220 310 L 176 310 L 152 416 L 96 416 L 148 102 Z" fill="url(#pgPortalP1)" />
                      <path d="M 176 310 L 220 310 C 274 310 316 284 334 238 C 314 252 284 258 244 258 L 188 258 L 176 310 Z" fill="#002447" opacity="0.45" />
                    </g>
                    <g transform="translate(366, 78)">
                      <path d="M 38 0 Q 38 38 76 38 Q 38 38 38 76 Q 38 38 0 38 Q 38 38 38 0 Z" fill="url(#pgPortalGold)" />
                    </g>
                    <g transform="translate(398, 250)">
                      <path d="M 22 0 Q 22 22 44 22 Q 22 22 22 44 Q 22 22 0 22 Q 22 22 22 0 Z" fill="url(#pgPortalCyan)" />
                    </g>
                    <g transform="translate(90, 72)">
                      <path d="M 14 0 Q 14 14 28 14 Q 14 14 14 28 Q 14 14 0 14 Q 14 14 14 0 Z" fill="#FFFFFF" opacity="0.95" />
                    </g>
                  </svg>

                  <div className="leading-tight min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-extrabold text-xs tracking-tight text-[#001435] shrink-0">
                        PayGenie <span className="text-[#0070ba]">AI</span>
                      </span>
                      <span className="text-[9px] font-semibold text-slate-400 shrink-0">· PayPal</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-medium truncate max-w-[170px] block">
                      paygenie.ai/?invoice={invoice.invoiceNumber}
                    </span>
                  </div>
                </div>

                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  <span>256-Bit</span>
                </span>
              </div>

              {/* Scrollable Mobile Bill Body */}
              <div className="flex-1 sm:overflow-y-auto p-4 space-y-3.5 text-xs no-scrollbar">
            
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

              <div className="mt-3 pt-2.5 border-t border-white/10 flex justify-between items-center text-[11px] text-blue-100">
                <span>{invoice.invoiceNumber}</span>
                
                {/* 📄 1-Click Client PDF Download Button */}
                <button
                  type="button"
                  onClick={handleClientDownloadPdf}
                  className="cursor-pointer inline-flex items-center gap-1 bg-white/20 hover:bg-white/30 text-white px-2.5 py-1 rounded-lg text-[10.5px] font-bold transition backdrop-blur-xs"
                  title="Download official PDF copy"
                >
                  <Download className="w-3 h-3" />
                  <span>Download PDF</span>
                </button>
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
              ) : !showPayPalCheckout ? (
                /* Primary Instant "Pay Now" Trigger Button */
                <button
                  type="button"
                  onClick={() => setShowPayPalCheckout(true)}
                  className="w-full h-11 rounded-full bg-[#0070ba] hover:bg-[#003087] text-white font-bold text-sm transition shadow-sm hover:shadow-md flex items-center justify-center gap-2.5 cursor-pointer active:scale-[0.99]"
                >
                  {/* Official Full PayGenie Emblem (Squircle Badge with Double-P & Sparkle - matching top logo) */}
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 512 512"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="shrink-0 select-none drop-shadow-sm"
                    style={{ minWidth: '22px', minHeight: '22px' }}
                  >
                    <defs>
                      <linearGradient id="btnPgBg" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#001C64" />
                        <stop offset="50%" stopColor="#003087" />
                        <stop offset="100%" stopColor="#0070BA" />
                      </linearGradient>
                      <linearGradient id="btnPgP1" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#0079C1" />
                        <stop offset="100%" stopColor="#00457C" />
                      </linearGradient>
                      <linearGradient id="btnPgP2" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#00457C" />
                        <stop offset="100%" stopColor="#002447" />
                      </linearGradient>
                      <linearGradient id="btnPgGold" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#FFE885" />
                        <stop offset="40%" stopColor="#FFC439" />
                        <stop offset="100%" stopColor="#FF9E1B" />
                      </linearGradient>
                      <linearGradient id="btnPgCyan" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#FFFFFF" />
                        <stop offset="60%" stopColor="#38BDF8" />
                        <stop offset="100%" stopColor="#0284C7" />
                      </linearGradient>
                    </defs>
                    <rect width="512" height="512" rx="128" fill="url(#btnPgBg)" />
                    <rect width="504" height="504" x="4" y="4" rx="124" fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="8" />
                    <g transform="translate(68, 70)">
                      <path d="M 96 48 L 220 48 C 290 48 338 88 322 158 C 308 220 252 258 184 258 L 132 258 L 94 416 L 36 416 L 96 48 Z" fill="url(#btnPgP2)" opacity="0.9" />
                      <path d="M 148 102 L 268 102 C 336 102 376 138 360 206 C 344 274 290 310 220 310 L 176 310 L 152 416 L 96 416 L 148 102 Z" fill="url(#btnPgP1)" />
                      <path d="M 176 310 L 220 310 C 274 310 316 284 334 238 C 314 252 284 258 244 258 L 188 258 L 176 310 Z" fill="#002447" opacity="0.45" />
                    </g>
                    <g transform="translate(366, 78)">
                      <path d="M 38 0 Q 38 38 76 38 Q 38 38 38 76 Q 38 38 0 38 Q 38 38 38 0 Z" fill="url(#btnPgGold)" />
                    </g>
                    <g transform="translate(398, 250)">
                      <path d="M 22 0 Q 22 22 44 22 Q 22 22 22 44 Q 22 22 0 22 Q 22 22 22 0 Z" fill="url(#btnPgCyan)" />
                    </g>
                    <g transform="translate(90, 72)">
                      <path d="M 14 0 Q 14 14 28 14 Q 14 14 14 28 Q 14 14 0 14 Q 14 14 14 0 Z" fill="#FFFFFF" opacity="0.95" />
                    </g>
                  </svg>
                  <span>Pay Now — ${invoice.totalAmount.toFixed(2)}</span>
                </button>
              ) : (
                <div className="animate-fade-in">
                  <PayPalButtonsContainer
                    invoice={invoice}
                    onSuccess={(paymentId) => handlePaymentSuccess(paymentId)}
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
  </div>
</div>
  );
}

const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || 'Aa0xL150IPiY0x_Fd6WDNyJ3mPenuuOShacZwPEnH_k-3_Jv3O8yPfnHWo5qBqJhv2z5kiZTWTbfsG5j';

function PayPalButtonsContainer({
  invoice,
  onSuccess,
}: {
  invoice: InvoiceData;
  onSuccess: (paymentId: string) => void;
}) {
  const options = React.useMemo(() => ({
    clientId: PAYPAL_CLIENT_ID,
    currency: invoice.currency || 'USD',
    intent: 'capture',
    components: 'buttons',
  }), [invoice.currency]);

  return (
    <div className="w-full min-h-[46px]">
      <PayPalScriptProvider options={options}>
        <PayPalButtonsInner
          invoice={invoice}
          onSuccess={onSuccess}
        />
      </PayPalScriptProvider>
    </div>
  );
}

function PayPalButtonsInner({
  invoice,
  onSuccess,
}: {
  invoice: InvoiceData;
  onSuccess: (paymentId: string) => void;
}) {
  const [{ isPending, isRejected }, dispatch] = usePayPalScriptReducer();

  const handleManualReload = () => {
    dispatch({
      type: DISPATCH_ACTION.RESET_OPTIONS,
      value: {
        clientId: PAYPAL_CLIENT_ID,
        currency: invoice.currency || 'USD',
        intent: 'capture',
        components: 'buttons',
      },
    });
  };

  if (isRejected) {
    return (
      <div className="p-3 text-center bg-slate-50 border border-slate-200 rounded-xl space-y-2 animate-fade-in">
        <p className="text-xs text-slate-600 font-medium">
          PayPal Checkout gateway is reconnecting...
        </p>
        <button
          type="button"
          onClick={handleManualReload}
          className="cursor-pointer inline-flex items-center gap-1.5 text-xs font-bold text-[#003087] bg-white hover:bg-blue-50 px-3.5 py-1.5 rounded-full border border-blue-200 shadow-2xs transition"
        >
          <RefreshCw className="w-3.5 h-3.5 text-[#0070ba]" />
          <span>Reload PayPal Buttons</span>
        </button>
      </div>
    );
  }

  return (
    <div className="relative min-h-[46px]">
      {isPending ? (
        <div className="h-11 w-full rounded-full bg-slate-50 animate-pulse flex items-center justify-center text-xs text-[#003087] font-semibold gap-2 border border-blue-200">
          <RefreshCw className="w-4 h-4 animate-spin text-[#0070ba]" />
          <span>Connecting to PayPal Sandbox Gateway...</span>
        </div>
      ) : (
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
              onSuccess(captureData.captureId || data.orderID);
            } catch (err: any) {
              toast.error(err.message || 'Payment capture failed');
            }
          }}
          onCancel={() => {
            // User closed the PayPal checkout popup window before completing
            toast.info('PayPal checkout window was closed.');
          }}
          onError={(err: any) => {
            const msg = err?.message || String(err || '');
            // Suppress benign cross-origin popup closure warnings from PayPal post-robot
            if (
              msg.includes('Window is closed') ||
              msg.includes('Component closed') ||
              msg.includes('detected') ||
              msg.includes('can not determine type')
            ) {
              return;
            }
            console.error('PayPal error:', err);
            toast.error('PayPal Checkout encountered an issue.');
          }}
        />
      )}
    </div>
  );
}
