import type { Metadata } from "next";
import "./globals.css";
import { PayPalProvider } from "@/components/PayPalProvider";

export const metadata: Metadata = {
  title: "PayGenie AI — Intelligent Invoicing & Instant PayPal Settlement",
  description: "Generate structured, ready-to-pay invoices from natural language using Gemini AI and settle instantly via PayPal Sandbox.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-slate-100 min-h-screen selection:bg-blue-600 selection:text-white">
        <PayPalProvider>
          {children}
        </PayPalProvider>
      </body>
    </html>
  );
}
