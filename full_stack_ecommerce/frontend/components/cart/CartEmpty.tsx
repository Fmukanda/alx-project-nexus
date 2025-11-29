'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { ShoppingBag, ArrowRight, Heart, TrendingUp } from 'lucide-react';

interface CartEmptyProps {
  onContinueShopping?: () => void;
  featuredProducts?: any[];
}

export function CartEmpty({ onContinueShopping, featuredProducts }: CartEmptyProps) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '3rem 1rem',
      textAlign: 'center',
    }}>
      {/* Empty Cart Icon */}
      <div style={{
        width: '120px',
        height: '120px',
        backgroundColor: '#f3f4f6',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '2rem',
      }}>
        <ShoppingBag size={48} color="#9ca3af" />
      </div>

      {/* Message */}
      <h2 style={{
        fontSize: '1.875rem',
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: '1rem',
      }}>
        Your cart is empty
      </h2>
      
      <p style={{
        fontSize: '1.125rem',
        color: '#6b7280',
        marginBottom: '2rem',
        maxWidth: '400px',
        lineHeight: '1.6',
      }}>
        Looks like you haven't added any items to your cart yet. Start shopping to discover amazing fashion deals!
      </p>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '3rem' }}>
        {onContinueShopping ? (
          <Button
            variant="primary"
            onClick={onContinueShopping}
            icon={<ArrowRight size={20} />}
          >
            Start Shopping
          </Button>
        ) : (
          <Link href="/products" style={{ textDecoration: 'none' }}>
            <Button
              variant="primary"
              icon={<ArrowRight size={20} />}
            >
              Start Shopping
            </Button>
          </Link>
        )}
        
        <Link href="/wishlist" style={{ textDecoration: 'none' }}>
          <Button
            variant="outline"
            icon={<Heart size={20} />}
          >
            View Wishlist
          </Button>
        </Link>
      </div>

      {/* Featured Products Section */}
      {featuredProducts && featuredProducts.length > 0 && (
        <div style={{
          width: '100%',
          maxWidth: '600px',
          backgroundColor: '#f8fafc',
          borderRadius: '0.75rem',
          padding: '2rem',
          border: '1px solid #e5e7eb',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <TrendingUp size={20} color="#0284c7" />
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#111827' }}>
              Popular Right Now
            </h3>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '1rem',
          }}>
            {featuredProducts.slice(0, 4).map((product) => (
              <Link
                key={product.id}
                href={`/products/${product.slug || product.id}`}
                style={{ textDecoration: 'none' }}
              >
                <div style={{
                  backgroundColor: 'white',
                  borderRadius: '0.5rem',
                  padding: '1rem',
                  border: '1px solid #e5e7eb',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgb(0 0 0 / 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
                >
                  <div style={{
                    position: 'relative',
                    paddingBottom: '100%',
                    backgroundColor: '#f9fafb',
                    borderRadius: '0.375rem',
                    overflow: 'hidden',
                    marginBottom: '0.75rem',
                  }}>
                    <img
                      src={product.images[0]?.image || '/images/placeholder-product.jpg'}
                      alt={product.name}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                  </div>
                  
                  <h4 style={{
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: '0.25rem',
                    lineHeight: '1.4',
                  }}>
                    {product.name}
                  </h4>
                  
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      color: '#111827',
                    }}>
                      ${product.onSale ? product.salePrice : product.price}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <span style={{ color: '#f59e0b', fontSize: '0.75rem' }}>★</span>
                      <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                        {product.rating}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Additional Help */}
      <div style={{
        marginTop: '2rem',
        padding: '1.5rem',
        backgroundColor: '#f0f9ff',
        borderRadius: '0.75rem',
        border: '1px solid #bae6fd',
        maxWidth: '500px',
      }}>
        <h4 style={{
          fontSize: '1rem',
          fontWeight: '600',
          color: '#0369a1',
          marginBottom: '0.5rem',
        }}>
          Need Help Shopping?
        </h4>
        <div style={{ fontSize: '0.875rem', color: '#0369a1', lineHeight: '1.5' }}>
          <p style={{ marginBottom: '0.5rem' }}>
            • Browse our categories to find what you're looking for
          </p>
          <p style={{ marginBottom: '0.5rem' }}>
            • Use filters to narrow down your search
          </p>
          <p>
            • Contact our support team for personalized recommendations
          </p>
        </div>
      </div>
    </div>
  );
}