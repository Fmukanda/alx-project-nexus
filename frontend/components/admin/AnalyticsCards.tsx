'use client';

import React from 'react';
import { DollarSign, ShoppingCart, Users, RotateCcw, TrendingUp, Package, CreditCard, Smartphone, Repeat } from 'lucide-react';

interface AnalyticsCardProps {
  title: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative';
  icon: React.ElementType;
  description?: string;
}

const AnalyticsCard: React.FC<AnalyticsCardProps> = ({ 
  title, 
  value, 
  change, 
  changeType, 
  icon: Icon,
  description 
}) => {
  return (
    <div style={{
      backgroundColor: 'white',
      padding: '1.5rem',
      borderRadius: '0.75rem',
      boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
      border: '1px solid #e5e7eb',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div style={{ flex: 1 }}>
          <p style={{ 
            fontSize: '0.875rem', 
            fontWeight: '500', 
            color: '#6b7280',
            marginBottom: '0.5rem',
          }}>
            {title}
          </p>
          <p style={{ 
            fontSize: '1.875rem', 
            fontWeight: 'bold', 
            color: '#111827',
            marginBottom: '0.5rem',
          }}>
            {value}
          </p>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.25rem',
            fontSize: '0.875rem',
          }}>
            <span style={{ 
              color: changeType === 'positive' ? '#10b981' : '#ef4444',
              fontWeight: '500',
            }}>
              {changeType === 'positive' ? '↑' : '↓'} {change}
            </span>
            <span style={{ color: '#9ca3af' }}>vs last month</span>
          </div>
          {description && (
            <p style={{ 
              fontSize: '0.75rem', 
              color: '#6b7280',
              marginTop: '0.5rem',
            }}>
              {description}
            </p>
          )}
        </div>
        <div style={{
          padding: '0.75rem',
          backgroundColor: '#f0f9ff',
          borderRadius: '0.5rem',
          color: '#0284c7',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  );
};

interface AnalyticsCardsProps {
  period?: 'today' | 'week' | 'month' | 'year';
}

export function AnalyticsCards({ period = 'month' }: AnalyticsCardsProps) {
  const analyticsData = {
    today: [
    { title: "Total Sales", value: "$2,450", change: "+12%", changeType: "positive" as const, icon: DollarSign },
    { title: "Orders", value: "74", change: "+8%", changeType: "positive" as const, icon: ShoppingCart },
    { title: "Customers", value: "51", change: "+5%", changeType: "positive" as const, icon: Users },
    { title: "Refunds", value: "2", change: "-1%", changeType: "negative" as const, icon: RotateCcw },
  ],

  week: [
    { title: "Total Sales", value: "$18,920", change: "+7%", changeType: "positive" as const, icon: DollarSign },
    { title: "Orders", value: "528", change: "+4%", changeType: "positive" as const, icon: ShoppingCart },
    { title: "Customers", value: "389", change: "+3%", changeType: "positive" as const, icon: Users },
    { title: "Refunds", value: "11", change: "-2%", changeType: "negative" as const, icon: RotateCcw },
  ],

  month: [
    { title: "Total Sales", value: "$76,200", change: "+14%", changeType: "positive" as const, icon: DollarSign },
    { title: "Orders", value: "2,931", change: "+10%", changeType: "positive" as const, icon: ShoppingCart },
    { title: "Customers", value: "1,842", change: "+6%", changeType: "positive" as const, icon: Users },
    { title: "Refunds", value: "39", change: "-4%", changeType: "negative" as const, icon: RotateCcw },
  ],

  year: [
    { title: "Total Sales", value: "$912,400", change: "+22%", changeType: "positive" as const, icon: DollarSign },
    { title: "Orders", value: "34,810", change: "+18%", changeType: "positive" as const, icon: ShoppingCart },
    { title: "Customers", value: "21,603", change: "+12%", changeType: "positive" as const, icon: Users },
    { title: "Refunds", value: "463", change: "-6%", changeType: "negative" as const, icon: RotateCcw },
  ],
  };

  const data = analyticsData[period] || analyticsData.month;

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
      gap: '1.5rem',
      marginBottom: '2rem',
    }}>
      {data.map((card, index) => (
        <AnalyticsCard key={index} {...card} />
      ))}
    </div>
  );
}