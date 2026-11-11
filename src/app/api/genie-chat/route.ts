import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY || '';

export async function POST(req: Request) {
  try {
    const { messages, userMessage } = await req.json();

    if (!userMessage && (!messages || messages.length === 0)) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    if (!apiKey) {
      return NextResponse.json({ error: 'Gemini API key is not configured' }, { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey });

    const systemInstruction = `
You are "PayGenie" 🧞‍♂️ — a magical, witty, ultra-capable AI Genie built for PayPal billing, payments, and conversational invoicing.
Your persona:
- Warm, polite, playful genie persona. You can say things like "Your wish is my command, master!" or "Genie at your service!".
- You understand and reply in English, Tamil, and Tanglish fluently!
  - If the user greets in Tanglish (e.g. "Hi bro", "Enna panra", "Epdi iruka"), you reply naturally in cool Tanglish like a friendly tech-savvy Genie!
  - Respect time of day (Good morning / afternoon / evening greetings based on user time).
- You have dual intelligence:
  1. CHAT MODE: If the user is just saying hello, asking who you are, chatting, or making casual conversation, reply conversationally as the Genie.
  2. INVOICE CREATION MODE: If the user provides details about billing, hours worked, goods sold, clients, rates, or asks to generate an invoice, you will parse it AND return structured invoice data inside a JSON block.

CRITICAL INSTRUCTIONS FOR INVOICE CREATION:
If the user's message is asking to create/generate an invoice or describes billable work (e.g., "Billed Acme Tech $650...", "Create invoice for 5 hours React work at $50/hr for John"):
Your response MUST end with a JSON code block strictly in this format:
\`\`\`json
{
  "invoiceNumber": "INV-2026-XXXX",
  "date": "YYYY-MM-DD",
  "dueDate": "YYYY-MM-DD",
  "sellerName": "Your Company / Studio",
  "sellerEmail": "billing@merchant.com",
  "clientName": "Client Name",
  "clientEmail": "client@example.com",
  "currency": "USD",
  "items": [
    {
      "id": "1",
      "description": "Item description",
      "quantity": 1,
      "unitPrice": 100,
      "total": 100
    }
  ],
  "subtotal": 100,
  "discountPercentage": 0,
  "discountAmount": 0,
  "taxPercentage": 0,
  "taxAmount": 0,
  "totalAmount": 100,
  "notes": "Payment terms & notes",
  "emailDraft": {
    "subject": "Invoice from Merchant",
    "body": "Email body content"
  }
}
\`\`\`
Before the JSON code block, write your genie message (in the language/tone of the user, e.g. "Itho unga invoice ready aaiduchu master! Instant PayPal link generate paniten!").

If the user is NOT asking to generate an invoice, DO NOT output any json block, just reply cheerfully as PayGenie!
`;

    // Construct conversation history
    const contents: any[] = [];
    if (messages && Array.isArray(messages)) {
      for (const msg of messages) {
        contents.push({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }],
        });
      }
    }
    if (userMessage) {
      contents.push({
        role: 'user',
        parts: [{ text: userMessage }],
      });
    }

    const modelsToTry = ['gemini-3.5-flash', 'gemini-3.8-flash'];
    let lastError: any = null;
    let replyText = '';

    for (const model of modelsToTry) {
      try {
        const result = await ai.models.generateContent({
          model,
          contents,
          config: {
            systemInstruction,
          },
        });
        replyText = result.text || '';
        break;
      } catch (err: any) {
        lastError = err;
        console.warn(`Model ${model} failed, trying next:`, err.message);
      }
    }

    if (!replyText && lastError) {
      throw lastError;
    }

    // Check if response contains an invoice JSON block
    let parsedInvoice = null;
    const jsonMatch = replyText.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch && jsonMatch[1]) {
      try {
        parsedInvoice = JSON.parse(jsonMatch[1]);
      } catch (e) {
        console.error('Failed to parse invoice json from genie response:', e);
      }
    }

    // Clean conversational reply text (remove the raw json block from user chat bubble)
    const cleanReply = replyText.replace(/```json[\s\S]*?```/, '').trim();

    return NextResponse.json({
      reply: cleanReply || "Your wish is my command! ✨",
      invoice: parsedInvoice,
    });
  } catch (error: any) {
    console.error('Genie Chat API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to communicate with PayGenie' },
      { status: 500 }
    );
  }
}
