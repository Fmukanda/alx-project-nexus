import React from 'react';
import { useTheme } from '@/providers/ThemeProvider';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className = '', ...props }: InputProps) {
  const theme = useTheme();

  return (
    <div style={{ marginBottom: '1rem' }}>
      {label && (
        <label style={{
          display: 'block',
          fontSize: '0.875rem',
          fontWeight: '500',
          color: theme.colors.gray[700],
          marginBottom: '0.5rem',
        }}>
          {label}
        </label>
      )}
      <input
        {...props}
        style={{
          width: '100%',
          padding: '0.75rem',
          border: `1px solid ${error ? theme.colors.error : theme.colors.gray[300]}`,
          borderRadius: theme.borderRadius.md,
          fontSize: '1rem',
          outline: 'none',
          transition: 'border-color 0.2s',
        }}
        className={className}
        onFocus={(e) => {
          e.target.style.borderColor = theme.colors.primary[500];
        }}
        onBlur={(e) => {
          e.target.style.borderColor = error ? theme.colors.error : theme.colors.gray[300];
        }}
      />
      {error && (
        <p style={{
          color: theme.colors.error,
          fontSize: '0.875rem',
          marginTop: '0.25rem',
        }}>
          {error}
        </p>
      )}
    </div>
  );
}