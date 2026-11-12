export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface InvoiceData {
  invoiceNumber: string;
  date: string;
  dueDate: string;
  sellerName: string;
  sellerEmail?: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string; // Client WhatsApp / Phone number
  items: LineItem[];
  currency: string;
  subtotal: number;
  discountPercentage: number;
  discountAmount: number;
  taxPercentage: number;
  taxAmount: number;
  totalAmount: number;
  notes?: string;
  status: 'PENDING' | 'PAID' | 'CANCELLED';
  paymentId?: string;
  paidAt?: string;
  emailDraft?: {
    subject: string;
    body: string;
    template?: 'formal' | 'friendly' | 'urgent';
  };
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  invoiceDraft?: InvoiceData;
  isConfirmed?: boolean;
}

export interface ClientProfile {
  id: string;
  name: string;
  email: string;
  phone?: string; // WhatsApp or Phone number (with country code e.g. +91 9876543210)
  company?: string;
  preferredLanguage: 'English' | 'Tanglish' | 'Tamil';
  avatarBg?: string;
  createdAt: string;
  messages: ChatMessage[];
  invoices: InvoiceData[];
}

export interface CustomTemplateItem {
  id: string;
  name: string;
  type: 'invoice' | 'email' | 'whatsapp';
  content: string; // for invoice: prompt; for email: body; for whatsapp: message text
  subject?: string; // only for email templates
}

export interface MerchantProfile {
  name: string;
  email: string;
  company: string;
  paypalClientId?: string;
  paypalSecretKey?: string;
  geminiApiKey?: string;
  twoFactorSecret?: string; // Standard Base32 secret for Google Authenticator 2FA
}
