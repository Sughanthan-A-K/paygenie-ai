'use client';

import React, { useState, useEffect } from 'react';
import { Bot, Sparkles, X, MessageSquareQuote, AlertTriangle } from 'lucide-react';

interface GenieAssistantProps {
  status: 'idle' | 'generating' | 'ready' | 'paid' | 'error';
  errorMessage?: string | null;
  clientName?: string;
  amount?: number;
  currency?: string;
}

export default function GenieAssistant({
  status,
  errorMessage,
  clientName,
  amount,
  currency = 'USD',
}: GenieAssistantProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    setPulse(true);
    setIsOpen(true);
    const timer = setTimeout(() => setPulse(false), 800);
    return () => clearTimeout(timer);
  }, [status, errorMessage]);

  const getMessage = () => {
    switch (status) {
      case 'error':
        return errorMessage || 'Oops, something went wrong with the request. Please verify and try again!';
      case 'generating':
        return 'Analyzing your prompt... Gemini 3.5 is calculating tax, discounts, and itemizing your invoice.';
      case 'ready':
        return `Invoice ready for ${clientName || 'Client'} ($${amount?.toFixed(2)} ${currency})! PayPal Checkout is armed.`;
      case 'paid':
        return `Boom! Settle captured via PayPal. Transaction confirmed. Don't forget to export your receipt!`;
      case 'idle':
      default:
        return 'Hi! I am your PayGenie Autonomous Agent. Describe your billing details above or click a Quick Try prompt to begin!';
    }
  };

  const isError = status === 'error';

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-auto">
      {/* Speech Bubble */}
      {isOpen && (
        <div className={`mb-3 max-w-xs sm:max-w-sm rounded-2xl p-4 shadow-2xl text-xs relative animate-in fade-in slide-in-from-bottom-2 duration-300 border ${
          isError
            ? 'bg-red-950/95 text-red-200 border-red-500/40'
            : 'bg-[#001435]/95 text-slate-100 border-blue-500/30'
        } backdrop-blur-xl`}>
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-2 right-2 text-slate-400 hover:text-white p-1 cursor-pointer"
            title="Dismiss message"
          >
            <X className="w-3.5 h-3.5" />
          </button>
          <div className="flex items-start gap-2.5 pr-4">
            {isError ? (
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            ) : (
              <MessageSquareQuote className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            )}
            <p className="leading-relaxed font-sans">{getMessage()}</p>
          </div>
          {/* Bubble Arrow */}
          <div className={`absolute -bottom-2 right-6 w-3 h-3 border-r border-b transform rotate-45 ${
            isError ? 'bg-red-950 border-red-500/40' : 'bg-[#001435] border-blue-500/30'
          }`} />
        </div>
      )}

      {/* Futuristic Fintech Floating Genie Avatar */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`group relative flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-tr ${
          isError
            ? 'from-red-600 via-rose-500 to-amber-400'
            : 'from-[#003087] via-[#0070BA] to-[#00CFDE]'
        } p-[2px] shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer ${
          pulse ? 'scale-110 ring-4 ring-cyan-400/50' : ''
        }`}
        title="PayGenie AI Assistant"
      >
        <div className="w-full h-full rounded-full bg-[#001435] flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-blue-500/20 blur-sm group-hover:bg-blue-500/30 transition" />
          <Bot className={`w-7 h-7 relative z-10 animate-pulse ${isError ? 'text-rose-300' : 'text-cyan-300'}`} />
          <Sparkles className="w-3.5 h-3.5 text-amber-300 absolute top-2 right-2 z-10" />
        </div>
      </button>
    </div>
  );
}
