import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY || '';

export async function POST(req: Request) {
  try {
    const { 
      messages, 
      userMessage, 
      currentInvoice, 
      clientProfile,
      preferredLanguage = 'English' 
    } = await req.json();

    if (!userMessage && (!messages || messages.length === 0)) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    if (!apiKey) {
      return NextResponse.json({ error: 'Gemini API key is not configured' }, { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey });

    const clientName = clientProfile?.name || 'Valued Client';
    const clientEmail = clientProfile?.email || 'client@example.com';
    const lang = preferredLanguage || clientProfile?.preferredLanguage || 'English';

    const systemInstruction = `
You are PayGenie AI — an intelligent, natural conversational billing copilot for PayPal Hackathon.
CURRENT ACTIVE CLIENT:
Name: "${clientName}"
Email: "${clientEmail}"
Company: "${clientProfile?.company || ''}"

NATURAL CONVERSATIONAL INTELLIGENCE:
- Detect the user's natural language and tone automatically.
- If the user types in English, reply in crisp, polite, professional English.
- If the user types in colloquial/multilingual speech (e.g. Tanglish or conversational phrasing), seamlessly understand and reply naturally in that tone.
- Never force an artificial language; prioritize clear, professional billing context that any global PayPal judge can appreciate.

CAPABILITIES:
1. CASUAL CONVERSATION:
   - If user is greeting, asking how things work, or chatting, reply warmly and politely in the conversation's language.
   - DO NOT fabricate an invoice for casual greetings.
   - Leave invoice JSON block empty.

2. INVOICE CREATION OR EDITING:
   - If user describes billable work, hours, rate, or edits:
     - Automatically bind the invoice to client "${clientName}" and email "${clientEmail}".
     - If the user asks to modify an existing invoice (e.g., "Add 10% tax", "Rate-ah $80 maathu", "Change due date"):
       Use CURRENT_INVOICE_CONTEXT to accurately update it!
     - You MUST append a JSON code block at the very end of your reply:
\`\`\`json
{
  "invoiceNumber": "INV-2026-XXXX",
  "date": "YYYY-MM-DD",
  "dueDate": "YYYY-MM-DD",
  "sellerName": "Your Company / Studio",
  "sellerEmail": "billing@merchant.com",
  "clientName": "${clientName}",
  "clientEmail": "${clientEmail}",
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
  "notes": "Payment terms & notes. Instant settlement via PayPal.",
  "emailDraft": {
    "subject": "Invoice from Merchant",
    "body": "Email body content"
  }
}
\`\`\`

Before the json block, write your conversational reply in "${lang}".

CURRENT_INVOICE_CONTEXT: ${JSON.stringify(currentInvoice || null)}
`;

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

    const modelsToTry = ['gemini-3.5-flash', 'gemini-3.8-flash', 'gemma-4-31b-it'];
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

    let parsedInvoice = null;
    const jsonMatch = replyText.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch && jsonMatch[1]) {
      try {
        parsedInvoice = JSON.parse(jsonMatch[1]);
        if (parsedInvoice && !parsedInvoice.status) {
          parsedInvoice.status = currentInvoice?.status || 'PENDING';
        }
      } catch (e) {
        console.error('Failed to parse invoice json:', e);
      }
    }

    const cleanReply = replyText.replace(/```json[\s\S]*?```/, '').trim();

    return NextResponse.json({
      reply: cleanReply || 'Message processed!',
      invoice: parsedInvoice,
    });
  } catch (error: any) {
    console.error('Genie Chat API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process AI message' },
      { status: 500 }
    );
  }
}
