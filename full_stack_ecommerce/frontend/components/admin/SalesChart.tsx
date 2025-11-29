'use client';

import React, { useState } from 'react';
import { TrendingUp, Calendar, Download } from 'lucide-react';

interface SalesData {
  date: string;
  revenue: number;
  orders: number;
  customers: number;
  mpesaOrders: number;
  cardOrders: number;
}

interface SalesChartProps {
  period?: '7days' | '30days' | '90days' | '1year';
  data?: SalesData[];
}

export function SalesChart({ period = '30days', data: externalData }: SalesChartProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<'7days' | '30days' | '90days' | '1year'>(period);
  const [chartType, setChartType] = useState<'revenue' | 'orders' | 'customers'>('revenue');

  // Mock data - in a real app, this would come from an API
  const mockData: Record<string, SalesData[]> = {
    '7days': [
      { date: 'Jan 15', revenue: 2450, orders: 34, customers: 28, mpesaOrders: 8, cardOrders: 26 },
      { date: 'Jan 16', revenue: 3120, orders: 42, customers: 35, mpesaOrders: 12, cardOrders: 30 },
      { date: 'Jan 17', revenue: 2980, orders: 39, customers: 32, mpesaOrders: 10, cardOrders: 29 },
      { date: 'Jan 18', revenue: 2670, orders: 36, customers: 30, mpesaOrders: 9, cardOrders: 27 },
      { date: 'Jan 19', revenue: 3340, orders: 45, customers: 38, mpesaOrders: 14, cardOrders: 31 },
      { date: 'Jan 20', revenue: 2890, orders: 40, customers: 33, mpesaOrders: 11, cardOrders: 29 },
      { date: 'Jan 21', revenue: 3560, orders: 48, customers: 40, mpesaOrders: 16, cardOrders: 32 },
    ],
    '30days': [
      { date: 'Dec 23', revenue: 2240, orders: 31, customers: 26, mpesaOrders: 7, cardOrders: 24 },
      { date: 'Dec 30', revenue: 2890, orders: 39, customers: 32, mpesaOrders: 10, cardOrders: 29 },
      { date: 'Jan 6', revenue: 3120, orders: 42, customers: 35, mpesaOrders: 12, cardOrders: 30 },
      { date: 'Jan 13', revenue: 3340, orders: 45, customers: 38, mpesaOrders: 14, cardOrders: 31 },
      { date: 'Jan 20', revenue: 3560, orders: 48, customers: 40, mpesaOrders: 16, cardOrders: 32 },
    ],
    '90days': [
      { date: 'Oct', revenue: 85600, orders: 1120, customers: 890, mpesaOrders: 280, cardOrders: 840 },
      { date: 'Nov', revenue: 92400, orders: 1250, customers: 980, mpesaOrders: 320, cardOrders: 930 },
      { date: 'Dec', revenue: 101200, orders: 1380, customers: 1070, mpesaOrders: 380, cardOrders: 1000 },
    ],
    '1year': [
      { date: 'Q1', revenue: 245600, orders: 3250, customers: 2450, mpesaOrders: 780, cardOrders: 2470 },
      { date: 'Q2', revenue: 278900, orders: 3680, customers: 2780, mpesaOrders: 920, cardOrders: 2760 },
      { date: 'Q3', revenue: 312400, orders: 4120, customers: 3120, mpesaOrders: 1080, cardOrders: 3040 },
      { date: 'Q4', revenue: 356800, orders: 4680, customers: 3560, mpesaOrders: 1320, cardOrders: 3360 },
    ],
  };

  const data = externalData || mockData[selectedPeriod];
  const maxValue = Math.max(...data.map(d => 
    chartType === 'revenue' ? d.revenue : 
    chartType === 'orders' ? d.orders : d.customers
  ));

  const getBarHeight = (value: number) => {
    return (value / maxValue) * 200;
  };

  const getBarColor = (index: number) => {
    const colors = ['#0284c7', '#0ea5e9', '#38bdf8', '#7dd3fc'];
    return colors[index % colors.length];
  };

  const formatValue = (value: number) => {
    if (chartType === 'revenue') {
      return `$${(value / 1000).toFixed(0)}k`;
    }
    return value.toString();
  };

  const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0);
  const totalOrders = data.reduce((sum, item) => sum + item.orders, 0);
  const totalCustomers = data.reduce((sum, item) => sum + item.customers, 0);

  return (
    <div style={{
      backgroundColor: 'white',
      padding: '1.5rem',
      borderRadius: '0.75rem',
      boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
      border: '1px solid #e5e7eb',
      gridColumn: 'span 1',
    }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        marginBottom: '1.5rem',
      }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#111827' }}>
            Sales Overview
          </h2>
          <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.25rem' }}>
            Track your sales performance and trends
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {/* Chart Type Selector */}
          <div style={{ display: 'flex', backgroundColor: '#f3f4f6', borderRadius: '0.5rem', padding: '0.25rem' }}>
            {[
              { key: 'revenue', label: 'Revenue' },
              { key: 'orders', label: 'Orders' },
              { key: 'customers', label: 'Customers' }
            ].map((type) => (
              <button
                key={type.key}
                onClick={() => setChartType(type.key as any)}
                style={{
                  padding: '0.5rem 1rem',
                  border: 'none',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  backgroundColor: chartType === type.key ? 'white' : 'transparent',
                  color: chartType === type.key ? '#111827' : '#6b7280',
                  boxShadow: chartType === type.key ? '0 1px 2px 0 rgb(0 0 0 / 0.05)' : 'none',
                  transition: 'all 0.2s',
                }}
              >
                {type.label}
              </button>
            ))}
          </div>

          {/* Period Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calendar size={16} color="#6b7280" />
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value as any)}
              style={{
                padding: '0.5rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
                backgroundColor: 'white',
                outline: 'none',
              }}
            >
              <option value="7days">Last 7 days</option>
              <option value="30days">Last 30 days</option>
              <option value="90days">Last 90 days</option>
              <option value="1year">Last year</option>
            </select>
          </div>

          <button style={{
            padding: '0.5rem',
            border: '1px solid #d1d5db',
            borderRadius: '0.375rem',
            backgroundColor: 'white',
            color: '#374151',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s',
          }}>
            <Download size={16} />
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '1rem',
        marginBottom: '2rem',
      }}>
        <div style={{
          backgroundColor: '#f0f9ff',
          padding: '1rem',
          borderRadius: '0.5rem',
          border: '1px solid #bae6fd',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <TrendingUp size={16} color="#0284c7" />
            <span style={{ fontSize: '0.875rem', fontWeight: '500', color: '#0369a1' }}>
              Total Revenue
            </span>
          </div>
          <p style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#111827' }}>
            ${(totalRevenue / 1000).toFixed(0)}k
          </p>
        </div>

        <div style={{
          backgroundColor: '#f0f9ff',
          padding: '1rem',
          borderRadius: '0.5rem',
          border: '1px solid #bae6fd',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <TrendingUp size={16} color="#0284c7" />
            <span style={{ fontSize: '0.875rem', fontWeight: '500', color: '#0369a1' }}>
              Total Orders
            </span>
          </div>
          <p style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#111827' }}>
            {totalOrders}
          </p>
        </div>

        <div style={{
          backgroundColor: '#f0f9ff',
          padding: '1rem',
          borderRadius: '0.5rem',
          border: '1px solid #bae6fd',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <TrendingUp size={16} color="#0284c7" />
            <span style={{ fontSize: '0.875rem', fontWeight: '500', color: '#0369a1' }}>
              Total Customers
            </span>
          </div>
          <p style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#111827' }}>
            {totalCustomers}
          </p>
        </div>
      </div>

      {/* Chart */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'end', 
        gap: '1rem', 
        height: '240px',
        padding: '1rem 0',
        borderBottom: '1px solid #e5e7eb',
        marginBottom: '1rem',
      }}>
        {data.map((item, index) => {
          const value = item[chartType];
          const height = getBarHeight(value);
          
          return (
            <div 
              key={index}
              style={{ 
                flex: 1, 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                height: '100%',
              }}
            >
              <div style={{
                position: 'relative',
                width: '100%',
                maxWidth: '60px',
                height: '100%',
                display: 'flex',
                alignItems: 'end',
              }}>
                <div
                  style={{
                    width: '100%',
                    height: `${height}px`,
                    backgroundColor: getBarColor(index),
                    borderRadius: '0.25rem 0.25rem 0 0',
                    transition: 'height 0.3s ease',
                    position: 'relative',
                  }}
                >
                  <div style={{
                    position: 'absolute',
                    top: '-2rem',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    backgroundColor: '#374151',
                    color: 'white',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '0.25rem',
                    fontSize: '0.75rem',
                    fontWeight: '500',
                    whiteSpace: 'nowrap',
                    opacity: 0,
                    transition: 'opacity 0.2s',
                  }}>
                    {formatValue(value)}
                  </div>
                </div>
              </div>
              <span style={{ 
                marginTop: '0.5rem',
                fontSize: '0.75rem',
                color: '#6b7280',
                fontWeight: '500',
                textAlign: 'center',
              }}>
                {item.date}
              </span>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: '12px', height: '12px', backgroundColor: '#0284c7', borderRadius: '2px' }} />
          <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Revenue</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: '12px', height: '12px', backgroundColor: '#0ea5e9', borderRadius: '2px' }} />
          <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>M-Pesa Orders</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: '12px', height: '12px', backgroundColor: '#38bdf8', borderRadius: '2px' }} />
          <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Card Orders</span>
        </div>
      </div>
    </div>
  );
}