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
  company?: string;
  preferredLanguage: 'English' | 'Tanglish' | 'Tamil';
  avatarBg?: string;
  createdAt: string;
  messages: ChatMessage[];
  invoices: InvoiceData[];
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
