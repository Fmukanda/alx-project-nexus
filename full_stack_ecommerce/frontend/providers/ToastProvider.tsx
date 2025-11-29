'use client';

import React, { createContext, useContext, useReducer } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}

type ToastAction =
  | { type: 'ADD_TOAST'; payload: Omit<Toast, 'id'> }
  | { type: 'REMOVE_TOAST'; payload: string };

const toastReducer = (state: Toast[], action: ToastAction): Toast[] => {
  switch (action.type) {
    case 'ADD_TOAST':
      return [
        ...state,
        {
          id: Math.random().toString(36).substr(2, 9),
          ...action.payload,
        },
      ];
    case 'REMOVE_TOAST':
      return state.filter((toast) => toast.id !== action.payload);
    default:
      return state;
  }
};

const ToastContext = createContext<{
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
} | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, dispatch] = useReducer(toastReducer, []);

  const addToast = (toast: Omit<Toast, 'id'>) => {
    dispatch({ type: 'ADD_TOAST', payload: toast });
  };

  const removeToast = (id: string) => {
    dispatch({ type: 'REMOVE_TOAST', payload: id });
  };

  const success = (title: string, message?: string) => {
    addToast({ type: 'success', title, message, duration: 5000 });
  };

  const error = (title: string, message?: string) => {
    addToast({ type: 'error', title, message, duration: 7000 });
  };

  const warning = (title: string, message?: string) => {
    addToast({ type: 'warning', title, message, duration: 5000 });
  };

  const info = (title: string, message?: string) => {
    addToast({ type: 'info', title, message, duration: 5000 });
  };

  return (
    <ToastContext.Provider
      value={{
        toasts,
        addToast,
        removeToast,
        success,
        error,
        warning,
        info,
      }}
    >
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
}

function ToastContainer() {
  const { toasts, removeToast } = useContext(ToastContext)!;

  if (toasts.length === 0) return null;

  return (
    <div style={{
      position: 'fixed',
      top: '1rem',
      right: '1rem',
      zIndex: 50,
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
      maxWidth: '400px',
    }}>
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  );
}

function Toast({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  React.useEffect(() => {
    if (toast.duration) {
      const timer = setTimeout(onClose, toast.duration);
      return () => clearTimeout(timer);
    }
  }, [toast.duration, onClose]);

  const icons = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertCircle,
    info: Info,
  };

  const colors = {
    success: { bg: '#dcfce7', border: '#bbf7d0', icon: '#16a34a' },
    error: { bg: '#fee2e2', border: '#fecaca', icon: '#dc2626' },
    warning: { bg: '#fef3c7', border: '#fde68a', icon: '#d97706' },
    info: { bg: '#dbeafe', border: '#bfdbfe', icon: '#2563eb' },
  };

  const Icon = icons[toast.type];
  const color = colors[toast.type];

  return (
    <div
      style={{
        backgroundColor: color.bg,
        border: `1px solid ${color.border}`,
        borderRadius: '0.5rem',
        padding: '1rem',
        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.75rem',
        maxWidth: '400px',
        animation: 'slideInRight 0.3s ease-out',
      }}
    >
      <Icon size={20} color={color.icon} style={{ flexShrink: 0, marginTop: '0.125rem' }} />
      <div style={{ flex: 1 }}>
        <h4 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1f2937', marginBottom: '0.25rem' }}>
          {toast.title}
        </h4>
        {toast.message && (
          <p style={{ fontSize: '0.75rem', color: '#6b7280', lineHeight: '1.4' }}>
            {toast.message}
          </p>
        )}
      </div>
      <button
        onClick={onClose}
        style={{
          background: 'none',
          border: 'none',
          color: '#9ca3af',
          cursor: 'pointer',
          padding: '0.25rem',
          borderRadius: '0.25rem',
          flexShrink: 0,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
        }}
      >
        <XCircle size={16} />
      </button>
    </div>
  );
}

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};