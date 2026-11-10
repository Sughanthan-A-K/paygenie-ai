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
You are an expert AI Billing & Invoicing specialist for PayGenie.
Given a natural language prompt from a freelancer or business owner describing work done or goods sold,
parse and structure it into a clean, complete professional invoice data object.

Ensure you:
1. Generate an invoice number like "INV-2026-XXXX".
2. Set date to current date (YYYY-MM-DD) and due date (typically 7 to 14 days out).
3. If seller name is unspecified, default to "Your Company / Studio".
4. If client name or email is missing, provide reasonable placeholders (e.g. "Valued Client", "client@example.com").
5. Parse line items, calculate quantities, unit prices, discounts, taxes (if mentioned or default to 0%), and total sum.
6. Provide polite notes/terms (e.g., "Thank you for your business! Payment due upon receipt via PayPal.").
7. Draft a friendly, professional notification email that can be sent to the client with payment link details.
Currency must default to "USD" unless specified.
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
                  required: ['subject', 'body'],
                },
              },
              required: [
                'invoiceNumber',
                'date',
                'dueDate',
                'sellerName',
                'clientName',
                'items',
                'currency',
                'subtotal',
                'totalAmount',
                'emailDraft',
              ],
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

    const invoiceJson = JSON.parse(cleanedText);
    invoiceJson.status = 'PENDING';

    return NextResponse.json({ invoice: invoiceJson });
  } catch (error: any) {
    console.error('Invoice Generation Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to generate invoice with AI' },
      { status: 500 }
    );
  }
}
