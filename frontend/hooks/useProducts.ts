'use client';

import { useState, useEffect, useCallback } from 'react';
import { Product } from '@/types/product';
import { apiClient } from '@/lib/api';

interface UseProductsProps {
  category?: string;
  search?: string;
  filters?: any;
  featured?: boolean;
  page_size?: number;
}

interface UseProductsReturn {
  products: Product[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useProducts({ 
  category, 
  search, 
  filters 
}: UseProductsProps = {}): UseProductsReturn {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.getProducts({
        category,
        search,
        ...filters,
      });
      setProducts(data.results || data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  }, [category, search, filters]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return { products, loading, error, refetch: fetchProducts };
}