'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '@/providers/CartProvider';
import { useAuth } from '@/providers/AuthProvider';
import { useWishlist } from '@/providers/WishlistProvider';
import { Button } from '@/components/ui/Button';
import { Search, ShoppingBag, User, Menu, X, Heart, LogOut, ChevronDown } from 'lucide-react';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const pathname = usePathname();
  const { state: cartState } = useCart();
  const { state: authState, logout } = useAuth();
  const { state: wishlistState } = useWishlist();
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close user menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
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

  return (
    <header style={{
      backgroundColor: 'white',
      boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
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
          height: '4rem',
        }}>
          {/* Logo */}
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

          {/* Navigation - Desktop */}
          <nav style={{
            display: 'flex',
            alignItems: 'center',
            gap: '2rem',
          }}>
            <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
              <Link 
                href="/products" 
                style={{
                  color: pathname === '/products' ? '#0284c7' : '#374151',
                  textDecoration: 'none',
                  fontWeight: pathname === '/products' ? '600' : '500',
                  padding: '0.5rem 0',
                  borderBottom: pathname === '/products' ? '2px solid #0284c7' : 'none',
                }}
              >
                Products
              </Link>
              <Link 
                href="/categories" 
                style={{
                  color: pathname === '/categories' ? '#0284c7' : '#374151',
                  textDecoration: 'none',
                  fontWeight: pathname === '/categories' ? '600' : '500',
                  padding: '0.5rem 0',
                  borderBottom: pathname === '/categories' ? '2px solid #0284c7' : 'none',
                }}
              >
                Categories
              </Link>
              <Link 
                href="/sale" 
                style={{
                  color: '#ef4444',
                  textDecoration: 'none',
                  fontWeight: '500',
                  padding: '0.5rem 0',
                }}
              >
                Sale
              </Link>
            </div>
          </nav>

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
            gap: '1rem',
          }}>
            {/* Wishlist */}
            <Link href="/wishlist" style={{
              position: 'relative',
              color: '#374151',
              textDecoration: 'none',
              padding: '0.5rem',
              borderRadius: '0.375rem',
            }}>
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
            }}>
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
                  }}
                >
                  <User size={16} />
                  <span>{authState.user.first_name || authState.user.username}</span>
                  <ChevronDown size={16} />
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
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
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
                        }}
                        onClick={() => setIsUserMenuOpen(false)}
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
                        }}
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        My Orders
                      </Link>

                      {authState.user.is_staff && (
                        <Link 
                          href="/admin" 
                          style={{
                            display: 'block',
                            padding: '0.5rem 1rem',
                            color: '#374151',
                            textDecoration: 'none',
                            fontSize: '0.875rem',
                          }}
                          onClick={() => setIsUserMenuOpen(false)}
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

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              style={{
                display: 'none',
                padding: '0.5rem',
                border: 'none',
                background: 'none',
                cursor: 'pointer',
              }}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            backgroundColor: 'white',
            borderTop: '1px solid #e5e7eb',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}>
            <Link 
              href="/products" 
              style={{
                color: '#374151',
                textDecoration: 'none',
                fontWeight: '500',
                padding: '0.5rem 0',
              }}
              onClick={() => setIsMenuOpen(false)}
            >
              Products
            </Link>
            <Link 
              href="/categories" 
              style={{
                color: '#374151',
                textDecoration: 'none',
                fontWeight: '500',
                padding: '0.5rem 0',
              }}
              onClick={() => setIsMenuOpen(false)}
            >
              Categories
            </Link>
            <Link 
              href="/sale" 
              style={{
                color: '#ef4444',
                textDecoration: 'none',
                fontWeight: '500',
                padding: '0.5rem 0',
              }}
              onClick={() => setIsMenuOpen(false)}
            >
              Sale
            </Link>
            <Link 
              href="/wishlist" 
              style={{
                color: '#374151',
                textDecoration: 'none',
                fontWeight: '500',
                padding: '0.5rem 0',
              }}
              onClick={() => setIsMenuOpen(false)}
            >
              Wishlist
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}