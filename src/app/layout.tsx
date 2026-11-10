import type { Metadata } from "next";
import "./globals.css";
import { PayPalProvider } from "@/components/PayPalProvider";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "PayGenie — Intelligent Invoicing & Instant PayPal Settlement",
  description: "Generate structured, ready-to-pay invoices from natural language using Gemini AI and settle instantly via PayPal Sandbox.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-white text-[#001435] min-h-screen selection:bg-[#0070ba] selection:text-white antialiased">
        <PayPalProvider>
          {children}
          <Toaster position="top-right" richColors />
        </PayPalProvider>
      </body>
    </html>
  );
}
