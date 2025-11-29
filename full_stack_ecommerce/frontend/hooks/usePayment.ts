'use client';

import { useState } from 'react';
import { apiClient } from '@/lib/api';

interface UsePaymentProps {
  onSuccess?: (payment: any) => void;
  onError?: (error: string) => void;
}

interface PaymentMethodData {
  type: 'card' | 'mpesa' | 'paypal';
  card?: {
    number: string;
    exp_month: number;
    exp_year: number;
    cvc: string;
    name: string;
  };
  is_default?: boolean;
}

interface MpesaPaymentData {
  phone_number: string;
  amount: number;
  order?: string;
}

interface CardPaymentData {
  order: string;
  payment_method?: string;
  save_payment_method?: boolean;
}

export function usePayment({ onSuccess, onError }: UsePaymentProps = {}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Create a payment for an order
  const createPayment = async (paymentData: CardPaymentData) => {
    setLoading(true);
    setError(null);

    try {
      // For card payments, we'll use a generic payment endpoint
      const payment = await apiClient.createPayment(paymentData);
      onSuccess?.(payment);
      return payment;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Payment creation failed';
      setError(errorMessage);
      onError?.(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Initiate M-Pesa payment
  const initiateMpesaPayment = async (mpesaData: MpesaPaymentData) => {
    setLoading(true);
    setError(null);

    try {
      const payment = await apiClient.initiateMpesaPayment(mpesaData);
      onSuccess?.(payment);
      return payment;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'M-Pesa payment initiation failed';
      setError(errorMessage);
      onError?.(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Confirm payment (for 3D Secure or other verification)
  const confirmPayment = async (paymentId: string, paymentIntent?: string) => {
    setLoading(true);
    setError(null);

    try {
      const result = await apiClient.confirmPayment(paymentId, paymentIntent);
      onSuccess?.(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Payment confirmation failed';
      setError(errorMessage);
      onError?.(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get user's saved payment methods
  const getPaymentMethods = async () => {
    setLoading(true);
    setError(null);

    try {
      const paymentMethods = await apiClient.getPaymentMethods();
      return paymentMethods;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch payment methods';
      setError(errorMessage);
      onError?.(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Create a new payment method (save card, etc.)
  const createPaymentMethod = async (paymentMethodData: PaymentMethodData) => {
    setLoading(true);
    setError(null);

    try {
      const paymentMethod = await apiClient.createPaymentMethod(paymentMethodData);
      return paymentMethod;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create payment method';
      setError(errorMessage);
      onError?.(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete a payment method
  const deletePaymentMethod = async (paymentMethodId: string) => {
    setLoading(true);
    setError(null);

    try {
      await apiClient.deletePaymentMethod(paymentMethodId);
      onSuccess?.({ message: 'Payment method deleted successfully' });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete payment method';
      setError(errorMessage);
      onError?.(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get payment status for an order
  const getPaymentStatus = async (orderId: string) => {
    setLoading(true);
    setError(null);

    try {
      const status = await apiClient.getPaymentStatus(orderId);
      return status;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch payment status';
      setError(errorMessage);
      onError?.(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get payment history
  const getPaymentHistory = async (params?: { page?: number; limit?: number }) => {
    setLoading(true);
    setError(null);

    try {
      const history = await apiClient.getPaymentHistory(params);
      return history;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch payment history';
      setError(errorMessage);
      onError?.(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Create refund
  const createRefund = async (refundData: {
    order: string;
    amount: number;
    reason: string;
  }) => {
    setLoading(true);
    setError(null);

    try {
      const refund = await apiClient.createRefund(refundData);
      onSuccess?.(refund);
      return refund;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Refund creation failed';
      setError(errorMessage);
      onError?.(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    // Payment methods
    createPayment,
    initiateMpesaPayment,
    confirmPayment,
    getPaymentStatus,
    
    // Payment methods management
    getPaymentMethods,
    createPaymentMethod,
    deletePaymentMethod,
    
    // History and refunds
    getPaymentHistory,
    createRefund,
    
    // State
    loading,
    error,
    clearError: () => setError(null),
  };
}