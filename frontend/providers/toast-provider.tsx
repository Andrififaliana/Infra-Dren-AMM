'use client';

import { Toaster as SonnerToaster } from 'sonner';

export function ToastProvider() {
  return (
    <SonnerToaster
      position="top-right"
      toastOptions={{
        style: {
          background: 'white',
          border: '1px solid #e5e7eb',
          color: '#111827',
          borderRadius: '12px',
          padding: '12px 16px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        },
      }}
      richColors
      closeButton
    />
  );
}
