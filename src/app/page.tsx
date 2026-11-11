'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  Send, 
  Sparkles, 
  ExternalLink,
  RefreshCw,
  FileSpreadsheet,
  Trash2,
  CheckCircle2,
  Clock,
  X
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

  return <PureGenieExperience />;
}

function PureGenieExperience() {
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [latestInvoice, setLatestInvoice] = useState<InvoiceData | null>(null);
  const [history, setHistory] = useState<InvoiceData[]>([]);
  const [showLedgerDrawer, setShowLedgerDrawer] = useState(false);

  // Time-aware greeting speech
  const getInitialSpeech = () => {
    const hour = new Date().getHours();
    let timeGreeting = 'Vanakkam!';
    if (hour < 12) timeGreeting = 'Kaalai Vanakkam! Good morning!';
    else if (hour < 17) timeGreeting = 'Mathiya Vanakkam! Good afternoon!';
    else timeGreeting = 'Maalai Vanakkam! Good evening!';

    return `${timeGreeting} Naan thaan unga **PayGenie** 🧞‍♂️✨\n\nYour wish is my command, master! Enkitta neenga normal-ah pesalam (English, Tamil, Tanglish ethula venumnalum!).\n\nE.g. *"Hi bro"* nu pesalam, or *"Acme Tech-ku $650 bill ready pannu"* nu sonna odane structured invoice & PayPal link tharuren!`;
  };

  useEffect(() => {
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: getInitialSpeech(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);

    try {
      const stored = localStorage.getItem('paygenie_invoices');
      if (stored) {
        const list: InvoiceData[] = JSON.parse(stored);
        setHistory(list);
        if (list.length > 0) setLatestInvoice(list[0]);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

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

      if (data.invoice) {
        setLatestInvoice(data.invoice);
        const updatedHistory = [data.invoice, ...history];
        setHistory(updatedHistory);
        saveToStorage(updatedHistory);
        toast.success(`✨ Invoice ${data.invoice.invoiceNumber} created!`);
      }
    } catch (err: any) {
      toast.error(err.message || 'Genie is currently meditating...');
    } finally {
      setLoading(false);
    }
  };

  const latestAssistantMessage = [...messages].reverse().find((m) => m.role === 'assistant');
  const latestUserMessage = [...messages].reverse().find((m) => m.role === 'user');

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-gradient-to-b from-[#020b18] via-[#001435] to-[#00225e] text-white flex flex-col font-sans select-none">
      
      {/* Background Magical Ambient Light */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-[#0070ba]/20 via-[#003087]/30 to-[#ffc439]/15 blur-3xl rounded-full pointer-events-none" />

      {/* Top Floating Badge & Ledger Shortcut */}
      <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-30">
        <div className="flex items-center gap-2.5 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/15 shadow-lg">
          <div className="w-6 h-6 rounded-full bg-[#003087] border border-[#ffc439] flex items-center justify-center font-black text-xs text-white">
            P
          </div>
          <span className="font-extrabold text-sm tracking-tight">
            PayGenie <span className="text-[#38bdf8]">AI</span>
          </span>
          <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-300/30">
            PayPal Magic
          </span>
        </div>

        <button
          type="button"
          onClick={() => setShowLedgerDrawer(true)}
          className="cursor-pointer flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/15 text-xs font-bold transition shadow-lg"
        >
          <FileSpreadsheet className="w-3.5 h-3.5 text-[#38bdf8]" />
          <span>Ledger ({history.length})</span>
        </button>
      </div>

      {/* CENTER STAGE: ANIMATED GENIE + COMIC SPEECH BUBBLE */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 pt-12 pb-24 z-10 max-w-4xl mx-auto w-full">
        
        {/* Genie Comic Speech Bubble (Where the Genie speaks!) */}
        <div className="relative mb-6 w-full max-w-xl animate-fade-in">
          <div className="relative bg-white text-[#001435] p-5 sm:p-6 rounded-[28px] shadow-2xl border-2 border-sky-300">
            
            {/* Thinking / Talking status */}
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 text-xs">
              <span className="font-black text-[#003087] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>PayGenie Says:</span>
              </span>
              <span className="text-[11px] text-slate-400">
                {loading ? 'Casting spell...' : latestAssistantMessage?.timestamp}
              </span>
            </div>

            {/* Genie Speech Text */}
            <p className="text-sm sm:text-base leading-relaxed whitespace-pre-line font-medium text-slate-800 max-h-[160px] overflow-y-auto no-scrollbar">
              {loading ? 'Poruma master... unga wish-ah compute pandren! 🧞‍♂️✨' : latestAssistantMessage?.content}
            </p>

            {/* Speech Bubble Downward Tail Pointer */}
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-white border-r-2 border-b-2 border-sky-300 rotate-45" />
          </div>

          {/* User's Last Spoken Wish Preview Tag */}
          {latestUserMessage && (
            <div className="mt-4 text-center">
              <span className="inline-block bg-white/10 backdrop-blur-sm border border-white/20 px-3.5 py-1 rounded-full text-xs text-sky-200">
                You wished: &quot;{latestUserMessage.content}&quot;
              </span>
            </div>
          )}
        </div>

        {/* Big Animated Genie Avatar */}
        <div className="my-2">
          <GenieAvatar 
            isThinking={loading} 
            mood={loading ? 'magic' : latestAssistantMessage?.invoice ? 'happy' : 'idle'} 
          />
        </div>

        {/* If an invoice was created, Quick One-Click Access Card */}
        {latestInvoice && (
          <div className="mt-4 bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/20 rounded-2xl p-3 sm:px-6 flex items-center justify-between gap-4 w-full max-w-md shadow-xl transition animate-fade-in">
            <div>
              <span className="text-[10px] uppercase font-bold text-amber-300 block">Latest Invoice Ready</span>
              <p className="font-black text-sm text-white">{latestInvoice.invoiceNumber} • ${latestInvoice.totalAmount.toFixed(2)} USD</p>
            </div>
            <a
              href={`/?invoice=${latestInvoice.invoiceNumber}`}
              target="_blank"
              rel="noreferrer"
              className="pp-button-primary !py-1.5 !px-4 !text-xs !bg-[#ffc439] !text-[#001435] !border-[#ffc439] hover:!bg-amber-300 inline-flex items-center gap-1.5 font-bold shadow-md"
            >
              <span>Client Mobile Pay</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        )}

      </div>

      {/* BOTTOM FIXED WISH INPUT BAR */}
      <div className="absolute bottom-6 left-4 right-4 max-w-2xl mx-auto z-30">
        <form onSubmit={handleSendMessage} className="relative flex items-center">
          <input
            type="text"
            value={inputMessage}
            disabled={loading}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Speak your wish in English, Tamil, or Tanglish... (e.g. 'Hi bro!' or 'Acme-ku $650 bill pannu')..."
            className="w-full bg-white/15 backdrop-blur-xl border border-white/30 rounded-full py-4 pl-6 pr-14 text-sm text-white placeholder-slate-300 focus:outline-none focus:bg-white/25 focus:border-[#ffc439] focus:ring-2 focus:ring-[#ffc439]/30 transition shadow-2xl disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={loading || !inputMessage.trim()}
            className="absolute right-2.5 w-10 h-10 rounded-full bg-gradient-to-r from-[#ffc439] to-amber-400 hover:from-amber-300 hover:to-[#ffc439] text-[#001435] flex items-center justify-center font-black transition disabled:opacity-40 disabled:cursor-not-allowed shadow-md cursor-pointer"
            title="Send wish"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </form>
      </div>

      {/* SLIDE-OVER SETTLEMENT LEDGER DRAWER */}
      {showLedgerDrawer && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex justify-end animate-fade-in">
          <div className="w-full max-w-md bg-white text-[#001435] h-full shadow-2xl p-6 flex flex-col justify-between overflow-y-auto">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-[#003087]" />
                  <h3 className="text-lg font-black text-[#001435]">Settlement Ledger</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowLedgerDrawer(false)}
                  className="cursor-pointer p-1.5 rounded-full hover:bg-slate-100 text-slate-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {history.length === 0 ? (
                <div className="text-center py-16 text-slate-400 text-xs">
                  No invoices crafted yet. Speak to the Genie to create one!
                </div>
              ) : (
                <div className="space-y-3">
                  {history.map((inv, idx) => (
                    <div key={idx} className="p-3.5 rounded-2xl bg-[#f8fafc] border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-[#003087]">{inv.invoiceNumber}</span>
                        {inv.status === 'PAID' ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                            PAID
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                            AWAITING PAYMENT
                          </span>
                        )}
                      </div>
                      <div className="flex justify-between items-baseline">
                        <span className="font-bold text-xs text-[#001435]">{inv.clientName}</span>
                        <span className="font-black text-sm text-[#003087]">${inv.totalAmount.toFixed(2)}</span>
                      </div>
                      <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-xs">
                        <a
                          href={`/?invoice=${inv.invoiceNumber}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#0070ba] font-bold hover:underline inline-flex items-center gap-1"
                        >
                          <span>Open Mobile Bill</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setShowLedgerDrawer(false)}
              className="w-full pp-button-primary !py-2.5 mt-4"
            >
              Back to Genie
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#020b18]" />}>
      <MainAppContent />
    </Suspense>
  );
}
