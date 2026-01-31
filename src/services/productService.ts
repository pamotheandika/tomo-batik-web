import api from './api';
import type { 
  Product,
  FilterState,
  CatalogApiResponse,
  ProductsResponse,
  Category 
} from '@/types/product';
import { transformApiProduct } from '@/types/product';

// Build query string from filters - matching backend API
function buildQueryString(filters: Partial<FilterState>): string {
  const params = new URLSearchParams();

  // category_id (string slug)
  if (filters.category?.length) {
    params.append('category_id', filters.category.join(','));
  }

  // subcategory_id (string slug)
  if (filters.subcategory?.length) {
    params.append('subcategory_id', filters.subcategory.join(','));
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

// Product Service
export const productService = {
  /**
   * Get all products with optional filters (catalog endpoint)
   */
  async getProducts(filters?: Partial<FilterState>, page = 1, limit = 24): Promise<ProductsResponse> {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    
    if (filters) {
      const filterString = buildQueryString(filters);
      if (filterString) {
        const filterParams = new URLSearchParams(filterString);
        filterParams.forEach((value, key) => {
          params.append(key, value);
        });
      }
    }
    
    const endpoint = `/catalog?${params.toString()}`;
    const response = await api.get<CatalogApiResponse>(endpoint);
    
    // Transform API response
    return {
      products: response.products.map(transformApiProduct),
      total: response.total,
      page: response.page,
      limit: response.limit,
      totalPages: Math.ceil(response.total / response.limit),
      filters: {
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
      },
    };
  },

  /**
   * Get a single product by ID
   */
  async getProductById(id: number): Promise<{ data: Product }> {
    interface ProductApiResponse {
      product: import('@/types/product').ApiProduct;
    }
    const response = await api.get<ProductApiResponse>(`/products/${id}`);
    return { data: transformApiProduct(response.product) };
  },

  /**
   * Get products by category
   */
  async getProductsByCategory(category: string): Promise<ProductsResponse> {
    return this.getProducts({ category: [category] });
  },

  /**
   * Get products by subcategory
   */
  async getProductsBySubcategory(subcategory: string): Promise<ProductsResponse> {
    return this.getProducts({ subcategory: [subcategory] });
  },

  /**
   * Search products
   */
  async searchProducts(query: string): Promise<ProductsResponse> {
    return this.getProducts({ search: query });
  },

  /**
   * Get featured/best seller products
   */
  async getFeaturedProducts(): Promise<{ data: Product[] }> {
    const response = await api.get<CatalogApiResponse>('/catalog?is_featured=true&limit=8');
    return { data: response.products.map(transformApiProduct) };
  },

  /**
   * Get new arrival products
   */
  async getNewArrivals(): Promise<{ data: Product[] }> {
    const response = await api.get<CatalogApiResponse>('/catalog?is_new=true&sort_by=newest&limit=8');
    return { data: response.products.map(transformApiProduct) };
  },

  /**
   * Get best seller products
   */
  async getBestSellers(): Promise<{ data: Product[] }> {
    const response = await api.get<CatalogApiResponse>('/catalog?is_best_seller=true&limit=8');
    return { data: response.products.map(transformApiProduct) };
  },

  /**
   * Get related products
   */
  async getRelatedProducts(productId: number, categoryId: string): Promise<{ data: Product[] }> {
    const response = await api.get<CatalogApiResponse>(`/catalog?category_id=${categoryId}&limit=4`);
    // Filter out the current product
    const related = response.products
      .filter(p => p.id !== productId)
      .slice(0, 4)
      .map(transformApiProduct);
    return { data: related };
  },

  /**
   * Get all categories with subcategories
   */
  async getCategories(): Promise<{ data: Category[] }> {
    // Get categories from the catalog filters
    const response = await api.get<CatalogApiResponse>('/catalog?limit=1');
    
    // Build categories from filters
    const categories: Category[] = response.filters.categories.map(cat => ({
      id: cat.id,
      name: cat.name,
      productCount: cat.product_count,
      subcategories: response.filters.subcategories
        .filter(sub => sub.category_id === cat.id)
        .map(sub => ({
          id: sub.id,
          name: sub.name,
          parentId: sub.category_id,
          productCount: sub.product_count,
        })),
    }));
    
    return { data: categories };
  },
};

export default productService;
