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
  category_id: string;
  subcategory_id?: string;
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
  price: number;
  discount_price: number | null;
  stock_quantity: number;
  is_new: boolean;
  is_best_seller: boolean;
  is_featured: boolean;
}

// Admin Product API
export const adminProductApi = {
  /**
   * Get all products (admin view) - full data
   */
  async getProducts(): Promise<AdminProductResponse[]> {
    const response = await adminFetch<ApiResponse<AdminProductResponse[]>>('/admin/products');
    return response.products || response.data || [];
  },

  /**
   * Get products list (minimal data for table view)
   */
  async getProductsList(): Promise<{ products: AdminProductListItem[]; total: number }> {
    const response = await adminFetch<{ success: boolean; products: AdminProductListItem[]; total: number }>('/admin/products/list');
    return {
      products: response.products || [],
      total: response.total || 0,
    };
  },

  /**
   * Get single product by ID
   */
  async getProduct(id: number): Promise<AdminProductResponse> {
    const response = await adminFetch<ApiResponse<AdminProductResponse>>(`/admin/products/${id}`);
    return response.product || response.data!;
  },

  /**
   * Create a new product
   */
  async createProduct(product: AdminProductPayload): Promise<AdminProductResponse> {
    const response = await adminFetch<ApiResponse<AdminProductResponse>>('/admin/products', {
      method: 'POST',
      body: JSON.stringify(product),
    });
    return response.product || response.data!;
  },

  /**
   * Update an existing product
   */
  async updateProduct(id: number, product: Partial<AdminProductPayload>): Promise<AdminProductResponse> {
    const response = await adminFetch<ApiResponse<AdminProductResponse>>(`/admin/products/${id}`, {
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

    const response = await adminFetch<ApiResponse<AdminProductResponse>>(`/admin/products/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
    return response.product || response.data!;
  },

  /**
   * Delete a product
   */
  async deleteProduct(id: number): Promise<void> {
    await adminFetch<ApiResponse<void>>(`/admin/products/${id}`, {
      method: 'DELETE',
    });
  },
};

export default adminProductApi;

