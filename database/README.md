# Tomo Batik Indonesia - Database Schema

This folder contains the PostgreSQL database schema and example backend API for the Tomo Batik Indonesia e-commerce platform.

## 📁 Files Overview

```
database/
├── schema.sql              # Complete PostgreSQL database schema
├── queries.sql             # Common SQL queries for reference
├── README.md               # This file
└── backend-example/        # Example Node.js/Express backend
    ├── server.js           # Main Express server
    ├── db.js               # Database connection
    ├── package.json        # Dependencies
    └── routes/
        ├── products.js     # Product API routes
        └── categories.js   # Category API routes
```

## 🗄️ Database Tables

### Core Tables

| Table | Description |
|-------|-------------|
| `users` | User accounts (OAuth: Google, Facebook) |
| `user_addresses` | Saved shipping addresses |
| `categories` | Product categories (Batik Tulis, Ready To Wear) |
| `subcategories` | Product subcategories (Katun, Sutra, etc.) |
| `products` | Product catalog |
| `product_sizes` | Available sizes per product with inventory |
| `product_images` | Multiple images per product |

### Order Tables

| Table | Description |
|-------|-------------|
| `orders` | Customer orders |
| `order_items` | Items in each order |
| `order_status_history` | Order status tracking |

### Additional Tables

| Table | Description |
|-------|-------------|
| `wishlists` | User wishlist items |
| `cart_items` | Persistent shopping cart |
| `promo_codes` | Discount codes |

## 🚀 Quick Start

### 1. Create PostgreSQL Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE tomo_batik;

# Exit
\q
```

### 2. Run Schema

```bash
# Navigate to database folder
cd database

# Run the schema
psql -U postgres -d tomo_batik -f schema.sql
```

### 3. Start Backend API (Optional)

```bash
# Navigate to backend folder
cd backend-example

# Install dependencies
npm install

# Create .env file
cat > .env << EOF
DB_HOST=localhost
DB_PORT=5432
DB_NAME=tomo_batik
DB_USER=postgres
DB_PASSWORD=your_password
PORT=3001
FRONTEND_URL=http://localhost:5173
EOF

# Start the server
npm run dev
```

## 📊 Database Schema Diagram

```
┌─────────────────┐      ┌─────────────────┐
│   categories    │      │  subcategories  │
├─────────────────┤      ├─────────────────┤
│ id (PK)         │◄─────│ category_id (FK)│
│ name            │      │ id (PK)         │
│ description     │      │ name            │
└─────────────────┘      └────────┬────────┘
                                  │
                         ┌────────▼────────┐
                         │    products     │
                         ├─────────────────┤
┌─────────────────┐      │ id (PK)         │
│  product_sizes  │      │ name            │
├─────────────────┤      │ category_id (FK)│
│ product_id (FK) │◄─────│ subcategory_id  │
│ size            │      │ price           │
│ stock_quantity  │      │ is_single_size  │
└─────────────────┘      │ motif           │
                         └────────┬────────┘
                                  │
┌─────────────────┐      ┌────────▼────────┐
│     users       │      │  order_items    │
├─────────────────┤      ├─────────────────┤
│ id (PK)         │◄─┐   │ product_id (FK) │
│ email           │  │   │ order_id (FK)   │
│ name            │  │   │ quantity        │
│ provider        │  │   └────────┬────────┘
└─────────────────┘  │            │
         │           │   ┌────────▼────────┐
         │           │   │     orders      │
         │           └───├─────────────────┤
         │               │ user_id (FK)    │
         │               │ order_number    │
         │               │ status          │
         ▼               │ total_amount    │
┌─────────────────┐      └─────────────────┘
│  user_addresses │
│    wishlists    │
│   cart_items    │
└─────────────────┘
```

## 🔑 Key Features

### 1. Product Categories

```sql
-- Batik Tulis
  ├── Katun (Cotton)
  └── Sutra (Silk)

-- Ready To Wear
  ├── Batik Tulis/Sutra (One-of-a-kind pieces)
  └── Batik Casual
```

### 2. Single Size Products

For "Ready To Wear - Batik Tulis/Sutra" products, each item is unique with:
- One motif per product
- One size per product
- Stock quantity of 1

```sql
-- Example: Parang Rusak Motif (Size M only)
INSERT INTO products (name, motif, is_single_size) 
VALUES ('Parang Rusak Motif', 'Parang Rusak', TRUE);

INSERT INTO product_sizes (product_id, size, stock_quantity)
VALUES (7, 'M', 1);
```

### 3. Automatic Features

- **Auto-generated order numbers**: `TB-XXXXXX` format
- **Updated timestamps**: Automatic `updated_at` on changes
- **Stock management**: Auto-update on order placement
- **Views**: Pre-built views for common queries

## 📝 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | List products with filters |
| GET | `/api/products/:id` | Get product details |
| GET | `/api/products/featured` | Featured products |
| GET | `/api/products/new-arrivals` | New arrivals |
| GET | `/api/categories` | List categories |

### Query Parameters for `/api/products`

| Parameter | Type | Description |
|-----------|------|-------------|
| `category` | string | Filter by category ID |
| `subcategory` | string | Filter by subcategory ID |
| `minPrice` | number | Minimum price |
| `maxPrice` | number | Maximum price |
| `size` | string | Comma-separated sizes (S,M,L) |
| `search` | string | Search term |
| `sortBy` | string | `price_asc`, `price_desc`, `newest`, `popular` |
| `page` | number | Page number |
| `limit` | number | Items per page |

## 🔒 Security Notes

- All user passwords should be hashed (use bcrypt)
- OAuth providers handle authentication
- Use prepared statements (already implemented)
- Enable SSL in production

## 📧 Contact

For questions, contact: tomobatikindonesia@gmail.com

