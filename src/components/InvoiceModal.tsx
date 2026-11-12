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
  Edit3,
  FileCode,
  Eye,
  Settings,
  Plus
} from 'lucide-react';
import { InvoiceData, CustomTemplateItem } from '@/types/invoice';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { getStoredTemplates, TemplateManagerModal } from '@/components/TemplateManagerModal';

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
  initialTab = 'invoice',
}: InvoiceModalProps & { initialTab?: 'invoice' | 'email' | 'whatsapp' }) {
  const [activeTab, setActiveTab] = useState<'invoice' | 'email' | 'whatsapp'>(initialTab);
  const [isPdfPreviewOpen, setIsPdfPreviewOpen] = useState(false);
  const [pdfDataUri, setPdfDataUri] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedWhatsApp, setCopiedWhatsApp] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  
  // Quick Inline Edit Box (Manual or AI)
  const [showEditBox, setShowEditBox] = useState(false);
  const [editPrompt, setEditPrompt] = useState('');
  const [isAiUpdating, setIsAiUpdating] = useState(false);

  // Email & WhatsApp message states
  const [emailSubject, setEmailSubject] = useState(invoice.emailDraft?.subject || `Invoice ${invoice.invoiceNumber}`);
  const [emailBody, setEmailBody] = useState(invoice.emailDraft?.body || '');
  const [isEditingEmailManual, setIsEditingEmailManual] = useState(false);

  // WhatsApp Message custom state (Editable via AI or manual unlock)
  const defaultWhatsAppText = `Hello ${invoice.clientName || 'there'}! Here is your official invoice ${invoice.invoiceNumber} for $${invoice.totalAmount.toFixed(2)} ${invoice.currency || 'USD'}.\n\nYou can easily review, download the PDF and settle securely via PayPal here:\n${typeof window !== 'undefined' ? window.location.origin : ''}/?invoice=${invoice.invoiceNumber}\n\nThank you for your business!`;
  const [whatsAppText, setWhatsAppText] = useState(defaultWhatsAppText);
  const [isEditingWhatsAppManual, setIsEditingWhatsAppManual] = useState(false);

  // Template Manager Modal state & dynamic template list
  const [isTemplateManagerOpen, setIsTemplateManagerOpen] = useState(false);
  const [allTemplates, setAllTemplates] = useState<CustomTemplateItem[]>([]);

  const reloadTemplates = () => {
    setAllTemplates(getStoredTemplates());
  };

  React.useEffect(() => {
    reloadTemplates();
  }, [isOpen]);

  // Delete confirmation modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Reset tab to initialTab whenever modal opens or invoice changes
  React.useEffect(() => {
    setActiveTab(initialTab);
    setShowEditBox(false);
    setIsEditingEmailManual(false);
    setIsEditingWhatsAppManual(false);
  }, [isOpen, invoice.invoiceNumber, initialTab]);

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

  const generatePdfInstance = () => {
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
    const totalColX = pageWidth - rightMargin;

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

    return pdf;
  };

  const handleDownloadPdf = async () => {
    setIsDownloading(true);
    try {
      const pdf = generatePdfInstance();
      pdf.save(`${invoice.invoiceNumber}.pdf`);
      toast.success('PDF exported successfully!');
    } catch (err: any) {
      console.error('PDF generation error:', err);
      toast.error('Failed to export PDF');
    } finally {
      setIsDownloading(false);
    }
  };

  // Open floating PDF Preview Modal directly from the Preview PDF button
  const handleOpenPdfPreviewModal = () => {
    try {
      const pdf = generatePdfInstance();
      const uri = pdf.output('datauristring');
      setPdfDataUri(uri);
      setIsPdfPreviewOpen(true);
    } catch (e) {
      console.error(e);
      toast.error('Failed to render PDF preview');
    }
  };

  const handleQuickAiEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editPrompt.trim() || isAiUpdating) return;

    setIsAiUpdating(true);
    try {
      if (activeTab === 'whatsapp') {
        const promptInstruction = `Polish and generate the single text message for a WhatsApp message to client ${invoice.clientName} regarding invoice ${invoice.invoiceNumber} for $${invoice.totalAmount.toFixed(2)} ${invoice.currency}. User instruction/tone: ${editPrompt}. Return only the clean message body ready to send on WhatsApp with emojis where appropriate and PayPal link placeholder ${clientPayUrl}.`;

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

        if (data.reply) {
          // Clean quotes if returned
          const cleanText = data.reply.replace(/^["']|["']$/g, '').trim();
          setWhatsAppText(cleanText);
          toast.success('WhatsApp text updated with AI polish!');
        }
      } else {
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
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1.5 bg-[#003087]/10 text-[#003087] pl-3 pr-2 py-1 rounded-full border border-[#003087]/20">
              <span className="font-mono text-xs sm:text-sm font-bold">
                {invoice.invoiceNumber}
              </span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(invoice.invoiceNumber);
                  toast.success(`Copied invoice ID: ${invoice.invoiceNumber}`);
                }}
                className="cursor-pointer p-1 text-[#003087] hover:text-[#0070ba] hover:bg-blue-100/60 rounded-full transition"
                title="Copy Invoice ID"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>

            <span className="text-sm font-bold text-slate-700 hidden sm:inline">
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
            {/* Context-aware Edit Trigger: For Invoice = AI prompt box, For Email/WhatsApp = Toggle unlock manual & AI edits */}
            <button
              type="button"
              onClick={() => {
                if (activeTab === 'email') {
                  setIsEditingEmailManual(!isEditingEmailManual);
                } else if (activeTab === 'whatsapp') {
                  setIsEditingWhatsAppManual(!isEditingWhatsAppManual);
                } else {
                  setShowEditBox(!showEditBox);
                }
              }}
              className={`cursor-pointer inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-1.5 rounded-full border transition shadow-2xs ${
                (activeTab === 'invoice'
                  ? showEditBox
                  : activeTab === 'email'
                  ? isEditingEmailManual
                  : isEditingWhatsAppManual)
                  ? 'bg-[#003087] text-white border-[#003087]'
                  : 'text-[#003087] bg-white hover:bg-blue-50 border-blue-200'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>
                {activeTab === 'invoice'
                  ? showEditBox ? 'Close AI Editor' : 'Edit Invoice (AI)'
                  : activeTab === 'email'
                  ? isEditingEmailManual ? 'Lock & Save Email' : 'Edit Email'
                  : isEditingWhatsAppManual ? 'Lock & Save WhatsApp' : 'Edit WhatsApp (AI)'}
              </span>
            </button>

            {/* In email or whatsapp tab, if manual edit is active, also offer AI tone assistant toggle */}
            {(activeTab === 'email' && isEditingEmailManual) || (activeTab === 'whatsapp' && isEditingWhatsAppManual) ? (
              <button
                type="button"
                onClick={() => setShowEditBox(!showEditBox)}
                className="cursor-pointer inline-flex items-center gap-1 text-xs font-bold text-[#0070ba] bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-full border border-blue-200 transition"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Tone Assistant</span>
              </button>
            ) : null}

            {onDelete && (
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(true)}
                className="cursor-pointer p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition"
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
                      : activeTab === 'whatsapp'
                      ? 'AI WhatsApp Message & Tone Polish'
                      : 'AI Email Tone & Content Polish'}
                  </span>
                </span>
                <span className="text-[11px] text-slate-500">
                  Target: <strong>{activeTab === 'invoice' ? 'Invoice Rates / Totals' : activeTab === 'whatsapp' ? 'WhatsApp Message' : 'Client Email'}</strong>
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
                      : activeTab === 'whatsapp'
                      ? "e.g. 'Make it friendly Tamil/Tanglish', 'Short & punchy', 'Remind urgent payment'..."
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
                      <span>{activeTab === 'invoice' ? 'Apply to Invoice' : activeTab === 'whatsapp' ? 'Apply to WhatsApp' : 'Apply to Email'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Client Pay URL Share Bar with Test View & Copy Link */}
        <div className="bg-blue-50/70 border-b border-blue-100 px-6 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-600 truncate max-w-md font-mono">
            <span className="font-bold text-[#003087]">Client Pay URL:</span>
            <span className="truncate bg-white px-2.5 py-1 rounded border border-blue-200">{clientPayUrl}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 text-xs font-bold bg-white text-slate-700 hover:bg-slate-100 px-3.5 py-1.5 rounded-full border border-slate-300 shadow-2xs transition cursor-pointer"
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

        {/* Tabs (3 Clean Tabs: Details, Email, WhatsApp) */}
        <div className="flex border-b border-slate-200 px-6 bg-white gap-6 text-sm font-bold">
          <button
            onClick={() => setActiveTab('invoice')}
            className={`py-3.5 border-b-2 flex items-center gap-2 transition cursor-pointer ${
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
            className={`py-3.5 border-b-2 flex items-center gap-2 transition cursor-pointer ${
              activeTab === 'email'
                ? 'border-[#003087] text-[#003087]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Mail className="w-4 h-4" />
            <span>Ready-to-Send Email</span>
          </button>

          <button
            onClick={() => setActiveTab('whatsapp')}
            className={`py-3.5 border-b-2 flex items-center gap-2 transition cursor-pointer ${
              activeTab === 'whatsapp'
                ? 'border-[#25D366] text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <svg className="w-4 h-4 fill-emerald-600" viewBox="0 0 24 24">
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
            </svg>
            <span>WhatsApp Message</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'invoice' && (
            <div className="space-y-4">
              <div className="flex justify-end items-center gap-2">
                <button
                  type="button"
                  onClick={handleOpenPdfPreviewModal}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#003087] bg-white hover:bg-blue-50 px-3.5 py-1.5 rounded-full border border-blue-200 transition shadow-2xs cursor-pointer"
                  title="Open live printable vector PDF preview"
                >
                  <Eye className="w-3.5 h-3.5 text-[#0070ba]" />
                  <span>Preview PDF</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  disabled={isDownloading}
                  className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3.5 py-1.5 rounded-full border border-slate-300 transition cursor-pointer"
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
                    <span className="text-slate-500 block">{invoice.clientEmail}</span>
                    {invoice.clientPhone && (
                      <span className="text-slate-500 block text-[11px] font-medium text-emerald-700 mt-0.5">
                        WhatsApp: {invoice.clientPhone}
                      </span>
                    )}
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
              {/* Email Tone One-Click Templates & Actions Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 gap-4">
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs">
                  <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px] shrink-0 mr-1">
                    Tone Templates:
                  </span>
                  {allTemplates
                    .filter((t) => t.type === 'email')
                    .map((tmpl) => (
                      <button
                        key={tmpl.id}
                        type="button"
                        onClick={() => {
                          const compiledSubject = (tmpl.subject || `Invoice ${invoice.invoiceNumber}`)
                            .replace(/\{\{invoiceNumber\}\}/g, invoice.invoiceNumber)
                            .replace(/\{\{clientName\}\}/g, invoice.clientName || 'there')
                            .replace(/\{\{sellerName\}\}/g, invoice.sellerName || 'Merchant');

                          const compiledBody = tmpl.content
                            .replace(/\{\{invoiceNumber\}\}/g, invoice.invoiceNumber)
                            .replace(/\{\{clientName\}\}/g, invoice.clientName || 'there')
                            .replace(/\{\{sellerName\}\}/g, invoice.sellerName || 'Merchant')
                            .replace(/\{\{totalAmount\}\}/g, invoice.totalAmount.toFixed(2))
                            .replace(/\{\{currency\}\}/g, invoice.currency || 'USD')
                            .replace(/\{\{dueDate\}\}/g, invoice.dueDate || '')
                            .replace(/\{\{payUrl\}\}/g, clientPayUrl);

                          setEmailSubject(compiledSubject);
                          setEmailBody(compiledBody);
                          toast.info(`Applied "${tmpl.name}" template`);
                        }}
                        className="cursor-pointer shrink-0 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-50 text-[#003087] hover:bg-blue-100 font-semibold text-xs border border-blue-200 transition"
                      >
                        <span>{tmpl.name}</span>
                      </button>
                    ))}

                  <button
                    type="button"
                    onClick={() => setIsTemplateManagerOpen(true)}
                    className="cursor-pointer shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs border border-slate-300 transition"
                    title="Manage / Add / Edit Email Templates"
                  >
                    <Plus className="w-3 h-3 text-[#0070ba]" />
                    <span>Manage</span>
                  </button>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {/* Send via Gmail with Gmail SVG Icon */}
                  <a
                    href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
                      invoice.clientEmail
                    )}&su=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(
                      `${emailBody}\n\nSecure PayPal Settlement Link:\n${clientPayUrl}\n\nThank you!`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    onClick={syncCurrentInvoiceToStorage}
                    className="cursor-pointer inline-flex items-center gap-1.5 text-xs font-bold bg-[#ea4335] text-white hover:bg-[#d33426] px-4 py-1.5 rounded-full shadow-2xs transition"
                    title="Open directly in Gmail compose with pre-filled invoice and PayPal link"
                  >
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                      <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.272H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L12 9.49l8.073-5.997C21.69 2.28 24 3.434 24 5.457z"/>
                    </svg>
                    <span>Send via Gmail</span>
                  </a>

                  <button
                    type="button"
                    onClick={handleCopyEmail}
                    className="cursor-pointer inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 px-3.5 py-1.5 rounded-full border border-slate-300 transition shadow-2xs"
                  >
                    {copiedEmail ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedEmail ? 'Copied' : 'Copy Email'}</span>
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Subject Line
                  </label>
                  <input
                    type="text"
                    disabled={!isEditingEmailManual}
                    value={emailSubject}
                    onChange={(e) => {
                      setEmailSubject(e.target.value);
                      onUpdate({
                        ...invoice,
                        emailDraft: { subject: e.target.value, body: emailBody },
                      });
                    }}
                    placeholder="Subject line..."
                    className={`w-full border rounded-xl p-3 text-sm font-bold text-slate-900 transition ${
                      isEditingEmailManual
                        ? 'bg-white border-[#0070ba] ring-2 ring-blue-100'
                        : 'bg-slate-50 border-slate-200 cursor-not-allowed opacity-90'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Email Body Message
                  </label>
                  <textarea
                    rows={8}
                    disabled={!isEditingEmailManual}
                    value={emailBody}
                    onChange={(e) => {
                      setEmailBody(e.target.value);
                      onUpdate({
                        ...invoice,
                        emailDraft: { subject: emailSubject, body: e.target.value },
                      });
                    }}
                    placeholder="Email body text..."
                    className={`w-full border rounded-xl p-3.5 text-sm text-slate-800 leading-relaxed resize-none font-normal transition ${
                      isEditingEmailManual
                        ? 'bg-white border-[#0070ba] ring-2 ring-blue-100'
                        : 'bg-slate-50 border-slate-200 cursor-not-allowed opacity-90'
                    }`}
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 flex items-center justify-between">
                <span>Client payment link is included in the footer of the email.</span>
                <span className="font-mono font-bold text-[#003087]">{invoice.invoiceNumber}</span>
              </div>
            </div>
          )}

          {activeTab === 'whatsapp' && (
            <div className="space-y-4">
              {/* WhatsApp Tone Quick Templates */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs">
                  <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px] shrink-0 mr-1">
                    Tone Templates:
                  </span>
                  {allTemplates
                    .filter((t) => t.type === 'whatsapp')
                    .map((tmpl) => (
                      <button
                        key={tmpl.id}
                        type="button"
                        onClick={() => {
                          const compiled = tmpl.content
                            .replace(/\{\{invoiceNumber\}\}/g, invoice.invoiceNumber)
                            .replace(/\{\{clientName\}\}/g, invoice.clientName || 'there')
                            .replace(/\{\{sellerName\}\}/g, invoice.sellerName || 'Merchant')
                            .replace(/\{\{totalAmount\}\}/g, invoice.totalAmount.toFixed(2))
                            .replace(/\{\{currency\}\}/g, invoice.currency || 'USD')
                            .replace(/\{\{dueDate\}\}/g, invoice.dueDate || '')
                            .replace(/\{\{payUrl\}\}/g, clientPayUrl);

                          setWhatsAppText(compiled);
                          toast.info(`Applied "${tmpl.name}" template`);
                        }}
                        className="cursor-pointer shrink-0 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 hover:bg-emerald-100 font-semibold text-xs border border-emerald-200 transition"
                      >
                        <span>{tmpl.name}</span>
                      </button>
                    ))}

                  <button
                    type="button"
                    onClick={() => setIsTemplateManagerOpen(true)}
                    className="cursor-pointer shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs border border-slate-300 transition"
                    title="Manage / Add / Edit WhatsApp Templates"
                  >
                    <Plus className="w-3 h-3 text-emerald-600" />
                    <span>Manage</span>
                  </button>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {invoice.clientPhone ? (
                    <a
                      href={`https://wa.me/${invoice.clientPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                        whatsAppText
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      onClick={syncCurrentInvoiceToStorage}
                      className="cursor-pointer inline-flex items-center gap-1.5 text-xs font-bold bg-[#25D366] text-white hover:bg-[#1ebd5b] px-4 py-1.5 rounded-full shadow-2xs transition"
                    >
                      <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                      </svg>
                      <span>Send to {invoice.clientPhone}</span>
                    </a>
                  ) : (
                    <a
                      href={`https://wa.me/?text=${encodeURIComponent(whatsAppText)}`}
                      target="_blank"
                      rel="noreferrer"
                      onClick={syncCurrentInvoiceToStorage}
                      className="cursor-pointer inline-flex items-center gap-1.5 text-xs font-bold bg-[#25D366] text-white hover:bg-[#1ebd5b] px-4 py-1.5 rounded-full shadow-2xs transition"
                    >
                      <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                      </svg>
                      <span>Open WhatsApp Web</span>
                    </a>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(whatsAppText);
                      setCopiedWhatsApp(true);
                      toast.success('WhatsApp message copied!');
                      setTimeout(() => setCopiedWhatsApp(false), 2000);
                    }}
                    className="cursor-pointer inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3.5 py-1.5 rounded-full border border-emerald-200 transition"
                  >
                    {copiedWhatsApp ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedWhatsApp ? 'Copied' : 'Copy Text'}</span>
                  </button>
                </div>
              </div>

              {/* WhatsApp Message Body */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  WhatsApp Message Draft {invoice.clientPhone && `(Target: ${invoice.clientPhone})`}
                </label>
                <textarea
                  rows={8}
                  disabled={!isEditingWhatsAppManual}
                  value={whatsAppText}
                  onChange={(e) => setWhatsAppText(e.target.value)}
                  placeholder="WhatsApp message text..."
                  className={`w-full border rounded-xl p-3.5 text-sm text-slate-800 leading-relaxed resize-none font-normal transition ${
                    isEditingWhatsAppManual
                      ? 'bg-white border-[#25D366] ring-2 ring-emerald-100'
                      : 'bg-slate-50 border-slate-200 cursor-not-allowed opacity-90'
                  }`}
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 flex items-center justify-between">
                <span>Direct 1-click PayPal settlement link is included inside message text.</span>
                <span className="font-mono font-bold text-[#003087]">{invoice.invoiceNumber}</span>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Floating Printable PDF Document Preview Modal */}
      {isPdfPreviewOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-fade-in">
          <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col h-[88vh] animate-scale-up">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <FileCode className="w-5 h-5 text-[#003087]" />
                <span className="font-bold text-sm text-[#001435]">
                  Official Printable Vector PDF Preview — {invoice.invoiceNumber}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  disabled={isDownloading}
                  className="pp-button-primary !py-2 !px-4 !text-xs flex items-center gap-1.5 shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsPdfPreviewOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-full transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 bg-slate-100 p-2 overflow-hidden flex items-center justify-center">
              {pdfDataUri ? (
                <iframe
                  src={pdfDataUri}
                  className="w-full h-full rounded-2xl border border-slate-200 bg-white shadow-sm"
                  title="Printable Vector PDF Preview"
                />
              ) : (
                <div className="text-center text-xs text-slate-500 space-y-2">
                  <RefreshCw className="w-6 h-6 animate-spin text-[#0070ba] mx-auto" />
                  <span>Rendering vector document...</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Themed Delete Invoice Confirmation Modal (Replaces browser confirm) */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4 animate-scale-up">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-red-50 text-red-600 border border-red-200 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-[#001435]">Delete Invoice</h3>
                <span className="text-xs text-slate-400 font-medium">Permanent Action</span>
              </div>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed font-medium">
              Are you sure you want to permanently delete invoice <strong className="font-mono text-[#003087]">{invoice.invoiceNumber}</strong>? This action cannot be reversed.
            </p>

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="pp-button-secondary !py-2 !px-4 !text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onDelete?.(invoice.invoiceNumber);
                  setIsDeleteModalOpen(false);
                  onClose();
                  toast.success(`Invoice ${invoice.invoiceNumber} deleted.`);
                }}
                className="cursor-pointer px-5 py-2 rounded-full text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-xs transition"
              >
                Delete Invoice
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Template Manager Modal */}
      <TemplateManagerModal
        isOpen={isTemplateManagerOpen}
        onClose={() => setIsTemplateManagerOpen(false)}
        initialType={activeTab === 'whatsapp' ? 'whatsapp' : 'email'}
        onTemplatesChanged={reloadTemplates}
      />
    </div>
  );
}
