'use client';

import { PayPalScriptProvider } from '@paypal/react-paypal-js';

export function PayPalProvider({ children }: { children: React.ReactNode }) {
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || 'test';

  return (
    <PayPalScriptProvider
      options={{
        clientId: clientId,
        currency: 'USD',
        intent: 'capture',
        components: 'buttons',
        enableFunding: 'card',
        disableFunding: 'credit',
      }}
    >
      {children}
    </PayPalScriptProvider>
  );
}
