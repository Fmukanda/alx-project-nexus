'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { CreditCard, Lock, Shield, Phone } from 'lucide-react';
import { MpesaForm } from './MpesaForm';

interface PaymentFormProps {
  onNext: (data: any) => void;
  onBack: () => void;
  initialData?: any;
  orderId?: string;
  amount?: number;
}

export function PaymentForm({ onNext, onBack, initialData, orderId, amount }: PaymentFormProps) {
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal' | 'mpesa'>('card');
  const [savePaymentMethod, setSavePaymentMethod] = useState(false);
  const [formData, setFormData] = useState({
    cardNumber: initialData?.cardNumber || '',
    expiryDate: initialData?.expiryDate || '',
    cvv: initialData?.cvv || '',
    nameOnCard: initialData?.nameOnCard || '',
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches ? matches[0] : '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    return parts.length ? parts.join(' ') : value;
  };

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return `${v.substring(0, 2)}/${v.substring(2, 4)}`;
    }
    return value;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // In a real app, you would tokenize the card with your payment provider
    // For now, we'll just pass the data along
    onNext({
      payment: {
        method: paymentMethod,
        ...formData,
      },
      savePaymentMethod,
    });
  };

  const handleMpesaSuccess = (data: any) => {
    onNext({
      payment: {
        method: 'mpesa',
        ...data,
      },
    });
  };

  const handleMpesaError = (error: string) => {
    // Handle error (show toast, etc.)
    console.error('M-Pesa error:', error);
  };

  // Show M-Pesa form if selected and we have required data
  if (paymentMethod === 'mpesa' && orderId && amount) {
    return (
      <MpesaForm
        onSuccess={handleMpesaSuccess}
        onError={handleMpesaError}
        onBack={() => setPaymentMethod('card')}
        orderId={orderId}
        amount={amount}
      />
    );
  }

  return (
    <div>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', marginBottom: '1.5rem' }}>
        Payment Information
      </h2>

      {/* Payment Method Selection - Updated with M-Pesa */}
      <div style={{ marginBottom: '2rem' }}>
        <label style={{ display: 'block', fontSize: '1rem', fontWeight: '600', color: '#374151', marginBottom: '1rem' }}>
          Payment Method
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
          <button
            type="button"
            onClick={() => setPaymentMethod('card')}
            style={{
              padding: '1rem',
              border: `2px solid ${paymentMethod === 'card' ? '#0284c7' : '#e5e7eb'}`,
              backgroundColor: paymentMethod === 'card' ? '#f0f9ff' : 'white',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              textAlign: 'left',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <CreditCard size={20} color={paymentMethod === 'card' ? '#0284c7' : '#6b7280'} />
              <span style={{ fontWeight: '600', color: paymentMethod === 'card' ? '#0284c7' : '#374151' }}>
                Credit/Debit Card
              </span>
            </div>
            <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
              Pay with your credit or debit card
            </p>
          </button>

          <button
            type="button"
            onClick={() => setPaymentMethod('paypal')}
            style={{
              padding: '1rem',
              border: `2px solid ${paymentMethod === 'paypal' ? '#0284c7' : '#e5e7eb'}`,
              backgroundColor: paymentMethod === 'paypal' ? '#f0f9ff' : 'white',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              textAlign: 'left',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <Shield size={20} color={paymentMethod === 'paypal' ? '#0284c7' : '#6b7280'} />
              <span style={{ fontWeight: '600', color: paymentMethod === 'paypal' ? '#0284c7' : '#374151' }}>
                PayPal
              </span>
            </div>
            <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
              Pay securely with your PayPal account
            </p>
          </button>

          <button
            type="button"
            onClick={() => setPaymentMethod('mpesa')}
            style={{
              padding: '1rem',
              border: `2px solid ${paymentMethod === 'mpesa' ? '#0284c7' : '#e5e7eb'}`,
              backgroundColor: paymentMethod === 'mpesa' ? '#f0f9ff' : 'white',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              textAlign: 'left',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <Phone size={20} color={paymentMethod === 'mpesa' ? '#0284c7' : '#6b7280'} />
              <span style={{ fontWeight: '600', color: paymentMethod === 'mpesa' ? '#0284c7' : '#374151' }}>
                M-Pesa
              </span>
            </div>
            <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
              Pay with M-Pesa mobile money
            </p>
          </button>
        </div>
      </div>

      {paymentMethod === 'card' && (
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
              Card Number
            </label>
            <Input
              type="text"
              name="cardNumber"
              value={formData.cardNumber}
              onChange={(e) => {
                const formatted = formatCardNumber(e.target.value);
                setFormData(prev => ({ ...prev, cardNumber: formatted }));
              }}
              placeholder="1234 5678 9012 3456"
              maxLength={19}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                Expiry Date
              </label>
              <Input
                type="text"
                name="expiryDate"
                value={formData.expiryDate}
                onChange={(e) => {
                  const formatted = formatExpiryDate(e.target.value);
                  setFormData(prev => ({ ...prev, expiryDate: formatted }));
                }}
                placeholder="MM/YY"
                maxLength={5}
                required
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                CVV
              </label>
              <Input
                type="text"
                name="cvv"
                value={formData.cvv}
                onChange={handleChange}
                placeholder="123"
                maxLength={4}
                required
              />
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
              Name on Card
            </label>
            <Input
              type="text"
              name="nameOnCard"
              value={formData.nameOnCard}
              onChange={handleChange}
              placeholder="John Doe"
              required
            />
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={savePaymentMethod}
                onChange={(e) => setSavePaymentMethod(e.target.checked)}
                style={{ width: '1rem', height: '1rem' }}
              />
              <span style={{ fontSize: '0.875rem', color: '#374151' }}>
                Save this card for future purchases
              </span>
            </label>
          </div>

          {/* Security Notice */}
          <div style={{
            backgroundColor: '#f0f9ff',
            padding: '1rem',
            borderRadius: '0.5rem',
            border: '1px solid #bae6fd',
            marginBottom: '2rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <Lock size={16} color="#0284c7" />
              <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#0369a1' }}>
                Your payment is secure
              </span>
            </div>
            <p style={{ fontSize: '0.75rem', color: '#0369a1', lineHeight: '1.4' }}>
              We use industry-standard encryption to protect your payment information. 
              Your card details are never stored on our servers.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
              style={{ flex: 1 }}
            >
              Back to Shipping
            </Button>
            <Button
              type="submit"
              variant="primary"
              style={{ flex: 1 }}
            >
              Continue to Review
            </Button>
          </div>
        </form>
      )}

      {paymentMethod === 'paypal' && (
        <div>
          <div style={{
            backgroundColor: '#f8fafc',
            padding: '2rem',
            borderRadius: '0.5rem',
            textAlign: 'center',
            marginBottom: '2rem',
          }}>
            <Shield size={48} color="#003087" style={{ margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
              PayPal Checkout
            </h3>
            <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
              You will be redirected to PayPal to complete your payment securely.
            </p>
            <Button
              variant="primary"
              onClick={() => onNext({ payment: { method: 'paypal' } })}
              style={{ backgroundColor: '#003087', borderColor: '#003087' }}
            >
              Continue with PayPal
            </Button>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
              style={{ flex: 1 }}
            >
              Back to Shipping
            </Button>
          </div>
        </div>
      )}

      {paymentMethod === 'mpesa' && (!orderId || !amount) && (
        <div>
          <div style={{
            backgroundColor: '#fef3c7',
            padding: '1rem',
            borderRadius: '0.5rem',
            border: '1px solid #f59e0b',
            marginBottom: '2rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <Phone size={16} color="#d97706" />
              <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#92400e' }}>
                M-Pesa Payment Information Required
              </span>
            </div>
            <p style={{ fontSize: '0.75rem', color: '#92400e', lineHeight: '1.4' }}>
              To use M-Pesa, please ensure you have an order ID and amount available. 
              This usually happens after proceeding from the shipping step.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
              style={{ flex: 1 }}
            >
              Back to Shipping
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setPaymentMethod('card')}
              style={{ flex: 1 }}
            >
              Use Card Instead
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}