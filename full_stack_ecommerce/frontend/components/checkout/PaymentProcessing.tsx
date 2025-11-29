'use client';

import React from 'react';
import { Loader2, Shield, CreditCard } from 'lucide-react';

export function PaymentProcessing() {
  return (
    <div style={{
      minHeight: '60vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      textAlign: 'center',
      padding: '2rem',
    }}>
      <div style={{
        width: '80px',
        height: '80px',
        backgroundColor: '#f0f9ff',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '2rem',
        position: 'relative',
      }}>
        <Loader2 size={32} color="#0284c7" style={{ animation: 'spin 1s linear infinite' }} />
        <Shield 
          size={20} 
          color="#0284c7" 
          style={{ 
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }} 
        />
      </div>

      <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', marginBottom: '1rem' }}>
        Processing Your Payment
      </h2>
      
      <p style={{ color: '#6b7280', marginBottom: '2rem', maxWidth: '400px' }}>
        Please wait while we securely process your payment. Do not refresh the page or close this window.
      </p>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        backgroundColor: '#f8fafc',
        padding: '1rem',
        borderRadius: '0.5rem',
        border: '1px solid #e2e8f0',
      }}>
        <CreditCard size={16} color="#64748b" />
        <span style={{ fontSize: '0.875rem', color: '#475569' }}>
          Your payment is being processed securely
        </span>
      </div>
    </div>
  );
}