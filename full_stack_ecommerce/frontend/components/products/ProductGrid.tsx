// frontend/components/products/ProductGrid.tsx
import React from 'react';
import Link from 'next/link';
import { Product } from '@/types';
import { Button } from '@/components/ui/Button';
import { useCart } from '@/providers/CartProvider';

interface ProductGridProps {
  products: Product[];
}

export function ProductGrid({ products }: ProductGridProps) {
  const { dispatch } = useCart();

  const addToCart = (product: Product) => {
    dispatch({
      type: 'ADD_ITEM',
      payload: {
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        image: product.images[0].image,
      },
    });
  };

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
      gap: '2rem',
      padding: '2rem 0',
    }}>
      {products.map((product) => (
        <div
          key={product.id}
          style={{
            backgroundColor: 'white',
            borderRadius: '0.5rem',
            boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
            overflow: 'hidden',
            transition: 'transform 0.2s, box-shadow 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 10px 25px -3px rgb(0 0 0 / 0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 1px 3px 0 rgb(0 0 0 / 0.1)';
          }}
        >
          <Link href={`/products/${product.id}`}>
            <div style={{
              position: 'relative',
              paddingBottom: '125%',
              backgroundColor: '#f9fafb',
              overflow: 'hidden',
            }}>
              <img
                src={product.images[0].image}
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
              {product.onSale && (
                <div style={{
                  position: 'absolute',
                  top: '0.5rem',
                  left: '0.5rem',
                  backgroundColor: '#ef4444',
                  color: 'white',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '0.25rem',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                }}>
                  SALE
                </div>
              )}
            </div>
          </Link>

          <div style={{ padding: '1rem' }}>
            <Link href={`/products/${product.id}`} style={{ textDecoration: 'none' }}>
              <h3 style={{
                fontSize: '1rem',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '0.5rem',
              }}>
                {product.name}
              </h3>
            </Link>

            <p style={{
              color: '#6b7280',
              fontSize: '0.875rem',
              marginBottom: '1rem',
              lineHeight: '1.4',
            }}>
              {product.description.substring(0, 60)}...
            </p>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1rem',
            }}>
              <div>
                {product.onSale ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{
                      fontSize: '1.125rem',
                      fontWeight: '600',
                      color: '#ef4444',
                    }}>
                      ${product.salePrice}
                    </span>
                    <span style={{
                      fontSize: '0.875rem',
                      color: '#9ca3af',
                      textDecoration: 'line-through',
                    }}>
                      ${product.price}
                    </span>
                  </div>
                ) : (
                  <span style={{
                    fontSize: '1.125rem',
                    fontWeight: '600',
                    color: '#374151',
                  }}>
                    ${product.price}
                  </span>
                )}
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
              }}>
                <span style={{ color: '#f59e0b' }}>★</span>
                <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                  {product.rating}
                </span>
              </div>
            </div>

            <Button
              variant="primary"
              size="sm"
              onClick={() => addToCart(product)}
              style={{ width: '100%' }}
            >
              Add to Cart
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}