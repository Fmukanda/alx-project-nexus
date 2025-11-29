'use client';

import React from 'react';
import { ThemeProvider } from './ThemeProvider';
import { CartProvider } from './CartProvider';
import { AuthProvider } from './AuthProvider';
import { ToastProvider } from './ToastProvider';
import { WishlistProvider } from './WishlistProvider';

interface AppProvidersProps {
  children: React.ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <ToastProvider>
              {children}
            </ToastProvider>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}