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
  Edit3,
  FileSpreadsheet,
  Trash2
} from 'lucide-react';
import { PayPalButtons } from '@paypal/react-paypal-js';
import { InvoiceData } from '@/types/invoice';
import { toast } from 'sonner';

interface MobileDeviceFrameProps {
  prompt: string;
  setPrompt: (val: string) => void;
  invoice: InvoiceData | null;
  loading: boolean;
  samplePrompts?: string[];
  history?: InvoiceData[];
  isBothView?: boolean;
  onGenerate: (text?: string) => void;
  onPaymentSuccess: (paymentId: string) => void;
  onDownloadPDF?: () => void;
  onSelectInvoice?: (inv: InvoiceData) => void;
  onUpdateInvoice?: (updated: InvoiceData) => void;
}

export default function MobileDeviceFrame({
  prompt,
  setPrompt,
  invoice,
  loading,
  samplePrompts = [],
  history = [],
  isBothView = true,
  onGenerate,
  onPaymentSuccess,
  onDownloadPDF,
  onSelectInvoice,
  onUpdateInvoice,
}: MobileDeviceFrameProps) {
  const [mobileTab, setMobileTab] = useState<'prompt' | 'bill' | 'invoices'>('prompt');
  const [copied, setCopied] = useState(false);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [emailSubject, setEmailSubject] = useState(invoice?.emailDraft?.subject || '');
  const [emailBody, setEmailBody] = useState(invoice?.emailDraft?.body || '');
  const [emailTone, setEmailTone] = useState<'formal' | 'friendly' | 'urgent'>('formal');

  // Auto-switch to bill tab when an invoice is generated/selected
  React.useEffect(() => {
    if (invoice) {
      setMobileTab('bill');
      if (invoice.emailDraft) {
        setEmailSubject(invoice.emailDraft.subject);
        setEmailBody(invoice.emailDraft.body);
      }
    }
  }, [invoice]);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(`Subject: ${emailSubject}\n\n${emailBody}`);
    setCopied(true);
    toast.success('Mobile: Copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const applyMobileEmailTone = (tone: 'formal' | 'friendly' | 'urgent') => {
    if (!invoice) return;
    setEmailTone(tone);
    let newSubject = '';
    let newBody = '';

    if (tone === 'formal') {
      newSubject = `Official Invoice ${invoice.invoiceNumber} from ${invoice.sellerName}`;
      newBody = `Dear ${invoice.clientName},\n\nPlease find attached invoice ${invoice.invoiceNumber} for the total amount of $${invoice.totalAmount.toFixed(2)} USD due on ${invoice.dueDate}.\n\nYou can settle this payment instantly via PayPal using our secure checkout link.\n\nThank you for your business.\n\nSincerely,\n${invoice.sellerName}`;
    } else if (tone === 'friendly') {
      newSubject = `Hey ${invoice.clientName}! Your invoice ${invoice.invoiceNumber} is ready 😊`;
      newBody = `Hi ${invoice.clientName}!\n\nHope you're having a fantastic week. Just sending over invoice ${invoice.invoiceNumber} for $${invoice.totalAmount.toFixed(2)} USD (due ${invoice.dueDate}).\n\nWhenever you're ready, click the PayPal button to settle it with one click.\n\nCheers,\n${invoice.sellerName}`;
    } else if (tone === 'urgent') {
      newSubject = `[Action Required] Payment Due Soon: Invoice ${invoice.invoiceNumber}`;
      newBody = `Hello ${invoice.clientName},\n\nThis is a friendly reminder that invoice ${invoice.invoiceNumber} for $${invoice.totalAmount.toFixed(2)} USD is due on ${invoice.dueDate}.\n\nTo ensure uninterrupted services, please complete settlement via PayPal.\n\nRegards,\n${invoice.sellerName}`;
    }

    setEmailSubject(newSubject);
    setEmailBody(newBody);

    if (onUpdateInvoice) {
      onUpdateInvoice({
        ...invoice,
        emailDraft: {
          subject: newSubject,
          body: newBody,
          template: tone,
        },
      });
    }
  };

  const handleSaveMobileEmail = () => {
    setIsEditingEmail(false);
    if (invoice && onUpdateInvoice) {
      onUpdateInvoice({
        ...invoice,
        emailDraft: {
          subject: emailSubject,
          body: emailBody,
          template: emailTone,
        },
      });
    }
    toast.success('Mobile: Email draft saved!');
  };

  return (
    <div className="relative mx-auto w-full max-w-[380px] select-none">
      
      {/* Top Header Label — ONLY show sync tag when in Both View */}
      {isBothView ? (
        <div className="flex items-center justify-between pb-3 px-2 text-xs font-semibold text-slate-700">
          <span className="inline-flex items-center gap-1.5 text-[#003087]">
            <Smartphone className="w-3.5 h-3.5" />
            <span>Mobile Client</span>
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-300">
            <span className="w-2 h-2 rounded-full bg-emerald-600" />
            Live Synced with Web
          </span>
        </div>
      ) : (
        <div className="pb-3 px-2 text-xs font-semibold text-slate-700 flex items-center gap-1.5 text-[#003087]">
          <Smartphone className="w-3.5 h-3.5" />
          <span>PayGenie Mobile Workspace</span>
        </div>
      )}

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

          {/* Mobile In-App Top Bar */}
          <div className="px-3.5 py-2.5 bg-[#f5f7fa] border-b border-slate-200 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-[#003087] text-white flex items-center justify-center font-black text-xs">
                P
              </div>
              <div className="leading-tight">
                <span className="font-extrabold text-xs tracking-tight text-[#001435] block">
                  PayGenie <span className="text-[#0070ba]">Pay</span>
                </span>
                <span className="text-[10px] text-slate-500 font-medium">Customer Checkout</span>
              </div>
            </div>

            {/* Mobile Tab Pills: Prompt | Bill & Pay | Invoices (Ledger) */}
            <div className="flex bg-slate-200/80 p-0.5 rounded-full text-[11px] font-bold">
              <button
                type="button"
                onClick={() => setMobileTab('prompt')}
                className={`px-2.5 py-1 rounded-full transition cursor-pointer ${
                  mobileTab === 'prompt'
                    ? 'bg-white text-[#003087] shadow-xs'
                    : 'text-slate-700'
                }`}
              >
                Prompt
              </button>
              <button
                type="button"
                onClick={() => setMobileTab('bill')}
                className={`px-2.5 py-1 rounded-full transition cursor-pointer ${
                  mobileTab === 'bill'
                    ? 'bg-white text-[#003087] shadow-xs'
                    : 'text-slate-700'
                }`}
              >
                Bill & Pay
              </button>
              <button
                type="button"
                onClick={() => setMobileTab('invoices')}
                className={`px-2 py-1 rounded-full transition cursor-pointer ${
                  mobileTab === 'invoices'
                    ? 'bg-white text-[#003087] shadow-xs'
                    : 'text-slate-700'
                }`}
              >
                Invoices ({history.length})
              </button>
            </div>
          </div>

          {/* Scrollable Mobile Screen Body without visible scrollbar */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs no-scrollbar">
            
            {/* TAB 1: PROMPT */}
            {mobileTab === 'prompt' ? (
              <div className="space-y-3">
                <div className="bg-[#f5f7fa] p-3.5 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-[#003087] text-white flex items-center justify-center font-bold text-[10px]">
                        01
                      </div>
                      <span className="text-xs font-bold text-[#001435]">
                        Describe Rates & Work
                      </span>
                    </div>
                    <Sparkles className="w-3.5 h-3.5 text-[#0070ba]" />
                  </div>

                  <textarea
                    rows={4}
                    value={prompt}
                    disabled={loading}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Type invoice instructions here..."
                    className="w-full min-h-[90px] max-h-[140px] bg-white border border-slate-300 rounded-xl p-2.5 text-xs text-[#001435] focus:outline-none focus:border-[#0070ba] resize-none disabled:opacity-60"
                  />

                  {/* Mobile Quick Scenario Presets */}
                  {samplePrompts.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
                        Quick Scenario Presets:
                      </span>
                      <div className="space-y-1.5">
                        {samplePrompts.map((sample, idx) => (
                          <button
                            key={idx}
                            type="button"
                            disabled={loading}
                            onClick={() => {
                              setPrompt(sample);
                              onGenerate(sample);
                            }}
                            className="w-full cursor-pointer text-left text-[11px] bg-white hover:bg-blue-50/60 hover:border-blue-300 text-slate-700 p-2.5 rounded-xl border border-slate-200 transition font-medium leading-snug shadow-2xs disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {sample}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <button
                    type="button"
                    disabled={loading || !prompt.trim()}
                    onClick={() => onGenerate()}
                    className="w-full pp-button-primary !py-2.5 !text-xs disabled:opacity-50 mt-1"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Parsing with Gemini AI...</span>
                      </>
                    ) : (
                      <span>Generate & Settle</span>
                    )}
                  </button>
                </div>

                {isBothView && (
                  <div className="text-[11px] text-slate-600 bg-blue-50/70 p-2.5 rounded-xl border border-blue-200 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0" />
                    <span><strong>Bi-directional sync:</strong> Live synced with Web workspace.</span>
                  </div>
                )}
              </div>
            ) : mobileTab === 'invoices' ? (
              /* TAB 2: MOBILE INVOICES LIST (LEDGER) */
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="text-xs font-bold text-[#001435]">Saved Invoices ({history.length})</span>
                  <span className="text-[10px] text-slate-500">Tap to load & settle</span>
                </div>

                {history.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 space-y-2">
                    <FileSpreadsheet className="w-8 h-8 mx-auto text-slate-300" />
                    <p className="font-bold text-xs text-slate-600">No Invoices Yet</p>
                    <p className="text-[11px]">Generate your first invoice in the Prompt tab.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {history.map((inv, idx) => (
                      <div
                        key={idx}
                        onClick={() => {
                          if (onSelectInvoice) onSelectInvoice(inv);
                          setMobileTab('bill');
                        }}
                        className="cursor-pointer bg-white p-3 rounded-xl border border-slate-200 hover:border-[#0070ba] hover:shadow-xs transition space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs font-bold text-[#003087]">{inv.invoiceNumber}</span>
                          {inv.status === 'PAID' ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                              PAID
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                              DUE
                            </span>
                          )}
                        </div>
                        <div className="flex justify-between items-baseline">
                          <span className="font-bold text-xs text-[#001435] truncate max-w-[180px]">{inv.clientName}</span>
                          <span className="font-black text-xs text-[#003087]">${inv.totalAmount.toFixed(2)}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 flex justify-between">
                          <span>Date: {inv.date}</span>
                          <span className="text-[#0070ba] font-bold">View & Settle →</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : invoice ? (
              /* TAB 3: BILL & PAY (CHECKOUT & EMAIL EDITOR) */
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
                    <div>
                      <PayPalButtons
                        style={{ layout: 'vertical', shape: 'pill', label: 'pay', height: 42, color: 'gold' }}
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

                {/* Mobile Direct Editable Email Drawer */}
                {invoice.emailDraft && (
                  <div className="bg-white p-3.5 rounded-2xl border border-slate-200 space-y-2.5">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <span className="text-xs font-bold text-[#001435]">Client Notification Email</span>
                      <div className="flex gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            if (isEditingEmail) handleSaveMobileEmail();
                            else setIsEditingEmail(true);
                          }}
                          className="cursor-pointer text-[10px] font-bold px-2 py-1 rounded-full border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition"
                        >
                          {isEditingEmail ? 'Save' : 'Edit'}
                        </button>
                        <button
                          type="button"
                          onClick={handleCopyEmail}
                          className="cursor-pointer text-[10px] font-bold px-2 py-1 rounded-full bg-[#003087] text-white transition flex items-center gap-1"
                        >
                          {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          <span>{copied ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Tone chips */}
                    <div className="flex items-center gap-1 text-[10px]">
                      <span className="text-slate-400 font-bold">Tone:</span>
                      {(['formal', 'friendly', 'urgent'] as const).map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => applyMobileEmailTone(t)}
                          className={`cursor-pointer px-2 py-0.5 rounded-full capitalize font-semibold transition ${
                            emailTone === t ? 'bg-[#003087] text-white' : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>

                    {isEditingEmail ? (
                      <div className="space-y-1.5">
                        <input
                          type="text"
                          value={emailSubject}
                          onChange={(e) => setEmailSubject(e.target.value)}
                          placeholder="Subject..."
                          className="w-full bg-[#f8fafc] border border-slate-200 rounded-lg p-2 text-[11px] font-bold text-[#001435]"
                        />
                        <textarea
                          rows={4}
                          value={emailBody}
                          onChange={(e) => setEmailBody(e.target.value)}
                          placeholder="Body..."
                          className="w-full bg-[#f8fafc] border border-slate-200 rounded-lg p-2 text-[11px] text-slate-700 font-sans resize-none"
                        />
                      </div>
                    ) : (
                      <div className="bg-[#f8fafc] p-2.5 rounded-xl border border-slate-200 space-y-1 text-[11px]">
                        <p className="font-bold text-[#001435] line-clamp-1">Sub: {emailSubject}</p>
                        <p className="whitespace-pre-line text-slate-600 font-sans line-clamp-4">{emailBody}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Mobile Quick Action Buttons */}
                {onDownloadPDF && (
                  <button
                    type="button"
                    onClick={onDownloadPDF}
                    className="w-full cursor-pointer py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] flex items-center justify-center gap-1.5 transition border border-slate-200"
                  >
                    <Download className="w-3.5 h-3.5 text-[#0070ba]" />
                    <span>Download PDF Invoice</span>
                  </button>
                )}

              </div>
            ) : (
              /* Mobile Empty State */
              <div className="text-center py-16 px-4 space-y-3 text-slate-400">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                  <CreditCard className="w-6 h-6" />
                </div>
                <p className="font-bold text-xs text-slate-600">No Active Bill</p>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Generate an invoice in the Prompt tab or pick one from the Invoices tab.
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
