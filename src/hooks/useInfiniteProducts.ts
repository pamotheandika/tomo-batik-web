import { useState, useEffect, useCallback, useRef } from 'react';
import { productService } from '@/services/productService';
import type { Product, FilterState } from '@/types/product';

interface UseInfiniteProductsOptions {
  filters?: Partial<FilterState>;
  limit?: number;
  enabled?: boolean;
}

interface UseInfiniteProductsReturn {
  products: Product[];
  loading: boolean;
  loadingMore: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  reset: () => void;
  refetch: () => Promise<void>;
}

export function useInfiniteProducts(
  options: UseInfiniteProductsOptions = {}
): UseInfiniteProductsReturn {
  const { filters = {}, limit = 24, enabled = true } = options;
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const isInitialLoadRef = useRef(true);

  // Fetch products function
  const fetchProducts = useCallback(async (page: number, append = false) => {
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    if (page === 1) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
    setError(null);

    try {
      const response = await productService.getProducts(filters, page, limit);
      
      if (append) {
        setProducts(prev => [...prev, ...response.products]);
      } else {
        setProducts(response.products);
      }
      
      setCurrentPage(page);
      setTotalPages(response.totalPages);
      setHasMore(page < response.totalPages);
      
      isInitialLoadRef.current = false;
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return; // Request was cancelled
      }
      console.error('Failed to fetch products:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch products');
      if (!append) {
        setProducts([]);
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [filters, limit]);

  // Load more products
  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore || loading) return;
    
    const nextPage = currentPage + 1;
    await fetchProducts(nextPage, true);
  }, [currentPage, hasMore, loadingMore, loading, fetchProducts]);

  // Reset and refetch from page 1
  const reset = useCallback(() => {
    setProducts([]);
    setCurrentPage(1);
    setHasMore(true);
    setError(null);
    isInitialLoadRef.current = true;
  }, []);

  // Refetch current page
  const refetch = useCallback(async () => {
    await fetchProducts(currentPage, false);
  }, [currentPage, fetchProducts]);

  // Initial fetch
  useEffect(() => {
    if (enabled) {
      reset();
      fetchProducts(1, false);
    }
    
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [enabled]); // Only run on mount or when enabled changes

  // Refetch when filters change
  useEffect(() => {
    if (!isInitialLoadRef.current && enabled) {
      reset();
      fetchProducts(1, false);
    }
  }, [JSON.stringify(filters)]); // Refetch when filters change

  return {
    products,
    loading,
    loadingMore,
    error,
    hasMore,
    loadMore,
    reset,
    refetch,
  };
}

