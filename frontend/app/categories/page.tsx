'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Search, Grid, List, ShoppingBag, Shirt, Watch, Gem, Glasses, Crown, Heart } from 'lucide-react';

// Type guard functions
const isString = (value: any): value is string => typeof value === 'string';

// Complete categories array with real image URLs
const categories = [
  {
    id: 'clothing',
    name: 'Clothing',
    description: 'Latest fashion trends and styles for every occasion',
    image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&h=300&fit=crop',
    icon: Shirt,
    count: 45,
    featured: true
  },
  {
    id: 'accessories',
    name: 'Accessories',
    description: 'Complete your look with stylish accessories',
    image: 'https://images.unsplash.com/photo-1594223274512-ad4803739b7c?w=400&h=300&fit=crop',
    icon: Watch,
    count: 23,
    featured: true
  },
  {
    id: 'shoes',
    name: 'Shoes',
    description: 'Step out in confidence with our footwear collection',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=300&fit=crop',
    icon: ShoppingBag,
    count: 18,
    featured: true
  },
  {
    id: 'bags',
    name: 'Bags',
    description: 'Carry your essentials in style and comfort',
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&h=300&fit=crop',
    icon: ShoppingBag,
    count: 12
  },
  {
    id: 'jewelry',
    name: 'Jewelry',
    description: 'Sparkling pieces for every special occasion',
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&h=300&fit=crop',
    icon: Gem,
    count: 8
  },
  {
    id: 'watches',
    name: 'Watches',
    description: 'Timeless elegance on your wrist',
    image: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=400&h=300&fit=crop',
    icon: Watch,
    count: 15
  },
  {
    id: 'eyewear',
    name: 'Eyewear',
    description: 'See the world in style with our sunglasses',
    image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&h=300&fit=crop',
    icon: Glasses,
    count: 10
  },
  {
    id: 'premium',
    name: 'Premium Collection',
    description: 'Exclusive luxury items for the discerning customer',
    image: '/images/premium-wedding.jpg',
    icon: Crown,
    count: 6,
    featured: true
  },
  {
    id: 'sale',
    name: 'Sale Items',
    description: 'Great deals on selected fashion items',
    image: '/images/summer-dress.jpg',
    icon: Heart,
    count: 25
  },
  {
    id: 'new-arrivals',
    name: 'New Arrivals',
    description: 'Fresh styles just added to our collection',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop',
    icon: ShoppingBag,
    count: 32
  }
];

export default function CategoriesPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCategoryClick = (categoryId: string) => {
    router.push(`/products?category=${categoryId}`);
  };

  // Helper function to get image URL safely
  const getImageUrl = (image: any): string => {
    if (isString(image)) return image;
    return '/images/placeholder-category.jpg';
  };

  // Handle image loading errors
  const handleImageError = (categoryId: string) => {
    setImageErrors(prev => ({
      ...prev,
      [categoryId]: true
    }));
  };

  // Get fallback image URL or placeholder
  const getCategoryImage = (category: any) => {
    if (imageErrors[category.id]) {
      return '/images/placeholder-category.jpg';
    }
    return getImageUrl(category.image);
  };

  return (
    <div style={{ backgroundColor: '#f9fafb', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ 
        backgroundColor: 'white', 
        borderBottom: '1px solid #e5e7eb',
        padding: '2rem 0'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <Link 
                href="/"
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem',
                  color: '#6b7280',
                  textDecoration: 'none'
                }}
              >
                <ArrowLeft size={20} />
                Back to Home
              </Link>
              <div>
                <h1 style={{ 
                  fontSize: '2.25rem', 
                  fontWeight: 'bold', 
                  color: '#111827',
                  marginBottom: '0.5rem'
                }}>
                  All Categories
                </h1>
                <p style={{ color: '#6b7280' }}>
                  Browse our complete collection of fashion categories
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
        {/* Search and View Toggle */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '2rem',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div style={{ 
            position: 'relative',
            flex: '1',
            maxWidth: '400px'
          }}>
            <Search 
              size={20} 
              style={{ 
                position: 'absolute', 
                left: '1rem', 
                top: '50%', 
                transform: 'translateY(-50%)',
                color: '#9ca3af'
              }} 
            />
            <input
              type="text"
              placeholder="Search categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                padding: '0.75rem 1rem 0.75rem 3rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
                width: '100%',
                outline: 'none',
                backgroundColor: 'white'
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => setViewMode('grid')}
              style={{
                padding: '0.5rem',
                border: `1px solid ${viewMode === 'grid' ? '#0284c7' : '#d1d5db'}`,
                borderRadius: '0.375rem',
                backgroundColor: viewMode === 'grid' ? '#0284c7' : 'white',
                color: viewMode === 'grid' ? 'white' : '#374151',
                cursor: 'pointer'
              }}
            >
              <Grid size={16} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              style={{
                padding: '0.5rem',
                border: `1px solid ${viewMode === 'list' ? '#0284c7' : '#d1d5db'}`,
                borderRadius: '0.375rem',
                backgroundColor: viewMode === 'list' ? '#0284c7' : 'white',
                color: viewMode === 'list' ? 'white' : '#374151',
                cursor: 'pointer'
              }}
            >
              <List size={16} />
            </button>
          </div>
        </div>

        {/* Categories Grid */}
        <div className={`categories-container ${viewMode}`}>
          {filteredCategories.map((category) => {
            const IconComponent = category.icon;
            return (
              <div
                key={category.id}
                className="category-card-full"
                onClick={() => handleCategoryClick(category.id)}
              >
                <div className="category-image-container">
                  <img
                    src={getCategoryImage(category)}
                    alt={category.name}
                    onError={() => handleImageError(category.id)}
                    className="category-image-full"
                  />
                  {/* Fallback if image fails to load */}
                  {imageErrors[category.id] && (
                    <div className="category-image-fallback">
                      <IconComponent size={32} color="#9ca3af" />
                    </div>
                  )}
                </div>
                <div className="category-content-full">
                  <div className="category-header">
                    <div className="category-icon-full">
                      <IconComponent size={24} color="#0284c7" />
                    </div>
                    <h3 className="category-name-full">{category.name}</h3>
                  </div>
                  <p className="category-description-full">{category.description}</p>
                  <div className="category-footer">
                    <span className="category-count-full">{category.count} products</span>
                    {category.featured && (
                      <span className="featured-badge">Featured</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredCategories.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '4rem 2rem',
            backgroundColor: 'white',
            borderRadius: '0.75rem',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{ 
              width: '4rem', 
              height: '4rem', 
              backgroundColor: '#f3f4f6',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem'
            }}>
              <Search size={24} color="#6b7280" />
            </div>
            <h3 style={{ 
              fontSize: '1.25rem', 
              fontWeight: '600', 
              color: '#374151',
              marginBottom: '0.5rem'
            }}>
              No categories found
            </h3>
            <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
              {searchQuery ? `No categories match your search for "${searchQuery}"` : 'No categories available'}
            </p>
            <button
              onClick={() => setSearchQuery('')}
              style={{
                padding: '0.5rem 1rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                backgroundColor: 'white',
                color: '#374151',
                cursor: 'pointer'
              }}
            >
              Clear Search
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        .categories-container.grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.5rem;
        }

        .categories-container.list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .category-card-full {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 0.75rem;
          overflow: hidden;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .category-card-full:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
        }

        .categories-container.list .category-card-full {
          display: flex;
          height: 120px;
        }

        .category-image-container {
          position: relative;
          height: 200px;
          overflow: hidden;
          background-color: #f3f4f6;
        }

        .categories-container.list .category-image-container {
          height: 100%;
          width: 120px;
          flex-shrink: 0;
        }

        .category-image-full {
          width: 100%;
          height: 150%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }

        .category-card-full:hover .category-image-full {
          transform: scale(1.05);
        }

        .category-image-fallback {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #f3f4f6;
        }

        .category-content-full {
          padding: 1.5rem;
        }

        .categories-container.list .category-content-full {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .category-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 0.5rem;
        }

        .category-icon-full {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          background-color: #f0f9ff;
          border-radius: 0.5rem;
        }

        .category-name-full {
          font-size: 1.125rem;
          font-weight: 600;
          color: #111827;
          margin: 0;
        }

        .category-description-full {
          color: #6b7280;
          font-size: 0.875rem;
          margin-bottom: 1rem;
        }

        .categories-container.list .category-description-full {
          margin-bottom: 0;
        }

        .category-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .category-count-full {
          font-size: 0.875rem;
          color: #6b7280;
        }

        .featured-badge {
          padding: 0.25rem 0.5rem;
          background-color: #fef3c7;
          color: #92400e;
          font-size: 0.75rem;
          font-weight: 500;
          border-radius: 0.375rem;
        }

        @media (max-width: 768px) {
          .categories-container.grid {
            grid-template-columns: 1fr;
          }
          
          .categories-container.list .category-card-full {
            height: auto;
            flex-direction: column;
          }
          
          .categories-container.list .category-image-container {
            width: 100%;
            height: 150px;
          }
        }
      `}</style>
    </div>
  );

}




