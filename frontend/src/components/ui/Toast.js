'use client';

import React from 'react';
import { Toaster } from 'react-hot-toast';

export function ToastProvider({ children }) {
  return (
    <>
      <Toaster 
        position="top-right"
        toastOptions={{
          className: 'font-sora text-sm',
          duration: 3000,
          style: {
            background: '#ffffff',
            color: '#1e293b',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05)',
            borderRadius: '12px',
          },
        }} 
      />
      {children}
    </>
  );
}
