'use client';

import React from 'react';
import { X, ShoppingBag, ArrowRight, Truck, Shield } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { CartItem } from './CartItem';
import { CartEmpty } from './CartEmpty';
import { CartSummary } from './CartSummary';
import Link from 'next/link';

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  items: any[];
  onUpdateQuantity: (itemId: string, newQuantity: number) => void;
  onRemoveItem: (itemId: string) => void;
  onMoveToWishlist?: (itemId: string) => void;
  onClearCart?: () => void;
  onCheckout?: () => void;
}

export function CartSidebar({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onMoveToWishlist,
  onClearCart,
  onCheckout,
}: CartSidebarProps) {
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = subtotal > 50 ? 0 : 10;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleContinueShopping = () => {
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 40,
            transition: 'opacity 0.3s ease',
          }}
          onClick={handleBackdropClick}
        />
      )}

      {/* Sidebar */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: '100%',
          maxWidth: '400px',
          backgroundColor: 'white',
          boxShadow: '-4px 0 20px rgba(0, 0, 0, 0.1)',
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.3s ease',
          zIndex: 50,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1.5rem',
          borderBottom: '1px solid #e5e7eb',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <ShoppingBag size={24} color="#0284c7" />
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#111827' }}>
              Your Cart
              {totalItems > 0 && (
                <span style={{
                  marginLeft: '0.5rem',
                  backgroundColor: '#0284c7',
                  color: 'white',
                  padding: '0.125rem 0.5rem',
                  borderRadius: '1rem',
                  fontSize: '0.75rem',
                  fontWeight: '500',
                }}>
                  {totalItems} {totalItems === 1 ? 'item' : 'items'}
                </span>
              )}
            </h2>
          </div>

          <button
            onClick={onClose}
            style={{
              padding: '0.5rem',
              border: 'none',
              backgroundColor: 'transparent',
              color: '#6b7280',
              cursor: 'pointer',
              borderRadius: '0.375rem',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f3f4f6';
              e.currentTarget.style.color = '#374151';
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {items.length === 0 ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CartEmpty onContinueShopping={handleContinueShopping} />
            </div>
          ) : (
            <>
              {/* Items List */}
              <div style={{ flex: 1, overflow: 'auto', padding: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {items.map((item) => (
                    <CartItem
                      key={item.id}
                      item={item}
                      onUpdateQuantity={onUpdateQuantity}
                      onRemove={onRemoveItem}
                      onMoveToWishlist={onMoveToWishlist}
                    />
                  ))}
                </div>
              </div>

              {/* Security Badge */}
              <div style={{
                padding: '1rem 1.5rem',
                backgroundColor: '#f0f9ff',
                borderTop: '1px solid #e5e7eb',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Shield size={20} color="#0284c7" />
                  <div>
                    <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#0369a1' }}>
                      Secure Checkout
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#0369a1' }}>
                      Your payment information is encrypted and secure
                    </div>
                  </div>
                </div>
              </div>

              {/* Free Shipping Progress */}
              {subtotal < 50 && (
                <div style={{
                  padding: '1rem 1.5rem',
                  backgroundColor: '#f8fafc',
                  borderTop: '1px solid #e5e7eb',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <Truck size={16} color="#059669" />
                    <span style={{ fontSize: '0.875rem', fontWeight: '500', color: '#059669' }}>
                      Free shipping on orders over $50
                    </span>
                  </div>
                  <div style={{
                    width: '100%',
                    height: '6px',
                    backgroundColor: '#e5e7eb',
                    borderRadius: '3px',
                    overflow: 'hidden',
                  }}>
                    <div
                      style={{
                        width: `${(subtotal / 50) * 100}%`,
                        height: '100%',
                        backgroundColor: '#10b981',
                        transition: 'width 0.3s ease',
                      }}
                    />
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
                    ${(50 - subtotal).toFixed(2)} away from free shipping
                  </div>
                </div>
              )}

              {/* Summary */}
              <div style={{
                padding: '1.5rem',
                borderTop: '1px solid #e5e7eb',
                backgroundColor: '#fafafa',
              }}>
                <CartSummary
                  subtotal={subtotal}
                  shipping={shipping}
                  tax={tax}
                  total={total}
                  onCheckout={onCheckout}
                  checkoutLabel="Continue to Checkout"
                />

                {/* Continue Shopping Link */}
                <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                  <button
                    onClick={handleContinueShopping}
                    style={{
                      border: 'none',
                      backgroundColor: 'transparent',
                      color: '#0284c7',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      margin: '0 auto',
                      transition: 'color 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#0369a1';
                    }}
                  >
                    <ArrowRight size={16} style={{ transform: 'rotate(180deg)' }} />
                    Continue Shopping
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}