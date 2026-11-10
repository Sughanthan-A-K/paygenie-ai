export interface InvoiceItem {
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
  clientName: string;
  clientEmail: string;
  sellerName: string;
  sellerEmail: string;
  items: InvoiceItem[];
  currency: string;
  subtotal: number;
  discountPercentage: number;
  discountAmount: number;
  taxPercentage: number;
  taxAmount: number;
  totalAmount: number;
  notes: string;
  status: 'PENDING' | 'PAID';
  paymentId?: string;
  paidAt?: string;
  emailDraft?: {
    subject: string;
    body: string;
  };
}
