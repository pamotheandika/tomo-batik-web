-- =============================================
-- TOMO BATIK INDONESIA - PostgreSQL Database Schema
-- =============================================

-- Enable UUID extension for generating unique IDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- USERS & AUTHENTICATION
-- =============================================

-- Users table for storing user accounts
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    provider VARCHAR(50) NOT NULL DEFAULT 'email', -- 'google', 'facebook', 'email'
    provider_id VARCHAR(255), -- ID from OAuth provider
    phone VARCHAR(20),
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User addresses
CREATE TABLE user_addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    label VARCHAR(50) DEFAULT 'Home', -- 'Home', 'Office', etc.
    recipient_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    address_line TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    province VARCHAR(100) NOT NULL,
    postal_code VARCHAR(10) NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DfEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- CATALOG: CATEGORIES & PRODUCTS
-- =============================================

-- Categories table
CREATE TABLE categories (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    image_url TEXT,
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Subcategories table
CREATE TABLE subcategories (
    id VARCHAR(50) PRIMARY KEY,
    category_id VARCHAR(50) REFERENCES categories(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    image_url TEXT,
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Products table
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    category_id VARCHAR(50) REFERENCES categories(id),
    subcategory_id VARCHAR(50) REFERENCES subcategories(id),
    description TEXT,
    price DECIMAL(12, 2) NOT NULL,
    discount_price DECIMAL(12, 2), -- Sale price if applicable
    image_url TEXT NOT NULL,
    motif VARCHAR(100), -- For unique batik pieces (e.g., 'Parang Rusak')
    is_single_size BOOLEAN DEFAULT FALSE, -- True for one-of-a-kind pieces
    is_new BOOLEAN DEFAULT FALSE,
    is_best_seller BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    stock_quantity INT DEFAULT 0, -- Total stock across all sizes
    weight_grams INT DEFAULT 500, -- Weight for shipping calculation
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Available sizes enum
CREATE TYPE size_type AS ENUM ('S', 'M', 'L', 'XL', 'XXL', 'Custom');

-- Product sizes with inventory
CREATE TABLE product_sizes (
    id SERIAL PRIMARY KEY,
    product_id INT REFERENCES products(id) ON DELETE CASCADE,
    size size_type NOT NULL,
    stock_quantity INT DEFAULT 0,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(product_id, size)
);

-- Product images (multiple images per product)
CREATE TABLE product_images (
    id SERIAL PRIMARY KEY,
    product_id INT REFERENCES products(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    alt_text VARCHAR(255),
    display_order INT DEFAULT 0,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- ORDERS & TRANSACTIONS
-- =============================================

-- Order status enum
CREATE TYPE order_status AS ENUM (
    'pending',
    'awaiting_payment',
    'payment_confirmed',
    'processing',
    'shipped',
    'delivered',
    'cancelled',
    'refunded'
);

-- Payment method enum
CREATE TYPE payment_method AS ENUM (
    'bank_transfer',
    'e_wallet',
    'credit_card'
);

-- Shipping provider enum
CREATE TYPE shipping_provider AS ENUM ('JNT', 'JNE', 'TIKI');

-- Orders table
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number VARCHAR(20) UNIQUE NOT NULL, -- Format: TB-XXXXXX
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Customer info (for guest checkout or snapshot)
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    
    -- Shipping address snapshot
    shipping_address TEXT NOT NULL,
    shipping_city VARCHAR(100) NOT NULL,
    shipping_province VARCHAR(100) NOT NULL,
    shipping_postal_code VARCHAR(10) NOT NULL,
    
    -- Shipping details
    shipping_provider shipping_provider NOT NULL,
    shipping_service VARCHAR(50), -- 'Regular', 'Express', etc.
    shipping_cost DECIMAL(12, 2) NOT NULL DEFAULT 0,
    shipping_tracking_number VARCHAR(100),
    estimated_delivery_date DATE,
    
    -- Order totals
    subtotal DECIMAL(12, 2) NOT NULL,
    discount_amount DECIMAL(12, 2) DEFAULT 0,
    promo_code VARCHAR(50),
    total_amount DECIMAL(12, 2) NOT NULL,
    
    -- Payment
    payment_method payment_method NOT NULL,
    payment_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'paid', 'failed', 'refunded'
    payment_date TIMESTAMP WITH TIME ZONE,
    payment_proof_url TEXT, -- For bank transfer proof upload
    
    -- Order status
    status order_status DEFAULT 'pending',
    notes TEXT, -- Customer notes
    admin_notes TEXT, -- Internal notes
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    shipped_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    cancelled_at TIMESTAMP WITH TIME ZONE
);

-- Order items table
CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_id INT REFERENCES products(id) ON DELETE SET NULL,
    
    -- Product snapshot (in case product is deleted/modified)
    product_name VARCHAR(255) NOT NULL,
    product_image_url TEXT,
    product_category VARCHAR(100),
    product_subcategory VARCHAR(100),
    product_motif VARCHAR(100),
    
    -- Order details
    size VARCHAR(10) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    unit_price DECIMAL(12, 2) NOT NULL,
    total_price DECIMAL(12, 2) NOT NULL,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Order status history for tracking
CREATE TABLE order_status_history (
    id SERIAL PRIMARY KEY,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    status order_status NOT NULL,
    notes TEXT,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL, -- Admin who made the change
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- WISHLIST & CART
-- =============================================

-- User wishlist
CREATE TABLE wishlists (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    product_id INT REFERENCES products(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, product_id)
);

-- Persistent cart (for logged-in users)
CREATE TABLE cart_items (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    product_id INT REFERENCES products(id) ON DELETE CASCADE,
    size VARCHAR(10) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, product_id, size)
);

-- =============================================
-- PROMO & DISCOUNTS
-- =============================================

CREATE TABLE promo_codes (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    discount_type VARCHAR(20) NOT NULL DEFAULT 'percentage', -- 'percentage', 'fixed'
    discount_value DECIMAL(12, 2) NOT NULL, -- Percentage (0-100) or fixed amount
    min_order_amount DECIMAL(12, 2) DEFAULT 0,
    max_discount_amount DECIMAL(12, 2), -- Cap for percentage discounts
    usage_limit INT, -- NULL = unlimited
    usage_count INT DEFAULT 0,
    valid_from TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    valid_until TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- Products indexes
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_subcategory ON products(subcategory_id);
CREATE INDEX idx_products_price ON products(price);
CREATE INDEX idx_products_is_active ON products(is_active);
CREATE INDEX idx_products_is_new ON products(is_new);
CREATE INDEX idx_products_is_best_seller ON products(is_best_seller);
CREATE INDEX idx_products_created_at ON products(created_at DESC);

-- Product sizes indexes
CREATE INDEX idx_product_sizes_product ON product_sizes(product_id);
CREATE INDEX idx_product_sizes_available ON product_sizes(is_available);

-- Orders indexes
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_orders_order_number ON orders(order_number);

-- Order items indexes
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_product ON order_items(product_id);

-- User indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_provider ON users(provider);

-- =============================================
-- VIEWS FOR COMMON QUERIES
-- =============================================

-- Product catalog view with category names and available sizes
CREATE VIEW v_product_catalog AS
SELECT 
    p.id,
    p.name,
    p.slug,
    p.description,
    p.price,
    p.discount_price,
    p.image_url,
    p.motif,
    p.is_single_size,
    p.is_new,
    p.is_best_seller,
    p.is_featured,
    p.stock_quantity,
    c.id AS category_id,
    c.name AS category_name,
    sc.id AS subcategory_id,
    sc.name AS subcategory_name,
    ARRAY_AGG(DISTINCT ps.size ORDER BY ps.size) FILTER (WHERE ps.is_available = TRUE) AS available_sizes,
    ARRAY_AGG(DISTINCT ps.size ORDER BY ps.size) AS all_sizes,
    p.created_at,
    p.updated_at
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
LEFT JOIN subcategories sc ON p.subcategory_id = sc.id
LEFT JOIN product_sizes ps ON p.id = ps.product_id
WHERE p.is_active = TRUE
GROUP BY p.id, c.id, c.name, sc.id, sc.name;

-- Order summary view
CREATE VIEW v_order_summary AS
SELECT 
    o.id,
    o.order_number,
    o.customer_name,
    o.customer_email,
    o.status,
    o.payment_method,
    o.payment_status,
    o.shipping_provider,
    o.shipping_tracking_number,
    o.subtotal,
    o.shipping_cost,
    o.discount_amount,
    o.total_amount,
    o.created_at,
    COUNT(oi.id) AS item_count,
    SUM(oi.quantity) AS total_quantity
FROM orders o
LEFT JOIN order_items oi ON o.id = oi.order_id
GROUP BY o.id;

-- =============================================
-- FUNCTIONS & TRIGGERS
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subcategories_updated_at BEFORE UPDATE ON subcategories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_promo_codes_updated_at BEFORE UPDATE ON promo_codes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to generate order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
DECLARE
    new_number VARCHAR(20);
BEGIN
    new_number := 'TB-' || LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
    
    -- Ensure uniqueness
    WHILE EXISTS(SELECT 1 FROM orders WHERE order_number = new_number) LOOP
        new_number := 'TB-' || LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
    END LOOP;
    
    NEW.order_number := new_number;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER set_order_number BEFORE INSERT ON orders
    FOR EACH ROW 
    WHEN (NEW.order_number IS NULL)
    EXECUTE FUNCTION generate_order_number();

-- Function to update product stock after order
CREATE OR REPLACE FUNCTION update_product_stock()
RETURNS TRIGGER AS $$
BEGIN
    -- Reduce stock when order item is created
    IF TG_OP = 'INSERT' THEN
        UPDATE product_sizes 
        SET stock_quantity = stock_quantity - NEW.quantity,
            is_available = CASE WHEN stock_quantity - NEW.quantity > 0 THEN TRUE ELSE FALSE END
        WHERE product_id = NEW.product_id AND size::text = NEW.size;
        
        UPDATE products
        SET stock_quantity = stock_quantity - NEW.quantity
        WHERE id = NEW.product_id;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_stock_on_order AFTER INSERT ON order_items
    FOR EACH ROW EXECUTE FUNCTION update_product_stock();

-- =============================================
-- SEED DATA: CATEGORIES
-- =============================================

INSERT INTO categories (id, name, description, display_order) VALUES
('batik-tulis', 'Batik Tulis', 'Premium hand-drawn batik with traditional techniques', 1),
('ready-to-wear', 'Ready To Wear', 'Ready-to-wear batik clothing collection', 2);

INSERT INTO subcategories (id, category_id, name, description, display_order) VALUES
('katun', 'batik-tulis', 'Katun', 'Premium cotton batik tulis', 1),
('sutra', 'batik-tulis', 'Sutra', 'Luxurious silk batik tulis', 2),
('batik-tulis-sutra', 'ready-to-wear', 'Batik Tulis/Sutra', 'One-of-a-kind ready-to-wear silk batik pieces', 1),
('batik-casual', 'ready-to-wear', 'Batik Casual', 'Everyday casual batik wear', 2);

-- =============================================
-- SEED DATA: SAMPLE PRODUCTS
-- =============================================

-- Batik Tulis - Katun
INSERT INTO products (name, slug, category_id, subcategory_id, price, image_url, is_new, stock_quantity) VALUES
('Premium Batik Tulis Katun', 'premium-batik-tulis-katun', 'batik-tulis', 'katun', 850000, 'https://images.unsplash.com/photo-1610652492249-b6e5e4e57788?q=80&w=800', TRUE, 50),
('Classic Batik Tulis Katun', 'classic-batik-tulis-katun', 'batik-tulis', 'katun', 750000, 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=800', FALSE, 40),
('Traditional Batik Tulis Katun', 'traditional-batik-tulis-katun', 'batik-tulis', 'katun', 680000, 'https://images.unsplash.com/photo-1509319117814-5dce0a6c3226?q=80&w=800', FALSE, 35);

-- Batik Tulis - Sutra
INSERT INTO products (name, slug, category_id, subcategory_id, price, image_url, is_best_seller, stock_quantity) VALUES
('Elegant Batik Tulis Sutra', 'elegant-batik-tulis-sutra', 'batik-tulis', 'sutra', 1500000, 'https://images.unsplash.com/photo-1523359346063-d879354c0ea5?q=80&w=800', TRUE, 25),
('Luxury Batik Tulis Sutra', 'luxury-batik-tulis-sutra', 'batik-tulis', 'sutra', 1800000, 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=800', FALSE, 20),
('Royal Batik Tulis Sutra', 'royal-batik-tulis-sutra', 'batik-tulis', 'sutra', 2200000, 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?q=80&w=800', FALSE, 15);

-- Ready To Wear - Batik Tulis/Sutra (One-of-a-kind pieces)
INSERT INTO products (name, slug, category_id, subcategory_id, price, image_url, motif, is_single_size, is_best_seller, stock_quantity) VALUES
('Parang Rusak Motif', 'parang-rusak-motif', 'ready-to-wear', 'batik-tulis-sutra', 950000, 'https://images.unsplash.com/photo-1598032895397-b9c37bfb9a52?q=80&w=800', 'Parang Rusak', TRUE, FALSE, 1),
('Kawung Picis Motif', 'kawung-picis-motif', 'ready-to-wear', 'batik-tulis-sutra', 1100000, 'https://images.unsplash.com/photo-1602810316498-ab67cf68c8e1?q=80&w=800', 'Kawung Picis', TRUE, TRUE, 1),
('Truntum Motif', 'truntum-motif', 'ready-to-wear', 'batik-tulis-sutra', 980000, 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=800', 'Truntum', TRUE, FALSE, 1),
('Sidomukti Motif', 'sidomukti-motif', 'ready-to-wear', 'batik-tulis-sutra', 1250000, 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=800', 'Sidomukti', TRUE, FALSE, 1),
('Mega Mendung Motif', 'mega-mendung-motif', 'ready-to-wear', 'batik-tulis-sutra', 1050000, 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?q=80&w=800', 'Mega Mendung', TRUE, FALSE, 1),
('Sekar Jagad Motif', 'sekar-jagad-motif', 'ready-to-wear', 'batik-tulis-sutra', 1350000, 'https://images.unsplash.com/photo-1607345366928-199ea26cfe3e?q=80&w=800', 'Sekar Jagad', TRUE, FALSE, 1);

-- Ready To Wear - Batik Casual
INSERT INTO products (name, slug, category_id, subcategory_id, price, image_url, is_new, stock_quantity) VALUES
('Casual Batik Shirt', 'casual-batik-shirt', 'ready-to-wear', 'batik-casual', 380000, 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=800', FALSE, 100),
('Weekend Batik Casual', 'weekend-batik-casual', 'ready-to-wear', 'batik-casual', 420000, 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=800', TRUE, 80),
('Everyday Batik Casual', 'everyday-batik-casual', 'ready-to-wear', 'batik-casual', 350000, 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?q=80&w=800', FALSE, 120),
('Smart Casual Batik', 'smart-casual-batik', 'ready-to-wear', 'batik-casual', 450000, 'https://drive.google.com/thumbnail?id=1t8ZCjIWya5B5z5haaVl2aiZBsSc_ZdkD&sz=w800', FALSE, 75);

-- Insert product sizes for Batik Tulis products (multiple sizes)
INSERT INTO product_sizes (product_id, size, stock_quantity, is_available)
SELECT p.id, s.size, 
    CASE WHEN s.size = 'S' THEN 8 WHEN s.size = 'M' THEN 15 WHEN s.size = 'L' THEN 15 WHEN s.size = 'XL' THEN 10 WHEN s.size = 'XXL' THEN 5 ELSE 3 END,
    TRUE
FROM products p
CROSS JOIN (SELECT unnest(ARRAY['S', 'M', 'L', 'XL', 'Custom']::size_type[]) AS size) s
WHERE p.category_id = 'batik-tulis';

-- Insert product sizes for Batik Tulis/Sutra (single size each)
INSERT INTO product_sizes (product_id, size, stock_quantity, is_available) VALUES
((SELECT id FROM products WHERE slug = 'parang-rusak-motif'), 'M', 1, TRUE),
((SELECT id FROM products WHERE slug = 'kawung-picis-motif'), 'L', 1, TRUE),
((SELECT id FROM products WHERE slug = 'truntum-motif'), 'S', 1, TRUE),
((SELECT id FROM products WHERE slug = 'sidomukti-motif'), 'XL', 1, TRUE),
((SELECT id FROM products WHERE slug = 'mega-mendung-motif'), 'M', 1, TRUE),
((SELECT id FROM products WHERE slug = 'sekar-jagad-motif'), 'L', 1, TRUE);

-- Insert product sizes for Batik Casual (all sizes)
INSERT INTO product_sizes (product_id, size, stock_quantity, is_available)
SELECT p.id, s.size,
    CASE WHEN s.size = 'S' THEN 15 WHEN s.size = 'M' THEN 25 WHEN s.size = 'L' THEN 25 WHEN s.size = 'XL' THEN 20 WHEN s.size = 'XXL' THEN 15 ELSE 0 END,
    TRUE
FROM products p
CROSS JOIN (SELECT unnest(ARRAY['S', 'M', 'L', 'XL', 'XXL']::size_type[]) AS size) s
WHERE p.subcategory_id = 'batik-casual';

-- =============================================
-- SAMPLE PROMO CODES
-- =============================================

INSERT INTO promo_codes (code, description, discount_type, discount_value, min_order_amount, max_discount_amount, valid_until) VALUES
('NEWUSER10', 'Diskon 10% untuk pengguna baru', 'percentage', 10, 500000, 100000, '2025-12-31 23:59:59+07'),
('BATIK50K', 'Potongan Rp 50.000', 'fixed', 50000, 300000, NULL, '2025-12-31 23:59:59+07'),
('PREMIUM15', 'Diskon 15% untuk Batik Premium', 'percentage', 15, 1000000, 250000, '2025-12-31 23:59:59+07');

-- =============================================
-- END OF SCHEMA
-- =============================================

