'use client';

import React from 'react';
import { DollarSign, ShoppingCart, Users, TrendingUp } from 'lucide-react';

const stats = [
  {
    name: 'Total Revenue',
    value: '$45,231.89',
    change: '+20.1%',
    changeType: 'positive',
    icon: DollarSign,
  },
  {
    name: 'Orders',
    value: '1,234',
    change: '+12.1%',
    changeType: 'positive',
    icon: ShoppingCart,
  },
  {
    name: 'Customers',
    value: '892',
    change: '+18.1%',
    changeType: 'positive',
    icon: Users,
  },
  {
    name: 'Conversion Rate',
    value: '3.2%',
    change: '-1.2%',
    changeType: 'negative',
    icon: TrendingUp,
  },
];

export function DashboardStats() {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
      gap: '1.5rem',
    }}>
      {stats.map((stat) => {
        const Icon = stat.icon;
        
        return (
          <div
            key={stat.name}
            style={{
              backgroundColor: 'white',
              padding: '1.5rem',
              borderRadius: '0.5rem',
              boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ 
                  fontSize: '0.875rem', 
                  fontWeight: '500', 
                  color: '#6b7280',
                  marginBottom: '0.5rem',
                }}>
                  {stat.name}
                </p>
                <p style={{ 
                  fontSize: '1.5rem', 
                  fontWeight: 'bold', 
                  color: '#111827',
                  marginBottom: '0.25rem',
                }}>
                  {stat.value}
                </p>
                <p style={{ 
                  fontSize: '0.875rem',
                  color: stat.changeType === 'positive' ? '#10b981' : '#ef4444',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                }}>
                  {stat.changeType === 'positive' ? '↑' : '↓'}
                  {stat.change} from last month
                </p>
              </div>
              <div style={{
                padding: '0.75rem',
                backgroundColor: '#f0f9ff',
                borderRadius: '0.375rem',
                color: '#0284c7',
              }}>
                <Icon size={24} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}