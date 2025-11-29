'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Upload, X, Plus, Trash2 } from 'lucide-react';

interface ProductFormProps {
  product?: any;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  categories: any[];
}

interface Variant {
  size: string;
  color: string;
  sku: string;
  stockQuantity: number;
  isActive: boolean;
}

interface FormData {
  name: string;
  slug: string;
  description: string;
  price: string;
  salePrice: string;
  category: string;
  gender: string;
  brand: string;
  material: string;
  careInstructions: string;
  isActive: boolean;
  images: any[]; // or a more specific type
  variants: Variant[];
}

export function ProductForm({ product, onSubmit, onCancel, categories }: ProductFormProps) {
  const [formData, setFormData] = useState<FormData>({
  name: product?.name || '',
  slug: product?.slug || '',
  description: product?.description || '',
  price: product?.price || '',
  salePrice: product?.salePrice || '',
  category: product?.category?.id || '',
  gender: product?.gender || 'U',
  brand: product?.brand || '',
  material: product?.material || '',
  careInstructions: product?.careInstructions || '',
  isActive: product?.isActive ?? true,
  images: product?.images || [],
  variants: product?.variants || [
    { size: '', color: '', sku: '', stockQuantity: 0, isActive: true }
  ],
  });

  const [newImage, setNewImage] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleVariantChange = (index: number, field: string, value: any) => {
    const updatedVariants = [...formData.variants];
    updatedVariants[index] = { ...updatedVariants[index], [field]: value };
    setFormData(prev => ({ ...prev, variants: updatedVariants }));
  };

  const addVariant = () => {
    setFormData(prev => ({
      ...prev,
      variants: [...prev.variants, { size: '', color: '', sku: '', stockQuantity: 0, isActive: true }]
    }));
  };

  const removeVariant = (index: number) => {
    if (formData.variants.length > 1) {
      const updatedVariants = formData.variants.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, variants: updatedVariants }));
    }
  };

  const addImage = () => {
    if (newImage.trim()) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, { image: newImage, altText: '', isPrimary: prev.images.length === 0 }
      ]}));
      setNewImage('');
    }
  };

  const removeImage = (index: number) => {
    const updatedImages = formData.images.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, images: updatedImages }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Product name is required';
    if (!formData.slug.trim()) newErrors.slug = 'Product slug is required';
    if (!formData.price || Number(formData.price) <= 0) newErrors.price = 'Valid price is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (formData.variants.some(v => !v.size.trim())) newErrors.variants = 'All variants must have a size';
    if (formData.variants.some(v => !v.color.trim())) newErrors.variants = 'All variants must have a color';
    if (formData.variants.some(v => !v.sku.trim())) newErrors.variants = 'All variants must have a SKU';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <div style={{
      backgroundColor: 'white',
      padding: '2rem',
      borderRadius: '0.75rem',
      boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
      border: '1px solid #e5e7eb',
    }}>
      <h2 style={{ 
        fontSize: '1.5rem', 
        fontWeight: 'bold', 
        color: '#111827',
        marginBottom: '2rem',
      }}>
        {product ? 'Edit Product' : 'Add New Product'}
      </h2>

      <form onSubmit={handleSubmit}>
        {/* Basic Information */}
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ 
            fontSize: '1.125rem', 
            fontWeight: '600', 
            color: '#374151',
            marginBottom: '1rem',
            paddingBottom: '0.5rem',
            borderBottom: '1px solid #e5e7eb',
          }}>
            Basic Information
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                Product Name *
              </label>
              <Input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter product name"
                error={errors.name}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                Slug *
              </label>
              <Input
                type="text"
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                placeholder="product-slug"
                error={errors.slug}
              />
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter product description"
              rows={4}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: `1px solid ${errors.description ? '#ef4444' : '#d1d5db'}`,
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
                resize: 'vertical',
                outline: 'none',
                transition: 'all 0.2s',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#0284c7';
                e.target.style.boxShadow = '0 0 0 3px rgb(2 132 199 / 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = errors.description ? '#ef4444' : '#d1d5db';
                e.target.style.boxShadow = 'none';
              }}
            />
            {errors.description && (
              <p style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '0.25rem' }}>
                {errors.description}
              </p>
            )}
          </div>
        </div>

        {/* Pricing & Category */}
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ 
            fontSize: '1.125rem', 
            fontWeight: '600', 
            color: '#374151',
            marginBottom: '1rem',
            paddingBottom: '0.5rem',
            borderBottom: '1px solid #e5e7eb',
          }}>
            Pricing & Category
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                Price *
              </label>
              <Input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="0.00"
                step="0.01"
                min="0"
                error={errors.price}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                Sale Price
              </label>
              <Input
                type="number"
                name="salePrice"
                value={formData.salePrice}
                onChange={handleChange}
                placeholder="0.00"
                step="0.01"
                min="0"
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: `1px solid ${errors.category ? '#ef4444' : '#d1d5db'}`,
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  backgroundColor: 'white',
                  outline: 'none',
                  transition: 'all 0.2s',
                }}
              >
                <option value="">Select category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              {errors.category && (
                <p style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '0.25rem' }}>
                  {errors.category}
                </p>
              )}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                Gender
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  backgroundColor: 'white',
                  outline: 'none',
                }}
              >
                <option value="U">Unisex</option>
                <option value="M">Men</option>
                <option value="W">Women</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                Brand
              </label>
              <Input
                type="text"
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                placeholder="Brand name"
              />
            </div>
          </div>
        </div>

        {/* Product Variants */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3 style={{ 
              fontSize: '1.125rem', 
              fontWeight: '600', 
              color: '#374151',
            }}>
              Product Variants
            </h3>
            <Button
              type="button"
              variant="outline"
              onClick={addVariant}
              icon={<Plus size={16} />}
            >
              Add Variant
            </Button>
          </div>

          {errors.variants && (
            <p style={{ fontSize: '0.75rem', color: '#ef4444', marginBottom: '1rem' }}>
              {errors.variants}
            </p>
          )}

          {formData.variants.map((variant, index) => (
            <div 
              key={index}
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr 1fr auto',
                gap: '1rem',
                alignItems: 'end',
                padding: '1rem',
                backgroundColor: index % 2 === 0 ? '#f9fafb' : 'white',
                borderRadius: '0.5rem',
                marginBottom: '1rem',
              }}
            >
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                  Size *
                </label>
                <Input
                  type="text"
                  value={variant.size}
                  onChange={(e) => handleVariantChange(index, 'size', e.target.value)}
                  placeholder="S, M, L, XL"
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                  Color *
                </label>
                <Input
                  type="text"
                  value={variant.color}
                  onChange={(e) => handleVariantChange(index, 'color', e.target.value)}
                  placeholder="Black, White, Red"
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                  SKU *
                </label>
                <Input
                  type="text"
                  value={variant.sku}
                  onChange={(e) => handleVariantChange(index, 'sku', e.target.value)}
                  placeholder="SKU123"
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                  Stock
                </label>
                <Input
                  type="number"
                  value={variant.stockQuantity}
                  onChange={(e) => handleVariantChange(index, 'stockQuantity', parseInt(e.target.value) || 0)}
                  placeholder="0"
                  min="0"
                />
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => removeVariant(index)}
                disabled={formData.variants.length === 1}
                icon={<Trash2 size={16} />}
              >
                Remove
              </Button>
            </div>
          ))}
        </div>

        {/* Product Images */}
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ 
            fontSize: '1.125rem', 
            fontWeight: '600', 
            color: '#374151',
            marginBottom: '1rem',
            paddingBottom: '0.5rem',
            borderBottom: '1px solid #e5e7eb',
          }}>
            Product Images
          </h3>

          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{ flex: 1 }}>
              <Input
                type="text"
                value={newImage}
                onChange={(e) => setNewImage(e.target.value)}
                placeholder="Enter image URL"
              />
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={addImage}
              icon={<Upload size={16} />}
            >
              Add Image
            </Button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '1rem' }}>
            {formData.images.map((image, index) => (
              <div key={index} style={{ position: 'relative' }}>
                <img
                  src={image.image}
                  alt={image.altText}
                  style={{
                    width: '100%',
                    height: '120px',
                    objectFit: 'cover',
                    borderRadius: '0.5rem',
                    border: '1px solid #e5e7eb',
                  }}
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  style={{
                    position: 'absolute',
                    top: '-0.5rem',
                    right: '-0.5rem',
                    padding: '0.25rem',
                    backgroundColor: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '50%',
                    cursor: 'pointer',
                    width: '24px',
                    height: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Form Actions */}
        <div style={{ 
          display: 'flex', 
          gap: '1rem', 
          justifyContent: 'flex-end',
          paddingTop: '2rem',
          borderTop: '1px solid #e5e7eb',
        }}>
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
          >
            {product ? 'Update Product' : 'Create Product'}
          </Button>
        </div>
      </form>
    </div>
  );
}