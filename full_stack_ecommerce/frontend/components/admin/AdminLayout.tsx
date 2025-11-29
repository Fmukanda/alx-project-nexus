'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  BarChart3, 
  Package, 
  Users, 
  ShoppingCart, 
  Settings, 
  Menu, 
  X,
  TrendingUp,
  DollarSign,
  ShoppingBag,
  UserPlus
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: BarChart3 },
    { name: 'Products', href: '/admin/products', icon: Package },
    { name: 'Orders', href: '/admin/orders', icon: ShoppingCart },
    { name: 'Customers', href: '/admin/customers', icon: Users },
    { name: 'Analytics', href: '/admin/analytics', icon: TrendingUp },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      {/* Sidebar */}
      <div style={{
        width: '16rem',
        backgroundColor: 'white',
        boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
        position: 'fixed',
        height: '100vh',
        zIndex: 40,
        transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.3s',
      }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid #e5e7eb' }}>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#111827' }}>
            Admin Dashboard
          </h1>
        </div>

        <nav style={{ padding: '1rem' }}>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <li key={item.name} style={{ marginBottom: '0.5rem' }}>
                  <Link
                    href={item.href}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '0.75rem 1rem',
                      borderRadius: '0.375rem',
                      textDecoration: 'none',
                      color: isActive ? '#0284c7' : '#6b7280',
                      backgroundColor: isActive ? '#f0f9ff' : 'transparent',
                      fontWeight: isActive ? '600' : '500',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = '#f9fafb';
                        e.currentTarget.style.color = '#374151';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = '#6b7280';
                      }
                    }}
                  >
                    <Icon size={20} style={{ marginRight: '0.75rem' }} />
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      {/* Main content */}
      <div style={{ 
        flex: 1, 
        marginLeft: sidebarOpen ? '16rem' : 0,
        transition: 'margin-left 0.3s',
      }}>
        {/* Top bar */}
        <header style={{
          backgroundColor: 'white',
          boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
          position: 'sticky',
          top: 0,
          zIndex: 30,
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1rem 1.5rem',
          }}>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{
                padding: '0.5rem',
                border: 'none',
                backgroundColor: 'transparent',
                cursor: 'pointer',
                borderRadius: '0.375rem',
              }}
            >
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                Welcome back, Admin
              </span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main style={{ padding: '1.5rem' }}>
          {children}
        </main>
      </div>
    </div>
  );
}