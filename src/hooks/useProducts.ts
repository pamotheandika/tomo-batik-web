import { useState, useEffect, useCallback, useRef } from 'react';
import api from '@/services/api';
import type { 
  Product, 
  FilterState,
  CatalogApiResponse,
} from '@/types/product';
import { transformApiProduct } from '@/types/product';
import { categorySlugsToIds, subcategorySlugsToIds } from '@/utils/categoryMapping';

// Configuration
const DEBOUNCE_DELAY = 300;

interface UseProductsOptions {
  initialFilters?: Partial<FilterState>;
  autoFetch?: boolean;
}

interface FiltersData {
  categories: Array<{
    id: string;
    name: string;
    productCount: number;
  }>;
  subcategories: Array<{
    id: string;
    categoryId: string;
    name: string;
    productCount: number;
  }>;
  sizes: string[];
  priceRange: {
    min: number;
    max: number;
  };
}

interface UseProductsReturn {
  products: Product[];
  loading: boolean;
  error: string | null;
  totalProducts: number;
  currentPage: number;
  totalPages: number;
  filtersData: FiltersData | null;
  refetch: () => Promise<void>;
  fetchProducts: (filters?: Partial<FilterState>) => Promise<void>;
}

// Build query string from filter state - matching backend API
function buildQueryString(filters: Partial<FilterState>): string {
  const params = new URLSearchParams();

  // category_id (convert slugs to numeric IDs)
  if (filters.category?.length) {
    const categoryIds = categorySlugsToIds(filters.category);
    if (categoryIds.length > 0) {
      params.append('category_id', categoryIds.join(','));
    }
  }

  // subcategory_id (convert slugs to numeric IDs)
  if (filters.subcategory?.length) {
    const subcategoryIds = subcategorySlugsToIds(filters.subcategory);
    if (subcategoryIds.length > 0) {
      params.append('subcategory_id', subcategoryIds.join(','));
    }
  }

  // sizes (comma-separated)
  if (filters.size?.length) {
    params.append('sizes', filters.size.join(','));
  }

  // colors (comma-separated)
  if (filters.color?.length) {
    params.append('colors', filters.color.join(','));
  }

  // min_price
  if (filters.priceRange && filters.priceRange[0] > 0) {
    params.append('min_price', filters.priceRange[0].toString());
  }

  // max_price
  if (filters.priceRange && filters.priceRange[1] < 10000000) {
    params.append('max_price', filters.priceRange[1].toString());
  }

  // search
  if (filters.search) {
    params.append('search', filters.search);
  }

  // motif
  if (filters.motif) {
    params.append('motif', filters.motif);
  }

  // sort_by
  if (filters.sortBy) {
    params.append('sort_by', filters.sortBy);
  }

  // is_new
  if (filters.isNew) {
    params.append('is_new', 'true');
  }

  // is_best_seller
  if (filters.isBestSeller) {
    params.append('is_best_seller', 'true');
  }

  // is_featured
  if (filters.isFeatured) {
    params.append('is_featured', 'true');
  }

  return params.toString();
}

export function useProducts(options: UseProductsOptions = {}): UseProductsReturn {
  const { initialFilters, autoFetch = true } = options;
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalProducts, setTotalProducts] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filtersData, setFiltersData] = useState<FiltersData | null>(null);
  
  const filtersRef = useRef(initialFilters);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Fetch products function
  const fetchProducts = useCallback(async (filters?: Partial<FilterState>) => {
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setLoading(true);
    setError(null);

    try {
      // Build query string with page and limit
      const filterParams = filters ? buildQueryString(filters) : '';
      const baseParams = 'page=1&limit=24';
      const endpoint = `/v1/catalog?${baseParams}${filterParams ? `&${filterParams}` : ''}`;
      
      // Debug: Log filters and endpoint
      if (filters?.category?.length) {
        console.log('🔍 Filter Debug:', {
          categorySlugs: filters.category,
          categoryIds: categorySlugsToIds(filters.category),
          endpoint
        });
      }
      
      // Make API call
      const response = await api.get<CatalogApiResponse>(endpoint);
      
      // Debug: Log response
      console.log('📦 API Response:', {
        total: response.total,
        productsCount: response.products?.length || 0,
        page: response.page,
        limit: response.limit,
        hasFilters: !!response.filters,
        categoryCount: response.filters?.categories?.length || 0
      });
      
      // Transform API response to frontend format
      const transformedProducts = response.products.map(transformApiProduct);
      
      setProducts(transformedProducts);
      setTotalProducts(response.total);
      setCurrentPage(response.page);
      setTotalPages(Math.ceil(response.total / response.limit));
      
      // Transform and set filters data
      if (response.filters) {
        setFiltersData({
          categories: response.filters.categories.map(c => ({
            id: c.id,
            name: c.name,
            productCount: c.product_count,
          })),
          subcategories: response.filters.subcategories.map(s => ({
            id: s.id,
            categoryId: s.category_id,
            name: s.name,
            productCount: s.product_count,
          })),
          sizes: response.filters.sizes,
          priceRange: {
            min: response.filters.price_range.min,
            max: response.filters.price_range.max,
          },
        });
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return; // Request was cancelled
      }
      console.error('Failed to fetch products:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch products');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Refetch with current filters
  const refetch = useCallback(async () => {
    await fetchProducts(filtersRef.current);
  }, [fetchProducts]);

  // Auto fetch on mount
  useEffect(() => {
    if (autoFetch) {
      fetchProducts(initialFilters);
    }
    
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [autoFetch, fetchProducts, initialFilters]);

  return {
    products,
    loading,
    error,
    totalProducts,
    currentPage,
    totalPages,
    filtersData,
    refetch,
    fetchProducts,
  };
}

// Hook for fetching a single product
interface UseProductReturn {
  product: Product | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useProduct(id: number): UseProductReturn {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProduct = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get<{ product: import('@/types/product').ApiProduct }>(`/products/${id}`);
      setProduct(transformApiProduct(response.product));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch product');
      setProduct(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id, fetchProduct]);

  return {
    product,
    loading,
    error,
    refetch: fetchProduct,
  };
}

// Debounce hook for search
export function useDebouncedValue<T>(value: T, delay: number = DEBOUNCE_DELAY): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default useProducts;
