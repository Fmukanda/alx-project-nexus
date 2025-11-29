// frontend/components/ui/LoadingSpinner.tsx
import React from 'react';
import { useTheme } from '@/providers/ThemeProvider';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  className?: string;
}

export function LoadingSpinner({ 
  size = 'md', 
  color, 
  className = '' 
}: LoadingSpinnerProps) {
  const theme = useTheme();
  
  const sizeStyles = {
    sm: { width: '1rem', height: '1rem' },
    md: { width: '2rem', height: '2rem' },
    lg: { width: '3rem', height: '3rem' },
  };

  const spinnerColor = color || theme.colors.primary[500];

  return (
    <div
      style={{
        ...sizeStyles[size],
        border: `2px solid ${spinnerColor}20`,
        borderTop: `2px solid ${spinnerColor}`,
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
      }}
      className={className}
      aria-label="Loading"
    />
  );
}

export function PageLoader() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '50vh',
      flexDirection: 'column',
      gap: '1rem',
    }}>
      <LoadingSpinner size="lg" />
      <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
        Loading...
      </p>
    </div>
  );
}

export function ButtonLoader() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <LoadingSpinner size="sm" color="currentColor" />
      <span>Processing...</span>
    </div>
  );
}