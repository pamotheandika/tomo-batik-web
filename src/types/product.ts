// Product Types - Matching API Response

// Product from API (snake_case)
export interface ApiProduct {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  discount_price: number | null;
  image_url: string;
  motif: string;
  is_single_size: boolean;
  is_new: boolean;
  is_best_seller: boolean;
  is_featured: boolean;
  stock_quantity: number;
  category_id: number | string; // API can return numeric IDs
  category_name: string;
  subcategory_id: number | string | null; // API can return numeric IDs or null
  subcategory_name: string | null;
  available_sizes: string[];
  all_sizes: string[];
  created_at: string;
  updated_at: string;
}

// Product for frontend use (camelCase) - transformed from API
export interface Product {
  id: number;
  name: string;
  slug: string;
  description?: string;
  price: number;
  discountPrice?: number | null;
  image: string;
  motif?: string;
  isSingleSize: boolean;
  isNew: boolean;
  isBestSeller: boolean;
  isFeatured: boolean;
  stock: number;
  category: string;
  categoryId: string;
  subcategory: string;
  subcategoryId: string;
  sizes: string[];        // Available sizes
  allSizes: string[];     // All sizes for display
  createdAt: string;
  updatedAt?: string;
}

// API Response for catalog endpoint
export interface CatalogApiResponse {
  products: ApiProduct[];
  total: number;
  page: number;
  limit: number;
  filters: {
    categories: Array<{
      id: number | string; // API returns numeric IDs
      name: string;
      product_count: number;
    }>;
    subcategories: Array<{
      id: number | string; // API returns numeric IDs
      category_id: number | string; // API returns numeric IDs
      name: string;
      product_count: number;
    }>;
    sizes: string[];
    price_range: {
      min: number;
      max: number;
    };
  };
}

// Transformed response for frontend use
export interface ProductsResponse {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  filters: {
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
  };
}

export interface ProductResponse {
  data: Product;
}

// Filter Types for API query params (matching backend)
export interface ProductFilters {
  category_id?: string;
  subcategory_id?: string;
  sizes?: string;
  min_price?: number;
  max_price?: number;
  search?: string;
  motif?: string;
  sort_by?: 'price_asc' | 'price_desc' | 'newest' | 'popular';
  is_new?: boolean;
  is_best_seller?: boolean;
  is_featured?: boolean;
  page?: number;
  limit?: number;
}

// Filter state for component (frontend friendly)
export interface FilterState {
  category: string[];
  subcategory: string[];
  size: string[];
  color: string[];
  priceRange: [number, number];
  search?: string;
  motif?: string;
  sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'popular';
  isNew?: boolean;
  isBestSeller?: boolean;
  isFeatured?: boolean;
}

// Available colors for filter
export const AVAILABLE_COLORS = [
  { id: 'brown', name: 'Brown', hex: '#8B4513' },
  { id: 'blue', name: 'Blue', hex: '#1E40AF' },
  { id: 'red', name: 'Red', hex: '#DC2626' },
  { id: 'green', name: 'Green', hex: '#166534' },
] as const;

export type ColorOption = typeof AVAILABLE_COLORS[number]['id'];

// Category Types
export interface Category {
  id: string;
  name: string;
  productCount?: number;
  subcategories: Subcategory[];
}

export interface Subcategory {
  id: string;
  name: string;
  parentId: string;
  productCount?: number;
}

export interface CategoriesResponse {
  data: Category[];
}

// All available sizes
export const ALL_SIZES = ["S", "M", "L", "XL", "XXL", "Custom"] as const;
export type Size = typeof ALL_SIZES[number];

/**
 * Transform Google Drive URLs to viewable thumbnail format
 * Converts: https://drive.google.com/uc?id=FILE_ID
 * To: https://drive.google.com/thumbnail?id=FILE_ID&sz=w800
 */
export function transformImageUrl(url: string): string {
  if (!url) return url;
  
  // Check if it's a Google Drive URL
  const driveUcMatch = url.match(/drive\.google\.com\/uc\?id=([a-zA-Z0-9_-]+)/);
  if (driveUcMatch) {
    const fileId = driveUcMatch[1];
    return `https://drive.google.com/thumbnail?id=${fileId}&sz=w800`;
  }
  
  // Check for other Google Drive URL formats
  const driveFileMatch = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (driveFileMatch) {
    const fileId = driveFileMatch[1];
    return `https://drive.google.com/thumbnail?id=${fileId}&sz=w800`;
  }
  
  // Return original URL if not a Google Drive URL
  return url;
}

// Helper function to transform API product to frontend Product
export function transformApiProduct(apiProduct: ApiProduct): Product {
  return {
    id: apiProduct.id,
    name: apiProduct.name,
    slug: apiProduct.slug,
    description: apiProduct.description || undefined,
    price: apiProduct.price,
    discountPrice: apiProduct.discount_price,
    image: transformImageUrl(apiProduct.image_url),
    motif: apiProduct.motif || undefined,
    isSingleSize: apiProduct.is_single_size,
    isNew: apiProduct.is_new,
    isBestSeller: apiProduct.is_best_seller,
    isFeatured: apiProduct.is_featured,
    stock: apiProduct.stock_quantity,
    category: apiProduct.category_name,
    categoryId: String(apiProduct.category_id), // Convert to string for frontend
    subcategory: apiProduct.subcategory_name || '',
    subcategoryId: apiProduct.subcategory_id ? String(apiProduct.subcategory_id) : '',
    sizes: apiProduct.available_sizes,
    allSizes: apiProduct.all_sizes,
    createdAt: apiProduct.created_at,
    updatedAt: apiProduct.updated_at,
  };
}

// Helper function to transform API response
export function transformCatalogResponse(apiResponse: CatalogApiResponse): ProductsResponse {
  return {
    products: apiResponse.products.map(transformApiProduct),
    total: apiResponse.total,
    page: apiResponse.page,
    limit: apiResponse.limit,
    totalPages: Math.ceil(apiResponse.total / apiResponse.limit),
    filters: {
      categories: apiResponse.filters.categories.map(c => ({
        id: String(c.id), // Convert to string for frontend
        name: c.name,
        productCount: c.product_count,
      })),
      subcategories: apiResponse.filters.subcategories.map(s => ({
        id: String(s.id), // Convert to string for frontend
        categoryId: String(s.category_id), // Convert to string for frontend
        name: s.name,
        productCount: s.product_count,
      })),
      sizes: apiResponse.filters.sizes,
      priceRange: {
        min: apiResponse.filters.price_range.min,
        max: apiResponse.filters.price_range.max,
      },
    },
  };
}
