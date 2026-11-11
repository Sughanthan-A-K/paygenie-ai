'use client';

import React, { useState } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  ExternalLink, 
  Download, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  Trash2, 
  FileText,
  Mail,
  RefreshCw,
  Send,
  Edit3
} from 'lucide-react';
import { InvoiceData } from '@/types/invoice';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface InvoiceModalProps {
  invoice: InvoiceData;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updated: InvoiceData) => void;
  onDelete?: (invoiceNumber: string) => void;
  preferredLanguage?: 'English' | 'Tanglish' | 'Tamil';
}

export default function InvoiceModal({
  invoice,
  isOpen,
  onClose,
  onUpdate,
  onDelete,
  preferredLanguage = 'English',
}: InvoiceModalProps) {
  const [activeTab, setActiveTab] = useState<'invoice' | 'email'>('invoice');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  
  // Quick Inline Edit Box (Manual or AI)
  const [showEditBox, setShowEditBox] = useState(false);
  const [editPrompt, setEditPrompt] = useState('');
  const [isAiUpdating, setIsAiUpdating] = useState(false);

  // Email state
  const [emailSubject, setEmailSubject] = useState(invoice.emailDraft?.subject || `Invoice ${invoice.invoiceNumber}`);
  const [emailBody, setEmailBody] = useState(invoice.emailDraft?.body || '');
  const [isEditingEmailManual, setIsEditingEmailManual] = useState(false);

  if (!isOpen) return null;

  const clientPayUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/?invoice=${invoice.invoiceNumber}`;

  // Ensure current invoice data is always saved to localStorage before user opens or tests mobile view
  const syncCurrentInvoiceToStorage = () => {
    try {
      const stored = localStorage.getItem('paygenie_invoices');
      let invoices: InvoiceData[] = stored ? JSON.parse(stored) : [];
      const idx = invoices.findIndex((i) => i.invoiceNumber === invoice.invoiceNumber);
      if (idx !== -1) {
        invoices[idx] = invoice;
      } else {
        invoices.unshift(invoice);
      }
      localStorage.setItem('paygenie_invoices', JSON.stringify(invoices));
    } catch (e) {
      console.error(e);
    }
  };

  const handleCopyLink = () => {
    syncCurrentInvoiceToStorage();
    navigator.clipboard.writeText(clientPayUrl);
    setCopiedLink(true);
    toast.success('Client PayPal Checkout Link copied!');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyEmail = () => {
    const fullEmail = `Subject: ${emailSubject}\n\n${emailBody}\n\nClient Pay Link: ${clientPayUrl}`;
    navigator.clipboard.writeText(fullEmail);
    setCopiedEmail(true);
    toast.success('Email text copied to clipboard!');
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const handleDownloadPdf = async () => {
    setIsDownloading(true);
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
        pdf.setTextColor(16, 185, 129);
        pdf.text('STATUS: PAID VIA PAYPAL', pageWidth - 70, 32);
      } else {
        pdf.setTextColor(217, 119, 6);
        pdf.text('STATUS: AWAITING PAYMENT', pageWidth - 70, 32);
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
      pdf.setTextColor(15, 23, 42);
      pdf.text(invoice.sellerName || 'Freelancer / Studio', 19, 58);
      pdf.text(invoice.clientName || 'Valued Client', 24 + (pageWidth - 35) / 2, 58);

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9);
      pdf.setTextColor(100, 116, 139);
      pdf.text(invoice.sellerEmail || 'billing@merchant.com', 19, 65);
      pdf.text(invoice.clientEmail || 'client@example.com', 24 + (pageWidth - 35) / 2, 65);

      // Line items table header
      let y = 82;
      const rightMargin = 20;
      const totalColX = pageWidth - rightMargin; // Alignment anchor for the right edge of total amounts

      pdf.setFillColor(241, 245, 249);
      pdf.rect(15, y, pageWidth - 30, 8, 'F');
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(9);
      pdf.setTextColor(71, 85, 105);
      pdf.text('DESCRIPTION', 18, y + 5.5);
      pdf.text('QTY', totalColX - 55, y + 5.5, { align: 'right' });
      pdf.text('RATE', totalColX - 30, y + 5.5, { align: 'right' });
      pdf.text('TOTAL', totalColX, y + 5.5, { align: 'right' });

      // Line items
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(15, 23, 42);
      y += 13;

      invoice.items.forEach((item) => {
        pdf.text(item.description, 18, y);
        pdf.text(String(item.quantity), totalColX - 55, y, { align: 'right' });
        pdf.text(`$${(item.unitPrice || 0).toFixed(2)}`, totalColX - 30, y, { align: 'right' });
        pdf.setFont('helvetica', 'bold');
        pdf.text(`$${(item.total || 0).toFixed(2)}`, totalColX, y, { align: 'right' });
        pdf.setFont('helvetica', 'normal');
        y += 8;
      });

      // Total calculations box
      y += 4;
      pdf.setDrawColor(226, 232, 240);
      pdf.line(15, y, pageWidth - 15, y);
      y += 8;

      pdf.setFontSize(9);
      pdf.setTextColor(100, 116, 139);
      pdf.text('Subtotal:', totalColX - 45, y, { align: 'right' });
      pdf.text(`$${invoice.subtotal.toFixed(2)}`, totalColX, y, { align: 'right' });
      y += 6;

      if (invoice.discountAmount > 0) {
        pdf.setTextColor(16, 185, 129);
        pdf.text(`Discount (${invoice.discountPercentage}%):`, totalColX - 45, y, { align: 'right' });
        pdf.text(`-$${invoice.discountAmount.toFixed(2)}`, totalColX, y, { align: 'right' });
        y += 6;
      }

      if (invoice.taxAmount > 0) {
        pdf.setTextColor(100, 116, 139);
        pdf.text(`Tax (${invoice.taxPercentage}%):`, totalColX - 45, y, { align: 'right' });
        pdf.text(`+$${invoice.taxAmount.toFixed(2)}`, totalColX, y, { align: 'right' });
        y += 6;
      }

      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(0, 48, 135);
      pdf.text('Total Amount Due:', totalColX - 45, y + 2, { align: 'right' });
      pdf.text(`$${invoice.totalAmount.toFixed(2)} ${invoice.currency}`, totalColX, y + 2, { align: 'right' });

      // Client pay url footer note
      y += 18;
      pdf.setFillColor(240, 247, 255);
      pdf.roundedRect(15, y, pageWidth - 30, 22, 3, 3, 'FD');
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(0, 48, 135);
      pdf.text('Direct PayPal Online Settlement Link:', 19, y + 7);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);
      pdf.setTextColor(71, 85, 105);
      pdf.text(clientPayUrl, 19, y + 14);

      pdf.save(`${invoice.invoiceNumber}.pdf`);
      toast.success('PDF exported successfully!');
    } catch (err: any) {
      console.error('PDF generation error:', err);
      toast.error('Failed to export PDF');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleQuickAiEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editPrompt.trim() || isAiUpdating) return;

    setIsAiUpdating(true);
    try {
      const isEmailAction = activeTab === 'email';
      const promptInstruction = isEmailAction
        ? `Update the emailDraft for invoice ${invoice.invoiceNumber}. Tone/instruction: ${editPrompt}`
        : `Update invoice ${invoice.invoiceNumber}: ${editPrompt}`;

      const res = await fetch('/api/genie-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userMessage: promptInstruction,
          currentInvoice: invoice,
          clientProfile: { name: invoice.clientName, email: invoice.clientEmail },
          preferredLanguage,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update with AI');

      if (data.invoice) {
        onUpdate(data.invoice);
        toast.success(isEmailAction ? 'Email draft updated by AI!' : 'Invoice updated by AI!');
        if (data.invoice.emailDraft) {
          setEmailSubject(data.invoice.emailDraft.subject);
          setEmailBody(data.invoice.emailDraft.body);
        }
      }
      setEditPrompt('');
      setShowEditBox(false);
    } catch (err: any) {
      toast.error(err.message || 'AI update failed');
    } finally {
      setIsAiUpdating(false);
    }
  };

  const handleSaveManualEmail = () => {
    const updated: InvoiceData = {
      ...invoice,
      emailDraft: {
        subject: emailSubject,
        body: emailBody,
        template: invoice.emailDraft?.template,
      },
    };
    onUpdate(updated);
    setIsEditingEmailManual(false);
    toast.success('Email draft saved!');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div 
        className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <span className="font-mono text-sm font-bold bg-[#003087]/10 text-[#003087] px-3 py-1 rounded-full border border-[#003087]/20">
              {invoice.invoiceNumber}
            </span>
            <span className="text-sm font-bold text-slate-700">
              {invoice.clientName}
            </span>
            {invoice.status === 'PAID' ? (
              <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5" /> PAID VIA PAYPAL
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                <Clock className="w-3.5 h-3.5" /> AWAITING PAYMENT
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowEditBox(!showEditBox)}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#003087] bg-white hover:bg-blue-50 px-3.5 py-1.5 rounded-full border border-blue-200 transition shadow-2xs"
            >
              <Edit3 className="w-3.5 h-3.5 text-[#0070ba]" />
              <span>
                {showEditBox
                  ? 'Close Box'
                  : activeTab === 'invoice'
                  ? 'Edit Invoice (AI)'
                  : 'Edit Email (AI)'}
              </span>
            </button>

            {onDelete && (
              <button
                type="button"
                onClick={() => {
                  if (confirm(`Delete invoice ${invoice.invoiceNumber}?`)) {
                    onDelete(invoice.invoiceNumber);
                    onClose();
                  }
                }}
                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition"
                title="Delete invoice"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-full transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick Inline AI / Manual Edit Box (Drops down on demand, dynamic based on tab) */}
        {showEditBox && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200 p-4 animate-fade-in">
            <form onSubmit={handleQuickAiEdit} className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#003087] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#0070ba]" />
                  <span>
                    {activeTab === 'invoice'
                      ? 'AI Invoice Line Items & Tax Editor'
                      : 'AI Email Tone & Content Polish'}
                  </span>
                </span>
                <span className="text-[11px] text-slate-500">
                  Target: <strong>{activeTab === 'invoice' ? 'Invoice Rates / Totals' : 'Client Email'}</strong>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={editPrompt}
                  disabled={isAiUpdating}
                  onChange={(e) => setEditPrompt(e.target.value)}
                  placeholder={
                    activeTab === 'invoice'
                      ? "e.g. 'Add 10% tax', 'Change rate to $75/hr', 'Add 5% early discount'..."
                      : "e.g. 'Make it friendly & casual', 'Add urgent payment deadline', 'Mention 2 weeks guarantee'..."
                  }
                  className="flex-1 bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-[#001435] focus:outline-none focus:border-[#0070ba] font-medium"
                />
                <button
                  type="submit"
                  disabled={isAiUpdating || !editPrompt.trim()}
                  className="pp-button-primary !py-2.5 !px-5 !text-xs flex items-center gap-1.5"
                >
                  {isAiUpdating ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Updating...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{activeTab === 'invoice' ? 'Apply to Invoice' : 'Apply to Email'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Client Pay URL Share Bar */}
        <div className="bg-blue-50/70 border-b border-blue-100 px-6 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-600 truncate max-w-md font-mono">
            <span className="font-bold text-[#003087]">Client Pay URL:</span>
            <span className="truncate bg-white px-2.5 py-1 rounded border border-blue-200">{clientPayUrl}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 text-xs font-bold bg-[#0070ba] text-white hover:bg-[#003087] px-3.5 py-1.5 rounded-full shadow-2xs transition"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'Copied' : 'Copy Pay Link'}</span>
            </button>
            <a
              href={clientPayUrl}
              target="_blank"
              rel="noreferrer"
              onClick={syncCurrentInvoiceToStorage}
              className="inline-flex items-center gap-1 text-xs font-bold text-[#003087] bg-white hover:bg-blue-50 px-3 py-1.5 rounded-full border border-blue-200 shadow-2xs transition"
            >
              <span>Test Client Mobile View</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 px-6 bg-white gap-6 text-sm font-bold">
          <button
            onClick={() => setActiveTab('invoice')}
            className={`py-3.5 border-b-2 flex items-center gap-2 transition ${
              activeTab === 'invoice'
                ? 'border-[#003087] text-[#003087]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Invoice Details</span>
          </button>
          <button
            onClick={() => setActiveTab('email')}
            className={`py-3.5 border-b-2 flex items-center gap-2 transition ${
              activeTab === 'email'
                ? 'border-[#003087] text-[#003087]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Mail className="w-4 h-4" />
            <span>Ready-to-Send Email</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'invoice' && (
            <div className="space-y-4">
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  disabled={isDownloading}
                  className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3.5 py-1.5 rounded-full border border-slate-300 transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{isDownloading ? 'Exporting PDF...' : 'Download PDF'}</span>
                </button>
              </div>

              {/* Rendered Invoice Paper Container */}
              <div id="modal-invoice-paper" className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-6">
                <div className="flex justify-between items-start border-b border-slate-200 pb-4">
                  <div>
                    <h3 className="text-2xl font-black text-[#001435]">Invoice</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Date: {invoice.date} | Due: {invoice.dueDate}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total Due</span>
                    <span className="text-2xl font-black text-[#003087]">
                      ${invoice.totalAmount.toFixed(2)} {invoice.currency}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="p-3 bg-white rounded-xl border border-slate-200">
                    <span className="text-slate-400 font-bold block uppercase text-[10px]">Billed From</span>
                    <span className="font-bold text-slate-900 text-sm block mt-0.5">{invoice.sellerName}</span>
                    <span className="text-slate-500">{invoice.sellerEmail || 'billing@merchant.com'}</span>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-200">
                    <span className="text-slate-400 font-bold block uppercase text-[10px]">Billed To</span>
                    <span className="font-bold text-slate-900 text-sm block mt-0.5">{invoice.clientName}</span>
                    <span className="text-slate-500">{invoice.clientEmail}</span>
                  </div>
                </div>

                {/* Line items table */}
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-100/70 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-200">
                        <th className="p-3">Description</th>
                        <th className="p-3 text-center">Qty</th>
                        <th className="p-3 text-right">Rate</th>
                        <th className="p-3 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {invoice.items.map((it, idx) => (
                        <tr key={idx}>
                          <td className="p-3 font-semibold text-slate-800">{it.description}</td>
                          <td className="p-3 text-center text-slate-600">{it.quantity}</td>
                          <td className="p-3 text-right text-slate-600">${(it.unitPrice || 0).toFixed(2)}</td>
                          <td className="p-3 text-right font-black text-slate-900">${(it.total || 0).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="p-3 bg-slate-50/50 border-t border-slate-200 flex flex-col items-end space-y-1 text-xs">
                    <div className="flex justify-between w-48 text-slate-500">
                      <span>Subtotal:</span>
                      <span>${invoice.subtotal.toFixed(2)}</span>
                    </div>
                    {invoice.discountAmount > 0 && (
                      <div className="flex justify-between w-48 text-emerald-600">
                        <span>Discount ({invoice.discountPercentage}%):</span>
                        <span>-${invoice.discountAmount.toFixed(2)}</span>
                      </div>
                    )}
                    {invoice.taxAmount > 0 && (
                      <div className="flex justify-between w-48 text-slate-500">
                        <span>Tax ({invoice.taxPercentage}%):</span>
                        <span>+${invoice.taxAmount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between w-48 pt-1 border-t border-slate-200 font-black text-sm text-[#003087]">
                      <span>Total:</span>
                      <span>${invoice.totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {invoice.notes && (
                  <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs text-slate-600">
                    <span className="font-bold text-slate-800 block mb-0.5">Notes & Terms:</span>
                    {invoice.notes}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'email' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-700">Client Ready Notification Email</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSaveManualEmail}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3.5 py-1.5 rounded-full border border-emerald-300 transition"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Save Edits</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleCopyEmail}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0070ba] bg-blue-50 hover:bg-blue-100 px-3.5 py-1.5 rounded-full border border-blue-200 transition"
                  >
                    {copiedEmail ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedEmail ? 'Copied' : 'Copy Email Text'}</span>
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  placeholder="Subject line..."
                  className="w-full bg-[#f8fafc] border border-slate-300 rounded-xl p-3 text-sm font-bold text-slate-900 focus:outline-none focus:bg-white focus:border-[#0070ba]"
                />
                <textarea
                  rows={8}
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  placeholder="Email body text..."
                  className="w-full bg-[#f8fafc] border border-slate-300 rounded-xl p-3.5 text-sm text-slate-800 focus:outline-none focus:bg-white focus:border-[#0070ba] leading-relaxed resize-none"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 flex items-center justify-between">
                <span>Client payment link is included in the footer of the email.</span>
                <span className="font-mono font-bold text-[#003087]">{invoice.invoiceNumber}</span>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
