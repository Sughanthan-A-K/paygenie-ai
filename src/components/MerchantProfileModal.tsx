'use client';

import React, { useState } from 'react';
import { 
  X, 
  User, 
  Building2, 
  Mail, 
  Check, 
  ShieldCheck, 
  CreditCard,
  Sparkles,
  Globe,
  Coins
} from 'lucide-react';
import { MerchantProfile } from '@/types/invoice';
import { toast } from 'sonner';

interface MerchantProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: MerchantProfile;
  onSave: (updated: MerchantProfile) => void;
}

export default function MerchantProfileModal({
  isOpen,
  onClose,
  profile,
  onSave,
}: MerchantProfileModalProps) {
  const [name, setName] = useState(profile.name || 'PayGenie Studio');
  const [email, setEmail] = useState(profile.email || 'billing@merchant.com');
  const [company, setCompany] = useState(profile.company || 'PayGenie Technologies');
  const [defaultCurrency, setDefaultCurrency] = useState('USD');

  // ESC key listener to close modal
  React.useEffect(() => {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim();
    const cleanEmail = email.trim();

    if (!cleanName) {
      toast.error('Merchant business name is required');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      toast.error('Please enter a valid billing email address');
      return;
    }

    const updated: MerchantProfile = {
      ...profile,
      name: cleanName,
      email: cleanEmail,
      company: company.trim(),
    };

    onSave(updated);
    toast.success('Merchant profile updated successfully!');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div 
        className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#003087] text-white flex items-center justify-center font-bold shadow-xs">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-[#001435]">Freelancer & Merchant Profile</h3>
              <p className="text-xs text-slate-500 font-medium">Your public business identity attached to all client invoices</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-full transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-xs">
          
          <div className="space-y-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Your Name / Freelancer Alias *</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex Turner"
                  className="w-full bg-[#f8fafc] border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#001435] focus:outline-none focus:bg-white focus:border-[#0070ba] font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Billing Email *</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="billing@yourstudio.com"
                    className="w-full bg-[#f8fafc] border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#001435] focus:outline-none focus:bg-white focus:border-[#0070ba] font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Company / Studio</label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="e.g. Turner Design Studio"
                    className="w-full bg-[#f8fafc] border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#001435] focus:outline-none focus:bg-white focus:border-[#0070ba] font-medium"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Default Settlement Currency</label>
              <div className="grid grid-cols-4 gap-2 pt-1">
                {(['USD', 'EUR', 'INR', 'GBP'] as const).map((curr) => (
                  <button
                    key={curr}
                    type="button"
                    onClick={() => setDefaultCurrency(curr)}
                    className={`py-2 rounded-xl border text-center transition font-bold text-xs ${
                      defaultCurrency === curr
                        ? 'bg-[#003087] text-white border-[#003087] shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {curr}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Footer Save Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="pp-button-secondary !py-2 !px-4 !text-xs font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="pp-button-primary !py-2 !px-6 !text-xs flex items-center gap-1.5 shadow-sm font-bold"
            >
              <Check className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
