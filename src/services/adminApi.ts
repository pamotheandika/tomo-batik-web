// Admin API Service for Product Management

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8181/api';
const ADMIN_TOKEN = import.meta.env.VITE_ADMIN_TOKEN || 'IZMfO2dBDyXpcpvBlGtsMn1CMIDF5rak';

// Admin API Error
export class AdminApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: unknown
  ) {
    super(message);
    this.name = 'AdminApiError';
  }
}

// Size with stock
export interface ProductSize {
  size: string;
  stock_quantity: number;
  is_available: boolean;
}

// Product image
export interface ProductImage {
  image_url: string;
  alt_text: string;
  is_primary: boolean;
  display_order: number;
}

// Product payload for create/update
export interface AdminProductPayload {
  name: string;
  slug: string;
  description: string;
  price: number;
  discount_price?: number | null;
  image_url: string;
  category_id: number;
  subcategory_id?: number;
  motif?: string;
  colors?: string[];
  is_single_size: boolean;
  is_new: boolean;
  is_best_seller: boolean;
  is_featured: boolean;
  stock_quantity: number;
  weight_grams?: number;
  sizes: ProductSize[];
  images?: ProductImage[];
}

// Product response from API
export interface AdminProductResponse {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  discount_price: number | null;
  image_url: string;
  category_id: string;
  category_name: string;
  subcategory_id: string;
  subcategory_name: string;
  motif: string;
  colors: string[];
  is_single_size: boolean;
  is_new: boolean;
  is_best_seller: boolean;
  is_featured: boolean;
  stock_quantity: number;
  weight_grams: number;
  available_sizes: string[];
  all_sizes: string[];
  created_at: string;
  updated_at: string;
}

// API Response wrapper
interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  product?: T;
  products?: T[];
}

// Generate slug from name
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

// Fetch wrapper with admin auth
async function adminFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${ADMIN_TOKEN}`,
    ...options.headers,
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new AdminApiError(
        data.message || 'An error occurred',
        response.status,
        data
      );
    }

    return data;
  } catch (error) {
    if (error instanceof AdminApiError) {
      throw error;
    }
    if (error instanceof TypeError) {
      throw new AdminApiError('Network error. Please check your connection.', 0);
    }
    throw new AdminApiError('An unexpected error occurred', 500);
  }
}

// Minimal product for list view
export interface AdminProductListItem {
  id: number;
  name: string;
  image_url: string;
  category_name: string;
  subcategory_name: string;
  price: number;
  discount_price: number | null;
  stock_quantity: number;
  is_new: boolean;
  is_best_seller: boolean;
  is_featured: boolean;
}

// Category and Subcategory types
export interface Subcategory {
  id: number;
  name: string;
  parentId: number;
  description?: string;
  display_order?: number;
  is_active?: boolean;
}

export interface SubcategoryPayload {
  name: string;
  category_id: number;
  description?: string;
  display_order?: number;
}

export interface Category {
  id: number;
  name: string;
  description: string;
  subcategories: Subcategory[];
}

export interface CategoriesResponse {
  data: Category[];
}

// Admin Product API
export const adminProductApi = {
  /**
   * Get all products (admin view) - full data
   */
  async getProducts(): Promise<AdminProductResponse[]> {
    const response = await adminFetch<{ success: boolean; products?: AdminProductResponse[]; data?: AdminProductResponse[] }>('/v1/admin/products');
    if (response.products && Array.isArray(response.products)) {
      return response.products;
    }
    if (response.data && Array.isArray(response.data)) {
      return response.data;
    }
    return [];
  },

  /**
   * Get products list (minimal data for table view)
   */
  async getProductsList(): Promise<{ products: AdminProductListItem[]; total: number }> {
    const response = await adminFetch<{ success: boolean; products: AdminProductListItem[]; total: number }>('/v1/admin/products/list');
    return {
      products: response.products || [],
      total: response.total || 0,
    };
  },

  /**
   * Get single product by ID
   */
  async getProduct(id: number): Promise<AdminProductResponse> {
    const response = await adminFetch<ApiResponse<AdminProductResponse>>(`/v1/admin/products/${id}`);
    return response.product || response.data!;
  },

  /**
   * Create a new product
   */
  async createProduct(product: AdminProductPayload): Promise<AdminProductResponse> {
    const response = await adminFetch<ApiResponse<AdminProductResponse>>('/v1/admin/products', {
      method: 'POST',
      body: JSON.stringify(product),
    });
    return response.product || response.data!;
  },

  /**
   * Update an existing product
   */
  async updateProduct(id: number, product: Partial<AdminProductPayload>): Promise<AdminProductResponse> {
    const response = await adminFetch<ApiResponse<AdminProductResponse>>(`/v1/admin/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(product),
    });
    return response.product || response.data!;
  },

  /**
   * Update product stock only
   */
  async updateStock(id: number, stockQuantity: number, sizes?: ProductSize[]): Promise<AdminProductResponse> {
    const payload: Partial<AdminProductPayload> = {
      stock_quantity: stockQuantity,
    };
    
    if (sizes) {
      payload.sizes = sizes;
    }

    const response = await adminFetch<ApiResponse<AdminProductResponse>>(`/v1/admin/products/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
    return response.product || response.data!;
  },

  /**
   * Delete a product
   */
  async deleteProduct(id: number): Promise<void> {
    await adminFetch<ApiResponse<void>>(`/v1/admin/products/${id}`, {
      method: 'DELETE',
    });
  },

  /**
   * Get all categories with subcategories
   */
  async getCategories(): Promise<Category[]> {
    const response = await adminFetch<CategoriesResponse>('/v1/categories');
    return response.data || [];
  },

  /**
   * Get all subcategories
   */
  async getSubcategories(): Promise<Subcategory[]> {
    const response = await adminFetch<{ data: Subcategory[] }>('/v1/admin/subcategories');
    return response.data || [];
  },

  /**
   * Get subcategories by category ID
   */
  async getSubcategoriesByCategory(categoryId: number): Promise<Subcategory[]> {
    const response = await adminFetch<{ data: Subcategory[] }>(`/v1/admin/subcategories?category_id=${categoryId}`);
    return response.data || [];
  },

  /**
   * Get single subcategory by ID
   */
  async getSubcategory(id: number): Promise<Subcategory> {
    const response = await adminFetch<{ data: Subcategory }>(`/v1/admin/subcategories/${id}`);
    return response.data;
  },

  /**
   * Create a new subcategory
   */
  async createSubcategory(subcategory: SubcategoryPayload): Promise<Subcategory> {
    const response = await adminFetch<{ data: Subcategory }>('/v1/admin/subcategories', {
      method: 'POST',
      body: JSON.stringify(subcategory),
    });
    return response.data;
  },

  /**
   * Update an existing subcategory
   */
  async updateSubcategory(id: number, subcategory: Partial<SubcategoryPayload>): Promise<Subcategory> {
    const response = await adminFetch<{ data: Subcategory }>(`/v1/admin/subcategories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(subcategory),
    });
    return response.data;
  },

  /**
   * Delete a subcategory
   */
  async deleteSubcategory(id: number): Promise<void> {
    await adminFetch<{ message: string }>(`/v1/admin/subcategories/${id}`, {
      method: 'DELETE',
    });
  },
};

export default adminProductApi;

