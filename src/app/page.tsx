'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  Send, 
  Sparkles, 
  FileSpreadsheet, 
  Trash2, 
  Clock, 
  CheckCircle2, 
  ExternalLink,
  Bot,
  RefreshCw,
  User,
  Wand2
} from 'lucide-react';
import InvoiceView from '@/components/InvoiceView';
import ClientPayPortal from '@/components/ClientPayPortal';
import GenieAvatar from '@/components/GenieAvatar';
import { InvoiceData } from '@/types/invoice';
import { toast } from 'sonner';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  invoice?: InvoiceData | null;
  timestamp: string;
}

function MainAppContent() {
  const searchParams = useSearchParams();
  const invoiceParam = searchParams.get('invoice');

  if (invoiceParam) {
    return <ClientPayPortal />;
  }

  return <GenieMerchantWorkspace />;
}

function GenieMerchantWorkspace() {
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentInvoice, setCurrentInvoice] = useState<InvoiceData | null>(null);
  const [history, setHistory] = useState<InvoiceData[]>([]);
  const [activeTab, setActiveTab] = useState<'genie' | 'ledger'>('genie');
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Time-aware magical genie greeting
  const getGenieGreeting = () => {
    const hour = new Date().getHours();
    let timeGreeting = 'Vanakkam & Good day!';
    if (hour < 12) timeGreeting = 'Kaalai Vanakkam! Good morning!';
    else if (hour < 17) timeGreeting = 'Mathiya Vanakkam! Good afternoon!';
    else timeGreeting = 'Maalai Vanakkam! Good evening!';

    return `${timeGreeting} Naan thaan unga **PayGenie** 🧞‍♂️✨\n\nYour wish is my command, master! Enkitta neenga normal-ah pesalam (English, Tamil, Tanglish ethula venumnalum!).\n\nE.g., *"Hi bro, epdi iruka?"* or *"Acme Tech-ku 10 hours React work $650 bill create pannu"* nu sonna odane structured invoice & PayPal link tharuren!`;
  };

  // Initialize greeting & local storage on mount
  useEffect(() => {
    const greetingMsg: ChatMessage = {
      id: 'greeting-1',
      role: 'assistant',
      content: getGenieGreeting(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages([greetingMsg]);

    try {
      const stored = localStorage.getItem('paygenie_invoices');
      if (stored) {
        const list: InvoiceData[] = JSON.parse(stored);
        setHistory(list);
        if (list.length > 0) {
          setCurrentInvoice(list[0]);
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const saveToStorage = (updatedHistory: InvoiceData[]) => {
    try {
      localStorage.setItem('paygenie_invoices', JSON.stringify(updatedHistory));
    } catch (e) {
      console.error(e);
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim() || loading) return;

    const userText = inputMessage.trim();
    setInputMessage('');

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      // Build conversation history for API
      const conversationPayload = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch('/api/genie-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: conversationPayload,
          userMessage: userText,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Genie could not hear your wish');
      }

      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.reply,
        invoice: data.invoice || null,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);

      // If an invoice was magically generated!
      if (data.invoice) {
        setCurrentInvoice(data.invoice);
        const updatedHistory = [data.invoice, ...history];
        setHistory(updatedHistory);
        saveToStorage(updatedHistory);
        toast.success(`✨ Invoice ${data.invoice.invoiceNumber} created & ready!`);
      }
    } catch (err: any) {
      toast.error(err.message || 'Genie is currently thinking...');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLedgerItem = (invoiceNumber: string) => {
    const updatedHistory = history.filter((i) => i.invoiceNumber !== invoiceNumber);
    setHistory(updatedHistory);
    saveToStorage(updatedHistory);
    if (currentInvoice?.invoiceNumber === invoiceNumber) {
      setCurrentInvoice(null);
    }
    toast.success(`Invoice ${invoiceNumber} deleted from ledger`);
  };

  return (
    <div className="min-h-screen bg-[#fafbfc] text-[#001435] flex flex-col font-sans">
      
      {/* Official PayPal Enterprise Global Navigation */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-50 shadow-xs">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#003087] flex items-center justify-center text-white font-extrabold text-xl tracking-tighter shadow-sm">
              P
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight text-[#001435]">
                  PayGenie <span className="text-[#0070ba]">AI</span>
                </span>
                <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-50 text-[#003087] border border-blue-200">
                  Interactive AI Genie
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="pp-segment-tabs">
              <button
                onClick={() => setActiveTab('genie')}
                className={`pp-segment-tab ${activeTab === 'genie' ? 'pp-segment-tab-active' : ''}`}
              >
                Genie Chamber
              </button>
              <button
                onClick={() => setActiveTab('ledger')}
                className={`pp-segment-tab ${activeTab === 'ledger' ? 'pp-segment-tab-active' : ''}`}
              >
                Ledger ({history.length})
              </button>
            </div>
          </div>

        </div>
      </header>

      {/* Main Stage */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 flex flex-col">
        {activeTab === 'genie' ? (
          <div className="flex-1 flex flex-col space-y-6">
            
            {/* Center Stage: Floating Magical Genie Avatar */}
            <div className="text-center py-4 flex flex-col items-center">
              <GenieAvatar isThinking={loading} mood={loading ? 'magic' : 'happy'} />
              <div className="mt-4 space-y-1">
                <h1 className="text-2xl sm:text-3xl font-black text-[#001435] tracking-tight">
                  Speak Your Wish to <span className="text-[#003087]">PayGenie</span> 🧞‍♂️
                </h1>
                <p className="text-xs sm:text-sm text-slate-500">
                  Chat casually, greet in Tanglish, or describe work to generate instant PayPal bills!
                </p>
              </div>
            </div>

            {/* Conversational Stream */}
            <div className="flex-1 space-y-4 pb-28">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 items-start animate-fade-in ${
                    msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                  }`}
                >
                  {/* Avatar Icon */}
                  <div
                    className={`w-9 h-9 rounded-full shrink-0 flex items-center justify-center text-sm shadow-xs ${
                      msg.role === 'user'
                        ? 'bg-[#003087] text-white'
                        : 'bg-gradient-to-tr from-[#0070ba] to-sky-300 text-white font-bold'
                    }`}
                  >
                    {msg.role === 'user' ? <User className="w-4 h-4" /> : '🧞‍♂️'}
                  </div>

                  {/* Message Bubble Content */}
                  <div className={`max-w-[85%] space-y-3 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                    <div
                      className={`inline-block p-4 rounded-3xl text-sm leading-relaxed shadow-xs ${
                        msg.role === 'user'
                          ? 'bg-[#003087] text-white rounded-tr-xs'
                          : 'bg-white border border-slate-200 text-[#001435] rounded-tl-xs'
                      }`}
                    >
                      <p className="whitespace-pre-line">{msg.content}</p>
                      <span className={`text-[10px] block mt-1.5 opacity-60 ${msg.role === 'user' ? 'text-white' : 'text-slate-400'}`}>
                        {msg.timestamp}
                      </span>
                    </div>

                    {/* If this Genie reply created an Invoice, render the Invoice Card right inline! */}
                    {msg.invoice && (
                      <div className="text-left mt-3 animate-fade-in">
                        <div className="flex items-center justify-between pb-2 mb-2">
                          <span className="text-xs font-bold text-[#003087] uppercase tracking-wider flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-[#0070ba]" />
                            <span>Magical Structured Invoice</span>
                          </span>
                          <a
                            href={`/?invoice=${msg.invoice.invoiceNumber}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-bold text-[#003087] bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3 py-1 rounded-full transition"
                          >
                            <span>Client Mobile View</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                        <InvoiceView 
                          invoice={msg.invoice}
                          onUpdateInvoice={(updated) => {
                            setCurrentInvoice(updated);
                            const updatedHistory = history.map((i) =>
                              i.invoiceNumber === updated.invoiceNumber ? updated : i
                            );
                            setHistory(updatedHistory);
                            saveToStorage(updatedHistory);
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex gap-3 items-center text-xs text-slate-500 animate-pulse">
                  <div className="w-8 h-8 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center font-bold">
                    🧞‍♂️
                  </div>
                  <span className="italic">PayGenie is crafting your wish...</span>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Bottom Fixed Chat Input Bar */}
            <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-slate-200 py-4 px-4 z-40">
              <div className="max-w-4xl mx-auto">
                <form onSubmit={handleSendMessage} className="relative flex items-center gap-2">
                  <input
                    type="text"
                    value={inputMessage}
                    disabled={loading}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Speak to PayGenie... e.g. 'Hi bro!' or 'Acme Tech-ku $650 bill ready pannu'..."
                    className="flex-1 bg-[#f8fafc] border border-slate-300 rounded-full py-3.5 pl-6 pr-14 text-sm text-[#001435] placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#0070ba] focus:ring-2 focus:ring-[#0070ba]/20 transition disabled:opacity-60"
                  />
                  
                  <button
                    type="submit"
                    disabled={loading || !inputMessage.trim()}
                    className="absolute right-2 pp-button-primary !p-2.5 !min-w-0 !rounded-full disabled:opacity-40 disabled:cursor-not-allowed"
                    title="Send wish"
                  >
                    {loading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </button>
                </form>
              </div>
            </div>

          </div>
        ) : (
          /* Ledger Tab */
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-9 shadow-xs space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200">
              <div>
                <h2 className="text-2xl font-black text-[#001435]">Merchant Settlement Ledger</h2>
                <p className="text-xs text-slate-500 mt-0.5">Session records & confirmed PayPal client payments</p>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <span className="text-[11px] uppercase font-bold text-slate-400 block">Total Invoices</span>
                  <span className="text-xl font-bold text-slate-700">{history.length}</span>
                </div>
                <div className="text-right pl-6 border-l border-slate-200">
                  <span className="text-[11px] uppercase font-bold text-slate-400 block">Total Collected</span>
                  <span className="text-2xl font-black text-emerald-600">
                    ${history
                      .filter((i) => i.status === 'PAID')
                      .reduce((sum, i) => sum + i.totalAmount, 0)
                      .toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {history.length === 0 ? (
              <div className="text-center py-16 text-slate-400 text-xs space-y-3">
                <FileSpreadsheet className="w-12 h-12 text-slate-300 mx-auto" />
                <p className="font-bold text-sm text-slate-600">No invoices in this session</p>
                <p className="text-slate-400">Ask the Genie in the Genie Chamber to craft your first invoice.</p>
                <button
                  type="button"
                  onClick={() => setActiveTab('genie')}
                  className="pp-button-secondary !py-2 !text-xs"
                >
                  Talk to Genie →
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b-2 border-slate-200 text-slate-500 uppercase text-[11px]">
                      <th className="py-3 px-3 font-bold">Invoice #</th>
                      <th className="py-3 px-3 font-bold">Client & Email</th>
                      <th className="py-3 px-3 font-bold">Issue / Due Date</th>
                      <th className="py-3 px-3 text-right font-bold">Amount</th>
                      <th className="py-3 px-3 text-center font-bold">Payment Status</th>
                      <th className="py-3 px-3 text-right font-bold">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {history.map((inv, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 transition">
                        <td className="py-4 px-3 font-mono font-bold text-[#003087]">
                          {inv.invoiceNumber}
                          {inv.paymentId && (
                            <span className="block font-sans text-[10px] text-slate-400 font-normal">
                              TX: {inv.paymentId.slice(0, 14)}...
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-3">
                          <p className="text-[#001435] font-bold">{inv.clientName}</p>
                          <p className="text-slate-400 text-[11px]">{inv.clientEmail}</p>
                        </td>
                        <td className="py-4 px-3 text-slate-500">
                          <span>{inv.date}</span>
                          <span className="block text-slate-400 text-[10px]">Due: {inv.dueDate}</span>
                        </td>
                        <td className="py-4 px-3 text-right font-bold text-[#001435]">
                          ${inv.totalAmount.toFixed(2)}
                          <span className="text-[10px] text-slate-400 block font-normal">{inv.currency}</span>
                        </td>
                        <td className="py-4 px-3 text-center">
                          {inv.status === 'PAID' ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3" /> PAID
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                              <Clock className="w-3 h-3" /> AWAITING PAYMENT
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <a
                              href={`/?invoice=${inv.invoiceNumber}`}
                              target="_blank"
                              rel="noreferrer"
                              className="cursor-pointer text-xs font-bold text-[#0070ba] hover:bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200 transition inline-flex items-center gap-1"
                            >
                              <span>Client Pay Link</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                            <button
                              type="button"
                              onClick={() => handleDeleteLedgerItem(inv.invoiceNumber)}
                              className="cursor-pointer p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
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
      </main>

    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <MainAppContent />
    </Suspense>
  );
}
