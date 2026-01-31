/**
 * API Contract Types
 * 
 * This file defines all TypeScript interfaces for the API contract.
 * These types should be used by both frontend and backend.
 */

// ============================================
// COMMON TYPES
// ============================================

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface ApiError {
  message: string;
  error?: string;
  details?: Record<string, unknown>;
}

// ============================================
// PRODUCT TYPES
// ============================================

export type Size = 'S' | 'M' | 'L' | 'XL' | 'XXL' | 'Custom';

export interface SizeInfo {
  size: Size;
  stock: number;
  isAvailable: boolean;
}

export interface ProductImage {
  url: string;
  alt?: string;
  isPrimary: boolean;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  description?: string;
  category: string;
  categoryId?: string;
  subcategory: string;
  subcategoryId?: string;
  price: number;
  discountPrice?: number | null;
  image: string;
  images?: ProductImage[];
  sizes: Size[] | SizeInfo[];
  motif?: string | null;
  isSingleSize: boolean;
  isNew: boolean;
  isBestSeller: boolean;
  stock?: number;
  weight?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface ProductListItem {
  id: number;
  name: string;
  slug: string;
  description?: string;
  category: string;
  subcategory: string;
  price: number;
  discountPrice?: number | null;
  image: string;
  sizes: Size[];
  motif?: string | null;
  isSingleSize: boolean;
  isNew: boolean;
  isBestSeller: boolean;
  stock?: number;
  createdAt: string;
}

export interface ProductDetail extends Product {
  categoryId: string;
  subcategoryId: string;
  images: ProductImage[];
  sizes: SizeInfo[];
  weight: number;
  updatedAt: string;
}

// Product Filter Parameters
export interface ProductFilters {
  category?: string;
  subcategory?: string;
  size?: string;        // Comma-separated: "S,M,L"
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'popular';
  page?: number;
  limit?: number;
}

// ============================================
// CATEGORY TYPES
// ============================================

export interface Subcategory {
  id: string;
  name: string;
  parentId: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  image?: string;
  subcategories: Subcategory[];
  productCount?: number;
}

// ============================================
// CART TYPES
// ============================================

export interface CartItem {
  id: number;
  productId: number;
  name: string;
  image: string;
  category: string;
  subcategory: string;
  size: Size;
  quantity: number;
  price: number;
  totalPrice: number;
  stock: number;
  isAvailable: boolean;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  itemCount: number;
}

export interface AddToCartRequest {
  productId: number;
  size: Size;
  quantity: number;
}

export interface UpdateCartRequest {
  quantity: number;
}

// ============================================
// ORDER TYPES
// ============================================

export type OrderStatus =
  | 'pending'
  | 'awaiting_payment'
  | 'payment_confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export type PaymentMethod = 'bank_transfer' | 'e_wallet' | 'credit_card';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export type ShippingProvider = 'JNT' | 'JNE' | 'TIKI';

export interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
}

export interface ShippingInfo {
  address: string;
  city: string;
  province: string;
  postalCode: string;
  provider: ShippingProvider;
  service?: string;
  cost?: number;
  trackingNumber?: string | null;
  estimatedDelivery?: string;
}

export interface PaymentInfo {
  method: PaymentMethod;
  status?: PaymentStatus;
  bankDetails?: {
    bankName: string;
    accountNumber: string;
    accountName: string;
  };
}

export interface OrderItem {
  productId: number;
  name: string;
  image: string;
  size: Size;
  quantity: number;
  price: number;
  total: number;
}

export interface OrderStatusHistory {
  status: OrderStatus;
  timestamp: string;
  notes?: string;
}

// Create Order Request
export interface CreateOrderRequest {
  customer: CustomerInfo;
  shipping: {
    address: string;
    city: string;
    province: string;
    postalCode: string;
    provider: ShippingProvider;
    service: string;
  };
  payment: {
    method: PaymentMethod;
  };
  items: {
    productId: number;
    size: Size;
    quantity: number;
  }[];
  promoCode?: string;
  notes?: string;
}

// Order Response
export interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  paymentStatus?: PaymentStatus;
  customer: CustomerInfo;
  shipping: ShippingInfo;
  payment: PaymentInfo;
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  discount: number;
  total: number;
  promoCode?: string;
  notes?: string;
  statusHistory?: OrderStatusHistory[];
  createdAt: string;
  updatedAt?: string;
}

// Order List Item (for My Orders)
export interface OrderListItem {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  total: number;
  itemCount: number;
  firstItemImage: string;
  createdAt: string;
}

// Confirm Payment Request
export interface ConfirmPaymentRequest {
  paymentProofUrl?: string;
}

// ============================================
// AUTH TYPES
// ============================================

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  provider: 'google' | 'facebook' | 'email';
  phone?: string;
  createdAt?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  expiresIn: number;
}

export interface GoogleAuthRequest {
  token: string;  // Google ID token
}

export interface FacebookAuthRequest {
  accessToken: string;  // Facebook access token
}

// ============================================
// PROMO CODE TYPES
// ============================================

export type DiscountType = 'percentage' | 'fixed';

export interface PromoCode {
  code: string;
  description: string;
  discountType: DiscountType;
  discountValue: number;
  minOrderAmount: number;
  maxDiscountAmount?: number;
}

export interface ValidatePromoRequest {
  code: string;
  orderAmount: number;
}

export interface ValidatePromoResponse {
  valid: boolean;
  code?: string;
  description?: string;
  discountType?: DiscountType;
  discountValue?: number;
  discountAmount?: number;
  minOrderAmount?: number;
  reason?: 'INVALID' | 'EXPIRED' | 'LIMIT_REACHED' | 'MIN_ORDER_NOT_MET';
}

// ============================================
// WISHLIST TYPES
// ============================================

export interface WishlistItem {
  id: number;
  productId: number;
  name: string;
  price: number;
  image: string;
  category: string;
  sizes: Size[];
  createdAt: string;
}

// ============================================
// ADDRESS TYPES
// ============================================

export interface UserAddress {
  id: string;
  label: string;  // 'Home', 'Office', etc.
  recipientName: string;
  phone: string;
  addressLine: string;
  city: string;
  province: string;
  postalCode: string;
  isDefault: boolean;
}

export interface CreateAddressRequest {
  label?: string;
  recipientName: string;
  phone: string;
  addressLine: string;
  city: string;
  province: string;
  postalCode: string;
  isDefault?: boolean;
}

// ============================================
// API ENDPOINT TYPES
// ============================================

// Type-safe endpoint definitions
export interface ApiEndpoints {
  // Products
  'GET /api/products': {
    query: ProductFilters;
    response: PaginatedResponse<ProductListItem>;
  };
  'GET /api/products/:id': {
    params: { id: number };
    response: ApiResponse<ProductDetail>;
  };
  'GET /api/products/featured': {
    response: ApiResponse<ProductListItem[]>;
  };
  'GET /api/products/new-arrivals': {
    response: ApiResponse<ProductListItem[]>;
  };
  'GET /api/products/:id/related': {
    params: { id: number };
    response: ApiResponse<ProductListItem[]>;
  };

  // Categories
  'GET /api/categories': {
    response: ApiResponse<Category[]>;
  };
  'GET /api/categories/:id': {
    params: { id: string };
    response: ApiResponse<Category>;
  };

  // Cart
  'GET /api/cart': {
    response: ApiResponse<Cart>;
  };
  'POST /api/cart': {
    body: AddToCartRequest;
    response: ApiResponse<CartItem>;
  };
  'PUT /api/cart/:id': {
    params: { id: number };
    body: UpdateCartRequest;
    response: ApiResponse<CartItem>;
  };
  'DELETE /api/cart/:id': {
    params: { id: number };
    response: { message: string };
  };
  'DELETE /api/cart': {
    response: { message: string };
  };

  // Orders
  'POST /api/orders': {
    body: CreateOrderRequest;
    response: ApiResponse<Order>;
  };
  'GET /api/orders/:orderNumber': {
    params: { orderNumber: string };
    response: ApiResponse<Order>;
  };
  'GET /api/orders/my-orders': {
    query: { page?: number; limit?: number };
    response: PaginatedResponse<OrderListItem>;
  };
  'POST /api/orders/:orderNumber/confirm-payment': {
    params: { orderNumber: string };
    body: ConfirmPaymentRequest;
    response: { message: string; data: { orderNumber: string; status: OrderStatus } };
  };

  // Auth
  'POST /api/auth/google': {
    body: GoogleAuthRequest;
    response: ApiResponse<AuthResponse>;
  };
  'POST /api/auth/facebook': {
    body: FacebookAuthRequest;
    response: ApiResponse<AuthResponse>;
  };
  'GET /api/auth/me': {
    response: ApiResponse<User>;
  };
  'POST /api/auth/logout': {
    response: { message: string };
  };

  // Promo
  'POST /api/promo/validate': {
    body: ValidatePromoRequest;
    response: ApiResponse<ValidatePromoResponse>;
  };

  // Wishlist
  'GET /api/wishlist': {
    response: ApiResponse<WishlistItem[]>;
  };
  'POST /api/wishlist': {
    body: { productId: number };
    response: ApiResponse<WishlistItem>;
  };
  'DELETE /api/wishlist/:productId': {
    params: { productId: number };
    response: { message: string };
  };

  // Addresses
  'GET /api/addresses': {
    response: ApiResponse<UserAddress[]>;
  };
  'POST /api/addresses': {
    body: CreateAddressRequest;
    response: ApiResponse<UserAddress>;
  };
  'PUT /api/addresses/:id': {
    params: { id: string };
    body: Partial<CreateAddressRequest>;
    response: ApiResponse<UserAddress>;
  };
  'DELETE /api/addresses/:id': {
    params: { id: string };
    response: { message: string };
  };
}

