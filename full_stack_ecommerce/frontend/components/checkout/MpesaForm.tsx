'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Phone, Shield, CheckCircle, XCircle } from 'lucide-react';

interface MpesaFormProps {
  onSuccess: (transaction: any) => void;
  onError: (error: string) => void;
  onBack: () => void;
  orderId: string;
  amount: number;
}

export function MpesaForm({ onSuccess, onError, onBack, orderId, amount }: MpesaFormProps) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [transactionStatus, setTransactionStatus] = useState<'idle' | 'pending' | 'success' | 'failed'>('idle');
  const [transactionId, setTransactionId] = useState<string | null>(null);

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digit characters
    const digits = value.replace(/\D/g, '');
    
    // Format based on input
    if (digits.startsWith('254') && digits.length === 12) {
      return digits;
    } else if (digits.startsWith('0') && digits.length === 10) {
      return '254' + digits.slice(1);
    } else if (digits.startsWith('7') && digits.length === 9) {
      return '254' + digits;
    } else {
      return digits;
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhoneNumber(formatted);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phoneNumber || phoneNumber.length !== 12) {
      onError('Please enter a valid phone number (e.g., 0712345678)');
      return;
    }

    setIsLoading(true);
    setTransactionStatus('pending');

    try {
      const response = await fetch('/api/payments/mpesa/initiate/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify({
          phone_number: phoneNumber,
          order: orderId,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setTransactionId(data.transaction_id);
        
        // Poll for transaction status (simplified version)
        pollTransactionStatus(data.transaction_id);
      } else {
        setTransactionStatus('failed');
        onError(data.error || 'Failed to initiate M-Pesa payment');
      }
    } catch (error) {
      setTransactionStatus('failed');
      onError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const pollTransactionStatus = async (transId: string) => {
    const maxAttempts = 30; // 2.5 minutes at 5-second intervals
    let attempts = 0;

    const checkStatus = async () => {
      try {
        const response = await fetch(`/api/payments/mpesa/transactions/${transId}/status/`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          },
        });

        if (response.ok) {
          const transaction = await response.json();
          
          if (transaction.status === 'successful') {
            setTransactionStatus('success');
            onSuccess(transaction);
            return true;
          } else if (transaction.status === 'failed') {
            setTransactionStatus('failed');
            onError(transaction.result_description || 'Payment failed');
            return true;
          }
        }
      } catch (error) {
        console.error('Error checking transaction status:', error);
      }

      attempts++;
      return attempts >= maxAttempts;
    };

    const poll = async () => {
      const shouldStop = await checkStatus();
      if (!shouldStop) {
        setTimeout(poll, 5000); // Check every 5 seconds
      }
    };

    poll();
  };

  const renderContent = () => {
    switch (transactionStatus) {
      case 'pending':
        return (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <div style={{
              width: '80px',
              height: '80px',
              backgroundColor: '#fef3c7',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem',
            }}>
              <Phone size={32} color="#d97706" />
            </div>
            
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#374151', marginBottom: '1rem' }}>
              Check Your Phone
            </h3>
            
            <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
              We've sent an M-Pesa prompt to <strong>{phoneNumber}</strong>. 
              Please enter your M-Pesa PIN to complete the payment.
            </p>
            
            <div style={{
              backgroundColor: '#f8fafc',
              padding: '1rem',
              borderRadius: '0.5rem',
              border: '1px solid #e2e8f0',
            }}>
              <p style={{ fontSize: '0.875rem', color: '#475569', textAlign: 'left' }}>
                <strong>Amount:</strong> KSh {amount.toLocaleString()}<br />
                <strong>Paybill:</strong> 123456 (Test)<br />
                <strong>Account:</strong> ORDER{orderId.slice(-8)}
              </p>
            </div>
            
            <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '1.5rem' }}>
              Waiting for payment confirmation...
            </p>
          </div>
        );

      case 'success':
        return (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <div style={{
              width: '80px',
              height: '80px',
              backgroundColor: '#dcfce7',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem',
            }}>
              <CheckCircle size={32} color="#16a34a" />
            </div>
            
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#374151', marginBottom: '1rem' }}>
              Payment Successful!
            </h3>
            
            <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
              Your M-Pesa payment has been processed successfully.
            </p>
          </div>
        );

      case 'failed':
        return (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <div style={{
              width: '80px',
              height: '80px',
              backgroundColor: '#fee2e2',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem',
            }}>
              <XCircle size={32} color="#dc2626" />
            </div>
            
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#374151', marginBottom: '1rem' }}>
              Payment Failed
            </h3>
            
            <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
              We couldn't process your M-Pesa payment. Please try again.
            </p>
            
            <Button
              onClick={() => setTransactionStatus('idle')}
              variant="primary"
            >
              Try Again
            </Button>
          </div>
        );

      default:
        return (
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                M-Pesa Phone Number
              </label>
              <Input
                type="tel"
                value={phoneNumber}
                onChange={handlePhoneChange}
                placeholder="0712 345 678"
                required
                style={{ textAlign: 'left' }}
              />
              <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.5rem' }}>
                Enter your M-Pesa registered phone number
              </p>
            </div>

            <div style={{
              backgroundColor: '#f0f9ff',
              padding: '1rem',
              borderRadius: '0.5rem',
              border: '1px solid #bae6fd',
              marginBottom: '2rem',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <Shield size={16} color="#0284c7" />
                <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#0369a1' }}>
                  How M-Pesa Payment Works
                </span>
              </div>
              <ol style={{ fontSize: '0.75rem', color: '#0369a1', lineHeight: '1.4', paddingLeft: '1rem' }}>
                <li>Enter your M-Pesa registered phone number</li>
                <li>We'll send an STK push to your phone</li>
                <li>Enter your M-Pesa PIN when prompted</li>
                <li>Payment will be processed automatically</li>
              </ol>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <Button
                type="button"
                variant="outline"
                onClick={onBack}
                style={{ flex: 1 }}
                disabled={isLoading}
              >
                Back
              </Button>
              <Button
                type="submit"
                variant="primary"
                style={{ flex: 1 }}
                disabled={isLoading || !phoneNumber}
              >
                {isLoading ? 'Processing...' : `Pay KSh ${amount.toLocaleString()}`}
              </Button>
            </div>
          </form>
        );
    }
  };

  return (
    <div>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', marginBottom: '1.5rem' }}>
        M-Pesa Payment
      </h2>
      {renderContent()}
    </div>
  );
}