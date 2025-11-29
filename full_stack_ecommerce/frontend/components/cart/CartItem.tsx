'use client';

import React, { useState } from 'react';
import { Minus, Plus, Trash2, Heart, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

interface CartItemProps {
  item: {
    id: string;
    product_id: string;
    product_name: string;
    variant_id?: string;
    variant_details?: {
      size?: string;
      color?: string;
    };
    price: number;
    quantity: number;
    image_url: string;
    max_quantity?: number;
    in_stock?: boolean;
  };
  onUpdateQuantity: (itemId: string, newQuantity: number) => void;
  onRemove: (itemId: string) => void;
  onMoveToWishlist?: (itemId: string) => void;
}

export function CartItem({ item, onUpdateQuantity, onRemove, onMoveToWishlist }: CartItemProps) {
  const [isRemoving, setIsRemoving] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleQuantityChange = async (newQuantity: number) => {
    if (newQuantity < 1) return;
    if (item.max_quantity && newQuantity > item.max_quantity) {
      newQuantity = item.max_quantity;
    }

    setIsUpdating(true);
    try {
      await onUpdateQuantity(item.id, newQuantity);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemove = async () => {
    setIsRemoving(true);
    try {
      await onRemove(item.id);
    } finally {
      setIsRemoving(false);
    }
  };

  const handleMoveToWishlist = () => {
    onMoveToWishlist?.(item.id);
  };

  const totalPrice = item.price * item.quantity;
  const isLowStock = item.max_quantity && item.quantity >= item.max_quantity;
  const isOutOfStock = item.in_stock === false;

  return (
    <div style={{
      display: 'flex',
      gap: '1rem',
      padding: '1.5rem',
      backgroundColor: 'white',
      borderRadius: '0.75rem',
      border: '1px solid #e5e7eb',
      transition: 'all 0.2s ease',
      opacity: isRemoving ? 0.7 : 1,
      position: 'relative',
    }}>
      {/* Loading Overlay */}
      {(isRemoving || isUpdating) && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '0.75rem',
          zIndex: 5,
        }}>
          <div style={{
            width: '24px',
            height: '24px',
            border: '2px solid #e5e7eb',
            borderTop: '2px solid #0284c7',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }} />
        </div>
      )}

      {/* Product Image */}
      <Link href={`/products/${item.product_id}`} style={{ flexShrink: 0 }}>
        <div style={{
          width: '100px',
          height: '100px',
          backgroundColor: '#f8fafc',
          borderRadius: '0.5rem',
          overflow: 'hidden',
          position: 'relative',
        }}>
          <img
            src={item.image_url || '/images/placeholder-product.jpg'}
            alt={item.product_name}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        </div>
      </Link>

      {/* Product Details */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <Link 
              href={`/products/${item.product_id}`}
              style={{ textDecoration: 'none' }}
            >
              <h3 style={{
                fontSize: '1rem',
                fontWeight: '600',
                color: '#111827',
                marginBottom: '0.25rem',
                lineHeight: '1.4',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                {item.product_name}
              </h3>
            </Link>

            {/* Variant Details */}
            {item.variant_details && (item.variant_details.size || item.variant_details.color) && (
              <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.5rem' }}>
                {item.variant_details.size && (
                  <span style={{
                    fontSize: '0.875rem',
                    color: '#6b7280',
                  }}>
                    Size: {item.variant_details.size}
                  </span>
                )}
                {item.variant_details.color && (
                  <span style={{
                    fontSize: '0.875rem',
                    color: '#6b7280',
                  }}>
                    Color: {item.variant_details.color}
                  </span>
                )}
              </div>
            )}

            {/* Stock Status */}
            {isOutOfStock && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                color: '#ef4444',
                fontSize: '0.875rem',
                marginBottom: '0.5rem',
              }}>
                <AlertCircle size={14} />
                Out of stock
              </div>
            )}
            {isLowStock && !isOutOfStock && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                color: '#f59e0b',
                fontSize: '0.875rem',
                marginBottom: '0.5rem',
              }}>
                <AlertCircle size={14} />
                Only {item.max_quantity} left
              </div>
            )}
          </div>

          {/* Price */}
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{
              fontSize: '1.125rem',
              fontWeight: '700',
              color: '#111827',
              marginBottom: '0.25rem',
            }}>
              ${item.price.toFixed(2)}
            </div>
            <div style={{
              fontSize: '0.875rem',
              color: '#6b7280',
            }}>
              ${totalPrice.toFixed(2)} total
            </div>
          </div>
        </div>

        {/* Quantity Controls and Actions */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Quantity Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              border: '1px solid #d1d5db',
              borderRadius: '0.5rem',
              overflow: 'hidden',
            }}>
              <button
                onClick={() => handleQuantityChange(item.quantity - 1)}
                disabled={item.quantity <= 1 || isRemoving || isUpdating}
                style={{
                  padding: '0.5rem 0.75rem',
                  border: 'none',
                  backgroundColor: '#f9fafb',
                  color: item.quantity <= 1 ? '#9ca3af' : '#374151',
                  cursor: item.quantity <= 1 ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  if (item.quantity > 1) {
                    e.currentTarget.style.backgroundColor = '#f3f4f6';
                  }
                }}
                onMouseLeave={(e) => {
                  if (item.quantity > 1) {
                    e.currentTarget.style.backgroundColor = '#f9fafb';
                  }
                }}
              >
                <Minus size={16} />
              </button>

              <span style={{
                padding: '0.5rem 1rem',
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#374151',
                minWidth: '3rem',
                textAlign: 'center',
                backgroundColor: 'white',
              }}>
                {item.quantity}
              </span>

              <button
                onClick={() => handleQuantityChange(item.quantity + 1)}
                disabled={isLowStock || isOutOfStock || isRemoving || isUpdating}
                style={{
                  padding: '0.5rem 0.75rem',
                  border: 'none',
                  backgroundColor: '#f9fafb',
                  color: (isLowStock || isOutOfStock) ? '#9ca3af' : '#374151',
                  cursor: (isLowStock || isOutOfStock) ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  if (!isLowStock && !isOutOfStock) {
                    e.currentTarget.style.backgroundColor = '#f3f4f6';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isLowStock && !isOutOfStock) {
                    e.currentTarget.style.backgroundColor = '#f9fafb';
                  }
                }}
              >
                <Plus size={16} />
              </button>
            </div>

            {/* Move to Wishlist */}
            {onMoveToWishlist && (
              <button
                onClick={handleMoveToWishlist}
                disabled={isRemoving || isUpdating}
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
                  e.currentTarget.style.backgroundColor = '#fef2f2';
                  e.currentTarget.style.color = '#ef4444';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#6b7280';
                }}
              >
                <Heart size={18} />
              </button>
            )}
          </div>

          {/* Remove Button */}
          <button
            onClick={handleRemove}
            disabled={isRemoving || isUpdating}
            style={{
              padding: '0.5rem 0.75rem',
              border: 'none',
              backgroundColor: 'transparent',
              color: '#ef4444',
              cursor: 'pointer',
              borderRadius: '0.375rem',
              fontSize: '0.875rem',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#fef2f2';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <Trash2 size={16} />
            Remove
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}