'use client';

import React, { useState } from 'react';
import { Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface ProductFiltersProps {
  onFilterChange: (filters: any) => void;
  categories: any[];
}

export function ProductFilters({ onFilterChange, categories }: ProductFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState({
    category: '',
    priceRange: [0, 500],
    sizes: [] as string[],
    colors: [] as string[],
    brands: [] as string[],
    onSale: false,
    inStock: true,
  });

  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  const colors = ['Black', 'White', 'Red', 'Blue', 'Green', 'Yellow', 'Pink', 'Purple'];
  const brands = ['Nike', 'Adidas', 'Zara', 'H&M', 'Uniqlo', 'Levi\'s'];

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters = {
      category: '',
      priceRange: [0, 500],
      sizes: [],
      colors: [],
      brands: [],
      onSale: false,
      inStock: true,
    };
    setFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  return (
    <div>
      {/* Mobile filter button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <Button
          variant="outline"
          onClick={() => setIsOpen(!isOpen)}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <Filter size={16} />
          Filters
        </Button>
        
        <Button variant="outline" onClick={clearFilters}>
          Clear All
        </Button>
      </div>

      {/* Filter sidebar */}
      <div style={{
        position: isOpen ? 'fixed' : 'relative',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: isOpen ? 'rgba(0,0,0,0.5)' : 'transparent',
        zIndex: 50,
        display: isOpen ? 'block' : 'none',
      }}>
        <div style={{
          position: isOpen ? 'fixed' : 'relative',
          top: 0,
          left: 0,
          width: isOpen ? '300px' : '100%',
          height: '100vh',
          backgroundColor: 'white',
          padding: '1.5rem',
          overflowY: 'auto',
          transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.3s',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600' }}>Filters</h3>
            <button onClick={() => setIsOpen(false)}>
              <X size={20} />
            </button>
          </div>

          {/* Category filter */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.5rem' }}>Category</h4>
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
              }}
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category.id} value={category.slug}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Price range */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.5rem' }}>
              Price: ${filters.priceRange[0]} - ${filters.priceRange[1]}
            </h4>
            <input
              type="range"
              min="0"
              max="500"
              value={filters.priceRange[1]}
              onChange={(e) => handleFilterChange('priceRange', [filters.priceRange[0], parseInt(e.target.value)])}
              style={{ width: '100%' }}
            />
          </div>

          {/* Sizes */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.5rem' }}>Size</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {sizes.map(size => (
                <button
                  key={size}
                  onClick={() => {
                    const newSizes = filters.sizes.includes(size)
                      ? filters.sizes.filter(s => s !== size)
                      : [...filters.sizes, size];
                    handleFilterChange('sizes', newSizes);
                  }}
                  style={{
                    padding: '0.5rem 0.75rem',
                    border: `1px solid ${filters.sizes.includes(size) ? '#0284c7' : '#d1d5db'}`,
                    backgroundColor: filters.sizes.includes(size) ? '#0284c7' : 'transparent',
                    color: filters.sizes.includes(size) ? 'white' : '#374151',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                  }}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Colors */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.5rem' }}>Color</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {colors.map(color => (
                <button
                  key={color}
                  onClick={() => {
                    const newColors = filters.colors.includes(color)
                      ? filters.colors.filter(c => c !== color)
                      : [...filters.colors, color];
                    handleFilterChange('colors', newColors);
                  }}
                  style={{
                    padding: '0.5rem 0.75rem',
                    border: `1px solid ${filters.colors.includes(color) ? '#0284c7' : '#d1d5db'}`,
                    backgroundColor: filters.colors.includes(color) ? '#0284c7' : 'transparent',
                    color: filters.colors.includes(color) ? 'white' : '#374151',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                  }}
                >
                  {color}
                </button>
              ))}
            </div>
          </div>

          {/* Brands */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.5rem' }}>Brand</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {brands.map(brand => (
                <label key={brand} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input
                    type="checkbox"
                    checked={filters.brands.includes(brand)}
                    onChange={(e) => {
                      const newBrands = e.target.checked
                        ? [...filters.brands, brand]
                        : filters.brands.filter(b => b !== brand);
                      handleFilterChange('brands', newBrands);
                    }}
                  />
                  {brand}
                </label>
              ))}
            </div>
          </div>

          {/* Other filters */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <input
                type="checkbox"
                checked={filters.onSale}
                onChange={(e) => handleFilterChange('onSale', e.target.checked)}
              />
              On Sale
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="checkbox"
                checked={filters.inStock}
                onChange={(e) => handleFilterChange('inStock', e.target.checked)}
              />
              In Stock Only
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}