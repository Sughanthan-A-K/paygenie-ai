import { NextResponse } from 'next/server';
import { GoogleGenAI, Type } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY || '';

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Gemini API key is not configured' },
        { status: 500 }
      );
    }

    const ai = new GoogleGenAI({ apiKey });

    const systemInstruction = `
You are an expert AI Billing & Invoicing specialist for PayGenie (PayPal Billing Assistant).
Analyze the user's input carefully.

IMPORTANT LOGIC:
1. CHECK INTENT FIRST:
   Determine if the user's prompt is actually describing billable work, services rendered, products sold, an invoice request, or commercial billing terms.
   - If the input is just casual conversation, greetings (e.g. "Vanakamdi maapla pondicherry la irunthu", "Hi bro", "Hello", "How are you?"), jokes, gibberish, or completely non-invoicing chatter:
     DO NOT fabricate a random fake invoice. Instead, return a friendly AI conversational reply in the field "chatReply" and leave "isInvoice" as false. Reply in the same language/tone as the user (English, Tamil, Tanglish).
   - If the input is indeed billable work, services, hours, or products (even if in casual English, Tamil, or Tanglish like "5 mani neram UI design pannadhuku $200 podu bro"):
     Set "isInvoice" to true and parse into a clean structured invoice data object.

2. WHEN CREATING AN INVOICE ("isInvoice": true):
   - Generate invoice number like "INV-2026-XXXX".
   - Set date to current date (YYYY-MM-DD) and due date (typically 7 to 14 days out).
   - If seller name is unspecified, default to "Your Company / Studio".
   - If client name or email is missing, provide reasonable placeholders or infer from context.
   - Parse line items, calculate quantities, unit prices, discounts, taxes (if mentioned or default to 0%), and total sum.
   - Currency defaults to "USD" unless INR or another currency is mentioned.
   - Draft a polite notification email draft in "emailDraft".
   - Provide a short friendly confirmation message in "chatReply" (e.g., "Got it! Generated invoice for your design work with instant PayPal payment link.").
`;

    const modelsToTry = ['gemini-3.5-flash', 'gemini-3.8-flash', 'gemma-4-31b-it'];
    let lastError: any = null;
    let responseText: string | null = null;

    for (const model of modelsToTry) {
      try {
        const result = await ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            systemInstruction,
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                isInvoice: { type: Type.BOOLEAN, description: 'True if input contains billing/invoice details; false if casual chatter/greeting' },
                chatReply: { type: Type.STRING, description: 'Friendly conversational reply to the user in their language (Tanglish/Tamil/English)' },
                invoiceNumber: { type: Type.STRING },
                date: { type: Type.STRING },
                dueDate: { type: Type.STRING },
                sellerName: { type: Type.STRING },
                sellerEmail: { type: Type.STRING },
                clientName: { type: Type.STRING },
                clientEmail: { type: Type.STRING },
                currency: { type: Type.STRING },
                items: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      description: { type: Type.STRING },
                      quantity: { type: Type.NUMBER },
                      unitPrice: { type: Type.NUMBER },
                      total: { type: Type.NUMBER },
                    },
                    required: ['id', 'description', 'quantity', 'unitPrice', 'total'],
                  },
                },
                subtotal: { type: Type.NUMBER },
                discountPercentage: { type: Type.NUMBER },
                discountAmount: { type: Type.NUMBER },
                taxPercentage: { type: Type.NUMBER },
                taxAmount: { type: Type.NUMBER },
                totalAmount: { type: Type.NUMBER },
                notes: { type: Type.STRING },
                emailDraft: {
                  type: Type.OBJECT,
                  properties: {
                    subject: { type: Type.STRING },
                    body: { type: Type.STRING },
                  },
                },
              },
              required: ['isInvoice', 'chatReply'],
            },
          },
        });
        if (result.text) {
          responseText = result.text;
          break;
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`Model ${model} failed, trying next:`, err?.message);
      }
    }

    if (!responseText) {
      throw lastError || new Error('All Gemini model endpoints busy');
    }

    // Clean any markdown code blocks or trailing characters
    let cleanedText = responseText.trim();
    if (cleanedText.startsWith('```json')) {
      cleanedText = cleanedText.slice(7);
    } else if (cleanedText.startsWith('```')) {
      cleanedText = cleanedText.slice(3);
    }
    if (cleanedText.endsWith('```')) {
      cleanedText = cleanedText.slice(0, -3);
    }
    cleanedText = cleanedText.trim();

    // Extract first valid JSON object block
    const firstBrace = cleanedText.indexOf('{');
    const lastBrace = cleanedText.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      cleanedText = cleanedText.substring(firstBrace, lastBrace + 1);
    }

    const parsedResult = JSON.parse(cleanedText);

    if (!parsedResult.isInvoice) {
      return NextResponse.json({
        isInvoice: false,
        chatReply: parsedResult.chatReply || "Vanakam bro! Invoice details edhavathu irundha sollunga, udane calculate panni PayPal invoice ready panren!",
        invoice: null,
      });
    }

    parsedResult.status = 'PENDING';

    return NextResponse.json({
      isInvoice: true,
      chatReply: parsedResult.chatReply || "Invoice successfully generated!",
      invoice: parsedResult,
    });
  } catch (error: any) {
    console.error('Invoice Generation Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to generate invoice with AI' },
      { status: 500 }
    );
  }
}
