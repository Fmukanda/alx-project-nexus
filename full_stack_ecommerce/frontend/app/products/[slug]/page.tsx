'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { useCart } from '@/providers/CartProvider';
import { useWishlist } from '@/providers/WishlistProvider';
import { Button } from '@/components/ui/Button';
import { ProductReviews } from '@/components/products/ProductReviews';
import { Heart, Share2, Truck, Shield, RotateCcw } from 'lucide-react';

export default function ProductPage() {
  const params = useParams();
  const { dispatch: cartDispatch } = useCart();
  const { state: wishlistState, dispatch: wishlistDispatch } = useWishlist();
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);

  // Mock product data - in real app, fetch from API
  const product = {
    id: '1',
    slug: params.slug as string,
    name: 'Premium Cotton T-Shirt',
    description: 'Our premium cotton t-shirt offers exceptional comfort and durability. Made from 100% organic cotton, it features a classic fit that\'s perfect for everyday wear.',
    price: 29.99,
    salePrice: 24.99,
    onSale: true,
    images: [
      '/images/product-1-1.jpg',
      '/images/product-1-2.jpg',
      '/images/product-1-3.jpg',
    ],
    variants: [
      { id: '1', size: 'S', color: 'Black', stock: 10 },
      { id: '2', size: 'M', color: 'Black', stock: 5 },
      { id: '3', size: 'L', color: 'Black', stock: 0 },
      { id: '4', size: 'S', color: 'White', stock: 8 },
      { id: '5', size: 'M', color: 'White', stock: 12 },
    ],
    features: [
      '100% Organic Cotton',
      'Machine Washable',
      'Sustainably Sourced',
      'Oeko-Tex Certified',
    ],
    rating: 4.5,
    reviewCount: 128,
  };

  const sizes = [...new Set(product.variants.map(v => v.size))];
  const colors = [...new Set(product.variants.map(v => v.color))];
  
  const isInWishlist = wishlistState.items.some(item => item.id === product.id);

  const addToCart = () => {
    if (!selectedSize || !selectedColor) {
      alert('Please select size and color');
      return;
    }

    cartDispatch({
      type: 'ADD_ITEM',
      payload: {
        id: product.id,
        name: product.name,
        price: product.onSale ? product.salePrice : product.price,
        quantity,
        image: product.images[0],
        size: selectedSize,
        color: selectedColor,
      },
    });
  };

  const toggleWishlist = () => {
    if (isInWishlist) {
      wishlistDispatch({ type: 'REMOVE_ITEM', payload: product.id });
    } else {
      wishlistDispatch({
        type: 'ADD_ITEM',
        payload: {
          id: product.id,
          name: product.name,
          price: product.onSale ? product.salePrice : product.price,
          image: product.images[0],
          slug: product.slug,
        },
      });
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem' }}>
        {/* Product Images */}
        <div>
          <div style={{
            backgroundColor: '#f9fafb',
            borderRadius: '0.5rem',
            padding: '2rem',
            marginBottom: '1rem',
          }}>
            <img
              src={product.images[0]}
              alt={product.name}
              style={{
                width: '100%',
                height: '400px',
                objectFit: 'contain',
              }}
            />
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            {product.images.map((image, index) => (
              <div
                key={index}
                style={{
                  width: '80px',
                  height: '80px',
                  backgroundColor: '#f9fafb',
                  borderRadius: '0.375rem',
                  padding: '0.5rem',
                  cursor: 'pointer',
                  border: '1px solid #e5e7eb',
                }}
              >
                <img
                  src={image}
                  alt={`${product.name} ${index + 1}`}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#111827', marginBottom: '1rem' }}>
            {product.name}
          </h1>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  style={{
                    color: star <= Math.floor(product.rating) ? '#f59e0b' : '#d1d5db',
                  }}
                >
                  ★
                </span>
              ))}
              <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                ({product.reviewCount} reviews)
              </span>
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            {product.onSale ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ef4444' }}>
                  ${product.salePrice}
                </span>
                <span style={{ fontSize: '1.125rem', color: '#9ca3af', textDecoration: 'line-through' }}>
                  ${product.price}
                </span>
                <span style={{
                  backgroundColor: '#ef4444',
                  color: 'white',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '0.25rem',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                }}>
                  SAVE {(((product.price - product.salePrice) / product.price) * 100).toFixed(0)}%
                </span>
              </div>
            ) : (
              <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827' }}>
                ${product.price}
              </span>
            )}
          </div>

          <p style={{ color: '#6b7280', lineHeight: '1.6', marginBottom: '2rem' }}>
            {product.description}
          </p>

          {/* Size Selection */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.5rem' }}>Size</h3>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {sizes.map(size => {
                const variant = product.variants.find(v => v.size === size && v.color === selectedColor);
                const isOutOfStock = variant ? variant.stock === 0 : true;
                
                return (
                  <button
                    key={size}
                    onClick={() => !isOutOfStock && setSelectedSize(size)}
                    disabled={isOutOfStock}
                    style={{
                      padding: '0.75rem 1rem',
                      border: `1px solid ${
                        selectedSize === size ? '#0284c7' : 
                        isOutOfStock ? '#e5e7eb' : '#d1d5db'
                      }`,
                      backgroundColor: selectedSize === size ? '#0284c7' : 'transparent',
                      color: selectedSize === size ? 'white' : 
                            isOutOfStock ? '#9ca3af' : '#374151',
                      borderRadius: '0.375rem',
                      cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                      opacity: isOutOfStock ? 0.5 : 1,
                    }}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Color Selection */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.5rem' }}>Color</h3>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {colors.map(color => {
                const variant = product.variants.find(v => v.color === color && v.size === selectedSize);
                const isOutOfStock = variant ? variant.stock === 0 : true;
                
                return (
                  <button
                    key={color}
                    onClick={() => !isOutOfStock && setSelectedColor(color)}
                    disabled={isOutOfStock}
                    style={{
                      padding: '0.75rem 1rem',
                      border: `1px solid ${
                        selectedColor === color ? '#0284c7' : 
                        isOutOfStock ? '#e5e7eb' : '#d1d5db'
                      }`,
                      backgroundColor: selectedColor === color ? '#0284c7' : 'transparent',
                      color: selectedColor === color ? 'white' : 
                            isOutOfStock ? '#9ca3af' : '#374151',
                      borderRadius: '0.375rem',
                      cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                      opacity: isOutOfStock ? 0.5 : 1,
                    }}
                  >
                    {color}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quantity */}
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.5rem' }}>Quantity</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}>
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  style={{
                    padding: '0.5rem 1rem',
                    border: 'none',
                    backgroundColor: 'transparent',
                    cursor: 'pointer',
                  }}
                >
                  -
                </button>
                <span style={{ padding: '0.5rem 1rem', minWidth: '3rem', textAlign: 'center' }}>
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  style={{
                    padding: '0.5rem 1rem',
                    border: 'none',
                    backgroundColor: 'transparent',
                    cursor: 'pointer',
                  }}
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
            <Button
              variant="primary"
              size="lg"
              onClick={addToCart}
              style={{ flex: 1 }}
            >
              Add to Cart
            </Button>
            <Button
              variant="outline"
              onClick={toggleWishlist}
              style={{ padding: '0.75rem' }}
            >
              <Heart 
                size={20} 
                fill={isInWishlist ? 'currentColor' : 'none'} 
              />
            </Button>
            <Button
              variant="outline"
              style={{ padding: '0.75rem' }}
            >
              <Share2 size={20} />
            </Button>
          </div>

          {/* Features */}
          <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '1.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Truck size={20} color="#0284c7" />
                <span style={{ fontSize: '0.875rem', color: '#374151' }}>
                  Free shipping on orders over $50
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <RotateCcw size={20} color="#0284c7" />
                <span style={{ fontSize: '0.875rem', color: '#374151' }}>
                  30-day return policy
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Shield size={20} color="#0284c7" />
                <span style={{ fontSize: '0.875rem', color: '#374151' }}>
                  2-year warranty
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Product Details Tabs */}
      <div style={{ marginTop: '4rem' }}>
        <div style={{ borderBottom: '1px solid #e5e7eb', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', gap: '2rem' }}>
            <button style={{
              padding: '1rem 0',
              borderBottom: '2px solid #0284c7',
              color: '#0284c7',
              fontWeight: '600',
            }}>
              Description
            </button>
            <button style={{
              padding: '1rem 0',
              borderBottom: '2px solid transparent',
              color: '#6b7280',
              fontWeight: '500',
            }}>
              Features
            </button>
            <button style={{
              padding: '1rem 0',
              borderBottom: '2px solid transparent',
              color: '#6b7280',
              fontWeight: '500',
            }}>
              Shipping & Returns
            </button>
          </div>
        </div>

        <div style={{ marginBottom: '3rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>Product Details</h3>
          <p style={{ color: '#6b7280', lineHeight: '1.6' }}>
            {product.description}
          </p>
          <ul style={{ color: '#6b7280', marginTop: '1rem', paddingLeft: '1.5rem' }}>
            {product.features.map((feature, index) => (
              <li key={index} style={{ marginBottom: '0.5rem' }}>{feature}</li>
            ))}
          </ul>
        </div>

        {/* Reviews Section */}
        <ProductReviews productId={product.id} />
      </div>
    </div>
  );
}