import type { Metadata } from "next";
import "./globals.css";
import { PayPalProvider } from "@/components/PayPalProvider";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "PayGenie AI — Autonomous Invoicing & Instant PayPal Settlement",
  description: "AI-powered natural language invoicing engine with instant PayPal settlement for freelancers and modern businesses.",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
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
