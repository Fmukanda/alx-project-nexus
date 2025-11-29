'use client';

import React, { useState } from 'react';
import { ChevronUp, ChevronDown, Search, Filter, MoreVertical, Edit, Trash2, Eye } from 'lucide-react';

interface Column {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: any) => React.ReactNode;
}

interface DataTableProps {
  data: any[];
  columns: Column[];
  searchable?: boolean;
  searchPlaceholder?: string;
  actions?: {
    view?: (row: any) => void;
    edit?: (row: any) => void;
    delete?: (row: any) => void;
  };
  onSort?: (key: string, direction: 'asc' | 'desc') => void;
  onSearch?: (query: string) => void;
}

export function DataTable({ 
  data, 
  columns, 
  searchable = true, 
  searchPlaceholder = "Search...",
  actions,
  onSort,
  onSearch 
}: DataTableProps) {
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionMenu, setActionMenu] = useState<string | null>(null);

  const handleSort = (key: string) => {
    const isSortable = columns.find(col => col.key === key)?.sortable;
    if (!isSortable) return;

    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }

    const newSortConfig = { key, direction };
    setSortConfig(newSortConfig);
    onSort?.(key, direction);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    onSearch?.(query);
  };

  const getSortIcon = (key: string) => {
    if (sortConfig?.key !== key) {
      return <ChevronUp size={16} style={{ opacity: 0.3 }} />;
    }
    return sortConfig.direction === 'asc' ? 
      <ChevronUp size={16} color="#0284c7" /> : 
      <ChevronDown size={16} color="#0284c7" />;
  };

  const renderCell = (column: Column, row: any) => {
    if (column.render) {
      return column.render(row[column.key], row);
    }
    return row[column.key];
  };

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '0.75rem',
      boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
      border: '1px solid #e5e7eb',
      overflow: 'hidden',
    }}>
      {/* Table Header with Search */}
      {(searchable || onSearch) && (
        <div style={{
          padding: '1.5rem',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
        }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
            <Search 
              size={20} 
              style={{
                position: 'absolute',
                left: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#9ca3af',
              }}
            />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 0.75rem 0.75rem 2.5rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
                outline: 'none',
                transition: 'all 0.2s',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#0284c7';
                e.target.style.boxShadow = '0 0 0 3px rgb(2 132 199 / 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#d1d5db';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>
          
          <button style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1rem',
            border: '1px solid #d1d5db',
            borderRadius: '0.5rem',
            backgroundColor: 'white',
            color: '#374151',
            fontSize: '0.875rem',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}>
            <Filter size={16} />
            Filters
          </button>
        </div>
      )}

      {/* Table */}
      <div style={{ overflow: 'auto' }}>
        <table style={{ 
          width: '100%', 
          borderCollapse: 'collapse',
          minWidth: '800px',
        }}>
          <thead>
            <tr style={{ 
              backgroundColor: '#f9fafb',
              borderBottom: '1px solid #e5e7eb',
            }}>
              {columns.map((column) => (
                <th 
                  key={column.key}
                  style={{ 
                    padding: '1rem 1.5rem',
                    textAlign: 'left',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    color: '#374151',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    cursor: column.sortable ? 'pointer' : 'default',
                    userSelect: 'none',
                  }}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.5rem',
                  }}>
                    {column.label}
                    {column.sortable && getSortIcon(column.key)}
                  </div>
                </th>
              ))}
              {actions && (
                <th style={{ 
                  padding: '1rem 1.5rem',
                  textAlign: 'right',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  color: '#374151',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  width: '80px',
                }}>
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr 
                key={row.id || index}
                style={{ 
                  borderBottom: '1px solid #f3f4f6',
                  transition: 'background-color 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f9fafb';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'white';
                }}
              >
                {columns.map((column) => (
                  <td 
                    key={column.key}
                    style={{ 
                      padding: '1rem 1.5rem',
                      fontSize: '0.875rem',
                      color: '#374151',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {renderCell(column, row)}
                  </td>
                ))}
                {actions && (
                  <td style={{ 
                    padding: '1rem 1.5rem',
                    textAlign: 'right',
                    position: 'relative',
                  }}>
                    <button
                      onClick={() => setActionMenu(actionMenu === row.id ? null : row.id)}
                      style={{
                        padding: '0.5rem',
                        border: 'none',
                        backgroundColor: 'transparent',
                        borderRadius: '0.375rem',
                        cursor: 'pointer',
                        color: '#6b7280',
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#f3f4f6';
                        e.currentTarget.style.color = '#374151';
                      }}
                    >
                      <MoreVertical size={16} />
                    </button>

                    {actionMenu === row.id && (
                      <div style={{
                        position: 'absolute',
                        right: '1.5rem',
                        top: '3.5rem',
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '0.5rem',
                        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                        zIndex: 10,
                        minWidth: '160px',
                      }}>
                        {actions.view && (
                          <button
                            onClick={() => {
                              actions.view?.(row);
                              setActionMenu(null);
                            }}
                            style={{
                              width: '100%',
                              padding: '0.75rem 1rem',
                              border: 'none',
                              backgroundColor: 'transparent',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem',
                              fontSize: '0.875rem',
                              color: '#374151',
                              cursor: 'pointer',
                              transition: 'background-color 0.2s',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#f9fafb';
                            }}
                          >
                            <Eye size={16} />
                            View
                          </button>
                        )}
                        {actions.edit && (
                          <button
                            onClick={() => {
                              actions.edit?.(row);
                              setActionMenu(null);
                            }}
                            style={{
                              width: '100%',
                              padding: '0.75rem 1rem',
                              border: 'none',
                              backgroundColor: 'transparent',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem',
                              fontSize: '0.875rem',
                              color: '#374151',
                              cursor: 'pointer',
                              transition: 'background-color 0.2s',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#f9fafb';
                            }}
                          >
                            <Edit size={16} />
                            Edit
                          </button>
                        )}
                        {actions.delete && (
                          <button
                            onClick={() => {
                              actions.delete?.(row);
                              setActionMenu(null);
                            }}
                            style={{
                              width: '100%',
                              padding: '0.75rem 1rem',
                              border: 'none',
                              backgroundColor: 'transparent',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem',
                              fontSize: '0.875rem',
                              color: '#ef4444',
                              cursor: 'pointer',
                              transition: 'background-color 0.2s',
                              borderTop: '1px solid #f3f4f6',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#fef2f2';
                            }}
                          >
                            <Trash2 size={16} />
                            Delete
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Empty State */}
      {data.length === 0 && (
        <div style={{
          padding: '3rem 1.5rem',
          textAlign: 'center',
          color: '#6b7280',
        }}>
          <p style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>No data found</p>
          <p style={{ fontSize: '0.875rem' }}>Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
}