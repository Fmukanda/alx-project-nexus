'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { X, Home, ShoppingBag, Heart, User, Settings, LogOut, ChevronRight } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { useCart } from '@/providers/CartProvider';
import { useWishlist } from '@/providers/WishlistProvider';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { state: authState, logout } = useAuth();
  const { state: cartState } = useCart();
  const { state: wishlistState } = useWishlist();

  // Close sidebar when route changes
  useEffect(() => {
    onClose();
  }, [pathname, onClose]);

  // Prevent body scroll when sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleLogout = async () => {
    try {
      await logout();
      onClose();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const mainMenuItems = [
    {
      href: '/',
      label: 'Home',
      icon: Home,
    },
    {
      href: '/products',
      label: 'Products',
      icon: ShoppingBag,
    },
    {
      href: '/categories',
      label: 'Categories',
      icon: ChevronRight,
    },
    {
      href: '/sale',
      label: 'Sale',
      icon: ChevronRight,
      isSale: true,
    },
  ];

  const userMenuItems = authState.user
    ? [
        {
          href: '/profile',
          label: 'My Profile',
          icon: User,
        },
        {
          href: '/orders',
          label: 'My Orders',
          icon: ShoppingBag,
        },
        {
          href: '/wishlist',
          label: 'Wishlist',
          icon: Heart,
          badge: wishlistState.items.length,
        },
        {
          href: '/cart',
          label: 'Shopping Cart',
          icon: ShoppingBag,
          badge: cartState.itemCount,
        },
      ]
    : [];

  const adminMenuItems =
    authState.user?.is_staff || authState.user?.user_type === 'admin'
      ? [
          {
            href: '/admin',
            label: 'Admin Dashboard',
            icon: Settings,
          },
          {
            href: '/admin/products',
            label: 'Manage Products',
            icon: ChevronRight,
          },
          {
            href: '/admin/orders',
            label: 'Manage Orders',
            icon: ChevronRight,
          },
        ]
      : [];

  const supportMenuItems = [
    {
      href: '/about',
      label: 'About Us',
      icon: ChevronRight,
    },
    {
      href: '/contact',
      label: 'Contact',
      icon: ChevronRight,
    },
    {
      href: '/shipping',
      label: 'Shipping Info',
      icon: ChevronRight,
    },
    {
      href: '/returns',
      label: 'Returns & Exchanges',
      icon: ChevronRight,
    },
    {
      href: '/faq',
      label: 'FAQ',
      icon: ChevronRight,
    },
  ];

  const renderMenuSection = (
    items: Array<{
      href: string;
      label: string;
      icon: any;
      isSale?: boolean;
      badge?: number;
    }>,
    title?: string
  ) => (
    <div style={{ marginBottom: '2rem' }}>
      {title && (
        <h3 style={{
          fontSize: '0.875rem',
          fontWeight: '600',
          color: '#6b7280',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          marginBottom: '1rem',
          padding: '0 1rem',
        }}>
          {title}
        </h3>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.75rem 1rem',
                color: isActive ? '#0284c7' : (item.isSale ? '#ef4444' : '#374151'),
                textDecoration: 'none',
                backgroundColor: isActive ? '#f0f9ff' : 'transparent',
                borderRight: isActive ? '3px solid #0284c7' : 'none',
                fontWeight: isActive ? '600' : '500',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = '#f9fafb';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Icon size={20} />
                <span>{item.label}</span>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {item.badge !== undefined && item.badge > 0 && (
                  <span style={{
                    backgroundColor: '#ef4444',
                    color: 'white',
                    borderRadius: '50%',
                    width: '1.25rem',
                    height: '1.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                  }}>
                    {item.badge}
                  </span>
                )}
                {!item.badge && <ChevronRight size={16} style={{ color: '#9ca3af' }} />}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 40,
            transition: 'opacity 0.3s ease',
          }}
          onClick={handleBackdropClick}
        />
      )}

      {/* Sidebar Panel */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          width: '100%',
          maxWidth: '320px',
          backgroundColor: 'white',
          boxShadow: '4px 0 20px rgba(0, 0, 0, 0.1)',
          transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.3s ease',
          zIndex: 50,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1.5rem 1rem',
          borderBottom: '1px solid #e5e7eb',
          backgroundColor: '#f8fafc',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '2rem',
              height: '2rem',
              backgroundColor: '#0284c7',
              borderRadius: '0.375rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 'bold',
              fontSize: '0.875rem',
            }}>
              F
            </div>
            <div>
              <div style={{ fontSize: '1rem', fontWeight: '600', color: '#111827' }}>
                FashionStore
              </div>
              {authState.user && (
                <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                  Welcome, {authState.user.first_name || authState.user.username}
                </div>
              )}
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              padding: '0.5rem',
              border: 'none',
              backgroundColor: 'transparent',
              color: '#6b7280',
              cursor: 'pointer',
              borderRadius: '0.375rem',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f3f4f6';
              e.currentTarget.style.color = '#374151';
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Content */}
        <div style={{
          flex: 1,
          overflow: 'auto',
          padding: '1rem 0',
        }}>
          {/* Main Menu */}
          {renderMenuSection(mainMenuItems)}

          {/* User Menu */}
          {authState.user ? (
            <>
              {renderMenuSection(userMenuItems, 'My Account')}
              
              {/* Admin Menu */}
              {adminMenuItems.length > 0 && renderMenuSection(adminMenuItems, 'Admin')}
            </>
          ) : (
            <div style={{ padding: '0 1rem', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <Link
                  href="/auth/login"
                  style={{
                    display: 'block',
                    textAlign: 'center',
                    padding: '0.75rem 1rem',
                    backgroundColor: '#0284c7',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: '0.375rem',
                    fontWeight: '600',
                    transition: 'background-color 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#0369a1';
                  }}
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/register"
                  style={{
                    display: 'block',
                    textAlign: 'center',
                    padding: '0.75rem 1rem',
                    border: '1px solid #d1d5db',
                    color: '#374151',
                    textDecoration: 'none',
                    borderRadius: '0.375rem',
                    fontWeight: '600',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f9fafb';
                    e.currentTarget.style.borderColor = '#9ca3af';
                  }}
                >
                  Create Account
                </Link>
              </div>
            </div>
          )}

          {/* Support Menu */}
          {renderMenuSection(supportMenuItems, 'Support')}

          {/* Logout Button */}
          {authState.user && (
            <div style={{ padding: '0 1rem', marginTop: '2rem' }}>
              <button
                onClick={handleLogout}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 1rem',
                  border: '1px solid #fecaca',
                  backgroundColor: '#fef2f2',
                  color: '#dc2626',
                  borderRadius: '0.375rem',
                  cursor: 'pointer',
                  fontWeight: '600',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#fee2e2';
                  e.currentTarget.style.borderColor = '#fca5a5';
                }}
              >
                <LogOut size={20} />
                Sign Out
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '1rem',
          borderTop: '1px solid #e5e7eb',
          backgroundColor: '#f8fafc',
        }}>
          <div style={{ fontSize: '0.75rem', color: '#6b7280', textAlign: 'center' }}>
            &copy; {new Date().getFullYear()} FashionStore
            <br />
            All rights reserved
          </div>
        </div>
      </div>
    </>
  );
}