# PayGenie AI 🧞‍♂️ — Conversational Billing Copilot & Instant PayPal Settlement

PayGenie is an intelligent, conversational billing assistant and instant payment settlement portal built for modern freelancers and small studios. Powered by **Google Gemini 3.5 Flash** and **PayPal Orders v2 API**, PayGenie converts natural language project descriptions into structured, verified invoices with direct, one-touch mobile checkout links.

Built for the **PayPal AI Hackathon 2026**.

---

## 🌟 Key Features

1. **Client Invoicing Threads (Conversational Copilot):**
   - Natural language billing input in **English**, **Tanglish**, and **Tamil**.
   - Language selector toggle for seamless international judge reviews.
   - Smart intent classification (casual greetings vs. billable project hours).
   - Dedicated client workspace threads (`1 Client = 1 Dedicated Chat`).

2. **Verified Structured Invoicing & Instant PDF Export:**
   - Automatic calculation of item totals, tiered discounts, and local tax rates.
   - Clean, vector-based PDF download with official PayPal branding.
   - Pre-drafted client notification emails ready to dispatch via WhatsApp or email.

3. **Client Mobile Pay Portal (`/?invoice=INV-XXXX`):**
   - Pure client-facing smartphone chassis view with 256-bit SSL encrypted badges.
   - Native PayPal Sandbox checkout button with credit/debit card support.
   - Zero vendor or merchant control exposure to end clients.

4. **Real-Time Cross-Tab Settlement Sync:**
   - Powered by browser `BroadcastChannel` API (`paygenie_live_sync`).
   - When a client pays on mobile view, the merchant's ledger status and settled balance updates instantly across tabs without refreshing.

5. **Merchant Settlement Ledger & Live Balance Strip:**
   - Real-time display of **PayPal Settled Balance** and **Pending Receivables**.
   - Master invoice ledger with inline AI modification, email draft tuning, and search.
   - Enterprise security dialogs for safe message revert, edit, and deletion.

---

## 🛠️ Tech Stack

- **Framework:** Next.js 16 (App Router, Turbopack)
- **AI Engine:** Google Gemini SDK (`gemini-3.5-flash`, `gemini-3.8-flash`)
- **Payments:** PayPal Orders v2 REST API & `@paypal/react-paypal-js`
- **Styling:** Tailwind CSS with authentic PayPal PPUI 3.0 enterprise design
- **PDF Engine:** jsPDF vector engine
- **Icons & UI:** Lucide React, Sonner Toast Notifications, Canvas Confetti

---

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/Sughanthan-A-K/paygenie-ai.git
cd paygenie-ai
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env.local` file in the root directory:
```env
# PayPal Sandbox Developer Credentials
NEXT_PUBLIC_PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret

# Google Gemini AI Key
GEMINI_API_KEY=your_gemini_api_key
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📄 License
MIT License. Built with ❤️ for the PayPal AI Hackathon 2026.
