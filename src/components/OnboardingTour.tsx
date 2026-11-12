"use client";

import React, { useState, useEffect, useCallback } from "react";
import { 
  Sparkles, 
  ArrowRight, 
  ArrowLeft, 
  X, 
  Check, 
  Users, 
  MessageSquare, 
  Receipt, 
  Wallet, 
  HelpCircle,
  ShieldCheck,
  Zap,
  Bot,
  Play,
  FileText,
  CreditCard,
  Download,
  Share2,
  Sliders,
  Compass,
  CheckCircle2,
  ChevronRight,
  ExternalLink
} from "lucide-react";
import { PayGenieLogo } from "./PayGenieLogo";

export interface OnboardingStep {
  targetId: string;
  title: string;
  description: string;
  actionHint: string;
  badge: string;
  position: "bottom" | "top" | "left" | "right";
  icon: React.ReactNode;
}

export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    targetId: "onboarding-client-roster",
    title: "1. Client Roster & Account Switching",
    description: "Each client has an isolated private workspace with dedicated billing chat logs and invoice history. Click '+ Add Client' to add new counterparties with custom currencies, email, phone & company names.",
    actionHint: "Tip: Click any client on the left to immediately switch workspaces without losing progress.",
    badge: "Step 1 of 6 · Client Hub",
    position: "right",
    icon: <Users className="w-4 h-4 text-blue-500" />
  },
  {
    targetId: "onboarding-templates",
    title: "2. 1-Click Smart Billing Templates",
    description: "Quick-start your invoice using pre-configured templates for design, fullstack development, retainers, and consulting. Click 'Manage' to create, edit, or customize reusable billing prompts.",
    actionHint: "Tip: Click any template chip to automatically paste a structured prompt into the copilot.",
    badge: "Step 2 of 6 · Speed & Templates",
    position: "top",
    icon: <Sparkles className="w-4 h-4 text-amber-500" />
  },
  {
    targetId: "onboarding-chat-input",
    title: "3. Conversational AI Billing Copilot",
    description: "Type or paste your project details naturally in plain English or conversational phrases (e.g., '10 hours design at $75/hr plus 10% tax'). PayGenie parses line items, calculates totals, and creates an invoice draft.",
    actionHint: "Tip: Press Enter ↵ to draft the invoice, or Shift + Enter for multi-line inputs.",
    badge: "Step 3 of 6 · Natural Language AI",
    position: "top",
    icon: <MessageSquare className="w-4 h-4 text-sky-500" />
  },
  {
    targetId: "onboarding-ledger-tab",
    title: "4. Master Settlement Ledger & Tracking",
    description: "Switch between 'Client Invoicing Chats' and the 'Master Settlement Ledger'. View all past invoices, live PayPal capture statuses, total outstanding receivables, and download official PDF records.",
    actionHint: "Tip: Use the segment buttons at the top to toggle between active chats and the ledger.",
    badge: "Step 4 of 6 · Accounting Ledger",
    position: "bottom",
    icon: <Receipt className="w-4 h-4 text-emerald-500" />
  },
  {
    targetId: "onboarding-balance-strip",
    title: "5. Real-Time PayPal Settlement Balance",
    description: "Directly synchronized with the PayPal Developer platform and Neon Serverless PostgreSQL. Watch your settled funds increase in real time as clients pay their bills via PayPal Orders v2.",
    actionHint: "Tip: Green indicator confirms active real-time cross-tab synchronization via BroadcastChannel.",
    badge: "Step 5 of 6 · Live PayPal Capture",
    position: "bottom",
    icon: <Wallet className="w-4 h-4 text-[#0070ba]" />
  },
  {
    targetId: "onboarding-profile-btn",
    title: "6. Merchant Business & Sandbox Settings",
    description: "Configure your business identity (Company Name, Billing Email, Default Currency) and test API credentials (PayPal Client ID, Sandbox Secret, Gemini API keys).",
    actionHint: "Tip: Click your avatar pill at top-right to inspect merchant settings and API parameters anytime.",
    badge: "Step 6 of 6 · Configuration & Credentials",
    position: "bottom",
    icon: <Sliders className="w-4 h-4 text-indigo-500" />
  }
];

// Interactive Tutorial Guide Topics for Hackathon Judges & Users
interface GuideTopic {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  category: "Basics" | "AI Billing" | "PayPal Settlement" | "Management";
  steps: string[];
  spotlightTargetId?: string;
}

const GUIDE_TOPICS: GuideTopic[] = [
  {
    id: "create-invoice",
    title: "How to Create an Invoice in 10 Seconds",
    subtitle: "From natural speech or text to an official PayPal invoice draft",
    category: "AI Billing",
    icon: <Bot className="w-4 h-4 text-sky-500" />,
    spotlightTargetId: "onboarding-chat-input",
    steps: [
      "Select your client from the left Client Roster (or click '+ Add Client').",
      "In the chat box at the bottom, type your work in plain text (e.g. 'Build landing page for $600 with 5% discount').",
      "Press Enter ↵. PayGenie AI instantly structures line items, subtotal, discount, taxes, and total due.",
      "Review the invoice card inside chat and click 'Preview Invoice' or 'Confirm & Issue Invoice' to save it to your ledger."
    ]
  },
  {
    id: "client-pay",
    title: "How Clients Settle via PayPal in One Touch",
    subtitle: "Instant payment capture, buyer protection & real-time sync",
    category: "PayPal Settlement",
    icon: <CreditCard className="w-4 h-4 text-emerald-500" />,
    spotlightTargetId: "onboarding-ledger-tab",
    steps: [
      "Click 'Preview Invoice' on any confirmed invoice or open the Client Checkout Link.",
      "The client opens the portal on mobile or desktop and sees their official itemized bill with 256-bit encryption.",
      "The client clicks 'Pay Now' to launch the official PayPal checkout button or Debit/Credit Card option.",
      "Once captured in PayPal Sandbox, confetti fires, the invoice is stamped 'PAID VIA PAYPAL', and the merchant's ledger updates in real time!"
    ]
  },
  {
    id: "pdf-export",
    title: "Downloading & Sharing Official PDF Copies",
    subtitle: "Clean A4 layout with verified PayPal transaction stamps",
    category: "Basics",
    icon: <FileText className="w-4 h-4 text-indigo-500" />,
    spotlightTargetId: "onboarding-ledger-tab",
    steps: [
      "Open any invoice modal and click 'Download PDF' (or the client can click 'Download PDF' from their portal).",
      "PayGenie renders a clean, professional vector PDF with itemized quantities, unit rates, tax calculations, and party details.",
      "When settled, the PDF automatically features a vibrant emerald green 'STATUS: PAID VIA PAYPAL' stamp with the PayPal Transaction ID."
    ]
  },
  {
    id: "smart-templates",
    title: "Using & Customizing Reusable Templates",
    subtitle: "Create billing templates for retainers, milestones, and hourly gigs",
    category: "Management",
    icon: <Sparkles className="w-4 h-4 text-amber-500" />,
    spotlightTargetId: "onboarding-templates",
    steps: [
      "Click any quick template pill above the chat box to instantly fill the input with boilerplate billing items.",
      "Click '+ Manage' to open the Template Manager modal.",
      "Add, edit, or delete custom reusable templates with pre-defined hourly rates, payment terms, or email drafts."
    ]
  },
  {
    id: "multiple-clients",
    title: "Managing Multiple Clients & Isolated Chat Threads",
    subtitle: "Keep invoices, client rates, and conversations cleanly separated",
    category: "Basics",
    icon: <Users className="w-4 h-4 text-blue-500" />,
    spotlightTargetId: "onboarding-client-roster",
    steps: [
      "Click '+ Add Client' at the top of the left sidebar to add a new contact.",
      "Enter the client name, email, phone number, and company name.",
      "Each client maintains its own dedicated chat history, invoices, and draft messages without cross-contamination."
    ]
  },
  {
    id: "merchant-credentials",
    title: "Configuring Merchant Profile & PayPal API Keys",
    subtitle: "Your credentials and currency configuration",
    category: "Management",
    icon: <Sliders className="w-4 h-4 text-purple-500" />,
    spotlightTargetId: "onboarding-profile-btn",
    steps: [
      "Click the Merchant Profile pill at the top right header.",
      "Update your business legal name, billing email, and default currency (USD, EUR, GBP, INR).",
      "Credentials are securely stored in server environment variables (.env.local) to protect sensitive secrets."
    ]
  }
];

interface OnboardingTourProps {
  forceOpen?: boolean;
  onClose?: () => void;
}

export function OnboardingTour({ forceOpen = false, onClose }: OnboardingTourProps) {
  // Mode: "inactive" | "welcome" (grand intro modal) | "spotlight" (step-by-step element tour) | "guide" (searchable interactive manual)
  const [mode, setMode] = useState<"inactive" | "welcome" | "spotlight" | "guide">("inactive");
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [activeGuideId, setActiveGuideId] = useState<string>(GUIDE_TOPICS[0].id);

  // Check localStorage on initial mount (first-time detection per device/browser)
  useEffect(() => {
    if (forceOpen) {
      setMode("welcome");
      setCurrentStepIndex(0);
      return;
    }

    try {
      const hasCompletedTour = localStorage.getItem("paygenie_onboarding_completed");
      if (!hasCompletedTour) {
        // Instant synchronous launch on first-time visit — NO delay!
        setMode("welcome");
        setCurrentStepIndex(0);
      }
    } catch (e) {
      console.error(e);
    }
  }, [forceOpen]);

  // Update target element coordinates when spotlight step changes or window resizes
  const updateTargetRect = useCallback(() => {
    if (mode !== "spotlight") return;
    const step = ONBOARDING_STEPS[currentStepIndex];
    if (!step) return;

    const el = document.getElementById(step.targetId);
    if (el) {
      const rect = el.getBoundingClientRect();
      setTargetRect(rect);
      el.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
    } else {
      setTargetRect(null);
    }
  }, [mode, currentStepIndex]);

  useEffect(() => {
    updateTargetRect();
    const handleResize = () => updateTargetRect();
    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleResize, true);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleResize, true);
    };
  }, [updateTargetRect]);

  const handleStartSpotlightTour = (startIdx = 0) => {
    setCurrentStepIndex(startIdx);
    setMode("spotlight");
  };

  const handleOpenInteractiveGuide = () => {
    setMode("guide");
  };

  const handleSkipOrComplete = () => {
    setMode("inactive");
    try {
      localStorage.setItem("paygenie_onboarding_completed", "true");
    } catch (e) {
      console.error(e);
    }
    if (onClose) onClose();
  };

  const handleNext = () => {
    if (currentStepIndex < ONBOARDING_STEPS.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      handleSkipOrComplete();
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    if (mode === "inactive") return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleSkipOrComplete();
      } else if (mode === "spotlight") {
        if (e.key === "ArrowRight") handleNext();
        else if (e.key === "ArrowLeft") handlePrev();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mode, currentStepIndex]);

  if (mode === "inactive") return null;

  /* ========================================================================= */
  /* SCREEN 1: GRAND WELCOME & OVERVIEW MODAL (Large, Modern & Detailed)      */
  /* ========================================================================= */
  if (mode === "welcome") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/75 backdrop-blur-md animate-fade-in overflow-y-auto">
        <div className="bg-white w-full max-w-3xl rounded-3xl p-6 sm:p-10 shadow-2xl border border-slate-200 relative overflow-hidden animate-scale-up my-auto">
          
          {/* Top Gradient Banner Bar */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#001C64] via-[#0070BA] to-emerald-400" />
          
          {/* Close button */}
          <button
            type="button"
            onClick={handleSkipOrComplete}
            className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition cursor-pointer"
            title="Skip to App (Esc)"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Grand Header */}
          <div className="space-y-3 pb-6 border-b border-slate-100">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-bold text-[#003087]">
              <Sparkles className="w-3.5 h-3.5 text-[#0070ba]" />
              <span>PayPal AI Hackathon 2026 Showcase</span>
            </div>

            <div className="flex items-center gap-3.5 pt-1">
              <PayGenieLogo size={52} showText={false} />
              <div>
                <h1 className="text-3xl font-black tracking-tight text-[#001435]">
                  PayGenie <span className="text-[#0070ba]">AI</span>
                </h1>
                <p className="text-sm font-semibold text-slate-500">
                  Conversational Billing Intelligence & Instant PayPal Settlement
                </p>
              </div>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed font-medium pt-1 max-w-2xl">
              PayGenie eliminates tedious invoicing paperwork for freelancers, agencies, and global contractors. Simply chat or type project deliverables in plain language, and PayGenie drafts structured, mathematically verified invoices with instant 1-touch PayPal checkout.
            </p>
          </div>

          {/* 4 Feature Pillars Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 my-6">
            <div className="p-4 rounded-2xl bg-[#f8fafc] border border-slate-200/80 hover:border-blue-300 transition space-y-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
                  <Bot className="w-4 h-4" />
                </div>
                <h3 className="font-extrabold text-sm text-[#001435]">Conversational Invoicing</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Describe billable items in natural text or voice. PayGenie automatically computes hours, discounts, and regional taxes into structured items.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#f8fafc] border border-slate-200/80 hover:border-emerald-300 transition space-y-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <h3 className="font-extrabold text-sm text-[#001435]">PayPal Orders v2</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Clients receive clean, mobile-first payment links. One-touch settlement via PayPal or Card with zero credit card exposure for maximum buyer trust.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#f8fafc] border border-slate-200/80 hover:border-purple-300 transition space-y-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-xs">
                  <Zap className="w-4 h-4" />
                </div>
                <h3 className="font-extrabold text-sm text-[#001435]">Real-Time Cross-Tab Sync</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Live BroadcastChannel & Neon Postgres database immediately update payment status, firing celebrations and logging transaction IDs instantly.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#f8fafc] border border-slate-200/80 hover:border-amber-300 transition space-y-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
                  <FileText className="w-4 h-4" />
                </div>
                <h3 className="font-extrabold text-sm text-[#001435]">Official Vector PDF Receipts</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Download bank-grade PDF invoices complete with Emerald Green verified PayPal payment stamps and transaction hashes.
              </p>
            </div>
          </div>

          {/* Action Footer: 3 Options */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={handleSkipOrComplete}
              className="w-full sm:w-auto text-xs font-bold text-slate-500 hover:text-slate-800 px-4 py-2.5 rounded-xl hover:bg-slate-100 transition cursor-pointer text-center"
            >
              Skip to App Directly →
            </button>

            <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleOpenInteractiveGuide}
                className="w-full sm:w-auto px-4 py-2.5 rounded-full border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Compass className="w-3.5 h-3.5 text-[#0070ba]" />
                <span>Open Project Guide & FAQ</span>
              </button>

              <button
                type="button"
                onClick={() => handleStartSpotlightTour(0)}
                className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-[#003087] hover:bg-[#002466] text-white font-bold text-sm transition shadow-sm hover:shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Start Interactive Tour (6 Steps)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>
      </div>
    );
  }

  /* ========================================================================= */
  /* SCREEN 2: INTERACTIVE COMPREHENSIVE GUIDE & MANUAL                        */
  /* ========================================================================= */
  if (mode === "guide") {
    const activeTopic = GUIDE_TOPICS.find((t) => t.id === activeGuideId) || GUIDE_TOPICS[0];

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/75 backdrop-blur-md animate-fade-in overflow-y-auto">
        <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200 relative overflow-hidden flex flex-col max-h-[90vh] my-auto">
          
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#003087] text-white flex items-center justify-center shadow-xs">
                <Compass className="w-5 h-5 text-blue-200" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-[#001435]">
                  PayGenie Complete User & Judge Manual
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Detailed step-by-step workflow guide & interactive element finder
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSkipOrComplete}
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-full transition cursor-pointer"
              title="Close guide (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Two-Column Body: Topic List on Left, Active Topic Instructions on Right */}
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0">
            
            {/* Left Column: Topics Sidebar */}
            <div className="w-full md:w-80 border-r border-slate-200 bg-[#f8fafc] overflow-y-auto p-3 space-y-1 custom-scrollbar shrink-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1.5 block">
                Guide Topics ({GUIDE_TOPICS.length})
              </span>
              {GUIDE_TOPICS.map((topic) => {
                const isSelected = topic.id === activeGuideId;
                return (
                  <button
                    key={topic.id}
                    type="button"
                    onClick={() => setActiveGuideId(topic.id)}
                    className={`w-full text-left p-3 rounded-2xl transition cursor-pointer flex items-center justify-between gap-2.5 ${
                      isSelected
                        ? "bg-white border border-blue-200 shadow-xs text-[#003087]"
                        : "hover:bg-slate-100 text-slate-700 border border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                        {topic.icon}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold truncate leading-snug">{topic.title}</p>
                        <span className="text-[10px] text-slate-400 font-medium">{topic.category}</span>
                      </div>
                    </div>
                    <ChevronRight className={`w-3.5 h-3.5 shrink-0 ${isSelected ? "text-[#0070ba]" : "text-slate-300"}`} />
                  </button>
                );
              })}
            </div>

            {/* Right Column: Active Topic Detailed Walkthrough */}
            <div className="flex-1 p-6 md:p-8 overflow-y-auto custom-scrollbar space-y-6 bg-white">
              <div className="space-y-2 pb-4 border-b border-slate-100">
                <span className="text-xs font-bold uppercase tracking-wider text-[#0070ba] bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200 inline-block">
                  {activeTopic.category}
                </span>
                <h2 className="text-xl font-black text-[#001435]">
                  {activeTopic.title}
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  {activeTopic.subtitle}
                </p>
              </div>

              {/* Numbered Steps */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Step-by-Step Instructions:
                </h4>
                <div className="space-y-2.5">
                  {activeTopic.steps.map((stepText, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                      <div className="w-6 h-6 rounded-full bg-[#003087] text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                        {idx + 1}
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed font-semibold">
                        {stepText}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action: Spotlight Highlight Button */}
              {activeTopic.spotlightTargetId && (
                <div className="pt-2 p-4 rounded-2xl bg-blue-50/60 border border-blue-200 flex items-center justify-between gap-4">
                  <div>
                    <span className="text-xs font-bold text-[#003087] block">Want to see where this element is?</span>
                    <span className="text-[11px] text-slate-500">Jump right to the UI and highlight this component.</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const stepIdx = ONBOARDING_STEPS.findIndex((s) => s.targetId === activeTopic.spotlightTargetId);
                      handleStartSpotlightTour(stepIdx !== -1 ? stepIdx : 0);
                    }}
                    className="cursor-pointer px-4 py-2 rounded-xl bg-[#0070ba] hover:bg-[#003087] text-white text-xs font-bold transition shadow-xs flex items-center gap-1.5 shrink-0"
                  >
                    <span>Highlight on Screen</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

          </div>

          {/* Footer */}
          <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
            <button
              type="button"
              onClick={() => setMode("welcome")}
              className="text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Welcome Overview</span>
            </button>

            <button
              type="button"
              onClick={handleSkipOrComplete}
              className="px-5 py-2 rounded-full bg-[#003087] hover:bg-[#002466] text-white font-bold text-xs transition shadow-xs cursor-pointer"
            >
              Enter PayGenie Workspace
            </button>
          </div>

        </div>
      </div>
    );
  }

  /* ========================================================================= */
  /* SCREEN 3: INTERACTIVE SPOTLIGHT TOUR (Speech-Bubbles on Real UI Elements) */
  /* ========================================================================= */
  const currentStep = ONBOARDING_STEPS[currentStepIndex];

  let bubbleTop = 100;
  let bubbleLeft = 100;
  let arrowClass = "";

  if (targetRect) {
    const bubbleWidth = 380;
    const bubbleHeight = 250;
    const padding = 16;

    if (currentStep.position === "right") {
      bubbleLeft = targetRect.right + padding;
      bubbleTop = Math.max(16, targetRect.top + (targetRect.height / 2) - 90);
      arrowClass = "after:content-[''] after:absolute after:top-6 after:-left-2 after:w-4 after:h-4 after:bg-white after:border-l after:border-b after:border-slate-200 after:rotate-45";
    } else if (currentStep.position === "bottom") {
      bubbleLeft = Math.max(16, Math.min(window.innerWidth - bubbleWidth - 16, targetRect.left + (targetRect.width / 2) - (bubbleWidth / 2)));
      bubbleTop = targetRect.bottom + padding;
      arrowClass = "after:content-[''] after:absolute after:-top-2 after:left-1/2 after:-translate-x-1/2 after:w-4 after:h-4 after:bg-white after:border-l after:border-t after:border-slate-200 after:rotate-45";
    } else if (currentStep.position === "top") {
      bubbleLeft = Math.max(16, Math.min(window.innerWidth - bubbleWidth - 16, targetRect.left + (targetRect.width / 2) - (bubbleWidth / 2)));
      bubbleTop = Math.max(16, targetRect.top - bubbleHeight - padding);
      arrowClass = "after:content-[''] after:absolute after:-bottom-2 after:left-1/2 after:-translate-x-1/2 after:w-4 after:h-4 after:bg-white after:border-r after:border-b after:border-slate-200 after:rotate-45";
    } else if (currentStep.position === "left") {
      bubbleLeft = Math.max(16, targetRect.left - bubbleWidth - padding);
      bubbleTop = Math.max(16, targetRect.top + (targetRect.height / 2) - 90);
      arrowClass = "after:content-[''] after:absolute after:top-6 after:-right-2 after:w-4 after:h-4 after:bg-white after:border-r after:border-t after:border-slate-200 after:rotate-45";
    }

    if (bubbleLeft + bubbleWidth > window.innerWidth) {
      bubbleLeft = window.innerWidth - bubbleWidth - 16;
    }
    if (bubbleLeft < 16) {
      bubbleLeft = 16;
    }
    if (bubbleTop + bubbleHeight > window.innerHeight) {
      bubbleTop = window.innerHeight - bubbleHeight - 16;
    }
  }

  return (
    <div className="fixed inset-0 z-50 pointer-events-auto overflow-hidden animate-fade-in">
      {/* Dimmed Backdrop with Spotlight Cutout */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none transition-all duration-300">
        <defs>
          <mask id="spotlight-mask">
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            {targetRect && (
              <rect
                x={targetRect.left - 6}
                y={targetRect.top - 6}
                width={targetRect.width + 12}
                height={targetRect.height + 12}
                rx="16"
                fill="black"
              />
            )}
          </mask>
        </defs>
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="rgba(7, 13, 24, 0.65)"
          mask="url(#spotlight-mask)"
        />
      </svg>

      {/* Target Pulsing Highlight Border */}
      {targetRect && (
        <div
          className="absolute border-2 border-blue-500 rounded-2xl pointer-events-none shadow-[0_0_30px_rgba(0,112,186,0.6)] transition-all duration-300 animate-pulse"
          style={{
            top: targetRect.top - 6,
            left: targetRect.left - 6,
            width: targetRect.width + 12,
            height: targetRect.height + 12,
          }}
        />
      )}

      {/* Speech Bubble Floating Tooltip */}
      <div
        className={`absolute w-[380px] bg-white rounded-2xl shadow-2xl border border-slate-200 p-5 transition-all duration-300 z-50 ${arrowClass}`}
        style={{
          top: `${bubbleTop}px`,
          left: `${bubbleLeft}px`,
        }}
      >
        {/* Header with Badge & Dismiss Button */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
              {currentStep.icon}
            </div>
            <span className="text-[11px] font-bold text-[#0070ba] tracking-tight">
              {currentStep.badge}
            </span>
          </div>

          <button
            type="button"
            onClick={handleSkipOrComplete}
            className="cursor-pointer p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
            title="Close tour (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tooltip Content Body */}
        <div className="py-3.5 space-y-2">
          <h4 className="text-base font-extrabold text-[#001435] tracking-tight">
            {currentStep.title}
          </h4>
          <p className="text-xs text-slate-600 leading-relaxed font-medium">
            {currentStep.description}
          </p>
          {currentStep.actionHint && (
            <div className="p-2 rounded-xl bg-blue-50/70 border border-blue-100 text-[11px] text-[#003087] font-semibold">
              {currentStep.actionHint}
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="pt-2 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {ONBOARDING_STEPS.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentStepIndex(idx)}
                className={`h-1.5 rounded-full transition-all cursor-pointer ${
                  idx === currentStepIndex
                    ? "w-6 bg-[#0070ba]"
                    : "w-1.5 bg-slate-200 hover:bg-slate-300"
                }`}
                title={`Step ${idx + 1}`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            {currentStepIndex > 0 && (
              <button
                type="button"
                onClick={handlePrev}
                className="cursor-pointer px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Prev</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleNext}
              className="cursor-pointer px-4 py-1.5 rounded-xl bg-[#003087] hover:bg-[#002466] text-white font-bold text-xs transition shadow-sm hover:shadow flex items-center gap-1.5"
            >
              <span>{currentStepIndex === ONBOARDING_STEPS.length - 1 ? "Finish Tour" : "Next"}</span>
              {currentStepIndex === ONBOARDING_STEPS.length - 1 ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <ArrowRight className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

export function ReplayTourButton({ onReplay }: { onReplay: () => void }) {
  return (
    <button
      type="button"
      onClick={onReplay}
      className="cursor-pointer flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 hover:bg-blue-50 text-slate-600 hover:text-[#003087] border border-slate-200 hover:border-blue-300 text-xs font-bold transition shadow-2xs"
      title="Open PayGenie Tour & Interactive Guide"
    >
      <HelpCircle className="w-3.5 h-3.5 text-[#0070ba]" />
      <span className="hidden sm:inline">Guide & Tour</span>
    </button>
  );
}
