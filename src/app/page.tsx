'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  ArrowRight, 
  RefreshCw, 
  Sparkles,
  CheckCircle2, 
  FileSpreadsheet, 
  Trash2, 
  Clock, 
  Send,
  Eye,
  Check,
  Bot,
  User,
  ExternalLink,
  Wallet,
  Receipt,
  Search,
  Plus,
  MessageSquare,
  Globe,
  Edit3,
  X,
  Users,
  RotateCcw,
  Layers,
  FileCode,
  Mail
} from 'lucide-react';

const BILLING_TEMPLATES = [
  {
    category: 'Invoice Template',
    label: 'Hourly Development',
    prompt: 'Billed 12 hours of full-stack engineering & PayPal integration at $65/hr with a 5% early payment discount.',
  },
  {
    category: 'Invoice Template',
    label: 'Design & Branding',
    prompt: 'Complete branding package: UI kit, 5 custom illustrations & logo design for $450, payment due upon receipt.',
  },
  {
    category: 'Invoice Template',
    label: 'Monthly Retainer',
    prompt: 'Monthly cloud infrastructure maintenance and consulting retainer for $800, Net 14 days.',
  },
  {
    category: 'Email Template',
    label: 'Friendly Reminder',
    prompt: 'Write a warm, polite email reminding the client about their upcoming invoice with the PayPal payment link attached.',
  },
  {
    category: 'Email Template',
    label: 'Formal Completion',
    prompt: 'Draft an executive formal completion email thanking them for the partnership and requesting settlement via PayPal.',
  },
];
import ClientPayPortal from '@/components/ClientPayPortal';
import InvoiceModal from '@/components/InvoiceModal';
import MerchantProfileModal from '@/components/MerchantProfileModal';
import { PayGenieLogo } from '@/components/PayGenieLogo';
import { InvoiceData, ClientProfile, ChatMessage, MerchantProfile } from '@/types/invoice';
import { toast } from 'sonner';

const DEFAULT_MERCHANT: MerchantProfile = {
  name: 'PayGenie Studio',
  email: 'billing@merchant.com',
  company: 'PayGenie Technologies',
  // Credentials are intentionally left blank in frontend state so your private keys are never exposed in browser
  paypalClientId: '',
  paypalSecretKey: '',
  geminiApiKey: '',
};

const DEFAULT_CLIENTS: ClientProfile[] = [
  {
    id: 'client-1',
    name: 'Acme Tech',
    email: 'billing@acmetech.com',
    company: 'Acme Innovations Ltd.',
    preferredLanguage: 'English',
    avatarBg: 'bg-blue-600',
    createdAt: '2026-03-01',
    messages: [
      {
        id: 'msg-1',
        role: 'assistant',
        content: 'Hello! I am ready to generate invoices for Acme Tech. What project hours or deliverables should we bill today?',
        timestamp: '10:00 AM',
      },
    ],
    invoices: [],
  },
  {
    id: 'client-2',
    name: 'Nexus Labs',
    email: 'finance@nexuslabs.co',
    company: 'Nexus Software Studio',
    preferredLanguage: 'Tanglish',
    avatarBg: 'bg-indigo-600',
    createdAt: '2026-03-05',
    messages: [
      {
        id: 'msg-2',
        role: 'assistant',
        content: 'Vanakam bro! Nexus Labs-ku billing ready panlama? Project rate and hours sonna odane invoice generate pannitaen!',
        timestamp: '11:15 AM',
      },
    ],
    invoices: [],
  },
  {
    id: 'client-3',
    name: 'Bloom Bakery',
    email: 'hello@bloombakery.com',
    company: 'Bloom Bakery & Cafe',
    preferredLanguage: 'English',
    avatarBg: 'bg-emerald-600',
    createdAt: '2026-03-10',
    messages: [
      {
        id: 'msg-3',
        role: 'assistant',
        content: 'Welcome! Ready to bill brand illustrations or catering design for Bloom Bakery.',
        timestamp: '02:30 PM',
      },
    ],
    invoices: [],
  },
];

function MainAppContent() {
  const searchParams = useSearchParams();
  const invoiceParam = searchParams.get('invoice');

  if (invoiceParam) {
    return <ClientPayPortal />;
  }

  return <MerchantWorkspace />;
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#fafbfc] flex items-center justify-center font-bold text-slate-500 text-sm">
        Loading PayGenie...
      </div>
    }>
      <MainAppContent />
    </Suspense>
  );
}

function MerchantWorkspace() {
  const [activeTab, setActiveTab] = useState<'chat' | 'ledger'>('chat');
  
  // Clients & Sidebar state
  const [clients, setClients] = useState<ClientProfile[]>(DEFAULT_CLIENTS);
  const [selectedClientId, setSelectedClientId] = useState<string>(DEFAULT_CLIENTS[0].id);
  const [searchQuery, setSearchQuery] = useState('');
  const [isNewClientModalOpen, setIsNewClientModalOpen] = useState(false);

  // New Client Form state
  const [newClientName, setNewClientName] = useState('');
  const [newClientEmail, setNewClientEmail] = useState('');
  const [newClientCompany, setNewClientCompany] = useState('');
  const [newClientLang, setNewClientLang] = useState<'English' | 'Tanglish' | 'Tamil'>('English');

  // Chat input & loading
  const [userInput, setUserInput] = useState('');
  const [loading, setLoading] = useState(false);

  // Modal inspection
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Merchant Profile Modal state
  const [merchantProfile, setMerchantProfile] = useState<MerchantProfile>(DEFAULT_MERCHANT);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Custom PayPal Branded Confirmation Modal state
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    confirmText: string;
    isDestructive?: boolean;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    description: '',
    confirmText: 'Confirm',
    isDestructive: false,
    onConfirm: () => {},
  });

  const openConfirmation = (opts: {
    title: string;
    description: string;
    confirmText?: string;
    isDestructive?: boolean;
    onConfirm: () => void;
  }) => {
    setConfirmDialog({
      isOpen: true,
      title: opts.title,
      description: opts.description,
      confirmText: opts.confirmText || 'Confirm',
      isDestructive: opts.isDestructive ?? true,
      onConfirm: () => {
        opts.onConfirm();
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Active client object
  const activeClient = clients.find((c) => c.id === selectedClientId) || clients[0];

  // Flat all invoices list for ledger
  const allInvoices: InvoiceData[] = clients.flatMap((c) => c.invoices || []);

  // Total Balance calculations
  const totalSettledBalance = allInvoices
    .filter((i) => i.status === 'PAID')
    .reduce((sum, i) => sum + i.totalAmount, 0);

  const totalPendingAmount = allInvoices
    .filter((i) => i.status !== 'PAID')
    .reduce((sum, i) => sum + i.totalAmount, 0);

  // Load from local storage on mount
  useEffect(() => {
    try {
      const storedClients = localStorage.getItem('paygenie_clients_v2');
      if (storedClients) {
        const parsed = JSON.parse(storedClients);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setClients(parsed);
          setSelectedClientId(parsed[0].id);
        }
      }

      const storedMerchant = localStorage.getItem('paygenie_merchant_profile');
      if (storedMerchant) {
        setMerchantProfile(JSON.parse(storedMerchant));
      }
    } catch (e) {
      console.error(e);
    }

    // Real-time settlement live sync listener
    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel('paygenie_live_sync');
      channel.onmessage = (event) => {
        if (event.data?.type === 'PAYMENT_SETTLED') {
          const { invoiceNumber, paymentId, paidAt } = event.data;
          
          setClients((prev) => {
            const updated = prev.map((c) => ({
              ...c,
              invoices: (c.invoices || []).map((inv) =>
                inv.invoiceNumber === invoiceNumber
                  ? { ...inv, status: 'PAID' as const, paymentId, paidAt }
                  : inv
              ),
            }));
            saveClientsToStorage(updated);
            return updated;
          });

          setSelectedInvoice((cur) => {
            if (!cur || cur.invoiceNumber !== invoiceNumber) return cur;
            return { ...cur, status: 'PAID' as const, paymentId, paidAt };
          });

          toast.success(`🎉 Client just paid invoice ${invoiceNumber} via PayPal!`);
        }
      };
    } catch (e) {
      console.error(e);
    }

    return () => {
      if (channel) channel.close();
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeClient?.messages, loading]);

  const saveClientsToStorage = (updatedClients: ClientProfile[]) => {
    try {
      localStorage.setItem('paygenie_clients_v2', JSON.stringify(updatedClients));
      // Also sync old storage for compatibility with client checkout
      const flat = updatedClients.flatMap((c) => c.invoices || []);
      localStorage.setItem('paygenie_invoices', JSON.stringify(flat));
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateNewClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName.trim() || !newClientEmail.trim()) {
      toast.error('Client name and email are required');
      return;
    }

    const colors = ['bg-blue-600', 'bg-indigo-600', 'bg-emerald-600', 'bg-purple-600', 'bg-amber-600'];
    const newClient: ClientProfile = {
      id: `client-${Date.now()}`,
      name: newClientName.trim(),
      email: newClientEmail.trim(),
      company: newClientCompany.trim() || undefined,
      preferredLanguage: newClientLang,
      avatarBg: colors[Math.floor(Math.random() * colors.length)],
      createdAt: new Date().toISOString().split('T')[0],
      messages: [
        {
          id: `msg-welcome-${Date.now()}`,
          role: 'assistant',
          content: newClientLang === 'Tanglish' 
            ? `Vanakam bro! ${newClientName} ku new billing chat ready. Enna work bill pannanum?`
            : `Hello! Billing workspace for ${newClientName} is ready. Describe the project or rate to draft an invoice.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ],
      invoices: [],
    };

    const updated = [newClient, ...clients];
    setClients(updated);
    setSelectedClientId(newClient.id);
    saveClientsToStorage(updated);
    
    // Reset form
    setNewClientName('');
    setNewClientEmail('');
    setNewClientCompany('');
    setIsNewClientModalOpen(false);
    toast.success(`Client ${newClient.name} added!`);
  };

  const handleSendMessage = async (customPrompt?: string) => {
    const textToSend = customPrompt || userInput;
    if (!textToSend.trim() || loading || !activeClient) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedMessages = [...(activeClient.messages || []), userMsg];
    
    setClients((prev) => {
      const upd = prev.map((c) =>
        c.id === activeClient.id ? { ...c, messages: updatedMessages } : c
      );
      saveClientsToStorage(upd);
      return upd;
    });

    if (!customPrompt) setUserInput('');
    setLoading(true);

    try {
      const latestInvoiceDraft = [...(activeClient.messages || [])]
        .reverse()
        .find((m) => m.invoiceDraft)?.invoiceDraft || activeClient.invoices[0] || null;

      const res = await fetch('/api/genie-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({ role: m.role, content: m.content })),
          userMessage: textToSend.trim(),
          currentInvoice: latestInvoiceDraft,
          clientProfile: activeClient,
          preferredLanguage: activeClient.preferredLanguage,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to process message');

      const aiMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: data.reply || 'Invoice updated! Preview paathutu confirm pannunga.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        invoiceDraft: data.invoice || undefined,
      };

      setClients((prev) => {
        const upd = prev.map((c) =>
          c.id === activeClient.id ? { ...c, messages: [...c.messages, aiMsg] } : c
        );
        saveClientsToStorage(upd);
        return upd;
      });
    } catch (err: any) {
      toast.error(err.message || 'AI message failed');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmInvoice = (inv: InvoiceData, msgId: string) => {
    setClients((prev) => {
      const upd = prev.map((c) => {
        if (c.id !== activeClient.id) return c;
        
        const existingIdx = (c.invoices || []).findIndex((i) => i.invoiceNumber === inv.invoiceNumber);
        let newInvoices: InvoiceData[];
        if (existingIdx !== -1) {
          newInvoices = [...c.invoices];
          newInvoices[existingIdx] = inv;
        } else {
          newInvoices = [inv, ...(c.invoices || [])];
        }

        const newMessages = (c.messages || []).map((m) =>
          m.id === msgId ? { ...m, isConfirmed: true } : m
        );

        return { ...c, invoices: newInvoices, messages: newMessages };
      });

      saveClientsToStorage(upd);
      return upd;
    });

    toast.success(`Invoice ${inv.invoiceNumber} confirmed! Added to Ledger.`);
    setActiveTab('ledger');
    setSelectedInvoice(inv);
    setIsModalOpen(true);
  };

  const handleUpdateInvoice = (updated: InvoiceData) => {
    setSelectedInvoice(updated);
    setClients((prev) => {
      const upd = prev.map((c) => ({
        ...c,
        invoices: (c.invoices || []).map((inv) =>
          inv.invoiceNumber === updated.invoiceNumber ? updated : inv
        ),
      }));
      saveClientsToStorage(upd);
      return upd;
    });
  };

  const handleDeleteLedgerItem = (invoiceNumber: string) => {
    openConfirmation({
      title: 'Delete Invoice from Ledger',
      description: `Are you sure you want to permanently remove invoice ${invoiceNumber}? This action cannot be undone.`,
      confirmText: 'Delete Invoice',
      isDestructive: true,
      onConfirm: () => {
        setClients((prev) => {
          const upd = prev.map((c) => ({
            ...c,
            invoices: (c.invoices || []).filter((inv) => inv.invoiceNumber !== invoiceNumber),
          }));
          saveClientsToStorage(upd);
          return upd;
        });
        toast.success(`Invoice ${invoiceNumber} deleted from ledger.`);
      },
    });
  };

  const handleSaveMerchantProfile = (updated: MerchantProfile) => {
    setMerchantProfile(updated);
    try {
      localStorage.setItem('paygenie_merchant_profile', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const handleLanguageChange = (clientId: string, lang: 'English' | 'Tanglish' | 'Tamil') => {
    setClients((prev) => {
      const upd = prev.map((c) => (c.id === clientId ? { ...c, preferredLanguage: lang } : c));
      saveClientsToStorage(upd);
      return upd;
    });
    toast.success(`Language set to ${lang}`);
  };

  // Delete an individual message with themed modal confirmation
  const handleDeleteMessage = (messageId: string) => {
    if (!activeClient) return;
    openConfirmation({
      title: 'Delete Chat Message',
      description: 'Are you sure you want to delete this message from the thread?',
      confirmText: 'Delete Message',
      isDestructive: true,
      onConfirm: () => {
        setClients((prev) => {
          const upd = prev.map((c) => {
            if (c.id !== activeClient.id) return c;
            return {
              ...c,
              messages: (c.messages || []).filter((m) => m.id !== messageId),
            };
          });
          saveClientsToStorage(upd);
          return upd;
        });
        toast.success('Message deleted');
      },
    });
  };

  // Revert / Branch back to a previous message point with themed modal confirmation
  // Revert panna: antha message content input box-la restore aaganum, chat-la irundhu remove aaganum
  const handleRevertToMessage = (messageId: string) => {
    if (!activeClient) return;
    openConfirmation({
      title: 'Rollback Chat History',
      description: 'Revert chat back to this message point? The text will be restored to your input box, and all messages sent after this point will be cleared.',
      confirmText: 'Revert to Here',
      isDestructive: true,
      onConfirm: () => {
        setClients((prev) => {
          const upd = prev.map((c) => {
            if (c.id !== activeClient.id) return c;
            const msgList = c.messages || [];
            const index = msgList.findIndex((m) => m.id === messageId);
            if (index === -1) return c;

            // Target message content-ah input box-la load panrom
            const targetMessage = msgList[index];
            if (targetMessage) {
              setUserInput(targetMessage.content);
            }

            // Chat-la intha message-ku munnaadi irukuradha mattum vachikitu, intha message & followings-ah remove panrom
            const truncated = msgList.slice(0, index);
            return {
              ...c,
              messages: truncated,
            };
          });
          saveClientsToStorage(upd);
          return upd;
        });
        toast.success('Message restored to input box & chat reverted!');
      },
    });
  };

  // Clear entire chat for this client with themed modal confirmation
  const handleClearEntireChat = () => {
    if (!activeClient) return;
    openConfirmation({
      title: `Clear All Chat for ${activeClient.name}`,
      description: `Are you sure you want to wipe the conversation history with ${activeClient.name}? You can still draft new invoices afterwards.`,
      confirmText: 'Clear Chat History',
      isDestructive: true,
      onConfirm: () => {
        setClients((prev) => {
          const upd = prev.map((c) => {
            if (c.id !== activeClient.id) return c;
            return {
              ...c,
              messages: [
                {
                  id: `msg-welcome-${Date.now()}`,
                  role: 'assistant' as const,
                  content: c.preferredLanguage === 'Tanglish'
                    ? `Chat reset pannitaen bro! ${c.name}-ku enna bill create pannanum?`
                    : `Chat cleared! Ready to draft a fresh invoice for ${c.name}.`,
                  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                },
              ],
            };
          });
          saveClientsToStorage(upd);
          return upd;
        });
        toast.success('Chat history cleared');
      },
    });
  };

  // Filter clients by search query
  const filteredClients = clients.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.company && c.company.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="h-screen bg-[#f8fafc] text-[#001435] flex flex-col font-sans overflow-hidden">
      
      {/* Top Enterprise Header */}
      <header className="border-b border-slate-200 bg-white shrink-0 z-40 shadow-xs">
        <div className="w-full px-4 sm:px-8 h-18 flex items-center justify-between">
          
          <div className="flex items-center gap-4">
            <PayGenieLogo size={38} textColor="text-[#001435]" subtextColor="text-slate-500" />
            <span className="hidden lg:inline-block text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-blue-50 text-[#003087] border border-blue-200/80">
              Client Hub & Billing Copilot
            </span>
          </div>

          {/* Tab Navigation & Merchant Profile Trigger */}
          <div className="flex items-center gap-3">
            <div className="pp-segment-tabs">
              <button
                onClick={() => setActiveTab('chat')}
                className={`pp-segment-tab text-sm sm:text-base font-bold py-2 px-6 cursor-pointer ${
                  activeTab === 'chat' ? 'pp-segment-tab-active' : ''
                }`}
              >
                Client Invoicing Chats
              </button>
              <button
                onClick={() => setActiveTab('ledger')}
                className={`pp-segment-tab text-sm sm:text-base font-bold py-2 px-6 cursor-pointer ${
                  activeTab === 'ledger' ? 'pp-segment-tab-active' : ''
                }`}
              >
                Master Settlement Ledger ({allInvoices.length})
              </button>
            </div>

            {/* Merchant User Profile Button */}
            <button
              type="button"
              onClick={() => setIsProfileModalOpen(true)}
              className="cursor-pointer flex items-center gap-2.5 p-1.5 pr-3 rounded-full bg-slate-50 hover:bg-blue-50/70 border border-slate-200 hover:border-blue-300 transition shadow-2xs group"
              title="Merchant Profile & API Settings"
            >
              <div className="w-8 h-8 rounded-full bg-[#003087] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                {merchantProfile.name.slice(0, 1)}
              </div>
              <div className="text-left hidden md:block">
                <span className="text-xs font-bold text-[#001435] block leading-tight group-hover:text-[#0070ba]">
                  {merchantProfile.name}
                </span>
                <span className="text-[10px] text-slate-400 block font-medium">
                  Settings & Keys
                </span>
              </div>
            </button>
          </div>

        </div>
      </header>

      {/* Freelancer Balance Strip */}
      <section className="bg-white border-b border-slate-200/80 shrink-0">
        <div className="w-full px-4 sm:px-8 py-3 flex flex-wrap items-center justify-between gap-4">
          
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center">
                <Wallet className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  PayPal Settled Balance
                </span>
                <span className="text-xl font-black text-emerald-600">
                  ${totalSettledBalance.toFixed(2)}{' '}
                  <span className="text-xs font-bold text-slate-400">USD</span>
                </span>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-3 pl-8 border-l border-slate-200">
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center">
                <Receipt className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Pending Receivables
                </span>
                <span className="text-xl font-black text-slate-800">
                  ${totalPendingAmount.toFixed(2)}{' '}
                  <span className="text-xs font-bold text-slate-400">USD</span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 bg-slate-50 px-3 py-1 rounded-full border border-slate-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>PayPal Live Sync Connected</span>
            </div>
          </div>

        </div>
      </section>

      {/* Main Hub: Dual Panel (Client Sidebar + Active Chat/Ledger) */}
      <main className="flex-1 w-full px-4 sm:px-8 py-4 overflow-hidden flex min-h-0 gap-5">
        
        {/* ============================================================ */}
        {/* LEFT CLIENT SIDEBAR: Each Client Name = Dedicated Chat       */}
        {/* ============================================================ */}
        <aside className="w-80 bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden flex flex-col shrink-0">
          
          {/* Sidebar Top: Search & Add Button */}
          <div className="p-4 border-b border-slate-200 bg-slate-50/70 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-[#003087]" />
                <span>Client Roster ({clients.length})</span>
              </span>
              <button
                type="button"
                onClick={() => setIsNewClientModalOpen(true)}
                className="cursor-pointer inline-flex items-center gap-1 text-xs font-bold text-white bg-[#003087] hover:bg-[#0070e0] px-2.5 py-1 rounded-full shadow-2xs transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Client</span>
              </button>
            </div>

            {/* Search Box */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search clients..."
                className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-[#0070ba]"
              />
            </div>
          </div>

          {/* Client List Items */}
          <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-slate-100 p-2 space-y-1">
            {filteredClients.map((c) => {
              const isSelected = c.id === selectedClientId;
              const pendingCount = (c.invoices || []).filter((i) => i.status !== 'PAID').length;

              return (
                <button
                  key={c.id}
                  onClick={() => {
                    setSelectedClientId(c.id);
                    if (activeTab === 'ledger') setActiveTab('chat');
                  }}
                  className={`w-full text-left p-3 rounded-2xl transition cursor-pointer flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-blue-50/90 border border-blue-200 shadow-2xs'
                      : 'hover:bg-slate-50 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3 truncate">
                    <div className={`w-9 h-9 rounded-xl ${c.avatarBg || 'bg-blue-600'} text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-2xs`}>
                      {c.name.slice(0, 1)}
                    </div>
                    <div className="truncate">
                      <p className={`text-sm font-bold truncate ${isSelected ? 'text-[#003087]' : 'text-[#001435]'}`}>
                        {c.name}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate">{c.email}</p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end shrink-0 gap-1">
                    <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                      {c.preferredLanguage}
                    </span>
                    {pendingCount > 0 && (
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.2 rounded-full">
                        {pendingCount} due
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

        </aside>

        {/* ============================================================ */}
        {/* RIGHT PANEL: DEDICATED CLIENT CHAT / MASTER LEDGER           */}
        {/* ============================================================ */}
        <section className="flex-1 bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden flex flex-col min-h-0">
          
          {activeTab === 'chat' ? (
            /* ======================================= */
            /* DEDICATED CLIENT CONVERSATIONAL CHAT    */
            /* ======================================= */
            <div className="flex flex-col h-full min-h-0 animate-fade-in">
              
              {/* Chat Header with Client Name & Language Selector */}
              <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl ${activeClient.avatarBg || 'bg-blue-600'} text-white flex items-center justify-center font-bold text-base shadow-xs`}>
                    {activeClient.name.slice(0, 1)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-[#001435]">{activeClient.name}</h3>
                      <span className="text-xs text-slate-500 font-normal">({activeClient.email})</span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium">Dedicated PayGenie Invoicing Thread</p>
                  </div>
                </div>

                {/* Judge / User Language Preference Picker & Clear Chat Button */}
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleClearEntireChat}
                    className="cursor-pointer text-xs font-bold text-slate-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-xl border border-transparent hover:border-red-200 transition"
                    title="Clear entire chat history"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200">
                    <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                      <Globe className="w-3.5 h-3.5 text-[#0070ba]" />
                      <span>Language:</span>
                    </span>
                    <div className="flex bg-slate-200/70 p-1 rounded-xl gap-1 text-xs font-bold">
                      {(['English', 'Tanglish', 'Tamil'] as const).map((lang) => (
                        <button
                          key={lang}
                          type="button"
                          onClick={() => handleLanguageChange(activeClient.id, lang)}
                          className={`cursor-pointer px-2.5 py-1 rounded-lg transition ${
                            activeClient.preferredLanguage === lang
                              ? 'bg-white text-[#003087] shadow-2xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          {lang}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Chat Message Scrollable Container */}
              <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-5 bg-[#fcfdfe] min-h-0">
                {(activeClient.messages || []).map((msg, index) => (
                  <div
                    key={msg.id}
                    className={`group/msg flex gap-3.5 max-w-2xl relative ${
                      msg.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-sm font-bold shadow-2xs ${
                        msg.role === 'user'
                          ? 'bg-[#003087] text-white'
                          : 'bg-white text-[#0070ba] border border-slate-200'
                      }`}
                    >
                      {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-5 h-5" />}
                    </div>

                    <div className="space-y-3 relative">
                      <div
                        className={`p-4 rounded-2xl text-base leading-relaxed relative ${
                          msg.role === 'user'
                            ? 'bg-[#003087] text-white font-medium rounded-tr-none'
                            : 'bg-white text-[#001435] border border-slate-200 shadow-2xs rounded-tl-none font-semibold'
                        }`}
                      >
                        <p className="whitespace-pre-line">{msg.content}</p>

                        {/* Hover Quick Action Buttons: Revert & Delete (No Edit button, clean UX) */}
                        <div className={`opacity-0 group-hover/msg:opacity-100 transition-opacity absolute top-2 ${
                          msg.role === 'user' ? '-left-16' : '-right-16'
                        } flex items-center gap-1 bg-white border border-slate-200 shadow-xs rounded-lg p-0.5 z-10`}>
                          <button
                            type="button"
                            onClick={() => handleRevertToMessage(msg.id)}
                            className="p-1 text-slate-400 hover:text-[#0070ba] hover:bg-blue-50 rounded transition cursor-pointer"
                            title="Revert / Rollback chat to this point"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteMessage(msg.id)}
                            className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition cursor-pointer"
                            title="Delete this message"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Interactive Invoice Draft Action Pill */}
                      {msg.invoiceDraft && (
                        <div className="bg-white border-2 border-blue-200 p-4 rounded-2xl shadow-sm space-y-3.5 animate-scale-up">
                          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-bold text-[#003087] bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                                {msg.invoiceDraft.invoiceNumber}
                              </span>
                              <span className="text-xs font-bold text-slate-500">
                                for {msg.invoiceDraft.clientName}
                              </span>
                            </div>
                            <span className="text-base font-black text-[#001435]">
                              ${msg.invoiceDraft.totalAmount.toFixed(2)}{' '}
                              <span className="text-xs font-normal text-slate-400">
                                {msg.invoiceDraft.currency}
                              </span>
                            </span>
                          </div>

                          <div className="flex items-center gap-2.5 pt-1">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedInvoice(msg.invoiceDraft!);
                                setIsModalOpen(true);
                              }}
                              className="cursor-pointer inline-flex items-center gap-1.5 text-sm font-bold text-[#003087] bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-xl border border-blue-200 transition"
                            >
                              <Eye className="w-4 h-4 text-[#0070ba]" />
                              <span>Preview Invoice</span>
                            </button>

                            {msg.isConfirmed ? (
                              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3.5 py-2 rounded-xl border border-emerald-200">
                                <Check className="w-4 h-4 text-emerald-600" />
                                <span>Confirmed in Ledger</span>
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleConfirmInvoice(msg.invoiceDraft!, msg.id)}
                                className="pp-button-primary !py-2 !px-4 !text-sm flex items-center gap-1.5 shadow-sm"
                              >
                                <Check className="w-4 h-4" />
                                <span>Confirm & Issue Invoice</span>
                              </button>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-2 px-1 text-[11px] text-slate-400 font-medium">
                        <span>{msg.timestamp}</span>
                      </div>
                    </div>
                  </div>
                ))}

                {loading && (
                  <div className="flex gap-3.5 mr-auto">
                    <div className="w-9 h-9 rounded-full bg-white text-[#0070ba] border border-slate-200 flex items-center justify-center">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    </div>
                    <div className="p-4 bg-white border border-slate-200 rounded-2xl rounded-tl-none text-sm text-slate-500 font-semibold flex items-center gap-2 shadow-2xs">
                      <span>PayGenie thinking & calculating for {activeClient.name}...</span>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input & Template Bar */}
              <div className="p-4 border-t border-slate-200 bg-white shrink-0 space-y-3">
                {/* One-Click Quick Templates Carousel */}
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 text-xs">
                  <span className="font-bold text-slate-500 uppercase tracking-wider shrink-0 text-[10px] flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5 text-[#0070ba]" />
                    <span>Templates:</span>
                  </span>
                  {BILLING_TEMPLATES.map((tmpl, idx) => (
                    <button
                      key={idx}
                      type="button"
                      disabled={loading}
                      onClick={() => {
                        setUserInput(tmpl.prompt);
                        toast.info(`Loaded ${tmpl.label} into input. You can edit numbers or rates before sending.`);
                      }}
                      className="cursor-pointer shrink-0 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-[#003087] border border-slate-200 hover:border-blue-300 font-semibold transition"
                    >
                      {tmpl.category === 'Email Template' ? (
                        <Mail className="w-3 h-3 text-[#0070ba]" />
                      ) : (
                        <FileCode className="w-3 h-3 text-emerald-600" />
                      )}
                      <span>{tmpl.label}</span>
                    </button>
                  ))}
                </div>

                {/* Input Textarea Form (Enter sends, Shift+Enter new line) */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="flex items-end gap-3"
                >
                  <div className="flex-1 relative">
                    <textarea
                      rows={2}
                      value={userInput}
                      disabled={loading}
                      onChange={(e) => setUserInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      placeholder={`Tell PayGenie what to bill ${activeClient.name}... (Press Enter to send, Shift + Enter for new line)`}
                      className="w-full bg-[#f8fafc] border border-slate-300 rounded-2xl px-5 py-3 text-base text-[#001435] placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#0070ba] focus:ring-2 focus:ring-[#0070ba]/20 transition font-medium resize-none leading-relaxed"
                    />
                  </div>

                  <div className="flex flex-col items-end gap-1.5 shrink-0 pb-1">
                    <button
                      type="submit"
                      disabled={loading || !userInput.trim()}
                      className="pp-button-primary !py-3 !px-6 !text-base shadow-sm disabled:opacity-50"
                      title="Send Message (Enter)"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                    <span className="text-[10px] font-bold text-slate-400">
                      Enter ↵ to send
                    </span>
                  </div>
                </form>
              </div>

            </div>
          ) : (
            /* ======================================= */
            /* MASTER SETTLEMENT LEDGER (All Clients)  */
            /* ======================================= */
            <div className="p-6 sm:p-8 space-y-6 flex-1 overflow-y-auto custom-scrollbar min-h-0 animate-fade-in">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <div>
                  <h2 className="text-2xl font-black text-[#001435]">Master Settlement Ledger</h2>
                  <p className="text-xs text-slate-500 mt-0.5">All client invoices, payment links & real-time settlement records</p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('chat')}
                  className="pp-button-primary !py-2 !px-5 !text-xs flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>+ Bill via Chat</span>
                </button>
              </div>

              {allInvoices.length === 0 ? (
                <div className="text-center py-20 text-slate-400 text-sm space-y-3">
                  <FileSpreadsheet className="w-12 h-12 text-slate-300 mx-auto" />
                  <p className="font-bold text-base text-slate-700">No invoices generated yet</p>
                  <p className="text-slate-500 text-xs">Pick a client from the left roster and chat with PayGenie to create your first invoice.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b-2 border-slate-200 text-slate-500 uppercase text-xs tracking-wider">
                        <th className="py-3 px-3 font-bold">Invoice #</th>
                        <th className="py-3 px-3 font-bold">Client & Email</th>
                        <th className="py-3 px-3 font-bold">Date & Due</th>
                        <th className="py-3 px-3 text-right font-bold">Amount</th>
                        <th className="py-3 px-3 text-center font-bold">Status</th>
                        <th className="py-3 px-3 text-right font-bold">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-800">
                      {allInvoices.map((inv, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/80 transition">
                          <td className="py-4 px-3 font-mono font-bold text-sm text-[#003087]">
                            {inv.invoiceNumber}
                            {inv.paymentId && (
                              <span className="block font-sans text-[11px] text-slate-400 font-normal">
                                TX: {inv.paymentId.slice(0, 14)}...
                              </span>
                            )}
                          </td>
                          <td className="py-4 px-3">
                            <p className="text-[#001435] font-bold text-sm">{inv.clientName}</p>
                            <p className="text-slate-500 text-xs">{inv.clientEmail}</p>
                          </td>
                          <td className="py-4 px-3 text-xs text-slate-600">
                            <span>{inv.date}</span>
                            <span className="block text-slate-400">Due: {inv.dueDate}</span>
                          </td>
                          <td className="py-4 px-3 text-right font-black text-sm text-[#001435]">
                            ${inv.totalAmount.toFixed(2)}
                            <span className="text-xs text-slate-400 block font-normal">{inv.currency}</span>
                          </td>
                          <td className="py-4 px-3 text-center">
                            {inv.status === 'PAID' ? (
                              <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <CheckCircle2 className="w-3.5 h-3.5" /> PAID
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                                <Clock className="w-3.5 h-3.5" /> AWAITING
                              </span>
                            )}
                          </td>
                          <td className="py-4 px-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedInvoice(inv);
                                  setIsModalOpen(true);
                                }}
                                className="cursor-pointer text-xs font-bold text-[#0070ba] hover:bg-blue-50 px-3 py-1.5 rounded-full border border-blue-200 transition inline-flex items-center gap-1 shadow-2xs"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>Inspect & Share</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteLedgerItem(inv.invoiceNumber)}
                                className="cursor-pointer p-1.5 rounded-full text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                                title="Delete from Ledger"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

        </section>

      </main>

      {/* Add New Client Modal */}
      {isNewClientModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4 animate-scale-up">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-black text-[#001435]">Add New Client</h3>
              <button
                onClick={() => setIsNewClientModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNewClient} className="space-y-4 text-xs font-semibold">
              <div className="space-y-1">
                <label className="text-slate-700">Client / Contact Name *</label>
                <input
                  type="text"
                  required
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                  placeholder="e.g. Sarah Connor or Acme Tech"
                  className="w-full bg-[#f8fafc] border border-slate-300 rounded-xl p-2.5 text-sm text-[#001435] focus:outline-none focus:border-[#0070ba]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-700">Client Email Address *</label>
                <input
                  type="email"
                  required
                  value={newClientEmail}
                  onChange={(e) => setNewClientEmail(e.target.value)}
                  placeholder="e.g. sarah@cyberdyne.com"
                  className="w-full bg-[#f8fafc] border border-slate-300 rounded-xl p-2.5 text-sm text-[#001435] focus:outline-none focus:border-[#0070ba]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-700">Company Name (Optional)</label>
                <input
                  type="text"
                  value={newClientCompany}
                  onChange={(e) => setNewClientCompany(e.target.value)}
                  placeholder="e.g. Cyberdyne Systems"
                  className="w-full bg-[#f8fafc] border border-slate-300 rounded-xl p-2.5 text-sm text-[#001435] focus:outline-none focus:border-[#0070ba]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-700">AI Chat Language Preference</label>
                <div className="grid grid-cols-3 gap-2 pt-1">
                  {(['English', 'Tanglish', 'Tamil'] as const).map((lang) => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => setNewClientLang(lang)}
                      className={`py-2 rounded-xl border text-center transition font-bold ${
                        newClientLang === lang
                          ? 'bg-[#003087] text-white border-[#003087]'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewClientModalOpen(false)}
                  className="pp-button-secondary !py-2 !px-4 !text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="pp-button-primary !py-2 !px-6 !text-xs"
                >
                  Create Client Thread
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Merchant Profile & API Keys Modal */}
      <MerchantProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        profile={merchantProfile}
        onSave={handleSaveMerchantProfile}
      />

      {/* Invoice Modal with Inline Quick AI Editor */}
      {selectedInvoice && (
        <InvoiceModal
          isOpen={isModalOpen}
          invoice={selectedInvoice}
          preferredLanguage={activeClient?.preferredLanguage || 'English'}
          onClose={() => setIsModalOpen(false)}
          onUpdate={handleUpdateInvoice}
          onDelete={handleDeleteLedgerItem}
        />
      )}

      {/* Official PayPal Themed Confirmation Dialog (No Browser alert/confirm) */}
      {confirmDialog.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4 animate-scale-up">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                confirmDialog.isDestructive ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-blue-50 text-[#003087] border border-blue-200'
              }`}>
                {confirmDialog.isDestructive ? <Trash2 className="w-5 h-5" /> : <RotateCcw className="w-5 h-5" />}
              </div>
              <div>
                <h3 className="text-base font-black text-[#001435]">{confirmDialog.title}</h3>
                <span className="text-xs text-slate-400 font-medium">Security & Data Confirmation</span>
              </div>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed font-medium">
              {confirmDialog.description}
            </p>

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
                className="pp-button-secondary !py-2 !px-4 !text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDialog.onConfirm}
                className={`cursor-pointer px-5 py-2 rounded-full text-xs font-bold transition shadow-xs ${
                  confirmDialog.isDestructive
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-[#003087] hover:bg-[#0070e0] text-white'
                }`}
              >
                {confirmDialog.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
