'use client';

import React from 'react';
import Link from 'next/link';
import { ProductCard } from '@/components/products/ProductCard';
import { ProductFilters } from '@/components/products/ProductFilters';
import { ProductGallery } from '@/components/products/ProductGallery';
import { ProductReviews } from '@/components/products/ProductReviews';
import { ProductVariants } from '@/components/products/ProductVariants';
import CategorySection from "./categories/page";
import { useProducts } from '@/hooks/useProducts';
import { useCart } from '@/providers/CartProvider';
import { useWishlist } from '@/providers/WishlistProvider';
import { useToast } from '@/providers/ToastProvider';
import { Button } from '@/components/ui/Button';
import { 
  ArrowRight, 
  Truck, 
  Shield, 
  HeartHandshake, 
  Smartphone, 
  CreditCard, 
  Globe,
  Star,
  TrendingUp,
  Users,
  ShoppingBag,
  Grid,
  List
} from 'lucide-react';
import { useState } from 'react';

export default function HomePage() {
  const { products, loading, error } = useProducts({ featured: true, page_size: 8 });
  const { addToCart } = useCart();
  const { addToWishlist, isInWishlist } = useWishlist();
  const { success: showToast } = useToast();
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Mock product for demonstration (you would typically get this from your API)
  const featuredProduct = products[0] || {
    id: 1,
    name: 'Premium Fashion Item',
    price: 99.99,
    salePrice: 79.99,
    onSale: true,
    description: 'A premium fashion item showcasing the best of our collection.',
    images: [
      { image: '/images/placeholder-product.jpg', alt: 'Product image' }
    ],
    category: 'featured',
    rating: 4.5,
    reviewCount: 24,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Black', 'White', 'Navy'],
    inStock: true
  };

  const handleAddToCart = (product: any) => {
    addToCart({
      name: product.name,
      price: product.onSale ? product.salePrice! : product.price,
      quantity: 1,
      image: product.images[0]?.image || '/images/placeholder-product.jpg',
      product_id: product.id,
      size: product.size,
      color: product.color,
    });
    showToast('Added to Cart', `${product.name} has been added to your cart.`);
  };

  const handleAddToWishlist = (product: any) => {
    addToWishlist(product);
    showToast('Added to Wishlist', `${product.name} has been added to your wishlist.`);
  };

  const features = [
    {
      icon: Truck,
      title: 'Free Shipping',
      description: 'Free delivery on orders over $50',
      color: '#3b82f6',
      stats: '2-3 days',
    },
    {
      icon: Shield,
      title: 'Secure Payment',
      description: '100% secure payment processing',
      color: '#16a34a',
      stats: '256-bit SSL',
    },
    {
      icon: HeartHandshake,
      title: 'Easy Returns',
      description: '30-day return policy',
      color: '#d97706',
      stats: 'No questions asked',
    },
    {
      icon: Smartphone,
      title: 'M-Pesa Payments',
      description: 'Pay with mobile money in Kenya',
      color: '#7c3aed',
      stats: 'Instant confirmation',
    },
    {
      icon: CreditCard,
      title: 'Multiple Payment Options',
      description: 'Credit cards, PayPal, and more',
      color: '#dc2626',
      stats: '6+ methods',
    },
    {
      icon: Globe,
      title: 'Worldwide Shipping',
      description: 'We ship to over 50 countries',
      color: '#0891b2',
      stats: 'Global delivery',
    },
  ];

  const stats = [
    { icon: Users, label: 'Happy Customers', value: '10,000+' },
    { icon: ShoppingBag, label: 'Products Sold', value: '50,000+' },
    { icon: Star, label: 'Customer Rating', value: '4.8/5' },
    { icon: TrendingUp, label: 'Annual Growth', value: '200%' },
  ];

  return (
    <div>
      {/* Hero Section */}
      <section style={{
        backgroundColor: '#0f172a',
        color: 'white',
        padding: '6rem 1rem',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{ 
          maxWidth: '800px', 
          margin: '0 auto',
          position: 'relative',
          zIndex: 10,
        }}>
          <h1 style={{
            fontSize: 'clamp(2.5rem, 5vw, 3.5rem)',
            fontWeight: 'bold',
            marginBottom: '1.5rem',
            background: 'linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            lineHeight: '1.2',
          }}>
            Discover Your Style
          </h1>
          <p style={{
            fontSize: 'clamp(1rem, 2vw, 1.25rem)',
            color: '#cbd5e1',
            marginBottom: '2.5rem',
            lineHeight: '1.6',
          }}>
            Explore our curated collection of premium fashion. From everyday essentials to statement pieces, 
            find exactly what you're looking for with multiple payment options including M-Pesa.
          </p>
          <div style={{ 
            display: 'flex', 
            gap: '1rem', 
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}>
            <Link href="/products">
              <Button variant="primary" size="lg">
                Shop Now
                <ArrowRight size={20} style={{ marginLeft: '0.5rem' }} />
              </Button>
            </Link>
            <Link href="/categories">
              <Button variant="outline" size="lg" style={{ 
                color: 'white', 
                borderColor: 'white',
                backgroundColor: 'transparent',
              }}>
                Browse Categories
              </Button>
            </Link>
          </div>
        </div>
        
        {/* Background pattern */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%)',
          zIndex: 1,
        }} />
      </section>

      {/* Category Section */}
      <CategorySection />

      {/* Stats Section */}
      <section style={{ 
        padding: '4rem 1rem', 
        backgroundColor: 'white',
        borderBottom: '1px solid #e5e7eb',
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '2rem',
            textAlign: 'center',
          }}>
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.75rem',
                    marginBottom: '0.5rem',
                  }}>
                    <Icon size={32} color="#0284c7" />
                    <div style={{ textAlign: 'left' }}>
                      <div style={{
                        fontSize: '1.5rem',
                        fontWeight: 'bold',
                        color: '#111827',
                      }}>
                        {stat.value}
                      </div>
                      <div style={{
                        fontSize: '0.875rem',
                        color: '#6b7280',
                      }}>
                        {stat.label}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section style={{ padding: '6rem 1rem', backgroundColor: '#f8fafc' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 style={{ 
              fontSize: 'clamp(2rem, 4vw, 2.5rem)', 
              fontWeight: 'bold', 
              color: '#111827',
              marginBottom: '1rem',
            }}>
              Why Shop With Us
            </h2>
            <p style={{ 
              fontSize: '1.125rem', 
              color: '#6b7280',
              maxWidth: '600px',
              margin: '0 auto',
            }}>
              We provide the best shopping experience with multiple payment options, 
              fast shipping, and excellent customer service.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem',
          }}>
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div 
                  key={index}
                  style={{
                    backgroundColor: 'white',
                    padding: '2rem',
                    borderRadius: '1rem',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    textAlign: 'center',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    border: `1px solid #e5e7eb`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 20px 25px -5px rgb(0 0 0 / 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 6px -1px rgb(0 0 0 / 0.1)';
                  }}
                >
                  <div style={{
                    width: '5rem',
                    height: '5rem',
                    backgroundColor: `${feature.color}20`,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1.5rem',
                    border: `2px solid ${feature.color}40`,
                  }}>
                    <Icon size={32} color={feature.color} />
                  </div>
                  <h3 style={{ 
                    fontSize: '1.25rem', 
                    fontWeight: '600', 
                    color: '#374151',
                    marginBottom: '0.5rem',
                  }}>
                    {feature.title}
                  </h3>
                  <p style={{ 
                    color: '#6b7280',
                    lineHeight: '1.6',
                    marginBottom: '1rem',
                  }}>
                    {feature.description}
                  </p>
                  <div style={{
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: feature.color,
                    padding: '0.5rem 1rem',
                    backgroundColor: `${feature.color}10`,
                    borderRadius: '2rem',
                    display: 'inline-block',
                  }}>
                    {feature.stats}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Product Showcase Section */}
      <section style={{ padding: '6rem 1rem', backgroundColor: 'white' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 style={{ 
              fontSize: 'clamp(2rem, 4vw, 2.5rem)', 
              fontWeight: 'bold', 
              color: '#111827',
              marginBottom: '1rem',
            }}>
              Featured Product Showcase
            </h2>
            <p style={{ 
              fontSize: '1.125rem', 
              color: '#6b7280',
              maxWidth: '600px',
              margin: '0 auto',
            }}>
              Experience our products with detailed views, variants, and customer reviews
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '4rem',
            alignItems: 'start',
          }}>
            {/* Product Gallery */}
            <div>
              <ProductGallery 
                images={featuredProduct.images}
                productName={featuredProduct.name}
              />
            </div>

            {/* Product Details */}
            <div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
                {featuredProduct.name}
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star 
                      key={star}
                      size={20} 
                      fill={star <= Math.floor(featuredProduct.rating) ? '#fbbf24' : 'none'}
                      color="#fbbf24"
                    />
                  ))}
                  <span style={{ marginLeft: '0.5rem', color: '#6b7280' }}>
                    ({featuredProduct.reviewCount} reviews)
                  </span>
                </div>
              </div>

              <div style={{ marginBottom: '2rem' }}>
                <span style={{ 
                  fontSize: '1.5rem', 
                  fontWeight: 'bold', 
                  color: featuredProduct.onSale ? '#dc2626' : '#111827',
                  marginRight: featuredProduct.onSale ? '0.5rem' : '0'
                }}>
                  ${featuredProduct.onSale ? featuredProduct.salePrice : featuredProduct.price}
                </span>
                {featuredProduct.onSale && (
                  <span style={{ 
                    fontSize: '1.125rem', 
                    color: '#6b7280', 
                    textDecoration: 'line-through' 
                  }}>
                    ${featuredProduct.price}
                  </span>
                )}
              </div>

              <p style={{ color: '#6b7280', marginBottom: '2rem', lineHeight: '1.6' }}>
                {featuredProduct.description}
              </p>

              {/* Product Variants */}
              <ProductVariants
                variants={[
                  {
                    id: '1',
                    size: 'S',
                    color: 'Black',
                    sku: 'FS-S-BLK',
                    stockQuantity: 15,
                    isActive: true
                  },
                  {
                    id: '2',
                    size: 'M',
                    color: 'Black',
                    sku: 'FS-M-BLK',
                    stockQuantity: 8,
                    isActive: true
                  },
                  {
                    id: '3',
                    size: 'L',
                    color: 'Black',
                    sku: 'FS-L-BLK',
                    stockQuantity: 0,
                    isActive: true
                  },
                  {
                    id: '4',
                    size: 'XL',
                    color: 'Black',
                    sku: 'FS-XL-BLK',
                    stockQuantity: 12,
                    isActive: true
                  },
                  {
                    id: '5',
                    size: 'S',
                    color: 'White',
                    sku: 'FS-S-WHT',
                    stockQuantity: 20,
                    isActive: true
                  },
                  {
                    id: '6',
                    size: 'M',
                    color: 'White',
                    sku: 'FS-M-WHT',
                    stockQuantity: 3,
                    isActive: true
                  },
                  {
                    id: '7',
                    size: 'L',
                    color: 'White',
                    sku: 'FS-L-WHT',
                    stockQuantity: 18,
                    isActive: true
                  },
                  {
                    id: '8',
                    size: 'S',
                    color: 'Navy',
                    sku: 'FS-S-NVY',
                    stockQuantity: 7,
                    isActive: true
                  },
                  {
                    id: '9',
                    size: 'M',
                    color: 'Navy',
                    sku: 'FS-M-NVY',
                    stockQuantity: 14,
                    isActive: true
                  },
                  {
                    id: '10',
                    size: 'L',
                    color: 'Navy',
                    sku: 'FS-L-NVY',
                    stockQuantity: 22,
                    isActive: true
                  }
                ]}
                onVariantSelect={(variant) => console.log('Variant selected:', variant)}
              />

              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <Button 
                  variant="primary" 
                  size="lg"
                  onClick={() => handleAddToCart(featuredProduct)}
                >
                  Add to Cart
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={() => handleAddToWishlist(featuredProduct)}
                >
                  Add to Wishlist
                </Button>
              </div>
            </div>
          </div>

          {/* Product Reviews */}
          <div style={{ marginTop: '4rem' }}>
            <ProductReviews
              productId={featuredProduct.id}
              onAddReview={(review) => console.log('New review:', review)}
            />
          </div>
        </div>
      </section>

      {/* Featured Products with Filters */}
      <section style={{ padding: '6rem 1rem', backgroundColor: '#f8fafc' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '3rem',
            flexWrap: 'wrap',
            gap: '1rem',
          }}>
            <div>
              <h2 style={{ 
                fontSize: 'clamp(2rem, 4vw, 2.5rem)', 
                fontWeight: 'bold', 
                color: '#111827',
                marginBottom: '0.5rem',
              }}>
                Featured Products
              </h2>
              <p style={{ color: '#6b7280' }}>
                Handpicked items from our latest collection
              </p>
            </div>
            
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              {/* View Mode Toggle */}
              <div style={{ display: 'flex', gap: '0.5rem', marginRight: '1rem' }}>
                <Button
                  variant={viewMode === 'grid' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid size={16} />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List size={16} />
                </Button>
              </div>
              
              <Link href="/products">
                <Button variant="outline">
                  View All Products
                  <ArrowRight size={16} style={{ marginLeft: '0.5rem' }} />
                </Button>
              </Link>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '2rem' }}>
            {/* Product Filters */}
            <div>
              <ProductFilters
                categories={[
                  { id: 'all', name: 'All Categories', count: products.length },
                  { id: 'clothing', name: 'Clothing', count: 12 },
                  { id: 'accessories', name: 'Accessories', count: 8 },
                  { id: 'shoes', name: 'Shoes', count: 6 }
                ]}
                onFilterChange={(filters) => {
                  console.log('Filters changed:', filters);
                }}
              />
            </div>

            {/* Products Grid */}
            <div>
              {error && (
                <div style={{
                  textAlign: 'center',
                  padding: '3rem',
                  backgroundColor: '#fef2f2',
                  borderRadius: '0.75rem',
                  border: '1px solid #fecaca',
                }}>
                  <p style={{ color: '#dc2626', marginBottom: '1rem' }}>
                    Failed to load products. Please try again.
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => window.location.reload()}
                  >
                    Retry
                  </Button>
                </div>
              )}

              {loading ? (
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(280px, 1fr))' : '1fr',
                  gap: '2rem' 
                }}>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                    <div
                      key={i}
                      style={{
                        backgroundColor: '#f3f4f6',
                        borderRadius: '0.75rem',
                        height: viewMode === 'grid' ? '400px' : '200px',
                        animation: 'pulse 2s infinite',
                      }}
                    />
                  ))}
                </div>
              ) : (
                // MANUAL GRID IMPLEMENTATION
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(280px, 1fr))' : '1fr',
                  gap: '2rem',
                }}>
                  {products.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onAddToCart={handleAddToCart}
                      onAddToWishlist={handleAddToWishlist}
                      showQuickView={true}
                      viewMode={viewMode}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Payment Methods Section */}
      <section style={{ 
        padding: '6rem 1rem', 
        backgroundColor: '#1f2937',
        color: 'white',
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ 
            fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', 
            fontWeight: 'bold', 
            marginBottom: '1rem',
          }}>
            Multiple Payment Options
          </h2>
          <p style={{ 
            fontSize: '1.125rem', 
            color: '#d1d5db',
            marginBottom: '3rem',
            maxWidth: '600px',
            margin: '0 auto',
          }}>
            We support various payment methods to make your shopping experience convenient
          </p>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '3rem',
            maxWidth: '800px',
            margin: '0 auto',
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '5rem',
                height: '5rem',
                backgroundColor: '#10b981',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem',
                transition: 'transform 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
              >
                <Smartphone size={28} color="white" />
              </div>
              <h3 style={{ fontWeight: '600', marginBottom: '0.5rem' }}>M-Pesa</h3>
              <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>
                Fast and secure mobile payments
              </p>
            </div>
            
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '5rem',
                height: '5rem',
                backgroundColor: '#3b82f6',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem',
                transition: 'transform 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
              >
                <CreditCard size={28} color="white" />
              </div>
              <h3 style={{ fontWeight: '600', marginBottom: '0.5rem' }}>Credit Cards</h3>
              <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>
                Visa, MasterCard & American Express
              </p>
            </div>
            
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '5rem',
                height: '5rem',
                backgroundColor: '#0070ba',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem',
                transition: 'transform 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
              >
                <Globe size={28} color="white" />
              </div>
              <h3 style={{ fontWeight: '600', marginBottom: '0.5rem' }}>PayPal</h3>
              <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>
                Secure online payments worldwide
              </p>
            </div>
          </div>

          <div style={{ marginTop: '4rem', padding: '2rem', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '1rem' }}>
            <p style={{ fontSize: '1rem', color: '#d1d5db', marginBottom: '0' }}>
              <strong>New:</strong> Now accepting cryptocurrency payments (Bitcoin, Ethereum) for selected items.
            </p>
          </div>
        </div>
      </section>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}