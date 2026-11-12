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
  FileText,
  Mail
} from 'lucide-react';

const BILLING_TEMPLATES = [
  {
    label: 'Hourly Engineering',
    prompt: 'Billed 12 hours of full-stack engineering & PayPal integration at $65/hr with a 5% early payment discount.',
  },
  {
    label: 'Design & Branding',
    prompt: 'Complete branding package: UI kit, 5 custom illustrations & logo design for $450, payment due upon receipt.',
  },
  {
    label: 'Monthly Retainer',
    prompt: 'Monthly cloud infrastructure maintenance and consulting retainer for $800, Net 14 days.',
  },
  {
    label: 'Fixed Milestone',
    prompt: 'Milestone 2 completion: Payment gateway checkout flow & automated receipts for $1,200.',
  },
];
import ClientPayPortal from '@/components/ClientPayPortal';
import InvoiceModal from '@/components/InvoiceModal';
import MerchantProfileModal from '@/components/MerchantProfileModal';
import { TemplateManagerModal, getStoredTemplates } from '@/components/TemplateManagerModal';
import { PayGenieLogo } from '@/components/PayGenieLogo';
import { InvoiceData, ClientProfile, ChatMessage, MerchantProfile, CustomTemplateItem } from '@/types/invoice';
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
    messages: [],
    invoices: [],
  },
  {
    id: 'client-2',
    name: 'Nexus Labs',
    email: 'finance@nexuslabs.co',
    company: 'Nexus Software Studio',
    preferredLanguage: 'English',
    avatarBg: 'bg-indigo-600',
    createdAt: '2026-03-05',
    messages: [],
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
    messages: [],
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
  const [isStorageLoaded, setIsStorageLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'ledger'>('chat');
  
  // Clients & Sidebar state
  const [clients, setClients] = useState<ClientProfile[]>(DEFAULT_CLIENTS);
  const [selectedClientId, setSelectedClientId] = useState<string>(DEFAULT_CLIENTS[0].id);
  const [searchQuery, setSearchQuery] = useState('');
  const [isNewClientModalOpen, setIsNewClientModalOpen] = useState(false);

  // New / Edit Client Form state
  const [newClientName, setNewClientName] = useState('');
  const [newClientEmail, setNewClientEmail] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');
  const [newClientCompany, setNewClientCompany] = useState('');
  const [newClientLang, setNewClientLang] = useState<'English' | 'Tanglish' | 'Tamil'>('English');
  const [editingClientId, setEditingClientId] = useState<string | null>(null); // null = create new, string = edit existing

  // Chat input & loading (per-client isolated)
  const [userInput, setUserInput] = useState('');
  const [generatingClientId, setGeneratingClientId] = useState<string | null>(null);

  // Modal inspection
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalPreviewOnly, setIsModalPreviewOnly] = useState(false);
  const [isClientInvoicesDropdownOpen, setIsClientInvoicesDropdownOpen] = useState(false);
  const [invoiceDropdownSearch, setInvoiceDropdownSearch] = useState('');

  // Merchant Profile Modal state
  const [merchantProfile, setMerchantProfile] = useState<MerchantProfile>(DEFAULT_MERCHANT);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Template Manager Modal state & dynamic billing templates
  const [isTemplateManagerOpen, setIsTemplateManagerOpen] = useState(false);
  const [templateManagerInitialType, setTemplateManagerInitialType] = useState<'invoice' | 'email' | 'whatsapp'>('invoice');
  const [allAppTemplates, setAllAppTemplates] = useState<CustomTemplateItem[]>([]);

  const reloadAppTemplates = () => {
    setAllAppTemplates(getStoredTemplates());
  };

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
      // Versioned key to ensure fresh chat starting state without old hardcoded AI messages
      const storageKey = 'paygenie_clients_v3';
      const storedClients = localStorage.getItem(storageKey);
      const savedActiveClientId = localStorage.getItem('paygenie_selected_client_id');

      if (storedClients) {
        const parsed = JSON.parse(storedClients);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setClients(parsed);
          // Persist the exact client thread the user was viewing
          if (savedActiveClientId && parsed.some((c: any) => c.id === savedActiveClientId)) {
            setSelectedClientId(savedActiveClientId);
          } else {
            setSelectedClientId(parsed[0].id);
          }
        }
      } else {
        // First load of v3: strip old seeded assistant starter messages from legacy cache
        const oldV2 = localStorage.getItem('paygenie_clients_v2');
        if (oldV2) {
          try {
            const parsedOld = JSON.parse(oldV2);
            if (Array.isArray(parsedOld)) {
              const cleaned = parsedOld.map((c: any) => ({
                ...c,
                messages: (c.messages || []).filter((m: any) => m.id !== 'msg-1' && m.id !== 'msg-2' && m.id !== 'msg-3'),
              }));
              setClients(cleaned);
              if (savedActiveClientId && cleaned.some((c: any) => c.id === savedActiveClientId)) {
                setSelectedClientId(savedActiveClientId);
              } else {
                setSelectedClientId(cleaned[0]?.id || DEFAULT_CLIENTS[0].id);
              }
              localStorage.setItem(storageKey, JSON.stringify(cleaned));
            }
          } catch (e) {
            console.error(e);
          }
        } else {
          // Initialize with clean empty messages
          localStorage.setItem(storageKey, JSON.stringify(DEFAULT_CLIENTS));
        }
      }

      const storedMerchant = localStorage.getItem('paygenie_merchant_profile');
      if (storedMerchant) {
        setMerchantProfile(JSON.parse(storedMerchant));
      }

      // Load custom templates
      reloadAppTemplates();
    } catch (e) {
      console.error(e);
    } finally {
      setIsStorageLoaded(true);
    }

    // Real-time settlement & cross-tab chat live sync listener
    let channel: BroadcastChannel | null = null;
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'paygenie_clients_v2' && e.newValue) {
        try {
          const freshClients = JSON.parse(e.newValue);
          if (Array.isArray(freshClients)) {
            setClients(freshClients);
          }
        } catch (err) {
          console.error(err);
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);

    try {
      channel = new BroadcastChannel('paygenie_live_sync');
      channel.onmessage = (event) => {
        if (event.data?.type === 'PAYMENT_SETTLED') {
          const { invoiceNumber, paymentId, paidAt } = event.data;
          
          setClients((prev) => {
            const updated: ClientProfile[] = prev.map((c) => ({
              ...c,
              invoices: (c.invoices || []).map((inv) =>
                inv.invoiceNumber === invoiceNumber
                  ? { ...inv, status: 'PAID' as const, paymentId, paidAt }
                  : inv
              ),
              messages: (c.messages || []).map((m) =>
                m.invoiceDraft && m.invoiceDraft.invoiceNumber === invoiceNumber
                  ? { ...m, invoiceDraft: { ...m.invoiceDraft, status: 'PAID' as const, paymentId, paidAt } }
                  : m
              ),
            }));
            saveClientsToStorage(updated, false); // Don't broadcast back
            return updated;
          });

          setSelectedInvoice((cur) => {
            if (!cur || cur.invoiceNumber !== invoiceNumber) return cur;
            return { ...cur, status: 'PAID' as const, paymentId, paidAt };
          });

          toast.success(`🎉 Client just paid invoice ${invoiceNumber} via PayPal!`);
        } else if (event.data?.type === 'CLIENTS_UPDATED') {
          // Cross-tab synchronization when another tab creates/updates messages or clients
          if (Array.isArray(event.data.clients)) {
            setClients(event.data.clients);
          }
        } else if (event.data?.type === 'TEMPLATES_UPDATED') {
          reloadAppTemplates();
        }
      };
    } catch (e) {
      console.error(e);
    }

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      if (channel) channel.close();
    };
  }, []);

  // Global ESC key listener to close modals & popups in workspace
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (confirmDialog.isOpen) {
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
          return;
        }
        if (isNewClientModalOpen) {
          setIsNewClientModalOpen(false);
          return;
        }
        if (isClientInvoicesDropdownOpen) {
          setIsClientInvoicesDropdownOpen(false);
          return;
        }
        if (isProfileModalOpen) {
          setIsProfileModalOpen(false);
          return;
        }
        if (isTemplateManagerOpen) {
          setIsTemplateManagerOpen(false);
          return;
        }
        if (isModalOpen) {
          setIsModalOpen(false);
          setIsModalPreviewOnly(false);
          return;
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    confirmDialog.isOpen,
    isNewClientModalOpen,
    isClientInvoicesDropdownOpen,
    isProfileModalOpen,
    isTemplateManagerOpen,
    isModalOpen,
  ]);

  // Persist selected client to localStorage whenever user switches clients
  const handleSelectClient = (clientId: string) => {
    setSelectedClientId(clientId);
    try {
      localStorage.setItem('paygenie_selected_client_id', clientId);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    // Immediate scroll to bottom on mount, client switch, or message change
    const scrollToBottom = () => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'auto' });
      }
    };
    
    // Run immediately and also after small tick for DOM settling
    scrollToBottom();
    const timer = setTimeout(scrollToBottom, 60);
    return () => clearTimeout(timer);
  }, [selectedClientId, activeClient?.messages, generatingClientId]);

  const saveClientsToStorage = (updatedClients: ClientProfile[], broadcast = true) => {
    try {
      localStorage.setItem('paygenie_clients_v3', JSON.stringify(updatedClients));
      localStorage.setItem('paygenie_clients_v2', JSON.stringify(updatedClients));
      // Also sync old storage for compatibility with client checkout
      const flat = updatedClients.flatMap((c) => c.invoices || []);
      localStorage.setItem('paygenie_invoices', JSON.stringify(flat));

      if (broadcast) {
        const syncChannel = new BroadcastChannel('paygenie_live_sync');
        syncChannel.postMessage({
          type: 'CLIENTS_UPDATED',
          clients: updatedClients,
        });
        syncChannel.close();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleOpenAddClientModal = () => {
    setEditingClientId(null);
    setNewClientName('');
    setNewClientEmail('');
    setNewClientPhone('');
    setNewClientCompany('');
    setNewClientLang('English');
    setIsNewClientModalOpen(true);
  };

  const handleOpenEditClientModal = (client: ClientProfile) => {
    setEditingClientId(client.id);
    setNewClientName(client.name);
    setNewClientEmail(client.email);
    setNewClientPhone(client.phone || '');
    setNewClientCompany(client.company || '');
    setNewClientLang(client.preferredLanguage || 'English');
    setIsNewClientModalOpen(true);
  };

  const handleDeleteClient = (clientId: string) => {
    const target = clients.find((c) => c.id === clientId);
    if (!target) return;
    if (clients.length <= 1) {
      toast.error('At least one client thread must remain in workspace.');
      return;
    }

    openConfirmation({
      title: `Delete Client ${target.name}`,
      description: `Are you sure you want to delete ${target.name} and all related invoices and chat logs? This action cannot be reversed.`,
      confirmText: 'Delete Client',
      isDestructive: true,
      onConfirm: () => {
        const remaining = clients.filter((c) => c.id !== clientId);
        setClients(remaining);
        setSelectedClientId(remaining[0].id);
        saveClientsToStorage(remaining);
        toast.success(`Client ${target.name} removed.`);
      },
    });
  };

  const handleSaveClientModal = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = newClientName.trim();
    const cleanEmail = newClientEmail.trim();

    if (!cleanName) {
      toast.error('Client name is required');
      return;
    }
    // Strict email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      toast.error('Please enter a valid email address (e.g. client@company.com)');
      return;
    }

    if (newClientPhone.trim() && !/^[+0-9\s\-()]{7,20}$/.test(newClientPhone.trim())) {
      toast.error('Please enter a valid phone/WhatsApp number with country code (e.g. +91 9876543210)');
      return;
    }

    if (editingClientId) {
      // Editing existing client
      const updated = clients.map((c) => {
        if (c.id !== editingClientId) return c;
        return {
          ...c,
          name: cleanName,
          email: cleanEmail,
          phone: newClientPhone.trim() || undefined,
          company: newClientCompany.trim() || undefined,
          preferredLanguage: newClientLang,
        };
      });
      setClients(updated);
      saveClientsToStorage(updated);
      setIsNewClientModalOpen(false);
      toast.success(`Client ${cleanName} updated successfully!`);
      return;
    }

    // Creating new client
    const colors = ['bg-blue-600', 'bg-indigo-600', 'bg-emerald-600', 'bg-purple-600', 'bg-amber-600'];
    const newClient: ClientProfile = {
      id: `client-${Date.now()}`,
      name: newClientName.trim(),
      email: newClientEmail.trim(),
      phone: newClientPhone.trim() || undefined,
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
    setNewClientPhone('');
    setNewClientCompany('');
    setIsNewClientModalOpen(false);
    toast.success(`Client ${newClient.name} added!`);
  };

  const handleSendMessage = async (customPrompt?: string) => {
    const textToSend = customPrompt || userInput;
    if (!textToSend.trim() || generatingClientId === activeClient?.id || !activeClient) return;

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
    setGeneratingClientId(activeClient.id);

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

      // Ensure invoice draft includes client phone if client has one
      const invoiceWithContact: InvoiceData | undefined = data.invoice
        ? {
            ...data.invoice,
            clientPhone: activeClient.phone || data.invoice.clientPhone,
          }
        : undefined;

      const aiMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: data.reply || 'Invoice updated! Preview paathutu confirm pannunga.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        invoiceDraft: invoiceWithContact,
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
      setGeneratingClientId(null);
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
      const upd = prev.map((c) => {
        // Find if this client owns the invoice or is currently active
        const hasInvoice = (c.invoices || []).some((inv) => inv.invoiceNumber === updated.invoiceNumber);
        const isCurrentActive = c.id === activeClient.id;

        if (hasInvoice) {
          return {
            ...c,
            invoices: (c.invoices || []).map((inv) =>
              inv.invoiceNumber === updated.invoiceNumber ? updated : inv
            ),
            // Also update any message holding this invoiceDraft
            messages: (c.messages || []).map((m) =>
              m.invoiceDraft?.invoiceNumber === updated.invoiceNumber
                ? { ...m, invoiceDraft: updated }
                : m
            ),
          };
        } else if (isCurrentActive) {
          // If invoice is new or not yet in invoices array, add it to current client's invoices
          const alreadyInInvoices = (c.invoices || []).some((i) => i.invoiceNumber === updated.invoiceNumber);
          const nextInvoices = alreadyInInvoices
            ? (c.invoices || []).map((i) => i.invoiceNumber === updated.invoiceNumber ? updated : i)
            : [updated, ...(c.invoices || [])];

          // Also update or add to messages
          const nextMessages = (c.messages || []).map((m) =>
            m.invoiceDraft?.invoiceNumber === updated.invoiceNumber
              ? { ...m, invoiceDraft: updated }
              : m
          );

          return {
            ...c,
            invoices: nextInvoices,
            messages: nextMessages,
          };
        }
        return c;
      });

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
                onClick={handleOpenAddClientModal}
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
                    handleSelectClient(c.id);
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
                    {generatingClientId === c.id ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#0070ba] bg-blue-50 px-1.5 py-0.5 rounded-full border border-blue-200">
                        <RefreshCw className="w-2.5 h-2.5 animate-spin" /> thinking
                      </span>
                    ) : pendingCount > 0 ? (
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                        {pendingCount} due
                      </span>
                    ) : null}
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
              
              {/* Chat Header with Client Name, Phone, Edit/Delete & Language Selector */}
              <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl ${activeClient.avatarBg || 'bg-blue-600'} text-white flex items-center justify-center font-bold text-base shadow-xs`}>
                    {activeClient.name.slice(0, 1)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-[#001435]">{activeClient.name}</h3>
                      <span className="text-xs text-slate-500 font-normal">({activeClient.email})</span>
                      {activeClient.phone && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                          WhatsApp: {activeClient.phone}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 font-medium">
                      {activeClient.company ? `${activeClient.company} · ` : ''}Dedicated PayGenie Invoicing Thread
                    </p>
                  </div>
                </div>

                {/* Client Invoices Dropdown / Button, Edit, Delete, Clear Chat & Language Selector */}
                <div className="flex items-center gap-2">
                  {/* Client Invoices Manager Pill (Supports 1 or multiple invoices cleanly) */}
                  {(() => {
                    const clientInvoices = activeClient.invoices || [];
                    const latestDraft = [...(activeClient.messages || [])].reverse().find((m) => m.invoiceDraft)?.invoiceDraft;
                    
                    // Combine confirmed invoices and any pending draft
                    const availableInvoices = [...clientInvoices];
                    if (latestDraft && !availableInvoices.some((i) => i.invoiceNumber === latestDraft.invoiceNumber)) {
                      availableInvoices.unshift(latestDraft);
                    }

                    if (availableInvoices.length === 0) return null;

                    if (availableInvoices.length === 1) {
                      return (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedInvoice(availableInvoices[0]);
                            setIsModalOpen(true);
                          }}
                          className="cursor-pointer inline-flex items-center gap-1.5 text-xs font-bold text-white bg-[#003087] hover:bg-[#0070e0] px-3.5 py-1.5 rounded-xl shadow-2xs transition"
                          title="View & manage client invoice"
                        >
                          <Receipt className="w-3.5 h-3.5" />
                          <span>View Invoice</span>
                        </button>
                      );
                    }

                    // If multiple invoices exist (2, 3, 5 etc.) - Custom PayPal Theme Dropdown Menu with Search & Max Height
                    const filteredDropdownInvoices = availableInvoices.filter((inv) =>
                      inv.invoiceNumber.toLowerCase().includes(invoiceDropdownSearch.toLowerCase()) ||
                      (inv.dueDate && inv.dueDate.toLowerCase().includes(invoiceDropdownSearch.toLowerCase())) ||
                      inv.totalAmount.toString().includes(invoiceDropdownSearch)
                    );

                    return (
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => {
                            setIsClientInvoicesDropdownOpen(!isClientInvoicesDropdownOpen);
                            setInvoiceDropdownSearch('');
                          }}
                          className="cursor-pointer inline-flex items-center gap-2 text-xs font-bold text-white bg-[#003087] hover:bg-[#002466] px-3.5 py-1.5 rounded-xl shadow-2xs transition border border-[#003087]"
                        >
                          <Receipt className="w-3.5 h-3.5 text-blue-200" />
                          <span>Invoices ({availableInvoices.length})</span>
                          <span className={`text-[9px] transition-transform ${isClientInvoicesDropdownOpen ? 'rotate-180' : ''}`}>
                            ▼
                          </span>
                        </button>

                        {isClientInvoicesDropdownOpen && (
                          <>
                            {/* Backdrop to close dropdown on outside click */}
                            <div
                              className="fixed inset-0 z-30"
                              onClick={() => {
                                setIsClientInvoicesDropdownOpen(false);
                                setInvoiceDropdownSearch('');
                              }}
                            />

                            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 z-40 py-2 animate-scale-up overflow-hidden">
                              <div className="px-3.5 py-1.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                  {activeClient.name} Invoices
                                </span>
                                <span className="text-[10px] font-bold bg-blue-100/70 text-[#003087] px-2 py-0.5 rounded-full">
                                  {availableInvoices.length} Total
                                </span>
                              </div>

                              {/* Search Box inside Dropdown if 3 or more invoices */}
                              {availableInvoices.length >= 3 && (
                                <div className="p-2 border-b border-slate-100 bg-white">
                                  <div className="relative">
                                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
                                    <input
                                      type="text"
                                      autoFocus
                                      value={invoiceDropdownSearch}
                                      onChange={(e) => setInvoiceDropdownSearch(e.target.value)}
                                      placeholder="Search invoice # or amount..."
                                      className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-2.5 py-1 text-xs text-slate-900 focus:outline-none focus:border-[#0070ba]"
                                    />
                                  </div>
                                </div>
                              )}

                              {/* Scrollable List with Max Height */}
                              <div className="max-h-64 overflow-y-auto custom-scrollbar divide-y divide-slate-100">
                                {filteredDropdownInvoices.length === 0 ? (
                                  <div className="p-4 text-center text-xs text-slate-400">
                                    No invoices match &ldquo;{invoiceDropdownSearch}&rdquo;
                                  </div>
                                ) : (
                                  filteredDropdownInvoices.map((inv) => (
                                    <button
                                      key={inv.invoiceNumber}
                                      type="button"
                                      onClick={() => {
                                        setSelectedInvoice(inv);
                                        setIsModalOpen(true);
                                        setIsClientInvoicesDropdownOpen(false);
                                        setInvoiceDropdownSearch('');
                                      }}
                                      className="w-full text-left p-3 hover:bg-blue-50/70 transition flex items-center justify-between gap-2 cursor-pointer group"
                                    >
                                      <div className="truncate">
                                        <p className="font-mono text-xs font-bold text-[#003087] group-hover:text-[#0070ba] flex items-center gap-1.5">
                                          <FileText className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#0070ba]" />
                                          <span>{inv.invoiceNumber}</span>
                                        </p>
                                        <p className="text-[11px] text-slate-500 mt-0.5">
                                          Due: {inv.dueDate || 'Upon receipt'}
                                        </p>
                                      </div>

                                      <div className="text-right shrink-0">
                                        <p className="font-bold text-xs text-[#001435]">
                                          ${inv.totalAmount.toFixed(2)}
                                        </p>
                                        {inv.status === 'PAID' ? (
                                          <span className="text-[9.5px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                                            PAID
                                          </span>
                                        ) : (
                                          <span className="text-[9.5px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                                            PENDING
                                          </span>
                                        )}
                                      </div>
                                    </button>
                                  ))
                                )}
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })()}

                  <button
                    type="button"
                    onClick={() => handleOpenEditClientModal(activeClient)}
                    className="cursor-pointer inline-flex items-center gap-1 text-xs font-bold text-[#003087] bg-white hover:bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-200 shadow-2xs transition"
                    title="Edit client details or WhatsApp number"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-[#0070ba]" />
                    <span className="hidden sm:inline">Edit Client</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteClient(activeClient.id)}
                    className="cursor-pointer text-xs font-bold text-slate-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-xl border border-transparent hover:border-red-200 transition"
                    title={`Delete client ${activeClient.name}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={handleClearEntireChat}
                    className="cursor-pointer text-xs font-bold text-slate-400 hover:text-amber-600 hover:bg-amber-50 p-2 rounded-xl border border-transparent hover:border-amber-200 transition"
                    title="Clear entire chat history"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Chat Message Scrollable Container */}
              <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-5 bg-[#fcfdfe] min-h-0 flex flex-col">
                {!isStorageLoaded ? (
                  /* Initial hydration loader — prevents flash of empty hero on refresh */
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-3 my-auto">
                    <RefreshCw className="w-6 h-6 animate-spin text-[#0070ba]" />
                    <span className="text-xs font-semibold text-slate-400">Loading conversation history...</span>
                  </div>
                ) : (activeClient.messages || []).length === 0 ? (
                  /* Empty state: ChatGPT-style clean centered hero (disappears once user sends a message) */
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-4 animate-fade-in my-auto">
                    <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-200/80 flex items-center justify-center text-[#003087] shadow-sm">
                      <Sparkles className="w-7 h-7 text-[#0070ba]" />
                    </div>

                    <div className="space-y-1.5 max-w-lg">
                      <h2 className="text-2xl sm:text-3xl font-extrabold text-[#001435] tracking-tight">
                        {(() => {
                          const hour = new Date().getHours();
                          const timeGreeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
                          return `${timeGreeting}! Ready to bill ${activeClient.name}?`;
                        })()}
                      </h2>
                      <p className="text-sm text-slate-500 font-medium leading-relaxed">
                        Chat naturally in any preferred language or phrasing — PayGenie drafts, verifies and settles invoices seamlessly.
                      </p>
                    </div>

                    {/* Quick Start Suggestions */}
                    <div className="flex flex-wrap items-center justify-center gap-2 pt-2 max-w-md">
                      {[
                        `Bill 10 hours of design at $80/hr`,
                        `Milestone payment for $1,200 with 5% discount`,
                        `Monthly retainer invoice for ${activeClient.name}`,
                      ].map((hint, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setUserInput(hint);
                          }}
                          className="cursor-pointer text-xs font-semibold px-3.5 py-1.5 rounded-full bg-slate-50 hover:bg-blue-50 text-slate-600 hover:text-[#003087] border border-slate-200 hover:border-blue-300 transition shadow-2xs"
                        >
                          &ldquo;{hint}&rdquo;
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  (activeClient.messages || []).map((msg, index) => (
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
                                setIsModalPreviewOnly(true);
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
                ))
              )}

                {generatingClientId === activeClient.id && (
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
                  {(allAppTemplates.filter((t) => t.type === 'invoice').length > 0
                    ? allAppTemplates.filter((t) => t.type === 'invoice')
                    : BILLING_TEMPLATES.map((b, i) => ({ id: `default-${i}`, name: b.label, content: b.prompt, type: 'invoice' as const }))
                  ).map((tmpl) => (
                    <button
                      key={tmpl.id}
                      type="button"
                      disabled={generatingClientId === activeClient.id}
                      onClick={() => {
                        setUserInput(tmpl.content);
                        toast.info(`Loaded "${tmpl.name}" template into input.`);
                      }}
                      className="cursor-pointer shrink-0 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-[#003087] border border-slate-200 hover:border-blue-300 font-semibold transition shadow-2xs"
                    >
                      <FileCode className="w-3 h-3 text-emerald-600" />
                      <span>{tmpl.name}</span>
                    </button>
                  ))}

                  <button
                    type="button"
                    onClick={() => {
                      setTemplateManagerInitialType('invoice');
                      setIsTemplateManagerOpen(true);
                    }}
                    className="cursor-pointer shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs border border-slate-300 transition"
                    title="Manage / Add / Edit Invoice Templates"
                  >
                    <Plus className="w-3 h-3 text-[#0070ba]" />
                    <span>Manage</span>
                  </button>
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
                      rows={Math.min(6, Math.max(2, userInput.split('\n').length))}
                      value={userInput}
                      disabled={generatingClientId === activeClient.id}
                      onChange={(e) => setUserInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      placeholder={`Tell PayGenie what to bill ${activeClient.name}... (Press Enter to send, Shift + Enter for new line)`}
                      className="w-full bg-[#f8fafc] border border-slate-300 rounded-2xl px-5 py-3 text-base text-[#001435] placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#0070ba] focus:ring-2 focus:ring-[#0070ba]/20 transition font-medium resize-y min-h-[58px] max-h-48 leading-relaxed custom-scrollbar"
                    />
                  </div>

                  <div className="flex flex-col items-end gap-1.5 shrink-0 pb-1">
                    <button
                      type="submit"
                      disabled={generatingClientId === activeClient.id || !userInput.trim()}
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
                                  setIsModalPreviewOnly(false);
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

      {/* Add / Edit Client Modal */}
      {isNewClientModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4 animate-scale-up">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-black text-[#001435]">
                  {editingClientId ? 'Edit Client Details' : 'Add New Client'}
                </h3>
                <span className="text-xs text-slate-400 font-medium">
                  {editingClientId ? 'Update contact & WhatsApp billing profile' : 'Create dedicated client billing thread'}
                </span>
              </div>
              <button
                onClick={() => setIsNewClientModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveClientModal} className="space-y-3.5 text-xs font-semibold">
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
                <label className="text-slate-700 flex items-center justify-between">
                  <span>WhatsApp / Phone Number (Optional)</span>
                  <span className="text-[10.5px] font-normal text-slate-400">Include country code</span>
                </label>
                <input
                  type="text"
                  value={newClientPhone}
                  onChange={(e) => setNewClientPhone(e.target.value)}
                  placeholder="e.g. +91 9876543210 or +1 415 555 2671"
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
                  {editingClientId ? 'Save Changes' : 'Create Client Thread'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Template Manager Modal */}
      <TemplateManagerModal
        isOpen={isTemplateManagerOpen}
        onClose={() => setIsTemplateManagerOpen(false)}
        initialType={templateManagerInitialType}
        onTemplatesChanged={reloadAppTemplates}
      />

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
          previewOnly={isModalPreviewOnly}
          preferredLanguage={activeClient?.preferredLanguage || 'English'}
          onClose={() => {
            setIsModalOpen(false);
            setIsModalPreviewOnly(false);
          }}
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
