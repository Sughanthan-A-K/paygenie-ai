'use client';

import React, { useState } from 'react';
import { Sparkles, CheckCircle2, AlertCircle, RefreshCw, X, MessageSquare } from 'lucide-react';

interface GenieAssistantProps {
  status: 'idle' | 'generating' | 'ready' | 'paid' | 'error';
  invoiceDetails?: {
    clientName?: string;
    amount?: number;
    transactionId?: string;
  };
}

export default function GenieAssistant({ status, invoiceDetails }: GenieAssistantProps) {
  const [minimized, setMinimized] = useState(false);

  const getMessage = () => {
    switch (status) {
      case 'generating':
        return {
          title: "Genie is crunching numbers...",
          desc: "Extracting line items, calculating accurate discounts, taxes, and preparing your PayPal order payload.",
          accent: "text-blue-500",
          badge: "ANALYZING"
        };
      case 'ready':
        return {
          title: `Invoice Ready for ${invoiceDetails?.clientName || 'Client'}!`,
          desc: `Total: $${invoiceDetails?.amount?.toFixed(2) || '0.00'}. The one-click PayPal Sandbox button is initialized and ready for checkout.`,
          accent: "text-amber-500",
          badge: "PAYMENT READY"
        };
      case 'paid':
        return {
          title: "Payment Settled via PayPal! 🎉",
          desc: `Captured successfully in PayPal Sandbox. Reference ID: ${invoiceDetails?.transactionId || 'CAPTURED'}. Email draft is ready to dispatch!`,
          accent: "text-emerald-500",
          badge: "SETTLED"
        };
      case 'error':
        return {
          title: "Need a bit more clarity",
          desc: "Could you provide a few more details like client name or service cost in your description?",
          accent: "text-red-500",
          badge: "ERROR"
        };
      case 'idle':
      default:
        return {
          title: "Hi! I'm PayGenie 🧞‍♂️",
          desc: "Pick a Quick Try scenario or describe any freelance gig. I'll structure the math and wire up PayPal automatically!",
          accent: "text-[#0070ba]",
          badge: "ASSISTANT ACTIVE"
        };
    }
  };

  const message = getMessage();

  if (minimized) {
    return (
      <button
        onClick={() => setMinimized(false)}
        className="fixed bottom-6 right-6 z-50 p-3.5 rounded-full bg-gradient-to-tr from-[#003087] to-[#0070ba] text-white shadow-2xl hover:scale-105 transition-all duration-300 border-2 border-white/20 cursor-pointer flex items-center gap-2 group"
      >
        <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
        <span className="text-xs font-bold pr-1 hidden group-hover:inline">Open PayGenie</span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm w-[90vw] sm:w-[360px] animate-fade-in transition-all">
      <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-5 shadow-2xl backdrop-blur-md">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            {/* Glowing Genie Avatar */}
            <div className="relative">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-[#003087] via-[#0070ba] to-cyan-400 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
                <Sparkles className="w-4 h-4 text-amber-300" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full" />
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <h4 className="font-extrabold text-xs text-[#001435] dark:text-white">PayGenie Copilot</h4>
                <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/40 text-[#003087] dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  {message.badge}
                </span>
              </div>
              <p className="text-[10px] text-slate-400">Autonomous Payment Agent</p>
            </div>
          </div>

          <button
            onClick={() => setMinimized(true)}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Dynamic Speech Content */}
        <div className="mt-3 space-y-1">
          <h5 className={`font-bold text-xs ${message.accent}`}>
            {message.title}
          </h5>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            {message.desc}
          </p>
        </div>

        {/* Interactive hint tag */}
        <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
          <span>Powered by Gemini & PayPal Orders v2</span>
          <span className="text-[#0070ba] font-semibold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping inline-block" />
            Live
          </span>
        </div>
      </div>
    </div>
  );
}
