'use client';

import React, { useState, useEffect } from 'react';
import { Bot, Sparkles, X, MessageSquareQuote } from 'lucide-react';

interface GenieAssistantProps {
  status: 'idle' | 'generating' | 'ready' | 'paid';
  clientName?: string;
  amount?: number;
  currency?: string;
}

export default function GenieAssistant({
  status,
  clientName,
  amount,
  currency = 'USD',
}: GenieAssistantProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    setPulse(true);
    const timer = setTimeout(() => setPulse(false), 800);
    return () => clearTimeout(timer);
  }, [status]);

  const getMessage = () => {
    switch (status) {
      case 'generating':
        return 'Analyzing your prompt... Gemini 3.5 is calculating tax, discounts, and itemizing breakdown.';
      case 'ready':
        return `Invoice ready for ${clientName || 'Client'} ($${amount?.toFixed(2)} ${currency})! PayPal Checkout is armed.`;
      case 'paid':
        return `Boom! Settle captured via PayPal. Transaction confirmed. Don't forget to export your receipt!`;
      case 'idle':
      default:
        return 'Hi! I am your PayGenie Autonomous Agent. Type any billing description or pick a Quick Try prompt!';
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-auto">
      {/* Speech Bubble */}
      {isOpen && (
        <div className="mb-3 max-w-xs sm:max-w-sm bg-slate-900/95 dark:bg-slate-900/95 backdrop-blur-xl border border-blue-500/30 rounded-2xl p-4 shadow-2xl text-xs text-slate-200 relative animate-in fade-in slide-in-from-bottom-2 duration-300">
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-2 right-2 text-slate-500 hover:text-slate-300 p-1"
            title="Dismiss message"
          >
            <X className="w-3.5 h-3.5" />
          </button>
          <div className="flex items-start gap-2.5 pr-4">
            <MessageSquareQuote className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed font-sans">{getMessage()}</p>
          </div>
          {/* Bubble Arrow */}
          <div className="absolute -bottom-2 right-6 w-3 h-3 bg-slate-900 border-r border-b border-blue-500/30 transform rotate-45" />
        </div>
      )}

      {/* Futuristic Fintech Floating Genie Avatar */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`group relative flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-tr from-[#003087] via-[#0070BA] to-cyan-400 p-[2px] shadow-lg shadow-blue-500/30 hover:scale-105 transition-all duration-300 cursor-pointer ${
          pulse ? 'scale-110 ring-4 ring-cyan-400/50' : ''
        }`}
        title="PayGenie AI Assistant"
      >
        <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center relative overflow-hidden">
          {/* Inner ambient glow */}
          <div className="absolute inset-0 bg-blue-500/20 blur-sm group-hover:bg-blue-500/30 transition" />
          <Bot className="w-7 h-7 text-cyan-300 relative z-10 animate-pulse" />
          <Sparkles className="w-3.5 h-3.5 text-amber-300 absolute top-2 right-2 z-10" />
        </div>
      </button>
    </div>
  );
}
