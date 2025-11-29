'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';
import { Lock, Truck, Tag, Shield } from 'lucide-react';
import Link from 'next/link';

interface CartSummaryProps {
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  discount?: number;
  couponCode?: string;
  onApplyCoupon?: (code: string) => void;
  onCheckout?: () => void;
  checkoutLabel?: string;
  showCheckoutButton?: boolean;
  isLoading?: boolean;
}

export function CartSummary({
  subtotal,
  shipping,
  tax,
  total,
  discount = 0,
  couponCode,
  onApplyCoupon,
  onCheckout,
  checkoutLabel = "Proceed to Checkout",
  showCheckoutButton = true,
  isLoading = false,
}: CartSummaryProps) {
  const [couponInput, setCouponInput] = React.useState('');

  const handleApplyCoupon = () => {
    if (couponInput.trim() && onApplyCoupon) {
      onApplyCoupon(couponInput.trim());
      setCouponInput('');
    }
  };

  const isFreeShipping = shipping === 0;
  const finalSubtotal = subtotal - discount;

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '0.75rem',
      border: '1px solid #e5e7eb',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: '1.5rem',
        borderBottom: '1px solid #e5e7eb',
        backgroundColor: '#f8fafc',
      }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#111827', marginBottom: '0.5rem' }}>
          Order Summary
        </h3>
        <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
          Review your items and proceed to checkout
        </p>
      </div>

      {/* Pricing Breakdown */}
      <div style={{ padding: '1.5rem' }}>
        {/* Subtotal */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Subtotal</span>
          <span style={{ fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>
            ${subtotal.toFixed(2)}
          </span>
        </div>

        {/* Discount */}
        {discount > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.875rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Tag size={14} />
              Discount{couponCode && ` (${couponCode})`}
            </span>
            <span style={{ fontSize: '0.875rem', fontWeight: '500', color: '#10b981' }}>
              -${discount.toFixed(2)}
            </span>
          </div>
        )}

        {/* Shipping */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <span style={{ fontSize: '0.875rem', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <Truck size={14} />
            Shipping
          </span>
          <span style={{ 
            fontSize: '0.875rem', 
            fontWeight: '500', 
            color: isFreeShipping ? '#10b981' : '#374151' 
          }}>
            {isFreeShipping ? 'FREE' : `$${shipping.toFixed(2)}`}
          </span>
        </div>

        {/* Tax */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Tax</span>
          <span style={{ fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>
            ${tax.toFixed(2)}
          </span>
        </div>

        {/* Divider */}
        <div style={{ height: '1px', backgroundColor: '#e5e7eb', marginBottom: '1.5rem' }} />

        {/* Total */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <span style={{ fontSize: '1.125rem', fontWeight: '600', color: '#111827' }}>Total</span>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#111827' }}>
              ${total.toFixed(2)}
            </div>
            {tax > 0 && (
              <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                Including ${tax.toFixed(2)} in taxes
              </div>
            )}
          </div>
        </div>

        {/* Coupon Code Input */}
        {onApplyCoupon && (
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
              Coupon Code
            </label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value)}
                placeholder="Enter coupon code"
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#0284c7';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#d1d5db';
                }}
              />
              <Button
                variant="outline"
                onClick={handleApplyCoupon}
                disabled={!couponInput.trim()}
              >
                Apply
              </Button>
            </div>
          </div>
        )}

        {/* Checkout Button */}
        {showCheckoutButton && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {onCheckout ? (
              <Button
                variant="primary"
                onClick={onCheckout}
                disabled={isLoading}
                style={{ width: '100%' }}
                icon={<Lock size={18} />}
              >
                {isLoading ? 'Processing...' : checkoutLabel}
              </Button>
            ) : (
              <Link href="/checkout" style={{ textDecoration: 'none', width: '100%' }}>
                <Button
                  variant="primary"
                  style={{ width: '100%' }}
                  icon={<Lock size={18} />}
                >
                  {checkoutLabel}
                </Button>
              </Link>
            )}

            {/* Security Message */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              fontSize: '0.75rem',
              color: '#6b7280',
            }}>
              <Shield size={14} />
              Secure SSL encryption
            </div>
          </div>
        )}

        {/* Additional Benefits */}
        <div style={{
          marginTop: '1.5rem',
          padding: '1rem',
          backgroundColor: '#f0f9ff',
          borderRadius: '0.5rem',
          border: '1px solid #bae6fd',
        }}>
          <h4 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#0369a1', marginBottom: '0.5rem' }}>
            What's Included:
          </h4>
          <ul style={{ fontSize: '0.75rem', color: '#0369a1', paddingLeft: '1rem', lineHeight: '1.5' }}>
            <li>Free returns within 30 days</li>
            <li>1-year warranty on selected items</li>
            <li>Dedicated customer support</li>
            <li>Fast and reliable shipping</li>
          </ul>
        </div>
      </div>
    </div>
  );
}