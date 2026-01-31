# Tomo Batik Indonesia - API Contract

This document defines the API contract that the backend must implement to integrate with the frontend catalog.

**Base URL:** `http://localhost:3001/api` (development)  
**Content-Type:** `application/json`

---

## Table of Contents

1. [Products API](#products-api)
2. [Categories API](#categories-api)
3. [Cart API](#cart-api)
4. [Orders API](#orders-api)
5. [Auth API](#auth-api)
6. [Promo Codes API](#promo-codes-api)
7. [Data Types](#data-types)
8. [Error Responses](#error-responses)

---

## Products API

### GET /api/products

Get all products with filtering, sorting, and pagination.

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `category` | string | No | Filter by category ID (e.g., `batik-tulis`, `ready-to-wear`) |
| `subcategory` | string | No | Filter by subcategory ID (e.g., `katun`, `sutra`, `batik-tulis-sutra`, `batik-casual`) |
| `size` | string | No | Comma-separated sizes (e.g., `S,M,L`) |
| `minPrice` | number | No | Minimum price filter |
| `maxPrice` | number | No | Maximum price filter |
| `search` | string | No | Search term for name, description, motif |
| `sortBy` | string | No | Sort option: `price_asc`, `price_desc`, `newest`, `popular` |
| `page` | number | No | Page number (default: 1) |
| `limit` | number | No | Items per page (default: 12) |

**Request Example:**
```
GET /api/products?category=batik-tulis&subcategory=sutra&minPrice=500000&maxPrice=2000000&size=M,L&sortBy=price_asc&page=1&limit=12
```

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": 1,
      "name": "Premium Batik Tulis Katun",
      "slug": "premium-batik-tulis-katun",
      "description": "Hand-drawn batik on premium cotton fabric",
      "category": "Batik Tulis",
      "subcategory": "Katun",
      "price": 850000,
      "discountPrice": null,
      "image": "https://example.com/image.jpg",
      "sizes": ["S", "M", "L", "XL", "Custom"],
      "motif": null,
      "isSingleSize": false,
      "isNew": true,
      "isBestSeller": false,
      "stock": 50,
      "createdAt": "2024-01-15T10:30:00Z"
    },
    {
      "id": 7,
      "name": "Parang Rusak Motif",
      "slug": "parang-rusak-motif",
      "description": "One-of-a-kind ready-to-wear batik",
      "category": "Ready To Wear",
      "subcategory": "Batik Tulis/Sutra",
      "price": 950000,
      "discountPrice": null,
      "image": "https://example.com/image2.jpg",
      "sizes": ["M"],
      "motif": "Parang Rusak",
      "isSingleSize": true,
      "isNew": false,
      "isBestSeller": false,
      "stock": 1,
      "createdAt": "2024-01-10T08:00:00Z"
    }
  ],
  "meta": {
    "total": 50,
    "page": 1,
    "limit": 12,
    "totalPages": 5
  }
}
```

---

### GET /api/products/:id

Get a single product by ID with full details.

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | number | Yes | Product ID |

**Request Example:**
```
GET /api/products/1
```

**Response (200 OK):**
```json
{
  "data": {
    "id": 1,
    "name": "Premium Batik Tulis Katun",
    "slug": "premium-batik-tulis-katun",
    "description": "Hand-drawn batik on premium cotton fabric using traditional techniques passed down through generations.",
    "category": "Batik Tulis",
    "categoryId": "batik-tulis",
    "subcategory": "Katun",
    "subcategoryId": "katun",
    "price": 850000,
    "discountPrice": null,
    "image": "https://example.com/image.jpg",
    "images": [
      {
        "url": "https://example.com/image.jpg",
        "alt": "Front view",
        "isPrimary": true
      },
      {
        "url": "https://example.com/image2.jpg",
        "alt": "Back view",
        "isPrimary": false
      }
    ],
    "sizes": [
      { "size": "S", "stock": 8, "isAvailable": true },
      { "size": "M", "stock": 15, "isAvailable": true },
      { "size": "L", "stock": 15, "isAvailable": true },
      { "size": "XL", "stock": 10, "isAvailable": true },
      { "size": "XXL", "stock": 0, "isAvailable": false },
      { "size": "Custom", "stock": 3, "isAvailable": true }
    ],
    "motif": null,
    "isSingleSize": false,
    "isNew": true,
    "isBestSeller": false,
    "stock": 51,
    "weight": 500,
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-20T14:00:00Z"
  }
}
```

**Response (404 Not Found):**
```json
{
  "message": "Product not found"
}
```

---

### GET /api/products/featured

Get featured/best seller products.

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": 4,
      "name": "Elegant Batik Tulis Sutra",
      "slug": "elegant-batik-tulis-sutra",
      "category": "Batik Tulis",
      "subcategory": "Sutra",
      "price": 1500000,
      "image": "https://example.com/image.jpg",
      "sizes": ["M", "L", "XL", "Custom"],
      "isNew": false,
      "isBestSeller": true
    }
  ]
}
```

---

### GET /api/products/new-arrivals

Get new arrival products.

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": 1,
      "name": "Premium Batik Tulis Katun",
      "slug": "premium-batik-tulis-katun",
      "category": "Batik Tulis",
      "subcategory": "Katun",
      "price": 850000,
      "image": "https://example.com/image.jpg",
      "sizes": ["S", "M", "L", "XL", "Custom"],
      "isNew": true,
      "isBestSeller": false
    }
  ]
}
```

---

### GET /api/products/:id/related

Get related products (same category).

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | number | Yes | Product ID |

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": 2,
      "name": "Classic Batik Tulis Katun",
      "slug": "classic-batik-tulis-katun",
      "subcategory": "Katun",
      "price": 750000,
      "image": "https://example.com/image.jpg",
      "sizes": ["M", "L", "XL", "Custom"]
    }
  ]
}
```

---

## Categories API

### GET /api/categories

Get all categories with subcategories.

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": "batik-tulis",
      "name": "Batik Tulis",
      "description": "Premium hand-drawn batik with traditional techniques",
      "image": "https://example.com/category1.jpg",
      "subcategories": [
        {
          "id": "katun",
          "name": "Katun",
          "parentId": "batik-tulis"
        },
        {
          "id": "sutra",
          "name": "Sutra",
          "parentId": "batik-tulis"
        }
      ]
    },
    {
      "id": "ready-to-wear",
      "name": "Ready To Wear",
      "description": "Ready-to-wear batik clothing collection",
      "image": "https://example.com/category2.jpg",
      "subcategories": [
        {
          "id": "batik-tulis-sutra",
          "name": "Batik Tulis/Sutra",
          "parentId": "ready-to-wear"
        },
        {
          "id": "batik-casual",
          "name": "Batik Casual",
          "parentId": "ready-to-wear"
        }
      ]
    }
  ]
}
```

---

### GET /api/categories/:id

Get a single category by ID.

**Response (200 OK):**
```json
{
  "data": {
    "id": "batik-tulis",
    "name": "Batik Tulis",
    "description": "Premium hand-drawn batik with traditional techniques",
    "image": "https://example.com/category1.jpg",
    "subcategories": [
      {
        "id": "katun",
        "name": "Katun",
        "parentId": "batik-tulis"
      },
      {
        "id": "sutra",
        "name": "Sutra",
        "parentId": "batik-tulis"
      }
    ],
    "productCount": 6
  }
}
```

---

## Cart API

### GET /api/cart

Get current user's cart (requires authentication).

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "data": {
    "items": [
      {
        "id": 1,
        "productId": 4,
        "name": "Elegant Batik Tulis Sutra",
        "image": "https://example.com/image.jpg",
        "category": "Batik Tulis",
        "subcategory": "Sutra",
        "size": "M",
        "quantity": 2,
        "price": 1500000,
        "totalPrice": 3000000,
        "stock": 15,
        "isAvailable": true
      }
    ],
    "subtotal": 3000000,
    "itemCount": 2
  }
}
```

---

### POST /api/cart

Add item to cart.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "productId": 4,
  "size": "M",
  "quantity": 1
}
```

**Response (201 Created):**
```json
{
  "message": "Item added to cart",
  "data": {
    "id": 1,
    "productId": 4,
    "size": "M",
    "quantity": 1
  }
}
```

---

### PUT /api/cart/:id

Update cart item quantity.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "quantity": 3
}
```

**Response (200 OK):**
```json
{
  "message": "Cart updated",
  "data": {
    "id": 1,
    "productId": 4,
    "size": "M",
    "quantity": 3
  }
}
```

---

### DELETE /api/cart/:id

Remove item from cart.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "message": "Item removed from cart"
}
```

---

### DELETE /api/cart

Clear entire cart.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "message": "Cart cleared"
}
```

---

## Orders API

### POST /api/orders

Create a new order.

**Headers:**
```
Authorization: Bearer <token> (optional for guest checkout)
```

**Request Body:**
```json
{
  "customer": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "081234567890"
  },
  "shipping": {
    "address": "Jl. Sudirman No. 123",
    "city": "Jakarta",
    "province": "DKI Jakarta",
    "postalCode": "12345",
    "provider": "JNE",
    "service": "Regular"
  },
  "payment": {
    "method": "bank_transfer"
  },
  "items": [
    {
      "productId": 4,
      "size": "M",
      "quantity": 2
    }
  ],
  "promoCode": "NEWUSER10",
  "notes": "Please wrap as gift"
}
```

**Response (201 Created):**
```json
{
  "message": "Order created successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "orderNumber": "TB-123456",
    "status": "awaiting_payment",
    "customer": {
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "081234567890"
    },
    "shipping": {
      "address": "Jl. Sudirman No. 123",
      "city": "Jakarta",
      "province": "DKI Jakarta",
      "postalCode": "12345",
      "provider": "JNE",
      "service": "Regular",
      "cost": 25000,
      "estimatedDelivery": "2024-01-25"
    },
    "payment": {
      "method": "bank_transfer",
      "status": "pending",
      "bankDetails": {
        "bankName": "BCA",
        "accountNumber": "1234567890",
        "accountName": "PT Tomo Batik Indonesia"
      }
    },
    "items": [
      {
        "productId": 4,
        "name": "Elegant Batik Tulis Sutra",
        "image": "https://example.com/image.jpg",
        "size": "M",
        "quantity": 2,
        "price": 1500000,
        "total": 3000000
      }
    ],
    "subtotal": 3000000,
    "shippingCost": 25000,
    "discount": 300000,
    "total": 2725000,
    "promoCode": "NEWUSER10",
    "createdAt": "2024-01-20T10:30:00Z"
  }
}
```

---

### GET /api/orders/:orderNumber

Get order by order number (public - for tracking).

**Request Example:**
```
GET /api/orders/TB-123456
```

**Response (200 OK):**
```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "orderNumber": "TB-123456",
    "status": "processing",
    "paymentStatus": "paid",
    "customer": {
      "name": "John Doe",
      "email": "jo***@example.com",
      "phone": "0812****7890"
    },
    "shipping": {
      "address": "Jl. Sudirman ***",
      "city": "Jakarta",
      "province": "DKI Jakarta",
      "provider": "JNE",
      "trackingNumber": null,
      "estimatedDelivery": "2024-01-25"
    },
    "items": [
      {
        "name": "Elegant Batik Tulis Sutra",
        "image": "https://example.com/image.jpg",
        "size": "M",
        "quantity": 2,
        "price": 1500000,
        "total": 3000000
      }
    ],
    "subtotal": 3000000,
    "shippingCost": 25000,
    "discount": 300000,
    "total": 2725000,
    "statusHistory": [
      {
        "status": "pending",
        "timestamp": "2024-01-20T10:30:00Z"
      },
      {
        "status": "awaiting_payment",
        "timestamp": "2024-01-20T10:30:00Z"
      },
      {
        "status": "payment_confirmed",
        "timestamp": "2024-01-20T14:00:00Z"
      },
      {
        "status": "processing",
        "timestamp": "2024-01-21T09:00:00Z"
      }
    ],
    "createdAt": "2024-01-20T10:30:00Z"
  }
}
```

---

### GET /api/orders/my-orders

Get user's orders (requires authentication).

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `page` | number | No | Page number (default: 1) |
| `limit` | number | No | Items per page (default: 10) |

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "orderNumber": "TB-123456",
      "status": "processing",
      "paymentStatus": "paid",
      "total": 2725000,
      "itemCount": 2,
      "firstItemImage": "https://example.com/image.jpg",
      "createdAt": "2024-01-20T10:30:00Z"
    }
  ],
  "meta": {
    "total": 5,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

---

### POST /api/orders/:orderNumber/confirm-payment

Confirm payment for bank transfer.

**Request Body:**
```json
{
  "paymentProofUrl": "https://example.com/proof.jpg"
}
```

**Response (200 OK):**
```json
{
  "message": "Payment confirmation received",
  "data": {
    "orderNumber": "TB-123456",
    "status": "payment_confirmed"
  }
}
```

---

## Auth API

### POST /api/auth/google

Authenticate with Google OAuth.

**Request Body:**
```json
{
  "token": "google_id_token_here"
}
```

**Response (200 OK):**
```json
{
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "John Doe",
      "email": "john@gmail.com",
      "avatar": "https://lh3.googleusercontent.com/...",
      "provider": "google"
    },
    "token": "jwt_token_here",
    "expiresIn": 86400
  }
}
```

---

### POST /api/auth/facebook

Authenticate with Facebook OAuth.

**Request Body:**
```json
{
  "accessToken": "facebook_access_token_here"
}
```

**Response (200 OK):**
```json
{
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "John Doe",
      "email": "john@facebook.com",
      "avatar": "https://graph.facebook.com/...",
      "provider": "facebook"
    },
    "token": "jwt_token_here",
    "expiresIn": 86400
  }
}
```

---

### GET /api/auth/me

Get current authenticated user.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "John Doe",
    "email": "john@gmail.com",
    "avatar": "https://lh3.googleusercontent.com/...",
    "provider": "google",
    "phone": "081234567890",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

---

### POST /api/auth/logout

Logout user (invalidate token).

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "message": "Logged out successfully"
}
```

---

## Promo Codes API

### POST /api/promo/validate

Validate a promo code.

**Request Body:**
```json
{
  "code": "NEWUSER10",
  "orderAmount": 500000
}
```

**Response (200 OK):**
```json
{
  "data": {
    "valid": true,
    "code": "NEWUSER10",
    "description": "Diskon 10% untuk pengguna baru",
    "discountType": "percentage",
    "discountValue": 10,
    "discountAmount": 50000,
    "minOrderAmount": 500000
  }
}
```

**Response (400 Bad Request - Invalid Code):**
```json
{
  "message": "Promo code is invalid or expired",
  "data": {
    "valid": false,
    "reason": "EXPIRED"
  }
}
```

---

## Data Types

### Product Object

```typescript
interface Product {
  id: number;
  name: string;
  slug: string;
  description?: string;
  category: string;
  categoryId: string;
  subcategory: string;
  subcategoryId: string;
  price: number;
  discountPrice?: number;
  image: string;
  images?: ProductImage[];
  sizes: string[] | SizeInfo[];
  motif?: string;           // For unique batik pieces
  isSingleSize: boolean;    // True for one-of-a-kind pieces
  isNew: boolean;
  isBestSeller: boolean;
  stock: number;
  weight?: number;          // In grams
  createdAt: string;
  updatedAt?: string;
}

interface ProductImage {
  url: string;
  alt?: string;
  isPrimary: boolean;
}

interface SizeInfo {
  size: string;             // "S" | "M" | "L" | "XL" | "XXL" | "Custom"
  stock: number;
  isAvailable: boolean;
}
```

### Category Object

```typescript
interface Category {
  id: string;
  name: string;
  description?: string;
  image?: string;
  subcategories: Subcategory[];
}

interface Subcategory {
  id: string;
  name: string;
  parentId: string;
}
```

### Order Status Enum

```typescript
type OrderStatus =
  | "pending"
  | "awaiting_payment"
  | "payment_confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";
```

### Payment Method Enum

```typescript
type PaymentMethod = "bank_transfer" | "e_wallet" | "credit_card";
```

### Shipping Provider Enum

```typescript
type ShippingProvider = "JNT" | "JNE" | "TIKI";
```

---

## Error Responses

All error responses follow this format:

```json
{
  "message": "Error description",
  "error": "ERROR_CODE",
  "details": {}
}
```

### HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | OK - Success |
| 201 | Created - Resource created successfully |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Authentication required |
| 403 | Forbidden - Access denied |
| 404 | Not Found - Resource not found |
| 422 | Unprocessable Entity - Validation error |
| 429 | Too Many Requests - Rate limited |
| 500 | Internal Server Error - Server error |

### Common Error Codes

| Code | Description |
|------|-------------|
| `VALIDATION_ERROR` | Input validation failed |
| `NOT_FOUND` | Resource not found |
| `UNAUTHORIZED` | Authentication required |
| `TOKEN_EXPIRED` | JWT token has expired |
| `INSUFFICIENT_STOCK` | Product out of stock |
| `PROMO_INVALID` | Promo code invalid |
| `PROMO_EXPIRED` | Promo code expired |

---

## Rate Limiting

API requests are rate limited:

- **Anonymous:** 100 requests per minute
- **Authenticated:** 1000 requests per minute

Rate limit headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1705752000
```

---

## Pagination

All list endpoints support pagination:

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 12, max: 100)

**Response Meta:**
```json
{
  "meta": {
    "total": 50,
    "page": 1,
    "limit": 12,
    "totalPages": 5
  }
}
```

---

## CORS

The API allows requests from:
- `http://localhost:5173` (development)
- `https://tomobatik.com` (production)

---

## Contact

For API questions: **tomobatikindonesia@gmail.com**

