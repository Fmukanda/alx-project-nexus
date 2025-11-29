'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { CheckCircle, Package, Mail } from 'lucide-react';

interface OrderConfirmationProps {
  onOrderComplete: () => void;
}

export function OrderConfirmation({ onOrderComplete }: OrderConfirmationProps) {
  React.useEffect(() => {
    onOrderComplete();
  }, [onOrderComplete]);

  return (
    <div style={{
      maxWidth: '600px',
      margin: '0 auto',
      textAlign: 'center',
      padding: '3rem 1rem',
    }}>
      <div style={{
        width: '5rem',
        height: '5rem',
        backgroundColor: '#10b981',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 2rem',
      }}>
        <CheckCircle size={48} color="white" />
      </div>

      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#111827', marginBottom: '1rem' }}>
        Order Confirmed!
      </h1>
      
      <p style={{ fontSize: '1.125rem', color: '#6b7280', marginBottom: '2rem' }}>
        Thank you for your purchase. Your order has been confirmed and will be shipped soon.
      </p>

      <div style={{
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '0.5rem',
        boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
        marginBottom: '2rem',
        textAlign: 'left',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
          <Package size={20} style={{ marginRight: '0.5rem', color: '#0284c7' }} />
          <span style={{ fontWeight: '600', color: '#374151' }}>Order #ORD-789123</span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem' }}>
          <Mail size={20} style={{ marginRight: '0.5rem', color: '#0284c7' }} />
          <span style={{ color: '#6b7280' }}>Confirmation email sent to your@email.com</span>
        </div>

        <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ color: '#6b7280' }}>Estimated Delivery</span>
            <span style={{ fontWeight: '500' }}>January 22, 2024</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#6b7280' }}>Shipping Address</span>
            <span style={{ fontWeight: '500', textAlign: 'right' }}>
              123 Main St<br />
              New York, NY 10001
            </span>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
        <Link href="/products">
          <Button variant="outline" size="lg">
            Continue Shopping
          </Button>
        </Link>
        <Link href="/orders">
          <Button variant="primary" size="lg">
            View Order Details
          </Button>
        </Link>
      </div>
    </div>
  );
}