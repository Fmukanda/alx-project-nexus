'use client';

import React from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { DashboardStats } from '@/components/admin/DashboardStats';
import { RecentOrders } from '@/components/admin/RecentOrders';
import { SalesChart } from '@/components/admin/SalesChart';

export default function AdminDashboard() {
  return (
    <AdminLayout>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#111827', marginBottom: '0.5rem' }}>
          Dashboard
        </h1>
        <p style={{ color: '#6b7280' }}>
          Welcome to your admin dashboard. Here's what's happening with your store today.
        </p>
      </div>

      {/* Stats Grid */}
      <DashboardStats />

      {/* Charts and Recent Orders */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: '2rem',
        marginTop: '2rem',
      }}>
        <SalesChart />
        <RecentOrders />
      </div>
    </AdminLayout>
  );
}