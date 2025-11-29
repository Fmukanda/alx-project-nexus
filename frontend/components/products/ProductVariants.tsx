'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { AlertCircle, Check } from 'lucide-react';

interface ProductVariant {
  id: string;
  size: string;
  color: string;
  sku: string;
  stockQuantity: number;
  isActive: boolean;
}

interface ProductVariantsProps {
  variants: ProductVariant[];
  onVariantSelect?: (variant: ProductVariant) => void;
  selectedVariant?: ProductVariant | null;
}

export function ProductVariants({ variants, onVariantSelect, selectedVariant }: ProductVariantsProps) {
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');

  // Extract unique sizes and colors
  const sizes = Array.from(new Set(variants.map(v => v.size))).sort();
  const colors = Array.from(new Set(variants.map(v => v.color))).sort();

  // Filter variants based on selections
  const availableVariants = variants.filter(variant => {
    const sizeMatch = !selectedSize || variant.size === selectedSize;
    const colorMatch = !selectedColor || variant.color === selectedColor;
    return sizeMatch && colorMatch && variant.isActive;
  });

  // Get available options for the other dimension when one is selected
  const availableSizes = selectedColor 
    ? Array.from(new Set(availableVariants.map(v => v.size))).sort()
    : sizes;

  const availableColors = selectedSize
    ? Array.from(new Set(availableVariants.map(v => v.color))).sort()
    : colors;

  // Find the currently selected variant
  const currentVariant = selectedVariant || availableVariants.find(variant => 
    variant.size === selectedSize && variant.color === selectedColor
  );

  const handleSizeSelect = (size: string) => {
    setSelectedSize(size);
    const newVariant = availableVariants.find(v => v.size === size && v.color === selectedColor) ||
                      availableVariants.find(v => v.size === size);
    if (newVariant) {
      setSelectedColor(newVariant.color);
      onVariantSelect?.(newVariant);
    }
  };

  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
    const newVariant = availableVariants.find(v => v.color === color && v.size === selectedSize) ||
                      availableVariants.find(v => v.color === color);
    if (newVariant) {
      setSelectedSize(newVariant.size);
      onVariantSelect?.(newVariant);
    }
  };

  const getVariantStockStatus = (variant: ProductVariant) => {
    if (!variant.isActive) return 'out-of-stock';
    if (variant.stockQuantity === 0) return 'out-of-stock';
    if (variant.stockQuantity < 10) return 'low-stock';
    return 'in-stock';
  };

  const getStockText = (variant: ProductVariant) => {
    const status = getVariantStockStatus(variant);
    switch (status) {
      case 'out-of-stock':
        return 'Out of Stock';
      case 'low-stock':
        return `Only ${variant.stockQuantity} left`;
      default:
        return 'In Stock';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Size Selection */}
      {sizes.length > 0 && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <label style={{ fontSize: '1rem', fontWeight: '600', color: '#374151' }}>
              Size
            </label>
            {selectedSize && (
              <span style={{ fontSize: '0.875rem', color: '#0284c7', fontWeight: '500' }}>
                Selected: {selectedSize}
              </span>
            )}
          </div>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {sizes.map((size) => {
              const isAvailable = availableSizes.includes(size);
              const isSelected = selectedSize === size;
              const variantForSize = variants.find(v => v.size === size && v.color === selectedColor) ||
                                   variants.find(v => v.size === size);

              return (
                <button
                  key={size}
                  onClick={() => isAvailable && handleSizeSelect(size)}
                  disabled={!isAvailable}
                  style={{
                    padding: '0.75rem 1rem',
                    border: `2px solid ${
                      isSelected ? '#0284c7' : 
                      !isAvailable ? '#e5e7eb' : '#d1d5db'
                    }`,
                    backgroundColor: isSelected ? '#0284c7' : 'transparent',
                    color: isSelected ? 'white' : !isAvailable ? '#9ca3af' : '#374151',
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    cursor: isAvailable ? 'pointer' : 'not-allowed',
                    transition: 'all 0.2s ease',
                    position: 'relative',
                    minWidth: '3.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  onMouseEnter={(e) => {
                    if (isAvailable && !isSelected) {
                      e.currentTarget.style.borderColor = '#0284c7';
                      e.currentTarget.style.color = '#0284c7';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (isAvailable && !isSelected) {
                      e.currentTarget.style.borderColor = '#d1d5db';
                      e.currentTarget.style.color = '#374151';
                    }
                  }}
                >
                  {size}
                  {isSelected && (
                    <Check 
                      size={16} 
                      style={{ 
                        position: 'absolute',
                        top: '-0.25rem',
                        right: '-0.25rem',
                        backgroundColor: '#0284c7',
                        color: 'white',
                        borderRadius: '50%',
                        padding: '0.125rem',
                      }} 
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Color Selection */}
      {colors.length > 0 && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <label style={{ fontSize: '1rem', fontWeight: '600', color: '#374151' }}>
              Color
            </label>
            {selectedColor && (
              <span style={{ fontSize: '0.875rem', color: '#0284c7', fontWeight: '500' }}>
                Selected: {selectedColor}
              </span>
            )}
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
            {colors.map((color) => {
              const isAvailable = availableColors.includes(color);
              const isSelected = selectedColor === color;
              const variantForColor = variants.find(v => v.color === color && v.size === selectedSize) ||
                                    variants.find(v => v.color === color);

              return (
                <button
                  key={color}
                  onClick={() => isAvailable && handleColorSelect(color)}
                  disabled={!isAvailable}
                  style={{
                    padding: '0.75rem 1.25rem',
                    border: `2px solid ${
                      isSelected ? '#0284c7' : 
                      !isAvailable ? '#e5e7eb' : '#d1d5db'
                    }`,
                    backgroundColor: isSelected ? '#0284c7' : 'transparent',
                    color: isSelected ? 'white' : !isAvailable ? '#9ca3af' : '#374151',
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    cursor: isAvailable ? 'pointer' : 'not-allowed',
                    transition: 'all 0.2s ease',
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                  onMouseEnter={(e) => {
                    if (isAvailable && !isSelected) {
                      e.currentTarget.style.borderColor = '#0284c7';
                      e.currentTarget.style.color = '#0284c7';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (isAvailable && !isSelected) {
                      e.currentTarget.style.borderColor = '#d1d5db';
                      e.currentTarget.style.color = '#374151';
                    }
                  }}
                >
                  <div
                    style={{
                      width: '1rem',
                      height: '1rem',
                      borderRadius: '50%',
                      backgroundColor: color.toLowerCase(),
                      border: color.toLowerCase() === 'white' ? '1px solid #d1d5db' : 'none',
                    }}
                  />
                  {color}
                  {isSelected && (
                    <Check 
                      size={16} 
                      style={{ 
                        position: 'absolute',
                        top: '-0.25rem',
                        right: '-0.25rem',
                        backgroundColor: '#0284c7',
                        color: 'white',
                        borderRadius: '50%',
                        padding: '0.125rem',
                      }} 
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Selected Variant Info */}
      {currentVariant && (
        <div style={{
          padding: '1rem',
          backgroundColor: '#f0f9ff',
          borderRadius: '0.5rem',
          border: '1px solid #bae6fd',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <Check size={16} color="#0284c7" />
            <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#0369a1' }}>
              Variant Selected
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ fontSize: '0.875rem', color: '#374151', marginBottom: '0.25rem' }}>
                {selectedSize && `${selectedSize}`}{selectedSize && selectedColor && ' • '}{selectedColor && `${selectedColor}`}
              </p>
              <p style={{ fontSize: '0.75rem', color: getVariantStockStatus(currentVariant) === 'out-of-stock' ? '#ef4444' : '#059669' }}>
                {getStockText(currentVariant)}
              </p>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
              SKU: {currentVariant.sku}
            </div>
          </div>
        </div>
      )}

      {/* Out of Stock Warning */}
      {selectedSize && selectedColor && currentVariant && getVariantStockStatus(currentVariant) === 'out-of-stock' && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '1rem',
          backgroundColor: '#fef2f2',
          borderRadius: '0.5rem',
          border: '1px solid #fecaca',
        }}>
          <AlertCircle size={16} color="#dc2626" />
          <span style={{ fontSize: '0.875rem', color: '#dc2626' }}>
            This variant is currently out of stock
          </span>
        </div>
      )}

      {/* Size Guide */}
      <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '1rem' }}>
        <details style={{ cursor: 'pointer' }}>
          <summary style={{ fontSize: '0.875rem', fontWeight: '500', color: '#0284c7', listStyle: 'none' }}>
            Size Guide
          </summary>
          <div style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#6b7280' }}>
            <p>Our sizes follow standard measurements. If you're between sizes, we recommend sizing up for a more comfortable fit.</p>
            {/* Add size chart table here if needed */}
          </div>
        </details>
      </div>
    </div>
  );
}