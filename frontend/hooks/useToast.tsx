'use client';

import { createContext, useContext, useCallback, useState } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
  success: (title: string, message?: string, duration?: number) => void;
  error: (title: string, message?: string, duration?: number) => void;
  warning: (title: string, message?: string, duration?: number) => void;
  info: (title: string, message?: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const defaultDuration = 5000; // 5 seconds

const toastIcons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const toastColors = {
  success: '#10b981',
  error: '#ef4444',
  warning: '#f59e0b',
  info: '#3b82f6',
};

const toastBackgrounds = {
  success: '#ecfdf5',
  error: '#fef2f2',
  warning: '#fffbeb',
  info: '#eff6ff',
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: Toast = {
      id,
      duration: defaultDuration,
      ...toast,
    };

    setToasts(prev => [...prev, newToast]);

    // Auto remove after duration
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, newToast.duration);
    }
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const clearToasts = useCallback(() => {
    setToasts([]);
  }, []);

  const success = useCallback((title: string, message?: string, duration?: number) => {
    addToast({ type: 'success', title, message, duration });
  }, [addToast]);

  const error = useCallback((title: string, message?: string, duration?: number) => {
    addToast({ type: 'error', title, message, duration });
  }, [addToast]);

  const warning = useCallback((title: string, message?: string, duration?: number) => {
    addToast({ type: 'warning', title, message, duration });
  }, [addToast]);

  const info = useCallback((title: string, message?: string, duration?: number) => {
    addToast({ type: 'info', title, message, duration });
  }, [addToast]);

  const value: ToastContextType = {
    toasts,
    addToast,
    removeToast,
    clearToasts,
    success,
    error,
    warning,
    info,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
}

function ToastContainer() {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div style={{
      position: 'fixed',
      top: '1rem',
      right: '1rem',
      zIndex: 50,
      display: 'flex',
      flexDirection: 'column',
      gap: '0.75rem',
      maxWidth: '400px',
    }}>
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  const Icon = toastIcons[toast.type];
  const backgroundColor = toastBackgrounds[toast.type];
  const color = toastColors[toast.type];

  return (
    <div style={{
      backgroundColor,
      border: `1px solid ${color}20`,
      borderRadius: '0.75rem',
      padding: '1rem',
      boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
      minWidth: '300px',
      animation: 'slideInRight 0.3s ease-out',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
        <Icon size={20} color={color} style={{ flexShrink: 0, marginTop: '0.125rem' }} />
        
        <div style={{ flex: 1, minWidth: 0 }}>
          <h4 style={{
            fontSize: '0.875rem',
            fontWeight: '600',
            color: '#111827',
            marginBottom: toast.message ? '0.25rem' : 0,
            lineHeight: '1.4',
          }}>
            {toast.title}
          </h4>
          
          {toast.message && (
            <p style={{
              fontSize: '0.875rem',
              color: '#6b7280',
              lineHeight: '1.4',
              margin: 0,
            }}>
              {toast.message}
            </p>
          )}

          {toast.action && (
            <button
              onClick={toast.action.onClick}
              style={{
                marginTop: '0.75rem',
                padding: '0.375rem 0.75rem',
                backgroundColor: color,
                color: 'white',
                border: 'none',
                borderRadius: '0.375rem',
                fontSize: '0.75rem',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '0.9';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '1';
              }}
            >
              {toast.action.label}
            </button>
          )}
        </div>

        <button
          onClick={onClose}
          style={{
            padding: '0.25rem',
            border: 'none',
            backgroundColor: 'transparent',
            color: '#9ca3af',
            cursor: 'pointer',
            borderRadius: '0.375rem',
            flexShrink: 0,
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.1)';
            e.currentTarget.style.color = '#374151';
          }}
        >
          <X size={16} />
        </button>
      </div>

      <style jsx>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

// Hook for specific toast types with common messages
export function useCartToast() {
  const { success, error, warning, info } = useToast();

  const addToCartSuccess = useCallback((productName: string) => {
    success('Added to Cart', `${productName} has been added to your cart.`);
  }, [success]);

  const addToCartError = useCallback((productName: string) => {
    error('Cannot Add to Cart', `Failed to add ${productName} to your cart. Please try again.`);
  }, [error]);

  const removeFromCartSuccess = useCallback((productName: string) => {
    success('Removed from Cart', `${productName} has been removed from your cart.`);
  }, [success]);

  const cartUpdateError = useCallback(() => {
  error('Cart Update Failed', 'Failed to update your cart. Please try again.');
}, [error]); // Add dependency array

  const outOfStockWarning = useCallback((productName: string) => {
    warning('Out of Stock', `${productName} is currently out of stock.`);
  }, [warning]);

  const lowStockWarning = useCallback((productName: string, quantity: number) => {
    warning('Low Stock', `Only ${quantity} ${productName} left in stock.`);
  }, [warning]);

  return {
    addToCartSuccess,
    addToCartError,
    removeFromCartSuccess,
    cartUpdateError,
    outOfStockWarning,
    lowStockWarning,
  };
}

export function useAuthToast() {
  const { success, error, info } = useToast();

  const loginSuccess = useCallback(() => {
    success('Welcome Back!', 'You have successfully signed in.');
  }, [success]);

  const loginError = useCallback((message?: string) => {
    error('Sign In Failed', message || 'Please check your credentials and try again.');
  }, [error]);

  const logoutSuccess = useCallback(() => {
    info('Signed Out', 'You have been successfully signed out.');
  }, [info]);

  const registerSuccess = useCallback(() => {
    success('Welcome!', 'Your account has been created successfully.');
  }, [success]);

  const registerError = useCallback((message?: string) => {
    error('Registration Failed', message || 'Please check your information and try again.');
  }, [error]);

  return {
    loginSuccess,
    loginError,
    logoutSuccess,
    registerSuccess,
    registerError,
  };
}

export function useOrderToast() {
  const { success, error, info } = useToast();

  const orderSuccess = useCallback((orderNumber: string) => {
    success('Order Placed!', `Your order #${orderNumber} has been confirmed.`);
  }, [success]);

  const orderError = useCallback(() => {
    error('Order Failed', 'There was a problem placing your order. Please try again.');
  }, [error]);

  const paymentSuccess = useCallback(() => {
  success('Payment Successful', 'Your payment has been processed successfully.');
}, [success]); // Add dependency array

const paymentError = useCallback(() => {
  error('Payment Failed', 'There was a problem processing your payment. Please try again.');
}, [error]); // Add dependency array

  return {
    orderSuccess,
    orderError,
    paymentSuccess,
    paymentError,
  };
}