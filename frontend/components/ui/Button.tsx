// frontend/components/ui/Button.tsx
import React from 'react';
import { useTheme } from '@/providers/ThemeProvider';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  icon?: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  ...props
}: ButtonProps) {
  const theme = useTheme();

  const baseStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '600',
    borderRadius: theme.borderRadius.md,
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s',
    outline: 'none',
  };

  const variants = {
    primary: {
      backgroundColor: theme.colors.primary[600],
      color: 'white',
      boxShadow: theme.shadows.sm,
    },
    secondary: {
      backgroundColor: theme.colors.gray[200],
      color: theme.colors.gray[800],
    },
    outline: {
      backgroundColor: 'transparent',
      color: theme.colors.primary[600],
      border: `1px solid ${theme.colors.primary[600]}`,
    },
  };

  const sizes = {
    sm: {
      padding: `${theme.spacing[2]} ${theme.spacing[3]}`,
      fontSize: '0.875rem',
    },
    md: {
      padding: `${theme.spacing[3]} ${theme.spacing[4]}`,
      fontSize: '1rem',
    },
    lg: {
      padding: `${theme.spacing[4]} ${theme.spacing[6]}`,
      fontSize: '1.125rem',
    },
  };

  const styles = {
    ...baseStyles,
    ...variants[variant],
    ...sizes[size],
  };

  return (
    <button
      style={styles}
      className={className}
      {...props}
    >
      {children}
    </button>
  );
}