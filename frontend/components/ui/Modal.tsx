'use client';

import React from 'react';
import { X } from 'lucide-react';
import { useTheme } from '@/providers/ThemeProvider';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  const theme = useTheme();

  if (!isOpen) return null;

  const sizeStyles = {
    sm: { maxWidth: '400px' },
    md: { maxWidth: '500px' },
    lg: { maxWidth: '600px' },
    xl: { maxWidth: '800px' },
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 50,
      padding: '1rem',
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: theme.borderRadius.lg,
        boxShadow: theme.shadows.lg,
        width: '100%',
        ...sizeStyles[size],
      }}>
        {/* Header */}
        {title && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1.5rem 1.5rem 0',
          }}>
            <h2 style={{
              fontSize: '1.25rem',
              fontWeight: '600',
              color: theme.colors.gray[900],
            }}>
              {title}
            </h2>
            <button
              onClick={onClose}
              style={{
                padding: '0.5rem',
                borderRadius: theme.borderRadius.md,
                color: theme.colors.gray[500],
                cursor: 'pointer',
                border: 'none',
                backgroundColor: 'transparent',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = theme.colors.gray[100];
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <X size={20} />
            </button>
          </div>
        )}

        {/* Content */}
        <div style={{
          padding: '1.5rem',
        }}>
          {children}
        </div>
      </div>
    </div>
  );
}