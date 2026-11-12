'use client';

import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Edit3, Check, FileText, Mail, Sparkles, MessageCircle } from 'lucide-react';
import { CustomTemplateItem } from '@/types/invoice';
import { toast } from 'sonner';

export const DEFAULT_APP_TEMPLATES: CustomTemplateItem[] = [
  // 1. Invoice templates (used in chat input carousel)
  {
    id: 'tmpl-inv-1',
    name: 'Hourly Engineering',
    type: 'invoice',
    content: 'Billed 12 hours of full-stack engineering & PayPal integration at $65/hr with a 5% early payment discount.',
  },
  {
    id: 'tmpl-inv-2',
    name: 'Design & Branding',
    type: 'invoice',
    content: 'Complete branding package: UI kit, 5 custom illustrations & logo design for $450, payment due upon receipt.',
  },
  {
    id: 'tmpl-inv-3',
    name: 'Monthly Retainer',
    type: 'invoice',
    content: 'Monthly cloud infrastructure maintenance and consulting retainer for $800, Net 14 days.',
  },
  {
    id: 'tmpl-inv-4',
    name: 'Fixed Milestone',
    type: 'invoice',
    content: 'Milestone 2 completion: Payment gateway checkout flow & automated receipts for $1,200.',
  },

  // 2. Email tone templates (used in Ready-to-Send Email tab)
  {
    id: 'tmpl-em-1',
    name: 'Friendly Reminder',
    type: 'email',
    subject: 'Friendly Reminder: Invoice {{invoiceNumber}} for {{clientName}}',
    content: `Hi {{clientName}},\n\nHope you're having a great week! Just a friendly reminder that invoice {{invoiceNumber}} for \${{totalAmount}} {{currency}} is ready for settlement.\n\nYou can easily review and pay via PayPal here:\n{{payUrl}}\n\nPlease let me know if you have any questions.\n\nWarm regards,\n{{sellerName}}`,
  },
  {
    id: 'tmpl-em-2',
    name: 'Formal Completion',
    type: 'email',
    subject: 'Formal Project Completion: Invoice {{invoiceNumber}}',
    content: `Dear {{clientName}},\n\nWe are pleased to inform you that the deliverables associated with invoice {{invoiceNumber}} have been completed successfully.\n\nTotal Amount Due: \${{totalAmount}} {{currency}}\nDue Date: {{dueDate}}\n\nPlease complete the final settlement via PayPal through the secure link below:\n{{payUrl}}\n\nThank you for your valued partnership.\n\nSincerely,\n{{sellerName}}`,
  },

  // 3. WhatsApp templates (used in WhatsApp tab)
  {
    id: 'tmpl-wa-1',
    name: 'Friendly Tanglish',
    type: 'whatsapp',
    content: `Vanakam {{clientName}}! 🙏 Invoice {{invoiceNumber}} (\${{totalAmount}} {{currency}}) ready ah iruku.\n\nPayPal instant payment link:\n{{payUrl}}\n\nReview pannitu settle pannidunga, thanks!`,
  },
  {
    id: 'tmpl-wa-2',
    name: 'Professional English',
    type: 'whatsapp',
    content: `Hi {{clientName}}! Here is your official invoice {{invoiceNumber}} for \${{totalAmount}} {{currency}}.\n\nYou can review, download PDF and settle securely via PayPal here:\n{{payUrl}}\n\nThank you for your business!`,
  },
  {
    id: 'tmpl-wa-3',
    name: 'Urgent Due',
    type: 'whatsapp',
    content: `URGENT REMINDER: Invoice {{invoiceNumber}} for \${{totalAmount}} is due on {{dueDate}}.\n\nPlease settle immediately via PayPal:\n{{payUrl}}\n\nThank you!`,
  },
];

export function getStoredTemplates(): CustomTemplateItem[] {
  if (typeof window === 'undefined') return DEFAULT_APP_TEMPLATES;
  try {
    const raw = localStorage.getItem('paygenie_custom_templates_v1');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error(e);
  }
  return DEFAULT_APP_TEMPLATES;
}

export function saveStoredTemplates(templates: CustomTemplateItem[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('paygenie_custom_templates_v1', JSON.stringify(templates));
    const channel = new BroadcastChannel('paygenie_live_sync');
    channel.postMessage({ type: 'TEMPLATES_UPDATED', templates });
    channel.close();
  } catch (e) {
    console.error(e);
  }
}

interface TemplateManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialType?: 'invoice' | 'email' | 'whatsapp';
  onTemplatesChanged?: () => void;
}

export function TemplateManagerModal({
  isOpen,
  onClose,
  initialType = 'invoice',
  onTemplatesChanged,
}: TemplateManagerModalProps) {
  const [activeTab, setActiveTab] = useState<'invoice' | 'email' | 'whatsapp'>(initialType);
  const [templates, setTemplates] = useState<CustomTemplateItem[]>([]);
  
  // Create / Edit form states
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formName, setFormName] = useState('');
  const [formSubject, setFormSubject] = useState('');
  const [formContent, setFormContent] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null);
  const editorRef = React.useRef<HTMLDivElement>(null);

  const TAG_LABELS: Record<string, string> = {
    '{{clientName}}': 'Client Name',
    '{{invoiceNumber}}': 'Invoice #',
    '{{totalAmount}}': 'Total Amount',
    '{{payUrl}}': 'PayPal Link',
    '{{dueDate}}': 'Due Date',
  };

  // Convert raw string text containing {{placeholders}} into HTML with non-editable badge spans
  const rawTextToHtml = (raw: string): string => {
    if (!raw) return '';
    // Escape HTML first
    const escaped = raw
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Replace {{tag}} with uneditable badge pill span
    return escaped.replace(/\{\{(clientName|invoiceNumber|totalAmount|payUrl|dueDate)\}\}/g, (_match, tagKey) => {
      const fullTag = `{{${tagKey}}}`;
      const label = TAG_LABELS[fullTag] || tagKey;
      return `<span contenteditable="false" data-tag="${fullTag}" class="inline-flex items-center gap-1 mx-1 px-2 py-0.5 rounded-md bg-blue-100 text-[#003087] font-bold text-[11px] border border-blue-300 select-none shadow-2xs align-baseline"><span class="w-1.5 h-1.5 rounded-full bg-[#0070ba]"></span>${label}</span>&zwnj;`;
    }).replace(/\n/g, '<br>');
  };

  // Extract raw text with {{tags}} from the contenteditable DOM
  const htmlToRawText = (element: HTMLElement): string => {
    let result = '';
    const traverse = (node: Node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        // Remove zero-width non-joiners (&zwnj;)
        result += (node.textContent || '').replace(/\u200C/g, '');
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as HTMLElement;
        if (el.dataset.tag) {
          result += el.dataset.tag;
          return;
        }
        if (el.tagName === 'BR') {
          result += '\n';
          return;
        }
        for (let i = 0; i < el.childNodes.length; i++) {
          traverse(el.childNodes[i]);
        }
        if (el.tagName === 'DIV' || el.tagName === 'P') {
          // If not empty, add newline if next sibling exists
          if (el.nextSibling && !result.endsWith('\n')) {
            result += '\n';
          }
        }
      }
    };
    traverse(element);
    return result;
  };

  // Helper to construct a badge span DOM element
  const createBadgeElement = (tag: string): HTMLSpanElement => {
    const label = TAG_LABELS[tag] || tag;
    const badge = document.createElement('span');
    badge.contentEditable = 'false';
    badge.setAttribute('data-tag', tag);
    badge.className = 'inline-flex items-center gap-1 mx-1 px-2 py-0.5 rounded-md bg-blue-100 text-[#003087] font-bold text-[11px] border border-blue-300 select-none shadow-2xs align-baseline';
    badge.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-[#0070ba]"></span>${label}`;
    return badge;
  };

  const handleEditorPaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    if (!text) return;

    const editor = editorRef.current;
    if (!editor) return;

    editor.focus();
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;

    const range = sel.getRangeAt(0);
    range.deleteContents();

    // Check if the pasted text contains placeholder tags like {{clientName}}
    const parts = text.split(/(\{\{(?:clientName|invoiceNumber|totalAmount|payUrl|dueDate)\}\})/g);
    const frag = document.createDocumentFragment();
    let lastNode: Node | null = null;

    parts.forEach((part) => {
      if (!part) return;
      if (/^\{\{(clientName|invoiceNumber|totalAmount|payUrl|dueDate)\}\}$/.test(part)) {
        const badge = createBadgeElement(part);
        frag.appendChild(badge);
        lastNode = badge;
      } else {
        const textNode = document.createTextNode(part);
        frag.appendChild(textNode);
        lastNode = textNode;
      }
    });

    range.insertNode(frag);

    if (lastNode) {
      range.setStartAfter(lastNode);
      range.setEndAfter(lastNode);
      sel.removeAllRanges();
      sel.addRange(range);
    }

    setFormContent(htmlToRawText(editor));
  };

  const handleEditorCopyOrCut = (e: React.ClipboardEvent<HTMLDivElement>, isCut = false) => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return;

    const editor = editorRef.current;
    if (!editor) return;

    const range = sel.getRangeAt(0);
    const container = document.createElement('div');
    container.appendChild(range.cloneContents());
    const rawSelectedText = htmlToRawText(container);

    if (rawSelectedText) {
      e.preventDefault();
      e.clipboardData.setData('text/plain', rawSelectedText);
      e.clipboardData.setData('text/html', container.innerHTML);

      if (isCut) {
        range.deleteContents();
        setFormContent(htmlToRawText(editor));
      }
    }
  };

  const insertPlaceholderBadge = (placeholder: string) => {
    const editor = editorRef.current;
    if (!editor) return;

    editor.focus();
    const sel = window.getSelection();
    let range: Range | null = null;

    if (sel && sel.rangeCount > 0) {
      const testRange = sel.getRangeAt(0);
      if (editor.contains(testRange.commonAncestorContainer)) {
        range = testRange;
      }
    }

    if (!range) {
      range = document.createRange();
      range.selectNodeContents(editor);
      range.collapse(false);
      if (sel) {
        sel.removeAllRanges();
        sel.addRange(range);
      }
    }

    range.deleteContents();

    const badge = createBadgeElement(placeholder);
    // Trailing space text node so cursor continues smoothly
    const spaceNode = document.createTextNode(' ');

    const frag = document.createDocumentFragment();
    frag.appendChild(badge);
    frag.appendChild(spaceNode);

    range.insertNode(frag);

    // Set cursor right after the space
    range.setStartAfter(spaceNode);
    range.setEndAfter(spaceNode);
    if (sel) {
      sel.removeAllRanges();
      sel.addRange(range);
    }

    // Sync state
    setFormContent(htmlToRawText(editor));
  };

  useEffect(() => {
    if (isOpen) {
      setTemplates(getStoredTemplates());
      setActiveTab(initialType);
      resetForm();
    }
  }, [isOpen, initialType]);

  // ESC key listener to close modal
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const resetForm = () => {
    setIsEditing(false);
    setEditingId(null);
    setFormName('');
    setFormSubject('');
    setFormContent('');
    if (editorRef.current) {
      editorRef.current.innerHTML = '';
    }
  };

  const currentTabTemplates = templates.filter((t) => t.type === activeTab);

  const handleStartCreate = () => {
    resetForm();
    setIsEditing(true);
    setTimeout(() => {
      if (editorRef.current) {
        editorRef.current.innerHTML = '';
        editorRef.current.focus();
      }
    }, 50);
  };

  const handleStartEdit = (t: CustomTemplateItem) => {
    setEditingId(t.id);
    setFormName(t.name);
    setFormSubject(t.subject || '');
    setFormContent(t.content);
    setIsEditing(true);
    setTimeout(() => {
      if (editorRef.current) {
        editorRef.current.innerHTML = rawTextToHtml(t.content);
        editorRef.current.focus();
      }
    }, 50);
  };

  const handleDelete = (id: string, name: string) => {
    setDeleteConfirm({ id, name });
  };

  const confirmDeleteAction = () => {
    if (!deleteConfirm) return;
    const { id, name } = deleteConfirm;
    const updated = templates.filter((t) => t.id !== id);
    setTemplates(updated);
    saveStoredTemplates(updated);
    toast.success(`Template "${name}" deleted.`);
    onTemplatesChanged?.();
    if (editingId === id) resetForm();
    setDeleteConfirm(null);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formContent.trim()) {
      toast.error('Template name and content message are required.');
      return;
    }
    if (activeTab === 'email' && !formSubject.trim()) {
      toast.error('Email subject line is required.');
      return;
    }

    let updated: CustomTemplateItem[];
    if (editingId) {
      updated = templates.map((t) =>
        t.id === editingId
          ? {
              ...t,
              name: formName.trim(),
              subject: activeTab === 'email' ? formSubject.trim() : undefined,
              content: formContent.trim(),
            }
          : t
      );
      toast.success(`Template "${formName}" updated.`);
    } else {
      const newItem: CustomTemplateItem = {
        id: `tmpl-${Date.now()}`,
        name: formName.trim(),
        type: activeTab,
        subject: activeTab === 'email' ? formSubject.trim() : undefined,
        content: formContent.trim(),
      };
      updated = [newItem, ...templates];
      toast.success(`New ${activeTab.toUpperCase()} template "${formName}" created!`);
    }

    setTemplates(updated);
    saveStoredTemplates(updated);
    onTemplatesChanged?.();
    resetForm();
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div 
        className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[88vh] animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#003087]/10 text-[#003087] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-[#0070ba]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#001435]">Template Manager</h3>
              <p className="text-xs text-slate-500">Customize, create, and organize templates for Invoices, Emails & WhatsApp</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-full transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Type Filter Tabs */}
        <div className="flex border-b border-slate-200 px-6 bg-white gap-6 text-sm font-bold">
          <button
            type="button"
            onClick={() => { setActiveTab('invoice'); resetForm(); }}
            className={`py-3 border-b-2 flex items-center gap-2 transition cursor-pointer ${
              activeTab === 'invoice'
                ? 'border-[#003087] text-[#003087]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Invoice Prompts ({templates.filter(t => t.type === 'invoice').length})</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('email'); resetForm(); }}
            className={`py-3 border-b-2 flex items-center gap-2 transition cursor-pointer ${
              activeTab === 'email'
                ? 'border-rose-500 text-rose-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Mail className={`w-4 h-4 ${activeTab === 'email' ? 'text-rose-600' : ''}`} />
            <span>Email Tones ({templates.filter(t => t.type === 'email').length})</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('whatsapp'); resetForm(); }}
            className={`py-3 border-b-2 flex items-center gap-2 transition cursor-pointer ${
              activeTab === 'whatsapp'
                ? 'border-[#25D366] text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <svg className="w-4 h-4 fill-emerald-600" viewBox="0 0 24 24">
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
            </svg>
            <span>WhatsApp Messages ({templates.filter(t => t.type === 'whatsapp').length})</span>
          </button>
        </div>

        {/* Body Container */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Top action row */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Active {activeTab.toUpperCase()} Templates ({currentTabTemplates.length})
            </span>
            {!isEditing && (
              <button
                type="button"
                onClick={handleStartCreate}
                className="cursor-pointer inline-flex items-center gap-1.5 text-xs font-bold bg-[#003087] hover:bg-[#002466] text-white px-3.5 py-1.5 rounded-full shadow-2xs transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add New {activeTab === 'invoice' ? 'Invoice Prompt' : activeTab === 'email' ? 'Email Tone' : 'WhatsApp Message'}</span>
              </button>
            )}
          </div>

          {/* Create / Edit Form Inline Card */}
          {isEditing && (
            <form onSubmit={handleSaveForm} className="p-4 bg-blue-50/70 border border-blue-200 rounded-2xl space-y-3.5 animate-scale-up">
              <div className="pb-1 border-b border-blue-200/80">
                <span className="text-xs font-bold text-[#003087] uppercase tracking-wider">
                  {editingId ? 'Edit Template' : `New ${activeTab.toUpperCase()} Template`}
                </span>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Template Name *
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Rush Weekend Billing or Formal Delivery"
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#0070ba]"
                />
              </div>

              {activeTab === 'email' && (
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Subject Line *
                  </label>
                  <input
                    type="text"
                    required
                    value={formSubject}
                    onChange={(e) => setFormSubject(e.target.value)}
                    placeholder="e.g. Invoice {{invoiceNumber}} from {{sellerName}}"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#0070ba]"
                  />
                </div>
              )}

              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1.5">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600">
                    {activeTab === 'invoice' ? 'Invoice Work Prompt Description *' : 'Message Body Text *'}
                  </label>
                  
                  {/* Clickable 1-Click Insert Placeholder Pills */}
                  {activeTab !== 'invoice' && (
                    <div className="flex items-center gap-1 flex-wrap">
                      <span className="text-[10px] text-slate-400 font-semibold mr-0.5">Insert:</span>
                      {[
                        { label: '+ Client Name', tag: '{{clientName}}' },
                        { label: '+ Invoice #', tag: '{{invoiceNumber}}' },
                        { label: '+ Total Amount', tag: '{{totalAmount}}' },
                        { label: '+ PayPal Link', tag: '{{payUrl}}' },
                        { label: '+ Due Date', tag: '{{dueDate}}' },
                      ].map((item, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => insertPlaceholderBadge(item.tag)}
                          className="cursor-pointer text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-white text-[#003087] hover:bg-blue-100/70 border border-blue-200 transition shadow-2xs inline-flex items-center gap-1"
                          title={`Insert non-editable ${item.tag} pill`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {activeTab === 'invoice' ? (
                  <textarea
                    rows={4}
                    required
                    value={formContent}
                    onChange={(e) => setFormContent(e.target.value)}
                    placeholder="e.g. Billed 8 hours of cloud backend API work at $75/hr with a Net 14 due date."
                    className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-[#0070ba] resize-none"
                  />
                ) : (
                  <div
                    ref={editorRef}
                    contentEditable
                    suppressContentEditableWarning
                    onInput={(e) => setFormContent(htmlToRawText(e.currentTarget))}
                    onCut={(e) => handleEditorCopyOrCut(e, true)}
                    onCopy={(e) => handleEditorCopyOrCut(e, false)}
                    onPaste={handleEditorPaste}
                    data-placeholder="Write message body with placeholders. Click the buttons above to insert locked tags like {{clientName}}, {{invoiceNumber}}, {{payUrl}}..."
                    className="w-full min-h-[105px] max-h-[220px] overflow-y-auto bg-white border border-slate-300 rounded-xl p-3 text-xs text-slate-900 leading-relaxed focus:outline-none focus:border-[#0070ba] whitespace-pre-wrap empty:before:content-[attr(data-placeholder)] empty:before:text-slate-400 empty:before:pointer-events-none"
                  />
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-1.5 rounded-full text-xs font-bold text-slate-600 bg-white border border-slate-300 hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-1.5 rounded-full text-xs font-bold text-white bg-[#003087] hover:bg-[#002466] shadow-2xs transition cursor-pointer"
                >
                  Save Template
                </button>
              </div>
            </form>
          )}

          {/* Template Cards Grid */}
          <div className="space-y-3">
            {currentTabTemplates.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                No templates in this category. Click &ldquo;Add New&rdquo; to create one!
              </div>
            ) : (
              currentTabTemplates.map((t) => (
                <div
                  key={t.id}
                  className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-blue-300 transition shadow-2xs space-y-2 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-[#001435] flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#0070ba]" />
                      <span>{t.name}</span>
                    </span>

                    <div className="flex items-center gap-1.5 opacity-90 group-hover:opacity-100">
                      <button
                        type="button"
                        onClick={() => handleStartEdit(t)}
                        className="cursor-pointer p-1.5 text-slate-400 hover:text-[#0070ba] hover:bg-blue-50 rounded-lg transition"
                        title="Edit template"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(t.id, t.name)}
                        className="cursor-pointer p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Delete template"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {t.subject && (
                    <p className="text-xs font-semibold text-[#003087] bg-blue-50/60 px-2.5 py-1 rounded-lg truncate">
                      Subject: {t.subject}
                    </p>
                  )}

                  <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line line-clamp-3">
                    {t.content}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal for Template Deletion */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-60 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 text-center animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-1">Delete Template?</h3>
            <p className="text-xs text-slate-500 mb-5 leading-relaxed">
              Are you sure you want to delete template <strong className="text-slate-800">&ldquo;{deleteConfirm.name}&rdquo;</strong>? This action cannot be undone.
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteAction}
                className="flex-1 py-2 text-xs font-semibold bg-red-600 hover:bg-red-700 text-white rounded-xl transition shadow-xs cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
