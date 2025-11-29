'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '@/providers/CartProvider';
import { useAuth } from '@/providers/AuthProvider';
import { useWishlist } from '@/providers/WishlistProvider';
import { Button } from '@/components/ui/Button';
import { 
  Search, 
  ShoppingBag, 
  User, 
  Menu, 
  X, 
  Heart, 
  LogOut, 
  ChevronDown,
  ChevronRight 
} from 'lucide-react';

interface NavigationProps {
  onMenuToggle?: () => void;
}

export function Navigation({ onMenuToggle }: NavigationProps) {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const pathname = usePathname();
  const { state: cartState } = useCart();
  const { state: authState, logout } = useAuth();
  const { state: wishlistState } = useWishlist();
  const userMenuRef = useRef<HTMLDivElement>(null);
  const categoryMenuRef = useRef<HTMLDivElement>(null);

  // Updated categories data to match the FashionStore structure
  const categories = [
    {
      name: "Clothing",
      href: '/products?category=clothing',
      subcategories: [
        { name: "Men's Clothing", href: '/products?category=clothing&subcategory=mens' },
        { name: "Women's Clothing", href: '/products?category=clothing&subcategory=womens' },
        { name: "Kids' Clothing", href: '/products?category=clothing&subcategory=kids' },
      ],
    },
    {
      name: "Accessories",
      href: '/products?category=accessories',
      subcategories: [
        { name: 'Bags', href: '/products?category=accessories&subcategory=bags' },
        { name: 'Jewelry', href: '/products?category=accessories&subcategory=jewelry' },
        { name: 'Watches', href: '/products?category=accessories&subcategory=watches' },
      ],
    },
    {
      name: "Shoes",
      href: '/products?category=shoes',
      subcategories: [
        { name: "Men's Shoes", href: '/products?category=shoes&subcategory=mens' },
        { name: "Women's Shoes", href: '/products?category=shoes&subcategory=womens' },
        { name: "Kids' Shoes", href: '/products?category=shoes&subcategory=kids' },
      ],
    },
    {
      name: "Premium Collection",
      href: '/products?category=premium',
      subcategories: [
        { name: 'Luxury Items', href: '/products?category=premium&subcategory=luxury' },
        { name: 'Limited Edition', href: '/products?category=premium&subcategory=limited' },
      ],
    },
  ];

  // Close menus when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
      if (categoryMenuRef.current && !categoryMenuRef.current.contains(event.target as Node)) {
        setIsCategoryMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/products?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setIsUserMenuOpen(false);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const isActiveLink = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  return (
    <nav style={{
      backgroundColor: 'white',
      borderBottom: '1px solid #e5e7eb',
    }}>
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '0 1rem',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '3.5rem',
        }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            <Link href="/" style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              color: '#0284c7',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
            }}>
              FashionStore
            </Link>

            {/* Desktop Navigation Links */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '1.5rem',
              height: '100%',
            }}>
              <Link 
                href="/products" 
                style={{
                  color: isActiveLink('/products') ? '#0284c7' : '#374151',
                  textDecoration: 'none',
                  fontWeight: isActiveLink('/products') ? '600' : '500',
                  padding: '1rem 0',
                  borderBottom: isActiveLink('/products') ? '2px solid #0284c7' : 'none',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  if (!isActiveLink('/products')) {
                    e.currentTarget.style.color = '#0284c7';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActiveLink('/products')) {
                    e.currentTarget.style.color = '#374151';
                  }
                }}
              >
                All Products
              </Link>

              {/* Categories Dropdown */}
              <div ref={categoryMenuRef} style={{ position: 'relative', height: '100%' }}>
                <button
                  onClick={() => setIsCategoryMenuOpen(!isCategoryMenuOpen)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '1rem 0',
                    border: 'none',
                    backgroundColor: 'transparent',
                    color: isCategoryMenuOpen ? '#0284c7' : '#374151',
                    cursor: 'pointer',
                    fontWeight: isCategoryMenuOpen ? '600' : '500',
                    height: '100%',
                    borderBottom: isCategoryMenuOpen ? '2px solid #0284c7' : 'none',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={() => {
                    if (!isCategoryMenuOpen) {
                      setIsCategoryMenuOpen(true);
                    }
                  }}
                >
                  Categories
                  <ChevronDown size={16} style={{
                    transform: isCategoryMenuOpen ? 'rotate(180deg)' : 'none',
                    transition: 'transform 0.2s ease',
                  }} />
                </button>

                {isCategoryMenuOpen && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '0.375rem',
                      boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                      minWidth: '200px',
                      zIndex: 50,
                      padding: '0.5rem 0',
                    }}
                    onMouseLeave={() => setIsCategoryMenuOpen(false)}
                  >
                    {categories.map((category) => (
                      <div key={category.name} style={{ position: 'relative' }}>
                        <Link
                          href={category.href}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '0.75rem 1rem',
                            color: '#374151',
                            textDecoration: 'none',
                            fontSize: '0.875rem',
                            transition: 'background-color 0.2s ease',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#f9fafb';
                          }}
                        >
                          <span>{category.name}</span>
                          <ChevronRight size={16} style={{ color: '#9ca3af' }} />
                        </Link>

                        {/* Subcategories */}
                        <div
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: '100%',
                            backgroundColor: 'white',
                            border: '1px solid #e5e7eb',
                            borderRadius: '0.375rem',
                            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                            minWidth: '200px',
                            opacity: 0,
                            pointerEvents: 'none',
                            transition: 'opacity 0.2s ease',
                          }}
                        >
                          {category.subcategories.map((subcategory) => (
                            <Link
                              key={subcategory.name}
                              href={subcategory.href}
                              style={{
                                display: 'block',
                                padding: '0.75rem 1rem',
                                color: '#374151',
                                textDecoration: 'none',
                                fontSize: '0.875rem',
                                transition: 'background-color 0.2s ease',
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#f9fafb';
                              }}
                            >
                              {subcategory.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                    ))}
                    
                    {/* View All Categories Link */}
                    <div style={{ borderTop: '1px solid #e5e7eb', margin: '0.5rem 0' }}></div>
                    <Link
                      href="/categories"
                      style={{
                        display: 'block',
                        padding: '0.75rem 1rem',
                        color: '#0284c7',
                        textDecoration: 'none',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        transition: 'background-color 0.2s ease',
                      }}
                      onClick={() => setIsCategoryMenuOpen(false)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#f0f9ff';
                      }}
                    >
                      View All Categories
                    </Link>
                  </div>
                )}
              </div>

              <Link 
                href="/sale" 
                style={{
                  color: '#ef4444',
                  textDecoration: 'none',
                  fontWeight: '600',
                  padding: '1rem 0',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  transition: 'color 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#dc2626';
                }}
              >
                Sale
              </Link>
            </div>
          </div>

          {/* Search Bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            flex: 1,
            maxWidth: '400px',
            margin: '0 2rem',
          }}>
            <form onSubmit={handleSearch} style={{ width: '100%' }}>
              <div style={{
                position: 'relative',
                width: '100%',
              }}>
                <Search size={20} style={{
                  position: 'absolute',
                  left: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#9ca3af',
                }} />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.5rem 0.5rem 2.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    outline: 'none',
                    fontSize: '0.875rem',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#0284c7';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#d1d5db';
                  }}
                />
              </div>
            </form>
          </div>

          {/* User Actions */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
          }}>
            {/* Wishlist */}
            <Link href="/wishlist" style={{
              position: 'relative',
              color: '#374151',
              textDecoration: 'none',
              padding: '0.5rem',
              borderRadius: '0.375rem',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f9fafb';
              e.currentTarget.style.color = '#0284c7';
            }}
            >
              <Heart size={20} />
              {wishlistState.items.length > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-0.25rem',
                  right: '-0.25rem',
                  backgroundColor: '#ef4444',
                  color: 'white',
                  borderRadius: '50%',
                  width: '1rem',
                  height: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.625rem',
                  fontWeight: 'bold',
                }}>
                  {wishlistState.items.length}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link href="/cart" style={{
              position: 'relative',
              color: '#374151',
              textDecoration: 'none',
              padding: '0.5rem',
              borderRadius: '0.375rem',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f9fafb';
              e.currentTarget.style.color = '#0284c7';
            }}
            >
              <ShoppingBag size={20} />
              {cartState.itemCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-0.25rem',
                  right: '-0.25rem',
                  backgroundColor: '#ef4444',
                  color: 'white',
                  borderRadius: '50%',
                  width: '1rem',
                  height: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.625rem',
                  fontWeight: 'bold',
                }}>
                  {cartState.itemCount}
                </span>
              )}
            </Link>

            {/* User Menu */}
            {authState.user ? (
              <div ref={userMenuRef} style={{ position: 'relative' }}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    backgroundColor: 'white',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    color: '#374151',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#9ca3af';
                  }}
                >
                  <User size={16} />
                  <span>{authState.user.first_name || authState.user.username}</span>
                  <ChevronDown size={16} style={{
                    transform: isUserMenuOpen ? 'rotate(180deg)' : 'none',
                    transition: 'transform 0.2s ease',
                  }} />
                </button>

                {isUserMenuOpen && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    marginTop: '0.5rem',
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.375rem',
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                    minWidth: '200px',
                    zIndex: 50,
                  }}>
                    <div style={{ padding: '0.5rem 0' }}>
                      <div style={{ 
                        padding: '0.5rem 1rem', 
                        borderBottom: '1px solid #f3f4f6',
                        color: '#6b7280',
                        fontSize: '0.875rem',
                      }}>
                        Signed in as<br />
                        <strong>{authState.user.email}</strong>
                      </div>
                      
                      <Link 
                        href="/profile" 
                        style={{
                          display: 'block',
                          padding: '0.5rem 1rem',
                          color: '#374151',
                          textDecoration: 'none',
                          fontSize: '0.875rem',
                          transition: 'background-color 0.2s ease',
                        }}
                        onClick={() => setIsUserMenuOpen(false)}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#f9fafb';
                        }}
                      >
                        My Profile
                      </Link>
                      
                      <Link 
                        href="/orders" 
                        style={{
                          display: 'block',
                          padding: '0.5rem 1rem',
                          color: '#374151',
                          textDecoration: 'none',
                          fontSize: '0.875rem',
                          transition: 'background-color 0.2s ease',
                        }}
                        onClick={() => setIsUserMenuOpen(false)}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#f9fafb';
                        }}
                      >
                        My Orders
                      </Link>

                      {(authState.user.is_staff || authState.user.user_type === 'admin') && (
                        <Link 
                          href="/admin" 
                          style={{
                            display: 'block',
                            padding: '0.5rem 1rem',
                            color: '#374151',
                            textDecoration: 'none',
                            fontSize: '0.875rem',
                            transition: 'background-color 0.2s ease',
                          }}
                          onClick={() => setIsUserMenuOpen(false)}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#f9fafb';
                          }}
                        >
                          Admin Dashboard
                        </Link>
                      )}

                      <button
                        onClick={handleLogout}
                        style={{
                          width: '100%',
                          textAlign: 'left',
                          padding: '0.5rem 1rem',
                          border: 'none',
                          backgroundColor: 'transparent',
                          color: '#ef4444',
                          cursor: 'pointer',
                          fontSize: '0.875rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          transition: 'background-color 0.2s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#fef2f2';
                        }}
                      >
                        <LogOut size={16} />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <Link href="/auth/login">
                  <Button variant="outline" size="sm">Login</Button>
                </Link>
                <Link href="/auth/register">
                  <Button variant="primary" size="sm">Sign Up</Button>
                </Link>
              </div>
            )}

            {/* Mobile menu button - hidden on desktop */}
            <button
              onClick={onMenuToggle}
              style={{
                display: 'none',
                padding: '0.5rem',
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                color: '#374151',
                transition: 'color 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#0284c7';
              }}
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}