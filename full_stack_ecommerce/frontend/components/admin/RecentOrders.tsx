'use client';

import React from 'react';
import Link from 'next/link';

const orders = [
  {
    id: 'ORD-001',
    customer: 'John Doe',
    date: '2024-01-15',
    amount: 149.99,
    status: 'Delivered',
    statusColor: '#10b981',
  },
  {
    id: 'ORD-002',
    customer: 'Jane Smith',
    date: '2024-01-15',
    amount: 89.99,
    status: 'Processing',
    statusColor: '#f59e0b',
  },
  {
    id: 'ORD-003',
    customer: 'Bob Johnson',
    date: '2024-01-14',
    amount: 199.99,
    status: 'Shipped',
    statusColor: '#0ea5e9',
  },
  {
    id: 'ORD-004',
    customer: 'Alice Brown',
    date: '2024-01-14',
    amount: 74.99,
    status: 'Pending',
    statusColor: '#6b7280',
  },
];

export function RecentOrders() {
  return (
    <div style={{
      backgroundColor: 'white',
      padding: '1.5rem',
      borderRadius: '0.5rem',
      boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
      gridColumn: 'span 1',
    }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        marginBottom: '1rem',
      }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#111827' }}>
          Recent Orders
        </h2>
        <Link 
          href="/admin/orders"
          style={{
            fontSize: '0.875rem',
            color: '#0284c7',
            textDecoration: 'none',
            fontWeight: '500',
          }}
        >
          View all
        </Link>
      </div>

      <div style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
              <th style={{ 
                textAlign: 'left', 
                padding: '0.75rem 0', 
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#6b7280',
              }}>
                Order ID
              </th>
              <th style={{ 
                textAlign: 'left', 
                padding: '0.75rem 0', 
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#6b7280',
              }}>
                Customer
              </th>
              <th style={{ 
                textAlign: 'left', 
                padding: '0.75rem 0', 
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#6b7280',
              }}>
                Date
              </th>
              <th style={{ 
                textAlign: 'right', 
                padding: '0.75rem 0', 
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#6b7280',
              }}>
                Amount
              </th>
              <th style={{ 
                textAlign: 'right', 
                padding: '0.75rem 0', 
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#6b7280',
              }}>
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                <td style={{ 
                  padding: '0.75rem 0',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#0284c7',
                }}>
                  {order.id}
                </td>
                <td style={{ 
                  padding: '0.75rem 0',
                  fontSize: '0.875rem',
                  color: '#374151',
                }}>
                  {order.customer}
                </td>
                <td style={{ 
                  padding: '0.75rem 0',
                  fontSize: '0.875rem',
                  color: '#6b7280',
                }}>
                  {order.date}
                </td>
                <td style={{ 
                  padding: '0.75rem 0',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#111827',
                  textAlign: 'right',
                }}>
                  ${order.amount}
                </td>
                <td style={{ 
                  padding: '0.75rem 0',
                  textAlign: 'right',
                }}>
                  <span style={{
                    padding: '0.25rem 0.5rem',
                    fontSize: '0.75rem',
                    fontWeight: '500',
                    borderRadius: '0.25rem',
                    backgroundColor: `${order.statusColor}20`,
                    color: order.statusColor,
                  }}>
                    {order.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}