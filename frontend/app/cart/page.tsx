'use client';

import React from 'react';
import Link from 'next/link';
import { useCart } from '@/providers/CartProvider';
import { Button } from '@/components/ui/Button';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';

export default function CartPage() {
  const { state: cartState, dispatch } = useCart();

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity < 1) {
      dispatch({ type: 'REMOVE_ITEM', payload: id });
    } else {
      dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });
    }
  };

  const removeItem = (id: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: id });
  };

  if (cartState.items.length === 0) {
    return (
      <div style={{
        maxWidth: '600px',
        margin: '0 auto',
        padding: '4rem 1rem',
        textAlign: 'center',
      }}>
        <ShoppingBag size={64} color="#9ca3af" style={{ margin: '0 auto 1rem' }} />
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#374151', marginBottom: '1rem' }}>
          Your cart is empty
        </h2>
        <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
          Add some items to your cart to get started.
        </p>
        <Link href="/products">
          <Button variant="primary" size="lg">
            Continue Shopping
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#111827', marginBottom: '2rem' }}>
        Shopping Cart ({cartState.itemCount} items)
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '3rem' }}>
        {/* Cart Items */}
        <div>
          {cartState.items.map((item) => (
            <div
              key={item.id}
              style={{
                display: 'flex',
                gap: '1rem',
                padding: '1.5rem',
                backgroundColor: 'white',
                borderRadius: '0.5rem',
                boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
                marginBottom: '1rem',
              }}
            >
              <img
                src={item.image}
                alt={item.name}
                style={{
                  width: '100px',
                  height: '100px',
                  objectFit: 'cover',
                  borderRadius: '0.375rem',
                }}
              />

              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
                  {item.name}
                </h3>
                {item.size && (
                  <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                    Size: {item.size}
                  </p>
                )}
                {item.color && (
                  <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                    Color: {item.color}
                  </p>
                )}
                <p style={{ fontSize: '1.125rem', fontWeight: '600', color: '#111827' }}>
                  ${item.price}
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '1rem' }}>
                <button
                  onClick={() => removeItem(item.id)}
                  style={{
                    padding: '0.5rem',
                    color: '#ef4444',
                    border: 'none',
                    backgroundColor: 'transparent',
                    cursor: 'pointer',
                    borderRadius: '0.375rem',
                  }}
                >
                  <Trash2 size={20} />
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    style={{
                      width: '2rem',
                      height: '2rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1px solid #d1d5db',
                      backgroundColor: 'transparent',
                      borderRadius: '0.375rem',
                      cursor: 'pointer',
                    }}
                  >
                    <Minus size={16} />
                  </button>
                  <span style={{ minWidth: '2rem', textAlign: 'center', fontWeight: '600' }}>
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    style={{
                      width: '2rem',
                      height: '2rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1px solid #d1d5db',
                      backgroundColor: 'transparent',
                      borderRadius: '0.375rem',
                      cursor: 'pointer',
                    }}
                  >
                    <Plus size={16} />
                  </button>
                </div>

                <p style={{ fontSize: '1.125rem', fontWeight: '600', color: '#111827' }}>
                  ${(item.price * item.quantity).toFixed(2)}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div style={{
          backgroundColor: 'white',
          padding: '1.5rem',
          borderRadius: '0.5rem',
          boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
          height: 'fit-content',
          position: 'sticky',
          top: '2rem',
        }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#111827', marginBottom: '1.5rem' }}>
            Order Summary
          </h3>

          <div style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: '1rem', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ color: '#6b7280' }}>Subtotal</span>
              <span>${cartState.total.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ color: '#6b7280' }}>Shipping</span>
              <span>$9.99</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#6b7280' }}>Tax</span>
              <span>${(cartState.total * 0.08).toFixed(2)}</span>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <span style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#111827' }}>Total</span>
            <span style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#111827' }}>
              ${(cartState.total + 9.99 + cartState.total * 0.08).toFixed(2)}
            </span>
          </div>

          <Link href="/checkout">
            <Button variant="primary" size="lg" style={{ width: '100%', marginBottom: '1rem' }}>
              Proceed to Checkout
            </Button>
          </Link>

          <Link href="/products">
            <Button variant="outline" style={{ width: '100%' }}>
              Continue Shopping
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}