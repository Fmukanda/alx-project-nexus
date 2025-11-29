'use client';

import React from 'react';
import Link from 'next/link';
import { Product } from '@/types';
import { Button } from '@/components/ui/Button';
import { useCart } from '@/providers/CartProvider';
import { Heart, ShoppingBag, Eye } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
  onAddToWishlist?: (productId: string) => void;
  showQuickView?: boolean;
  onQuickView?: (product: Product) => void;
  viewMode: 'grid' | 'list';
}

export function ProductCard({ 
  product, 
  onAddToCart, 
  onAddToWishlist, 
  showQuickView = false,
  onQuickView 
}: ProductCardProps) {
  const { dispatch } = useCart();
  const [imageLoaded, setImageLoaded] = React.useState(false);
  const [isWishlisted, setIsWishlisted] = React.useState(false);
  
  /*const handleAddToCart = () => {
    if (onAddToCart) {
      onAddToCart(product);
    } else {
      dispatch({
        type: 'ADD_ITEM',
        payload: {
          id: product.id,
          product_id: product.id,
          product_name: product.name,
          price: product.onSale ? product.salePrice! : product.price,
          quantity: 1,
          image_url: getPrimaryImageUrl(),
        },
      });
    }
  };*/

  const handleAddToWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
    onAddToWishlist?.(product.id);
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onQuickView?.(product);
  };

  // Helper function to get image URL - handles both string and object formats
  const getPrimaryImageUrl = () => {
    if (!product.images || product.images.length === 0) {
      return '/images/placeholder-product.jpg';
    }
    
    // If images are strings (URLs)
    if (typeof product.images[0] === 'string') {
      return product.images[0] as string;
    }
    
    // If images are objects
    const imageObj = product.images[0] as any;
    return imageObj.image || imageObj.url || '/images/placeholder-product.jpg';
  };

  // Helper function to get all image URLs for gallery
  const getAllImageUrls = () => {
    if (!product.images || product.images.length === 0) {
      return ['/images/placeholder-product.jpg'];
    }
    
    // If images are strings
    /*if (typeof product.images[0] === 'string') {
      return product.images as string[];
    }*/
    
    // If images are objects
    return (product.images as any[]).map(img => 
      img.image || img.url || '/images/placeholder-product.jpg'
    );
  };

  const primaryImageUrl = getPrimaryImageUrl();

  return (
    <div
      style={{
        backgroundColor: 'white',
        borderRadius: '0.75rem',
        boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        position: 'relative',
      }}
      className="product-card"
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-8px)';
        e.currentTarget.style.boxShadow = '0 20px 40px -5px rgb(0 0 0 / 0.1)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 1px 3px 0 rgb(0 0 0 / 0.1)';
      }}
    >
      {/* Product Badges */}
      <div style={{
        position: 'absolute',
        top: '0.75rem',
        left: '0.75rem',
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
      }}>
        {product.onSale && (
          <div style={{
            backgroundColor: '#ef4444',
            color: 'white',
            padding: '0.25rem 0.5rem',
            borderRadius: '0.375rem',
            fontSize: '0.75rem',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}>
            Sale
          </div>
        )}
        {!product.isActive && (
          <div style={{
            backgroundColor: '#6b7280',
            color: 'white',
            padding: '0.25rem 0.5rem',
            borderRadius: '0.375rem',
            fontSize: '0.75rem',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}>
            Out of Stock
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div style={{
        position: 'absolute',
        top: '0.75rem',
        right: '0.75rem',
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        opacity: 0,
        transition: 'opacity 0.3s ease',
      }}
      className="product-actions"
      >
        <button
          onClick={handleAddToWishlist}
          style={{
            width: '2.5rem',
            height: '2.5rem',
            backgroundColor: 'white',
            border: 'none',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgb(0 0 0 / 0.1)',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#fef2f2';
            e.currentTarget.style.transform = 'scale(1.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'white';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          <Heart 
            size={18} 
            color={isWishlisted ? '#ef4444' : '#374151'}
            fill={isWishlisted ? '#ef4444' : 'none'}
          />
        </button>

        {showQuickView && (
          <button
            onClick={handleQuickView}
            style={{
              width: '2.5rem',
              height: '2.5rem',
              backgroundColor: 'white',
              border: 'none',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgb(0 0 0 / 0.1)',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f0f9ff';
              e.currentTarget.style.transform = 'scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'white';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <Eye size={18} color="#374151" />
          </button>
        )}
      </div>

      {/* Product Image */}
      <Link href={`/products/${product.slug || product.id}`}>
        <div style={{
          position: 'relative',
          paddingBottom: '125%',
          backgroundColor: '#f8fafc',
          overflow: 'hidden',
        }}>
          <img
            src={primaryImageUrl}
            alt={product.name}
            onLoad={() => setImageLoaded(true)}
            onError={(e) => {
              // If image fails to load, use placeholder
              e.currentTarget.src = '/images/placeholder-product.jpg';
              setImageLoaded(true);
            }}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transition: 'transform 0.3s ease',
              opacity: imageLoaded ? 1 : 0,
            }}
            className="product-image"
          />
          
          {/* Loading Skeleton */}
          {!imageLoaded && (
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundColor: '#e5e7eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <ShoppingBag size={32} color="#9ca3af" />
            </div>
          )}
        </div>
      </Link>

      {/* Product Info */}
      <div style={{ padding: '1.25rem' }}>
        <div style={{ marginBottom: '0.75rem' }}>
          <Link 
            href={`/products/${product.slug || product.id}`}
            style={{ textDecoration: 'none' }}
          >
            <h3 style={{
              fontSize: '1rem',
              fontWeight: '600',
              color: '#111827',
              marginBottom: '0.25rem',
              lineHeight: '1.4',
              transition: 'color 0.2s ease',
            }}
            className="product-title"
            >
              {product.name}
            </h3>
          </Link>
          
          <p style={{
            color: '#6b7280',
            fontSize: '0.875rem',
            marginBottom: '0.5rem',
          }}>
            {product.brand}
          </p>
        </div>

        {/* Rating */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          marginBottom: '1rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.125rem' }}>
            {[...Array(5)].map((_, i) => (
              <span
                key={i}
                style={{
                  color: i < Math.floor(product.rating || 0) ? '#f59e0b' : '#e5e7eb',
                  fontSize: '0.875rem',
                }}
              >
                ★
              </span>
            ))}
          </div>
          <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
            ({product.reviewCount || 0})
          </span>
        </div>

        {/* Price */}
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
                  fontWeight: '700',
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
                fontWeight: '700',
                color: '#111827',
              }}>
                ${product.price}
              </span>
            )}
          </div>

          {product.variants && product.variants.length > 0 && (
            <div style={{
              fontSize: '0.75rem',
              color: '#6b7280',
            }}>
              {product.variants.length} variants
            </div>
          )}
        </div>

        {/* Add to Cart Button */}
        <Button
          variant="primary"
          //onClick={handleAddToCart}
          style={{ width: '100%' }}
          disabled={!product.isActive}
          icon={<ShoppingBag size={16} />}
        >
          {!product.isActive ? 'Out of Stock' : 'Add to Cart'}
        </Button>
      </div>

      <style jsx>{`
        .product-card:hover .product-actions {
          opacity: 1;
        }
        .product-card:hover .product-image {
          transform: scale(1.05);
        }
        .product-card:hover .product-title {
          color: #0284c7;
        }
      `}</style>
    </div>
  );
}