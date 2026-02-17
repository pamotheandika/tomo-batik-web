// Base API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8181/api';

// Request timeout in milliseconds
const REQUEST_TIMEOUT = 10000;

// Custom error class for API errors
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Request options type
interface RequestOptions extends RequestInit {
  timeout?: number;
}

// Create a fetch wrapper with timeout and error handling
async function fetchWithTimeout(
  url: string,
  options: RequestOptions = {}
): Promise<Response> {
  const { timeout = REQUEST_TIMEOUT, ...fetchOptions } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new ApiError('Request timeout', 408);
    }
    throw error;
  }
}

// Generic API request function
async function apiRequest<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
  };

  // Add auth token if available
  const token = localStorage.getItem('auth_token');
  if (token) {
    (defaultHeaders as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const config: RequestOptions = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetchWithTimeout(url, config);

    // Handle non-OK responses
    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = { message: response.statusText };
      }
      throw new ApiError(
        errorData.message || 'An error occurred',
        response.status,
        errorData
      );
    }

    // Handle empty responses
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return {} as T;
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    if (error instanceof TypeError) {
      throw new ApiError('Network error. Please check your connection.', 0);
    }
    throw new ApiError('An unexpected error occurred', 500);
  }
}

// HTTP method helpers
export const api = {
  get: <T>(endpoint: string, options?: RequestOptions) =>
    apiRequest<T>(endpoint, { ...options, method: 'GET' }),

  post: <T>(endpoint: string, data?: unknown, options?: RequestOptions) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    }),

  put: <T>(endpoint: string, data?: unknown, options?: RequestOptions) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    }),

  patch: <T>(endpoint: string, data?: unknown, options?: RequestOptions) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    }),

  delete: <T>(endpoint: string, options?: RequestOptions) =>
    apiRequest<T>(endpoint, { ...options, method: 'DELETE' }),
};

// Checkout API Types
export interface CheckoutItem {
  id: number;
  name: string;
  category: string;
  price: number;
  image: string;
  size: string;
  quantity: number;
}

export interface CheckoutRequest {
  customer: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    province: string;
    postalCode: string;
    notes?: string;
  };
  shipping: {
    courier: string;
    service: string;
    duration: string;
    cost: number;
  };
  payment: {
    method: string;
  };
  items: CheckoutItem[];
  subtotal: number;
  total: number;
}

export interface CheckoutResponse {
  success: boolean;
  message: string;
  data: {
    orderId: string;
    orderNumber: string;
    status: string;
    customer: CheckoutRequest['customer'];
    shipping: CheckoutRequest['shipping'] & {
      estimatedDelivery?: string;
    };
    payment: {
      method: string;
      methodName: string;
      status: string;
      bankDetails?: {
        bankName: string;
        accountNumber: string;
        accountName: string;
      };
    };
    items: (CheckoutItem & { totalPrice: number })[];
    subtotal: number;
    shippingCost: number;
    total: number;
    orderDate: string;
    createdAt: string;
  };
}

// Checkout API - uses direct URL (not under /api)
const CHECKOUT_URL = import.meta.env.VITE_CHECKOUT_URL || 'http://localhost:8181/api/v1/checkout';

export async function placeOrder(data: CheckoutRequest): Promise<CheckoutResponse> {
  try {
    const response = await fetchWithTimeout(CHECKOUT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = { message: response.statusText };
      }
      throw new ApiError(
        errorData.message || 'Failed to place order',
        response.status,
        errorData
      );
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    if (error instanceof TypeError) {
      throw new ApiError('Network error. Please check your connection.', 0);
    }
    throw new ApiError('An unexpected error occurred while placing order', 500);
  }
}

// Order Details Response Type
export interface OrderDetails {
  orderId: string;
  orderNumber: string;
  status: 'pending' | 'awaiting_payment' | 'payment_confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  customer: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    postalCode: string;
    notes?: string;
  };
  shipping: {
    courier: string;
    service: string;
    duration: string;
    cost: number;
    trackingNumber?: string;
    estimatedDelivery?: string;
  };
  payment: {
    method: string;
    methodName: string;
    status: 'pending' | 'paid' | 'failed' | 'expired';
    bankDetails?: {
      bankName: string;
      accountNumber: string;
      accountName: string;
    };
    paidAt?: string;
  };
  items: {
    id: number;
    name: string;
    category: string;
    price: number;
    image: string;
    size: string;
    quantity: number;
    totalPrice: number;
  }[];
  subtotal: number;
  shippingCost: number;
  discount?: number;
  total: number;
  orderDate: string;
  createdAt: string;
  updatedAt?: string;
  guestToken?: string;
}

export interface OrderLookupResponse {
  success: boolean;
  message?: string;
  data: OrderDetails;
}

export interface TrackOrderRequest {
  orderCode: string;
  email: string;
}

// Get order by order code and guest token (for URL-based access)
const ORDER_API_URL = import.meta.env.VITE_ORDER_API_URL || 'http://localhost:8181/api/v1';

export async function getOrderByToken(orderCode: string, token: string): Promise<OrderLookupResponse> {
  try {
    const response = await fetchWithTimeout(`${ORDER_API_URL}/orders/${orderCode}?token=${token}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = { message: response.statusText };
      }
      throw new ApiError(
        errorData.message || 'Order not found',
        response.status,
        errorData
      );
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    if (error instanceof TypeError) {
      throw new ApiError('Network error. Please check your connection.', 0);
    }
    throw new ApiError('Failed to fetch order details', 500);
  }
}

// Track order by order code and email (for guest verification)
export async function trackOrderByEmail(orderCode: string, email: string): Promise<OrderLookupResponse> {
  try {
    const response = await fetchWithTimeout(`${ORDER_API_URL}/orders/track`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ orderCode, email }),
    });

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = { message: response.statusText };
      }
      throw new ApiError(
        errorData.message || 'Order not found or email does not match',
        response.status,
        errorData
      );
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    if (error instanceof TypeError) {
      throw new ApiError('Network error. Please check your connection.', 0);
    }
    throw new ApiError('Failed to track order', 500);
  }
}

// Confirm payment for an order
export async function confirmOrderPayment(orderCode: string, token: string): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetchWithTimeout(`${ORDER_API_URL}/orders/${orderCode}/confirm-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    });

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = { message: response.statusText };
      }
      throw new ApiError(
        errorData.message || 'Failed to confirm payment',
        response.status,
        errorData
      );
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Failed to confirm payment', 500);
  }
}

export default api;

