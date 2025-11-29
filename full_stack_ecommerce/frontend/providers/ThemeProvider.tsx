// frontend/providers/ThemeProvider.tsx
'use client';

import React, { createContext, useContext } from 'react';
import { theme } from '@/lib/theme';

const ThemeContext = createContext(theme);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};