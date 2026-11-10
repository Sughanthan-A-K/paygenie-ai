# 🧞‍♂️ PayGenie AI — Autonomous Invoice Generation & Instant PayPal Settlement

> **Built for the PayPal AI Hackathon 2026**  
> *"Build what's next with PayPal and AI"*

![PayGenie AI Banner](https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1200&q=80)

---

## 💡 Overview

Freelancers, creators, and small agencies waste hours manually creating invoices, calculating discounts and taxes, chasing client payments, and managing payment links.

**PayGenie AI** bridges natural language and frictionless commerce:
1. **Gemini AI Engine**: Describe any project or transaction in plain conversational English (or any language). Gemini automatically extracts line items, applies discounts, computes taxes, generates structured JSON, and drafts professional client notification emails.
2. **PayPal Sandbox Settle Engine**: Mounts an instant PayPal Checkout button directly into the generated invoice, enabling one-click authorization and capture with automated status synchronization and celebratory receipt generation.

---

## ✨ Features

- 🧠 **Natural Language to Structured Invoice**: Turn `"Billed Acme Corp $450 for UI design with 10% discount"` into an itemized, mathematically accurate invoice in seconds.
- 💳 **Direct PayPal Checkout**: Embedded PayPal Buttons utilizing the PayPal Orders v2 API (Server-side create order + capture order).
- ✉️ **AI Email & Reminder Drafter**: Gemini crafts custom, polite client notification emails with one-click clipboard copy.
- 📊 **Real-time Session Ledger**: Keeps track of pending vs settled invoices with transaction reference IDs.
- 🎨 **Modern Responsive UI**: Built with Next.js 16 (App Router), React 19, Tailwind CSS, Lucide icons, and Canvas Confetti.

---

## 🛠️ Architecture & Tech Stack

```
[User Prompt] 
      │
      ▼
[Gemini 2.5 Flash] ──(Structured JSON Extraction)──► [Invoice & Email Draft View]
                                                                │
                                                                ▼
                                                      [PayPal Orders v2 API]
                                                                │
                                                                ▼
                                                    [Instant Capture & Settlement]
```

- **Frontend**: Next.js 16 (Turbopack, App Router), React 19, Tailwind CSS
- **AI / LLM**: Google Gemini (`@google/genai` SDK with `gemini-2.5-flash`)
- **Payments**: PayPal Developer Platform (`@paypal/react-paypal-js` & REST API Orders v2)
- **Deployment Ready**: Render / Vercel

---

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/PayGenie-AI.git
cd PayGenie-AI
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env.local` file in the root directory:
```env
# PayPal Sandbox Credentials
NEXT_PUBLIC_PAYPAL_CLIENT_ID=your_paypal_sandbox_client_id
PAYPAL_CLIENT_SECRET=your_paypal_sandbox_secret

# Gemini AI API Key
GEMINI_API_KEY=your_gemini_api_key
```

### 4. Run Locally
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Testing with PayPal Sandbox

To test payments:
1. Open the app at `http://localhost:3000`.
2. Generate an invoice using one of the sample prompt buttons.
3. Click the **PayPal** button.
4. Log in using your **PayPal Sandbox Personal Buyer Account** credentials (available in your [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/applications/sandbox)).
5. Click **Complete Purchase** — watch the invoice instantly update to **PAID VIA PAYPAL** with confetti!

---

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
