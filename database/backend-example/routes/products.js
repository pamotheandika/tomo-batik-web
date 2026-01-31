/**
 * Product Routes
 * 
 * Express router for product-related API endpoints
 */

const express = require('express');
const router = express.Router();
const { query } = require('../db');

/**
 * GET /api/products
 * Get all products with filtering, sorting, and pagination
 */
router.get('/', async (req, res) => {
  try {
    const {
      category,
      subcategory,
      minPrice,
      maxPrice,
      size,
      search,
      sortBy = 'newest',
      page = 1,
      limit = 12
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const sizes = size ? size.split(',') : null;

    // Build the query
    const productsQuery = `
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
        AND ($1::VARCHAR IS NULL OR p.category_id = $1)
        AND ($2::VARCHAR IS NULL OR p.subcategory_id = $2)
        AND p.price >= COALESCE($3::DECIMAL, 0)
        AND p.price <= COALESCE($4::DECIMAL, 999999999)
        AND (
          $5::TEXT[] IS NULL 
          OR EXISTS (
            SELECT 1 FROM product_sizes ps2 
            WHERE ps2.product_id = p.id 
            AND ps2.size::text = ANY($5)
            AND ps2.is_available = TRUE
          )
        )
        AND (
          $6::VARCHAR IS NULL 
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
      LIMIT $8 OFFSET $9
    `;

    const countQuery = `
      SELECT COUNT(DISTINCT p.id) as total
      FROM products p
      LEFT JOIN product_sizes ps ON p.id = ps.product_id
      WHERE p.is_active = TRUE
        AND ($1::VARCHAR IS NULL OR p.category_id = $1)
        AND ($2::VARCHAR IS NULL OR p.subcategory_id = $2)
        AND p.price >= COALESCE($3::DECIMAL, 0)
        AND p.price <= COALESCE($4::DECIMAL, 999999999)
        AND (
          $5::TEXT[] IS NULL 
          OR EXISTS (
            SELECT 1 FROM product_sizes ps2 
            WHERE ps2.product_id = p.id 
            AND ps2.size::text = ANY($5)
            AND ps2.is_available = TRUE
          )
        )
    `;

    const [productsResult, countResult] = await Promise.all([
      query(productsQuery, [
        category || null,
        subcategory || null,
        minPrice ? parseFloat(minPrice) : null,
        maxPrice ? parseFloat(maxPrice) : null,
        sizes,
        search || null,
        sortBy,
        parseInt(limit),
        offset
      ]),
      query(countQuery, [
        category || null,
        subcategory || null,
        minPrice ? parseFloat(minPrice) : null,
        maxPrice ? parseFloat(maxPrice) : null,
        sizes
      ])
    ]);

    const total = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(total / parseInt(limit));

    res.json({
      data: productsResult.rows,
      meta: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages
      }
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Failed to fetch products', error: error.message });
  }
});

/**
 * GET /api/products/:id
 * Get a single product by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const productQuery = `
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
      WHERE p.id = $1 AND p.is_active = TRUE
    `;

    const sizesQuery = `
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
        END
    `;

    const imagesQuery = `
      SELECT 
        pi.image_url,
        pi.alt_text,
        pi.is_primary
      FROM product_images pi
      WHERE pi.product_id = $1
      ORDER BY pi.is_primary DESC, pi.display_order ASC
    `;

    const [productResult, sizesResult, imagesResult] = await Promise.all([
      query(productQuery, [id]),
      query(sizesQuery, [id]),
      query(imagesQuery, [id])
    ]);

    if (productResult.rows.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const product = productResult.rows[0];
    product.sizes = sizesResult.rows;
    product.images = imagesResult.rows;

    res.json({ data: product });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ message: 'Failed to fetch product', error: error.message });
  }
});

/**
 * GET /api/products/featured
 * Get featured/best seller products
 */
router.get('/featured', async (req, res) => {
  try {
    const result = await query(`
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
      LIMIT 8
    `);

    res.json({ data: result.rows });
  } catch (error) {
    console.error('Error fetching featured products:', error);
    res.status(500).json({ message: 'Failed to fetch featured products', error: error.message });
  }
});

/**
 * GET /api/products/new-arrivals
 * Get new arrival products
 */
router.get('/new-arrivals', async (req, res) => {
  try {
    const result = await query(`
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
      LIMIT 8
    `);

    res.json({ data: result.rows });
  } catch (error) {
    console.error('Error fetching new arrivals:', error);
    res.status(500).json({ message: 'Failed to fetch new arrivals', error: error.message });
  }
});

/**
 * GET /api/products/:id/related
 * Get related products
 */
router.get('/:id/related', async (req, res) => {
  try {
    const { id } = req.params;

    // First get the product's category
    const productResult = await query(
      'SELECT category_id FROM products WHERE id = $1',
      [id]
    );

    if (productResult.rows.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const categoryId = productResult.rows[0].category_id;

    const result = await query(`
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
      LIMIT 4
    `, [id, categoryId]);

    res.json({ data: result.rows });
  } catch (error) {
    console.error('Error fetching related products:', error);
    res.status(500).json({ message: 'Failed to fetch related products', error: error.message });
  }
});

module.exports = router;

