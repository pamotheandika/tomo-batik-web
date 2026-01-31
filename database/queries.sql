-- =============================================
-- TOMO BATIK INDONESIA - Common SQL Queries
-- =============================================

-- =============================================
-- PRODUCT QUERIES
-- =============================================

-- Get all products with filtering, sorting, and pagination
-- Example: GET /api/products?category=batik-tulis&subcategory=sutra&minPrice=500000&maxPrice=2000000&size=M,L&sortBy=price_asc&page=1&limit=12

SELECT 
    p.id,
    p.name,
    p.slug,
    p.description,
    p.price,
    p.discount_price,
    p.image_url,
    c.name AS category,
    sc.name AS subcategory,
    p.motif,
    p.is_single_size,
    p.is_new,
    p.is_best_seller,
    p.stock_quantity,
    ARRAY_AGG(DISTINCT ps.size ORDER BY ps.size) FILTER (WHERE ps.is_available = TRUE) AS sizes,
    p.created_at
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
LEFT JOIN subcategories sc ON p.subcategory_id = sc.id
LEFT JOIN product_sizes ps ON p.id = ps.product_id
WHERE p.is_active = TRUE
    -- Filter by category
    AND (p.category_id = $1 OR $1 IS NULL)
    -- Filter by subcategory
    AND (p.subcategory_id = $2 OR $2 IS NULL)
    -- Filter by price range
    AND p.price >= COALESCE($3, 0)
    AND p.price <= COALESCE($4, 999999999)
    -- Filter by size availability
    AND (
        $5 IS NULL 
        OR EXISTS (
            SELECT 1 FROM product_sizes ps2 
            WHERE ps2.product_id = p.id 
            AND ps2.size::text = ANY($5::text[])
            AND ps2.is_available = TRUE
        )
    )
    -- Search by name
    AND (
        $6 IS NULL 
        OR p.name ILIKE '%' || $6 || '%'
        OR p.description ILIKE '%' || $6 || '%'
        OR p.motif ILIKE '%' || $6 || '%'
    )
GROUP BY p.id, c.name, sc.name
ORDER BY 
    CASE WHEN $7 = 'price_asc' THEN p.price END ASC,
    CASE WHEN $7 = 'price_desc' THEN p.price END DESC,
    CASE WHEN $7 = 'newest' THEN p.created_at END DESC,
    CASE WHEN $7 = 'popular' THEN p.is_best_seller END DESC,
    p.created_at DESC
LIMIT $8 OFFSET $9;


-- Get product by ID with all details
SELECT 
    p.id,
    p.name,
    p.slug,
    p.description,
    p.price,
    p.discount_price,
    p.image_url,
    c.id AS category_id,
    c.name AS category,
    sc.id AS subcategory_id,
    sc.name AS subcategory,
    p.motif,
    p.is_single_size,
    p.is_new,
    p.is_best_seller,
    p.stock_quantity,
    p.weight_grams,
    p.created_at,
    p.updated_at
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
LEFT JOIN subcategories sc ON p.subcategory_id = sc.id
WHERE p.id = $1 AND p.is_active = TRUE;


-- Get product sizes with availability
SELECT 
    ps.size,
    ps.stock_quantity,
    ps.is_available
FROM product_sizes ps
WHERE ps.product_id = $1
ORDER BY 
    CASE ps.size
        WHEN 'S' THEN 1
        WHEN 'M' THEN 2
        WHEN 'L' THEN 3
        WHEN 'XL' THEN 4
        WHEN 'XXL' THEN 5
        WHEN 'Custom' THEN 6
    END;


-- Get product images
SELECT 
    pi.image_url,
    pi.alt_text,
    pi.is_primary
FROM product_images pi
WHERE pi.product_id = $1
ORDER BY pi.is_primary DESC, pi.display_order ASC;


-- Get featured/best seller products
SELECT 
    p.id,
    p.name,
    p.slug,
    p.price,
    p.image_url,
    c.name AS category,
    sc.name AS subcategory,
    p.is_new,
    p.is_best_seller,
    ARRAY_AGG(DISTINCT ps.size ORDER BY ps.size) FILTER (WHERE ps.is_available = TRUE) AS sizes
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
LEFT JOIN subcategories sc ON p.subcategory_id = sc.id
LEFT JOIN product_sizes ps ON p.id = ps.product_id
WHERE p.is_active = TRUE AND (p.is_best_seller = TRUE OR p.is_featured = TRUE)
GROUP BY p.id, c.name, sc.name
ORDER BY p.is_best_seller DESC, p.created_at DESC
LIMIT 8;


-- Get new arrivals
SELECT 
    p.id,
    p.name,
    p.slug,
    p.price,
    p.image_url,
    c.name AS category,
    sc.name AS subcategory,
    p.is_new,
    ARRAY_AGG(DISTINCT ps.size ORDER BY ps.size) FILTER (WHERE ps.is_available = TRUE) AS sizes
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
LEFT JOIN subcategories sc ON p.subcategory_id = sc.id
LEFT JOIN product_sizes ps ON p.id = ps.product_id
WHERE p.is_active = TRUE AND p.is_new = TRUE
GROUP BY p.id, c.name, sc.name
ORDER BY p.created_at DESC
LIMIT 8;


-- Get related products (same category, excluding current product)
SELECT 
    p.id,
    p.name,
    p.slug,
    p.price,
    p.image_url,
    sc.name AS subcategory,
    ARRAY_AGG(DISTINCT ps.size ORDER BY ps.size) FILTER (WHERE ps.is_available = TRUE) AS sizes
FROM products p
LEFT JOIN subcategories sc ON p.subcategory_id = sc.id
LEFT JOIN product_sizes ps ON p.id = ps.product_id
WHERE p.is_active = TRUE 
    AND p.id != $1
    AND p.category_id = $2
GROUP BY p.id, sc.name
ORDER BY RANDOM()
LIMIT 4;


-- Count products with filters (for pagination)
SELECT COUNT(DISTINCT p.id)
FROM products p
LEFT JOIN product_sizes ps ON p.id = ps.product_id
WHERE p.is_active = TRUE
    AND (p.category_id = $1 OR $1 IS NULL)
    AND (p.subcategory_id = $2 OR $2 IS NULL)
    AND p.price >= COALESCE($3, 0)
    AND p.price <= COALESCE($4, 999999999)
    AND (
        $5 IS NULL 
        OR EXISTS (
            SELECT 1 FROM product_sizes ps2 
            WHERE ps2.product_id = p.id 
            AND ps2.size::text = ANY($5::text[])
            AND ps2.is_available = TRUE
        )
    );


-- =============================================
-- CATEGORY QUERIES
-- =============================================

-- Get all categories with subcategories
SELECT 
    c.id,
    c.name,
    c.description,
    c.image_url,
    json_agg(
        json_build_object(
            'id', sc.id,
            'name', sc.name,
            'parentId', sc.category_id
        ) ORDER BY sc.display_order
    ) FILTER (WHERE sc.id IS NOT NULL) AS subcategories
FROM categories c
LEFT JOIN subcategories sc ON c.id = sc.category_id AND sc.is_active = TRUE
WHERE c.is_active = TRUE
GROUP BY c.id
ORDER BY c.display_order;


-- Get products count per category
SELECT 
    c.id AS category_id,
    c.name AS category_name,
    sc.id AS subcategory_id,
    sc.name AS subcategory_name,
    COUNT(p.id) AS product_count
FROM categories c
LEFT JOIN subcategories sc ON c.id = sc.category_id
LEFT JOIN products p ON (p.category_id = c.id AND (p.subcategory_id = sc.id OR sc.id IS NULL)) AND p.is_active = TRUE
WHERE c.is_active = TRUE
GROUP BY c.id, c.name, sc.id, sc.name
ORDER BY c.display_order, sc.display_order;


-- =============================================
-- ORDER QUERIES
-- =============================================

-- Create new order
INSERT INTO orders (
    user_id,
    customer_name,
    customer_email,
    customer_phone,
    shipping_address,
    shipping_city,
    shipping_province,
    shipping_postal_code,
    shipping_provider,
    shipping_service,
    shipping_cost,
    subtotal,
    discount_amount,
    promo_code,
    total_amount,
    payment_method,
    notes
) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
RETURNING id, order_number;


-- Add order item
INSERT INTO order_items (
    order_id,
    product_id,
    product_name,
    product_image_url,
    product_category,
    product_subcategory,
    product_motif,
    size,
    quantity,
    unit_price,
    total_price
) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11);


-- Get order by order number
SELECT 
    o.*,
    json_agg(
        json_build_object(
            'id', oi.id,
            'productId', oi.product_id,
            'productName', oi.product_name,
            'productImage', oi.product_image_url,
            'size', oi.size,
            'quantity', oi.quantity,
            'unitPrice', oi.unit_price,
            'totalPrice', oi.total_price
        )
    ) AS items
FROM orders o
LEFT JOIN order_items oi ON o.id = oi.order_id
WHERE o.order_number = $1
GROUP BY o.id;


-- Get orders by user
SELECT 
    o.id,
    o.order_number,
    o.status,
    o.payment_status,
    o.total_amount,
    o.created_at,
    COUNT(oi.id) AS item_count,
    (SELECT oi2.product_image_url FROM order_items oi2 WHERE oi2.order_id = o.id LIMIT 1) AS first_item_image
FROM orders o
LEFT JOIN order_items oi ON o.id = oi.order_id
WHERE o.user_id = $1
GROUP BY o.id
ORDER BY o.created_at DESC
LIMIT $2 OFFSET $3;


-- Update order status
UPDATE orders 
SET 
    status = $2,
    updated_at = CURRENT_TIMESTAMP,
    shipped_at = CASE WHEN $2 = 'shipped' THEN CURRENT_TIMESTAMP ELSE shipped_at END,
    delivered_at = CASE WHEN $2 = 'delivered' THEN CURRENT_TIMESTAMP ELSE delivered_at END,
    cancelled_at = CASE WHEN $2 = 'cancelled' THEN CURRENT_TIMESTAMP ELSE cancelled_at END
WHERE id = $1
RETURNING *;


-- Update payment status
UPDATE orders 
SET 
    payment_status = $2,
    payment_date = CASE WHEN $2 = 'paid' THEN CURRENT_TIMESTAMP ELSE payment_date END,
    payment_proof_url = COALESCE($3, payment_proof_url),
    updated_at = CURRENT_TIMESTAMP
WHERE id = $1
RETURNING *;


-- Add order status history
INSERT INTO order_status_history (order_id, status, notes, created_by)
VALUES ($1, $2, $3, $4);


-- Get order status history
SELECT 
    osh.status,
    osh.notes,
    osh.created_at,
    u.name AS updated_by
FROM order_status_history osh
LEFT JOIN users u ON osh.created_by = u.id
WHERE osh.order_id = $1
ORDER BY osh.created_at DESC;


-- =============================================
-- USER QUERIES
-- =============================================

-- Find or create user (for OAuth login)
INSERT INTO users (email, name, avatar_url, provider, provider_id)
VALUES ($1, $2, $3, $4, $5)
ON CONFLICT (email) 
DO UPDATE SET 
    name = COALESCE(EXCLUDED.name, users.name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, users.avatar_url),
    updated_at = CURRENT_TIMESTAMP
RETURNING *;


-- Get user by ID
SELECT * FROM users WHERE id = $1;


-- Get user by email
SELECT * FROM users WHERE email = $1;


-- Get user addresses
SELECT * FROM user_addresses
WHERE user_id = $1
ORDER BY is_default DESC, created_at DESC;


-- Add user address
INSERT INTO user_addresses (
    user_id,
    label,
    recipient_name,
    phone,
    address_line,
    city,
    province,
    postal_code,
    is_default
) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
RETURNING *;


-- =============================================
-- CART & WISHLIST QUERIES
-- =============================================

-- Get user cart
SELECT 
    ci.id,
    ci.product_id,
    ci.size,
    ci.quantity,
    p.name,
    p.price,
    p.image_url,
    ps.stock_quantity,
    ps.is_available
FROM cart_items ci
JOIN products p ON ci.product_id = p.id
LEFT JOIN product_sizes ps ON ci.product_id = ps.product_id AND ci.size::size_type = ps.size
WHERE ci.user_id = $1;


-- Add to cart (upsert)
INSERT INTO cart_items (user_id, product_id, size, quantity)
VALUES ($1, $2, $3, $4)
ON CONFLICT (user_id, product_id, size)
DO UPDATE SET 
    quantity = cart_items.quantity + EXCLUDED.quantity,
    updated_at = CURRENT_TIMESTAMP
RETURNING *;


-- Update cart item quantity
UPDATE cart_items
SET quantity = $3, updated_at = CURRENT_TIMESTAMP
WHERE user_id = $1 AND id = $2
RETURNING *;


-- Remove from cart
DELETE FROM cart_items
WHERE user_id = $1 AND id = $2;


-- Clear cart
DELETE FROM cart_items WHERE user_id = $1;


-- Get user wishlist
SELECT 
    w.id,
    w.created_at,
    p.id AS product_id,
    p.name,
    p.price,
    p.image_url,
    c.name AS category,
    ARRAY_AGG(DISTINCT ps.size ORDER BY ps.size) FILTER (WHERE ps.is_available = TRUE) AS sizes
FROM wishlists w
JOIN products p ON w.product_id = p.id
LEFT JOIN categories c ON p.category_id = c.id
LEFT JOIN product_sizes ps ON p.id = ps.product_id
WHERE w.user_id = $1
GROUP BY w.id, p.id, c.name
ORDER BY w.created_at DESC;


-- Add to wishlist
INSERT INTO wishlists (user_id, product_id)
VALUES ($1, $2)
ON CONFLICT (user_id, product_id) DO NOTHING
RETURNING *;


-- Remove from wishlist
DELETE FROM wishlists
WHERE user_id = $1 AND product_id = $2;


-- Check if product is in wishlist
SELECT EXISTS(
    SELECT 1 FROM wishlists WHERE user_id = $1 AND product_id = $2
) AS is_in_wishlist;


-- =============================================
-- PROMO CODE QUERIES
-- =============================================

-- Validate promo code
SELECT 
    id,
    code,
    description,
    discount_type,
    discount_value,
    min_order_amount,
    max_discount_amount,
    CASE 
        WHEN is_active = FALSE THEN 'INACTIVE'
        WHEN valid_from > CURRENT_TIMESTAMP THEN 'NOT_STARTED'
        WHEN valid_until < CURRENT_TIMESTAMP THEN 'EXPIRED'
        WHEN usage_limit IS NOT NULL AND usage_count >= usage_limit THEN 'LIMIT_REACHED'
        ELSE 'VALID'
    END AS status
FROM promo_codes
WHERE code = $1;


-- Apply promo code (increment usage)
UPDATE promo_codes
SET usage_count = usage_count + 1
WHERE code = $1 AND is_active = TRUE
    AND (valid_from IS NULL OR valid_from <= CURRENT_TIMESTAMP)
    AND (valid_until IS NULL OR valid_until >= CURRENT_TIMESTAMP)
    AND (usage_limit IS NULL OR usage_count < usage_limit);


-- =============================================
-- ADMIN/DASHBOARD QUERIES
-- =============================================

-- Get order statistics
SELECT 
    COUNT(*) FILTER (WHERE status = 'pending') AS pending_orders,
    COUNT(*) FILTER (WHERE status = 'awaiting_payment') AS awaiting_payment,
    COUNT(*) FILTER (WHERE status = 'processing') AS processing_orders,
    COUNT(*) FILTER (WHERE status = 'shipped') AS shipped_orders,
    COUNT(*) FILTER (WHERE status = 'delivered') AS delivered_orders,
    COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE) AS today_orders,
    SUM(total_amount) FILTER (WHERE payment_status = 'paid' AND created_at >= date_trunc('month', CURRENT_DATE)) AS monthly_revenue
FROM orders;


-- Get low stock products
SELECT 
    p.id,
    p.name,
    p.slug,
    ps.size,
    ps.stock_quantity
FROM products p
JOIN product_sizes ps ON p.id = ps.product_id
WHERE ps.stock_quantity <= 5 AND ps.stock_quantity > 0
ORDER BY ps.stock_quantity ASC;


-- Get out of stock products
SELECT 
    p.id,
    p.name,
    p.slug,
    ARRAY_AGG(ps.size) AS out_of_stock_sizes
FROM products p
JOIN product_sizes ps ON p.id = ps.product_id
WHERE ps.stock_quantity = 0 OR ps.is_available = FALSE
GROUP BY p.id;

