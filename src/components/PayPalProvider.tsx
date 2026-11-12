'use client';

import React, { useEffect } from 'react';

export function PayPalProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Intercept uncaught postMessage / post-robot window closed errors from PayPal popup
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason?.message || String(event.reason || '');
      if (
        reason.includes('Window is closed') ||
        reason.includes('can not determine type') ||
        reason.includes('Component closed')
      ) {
        event.preventDefault(); // Suppress noise from closing PayPal checkout popup
      }
    };

    const handleError = (event: ErrorEvent) => {
      const message = event.message || '';
      if (
        message.includes('Window is closed') ||
        message.includes('can not determine type') ||
        message.includes('Component closed')
      ) {
        event.preventDefault();
      }
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleError);

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleError);
    };
  }, []);

  return <>{children}</>;
}
