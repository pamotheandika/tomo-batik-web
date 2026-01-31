/**
 * Category Routes
 * 
 * Express router for category-related API endpoints
 */

const express = require('express');
const router = express.Router();
const { query } = require('../db');

/**
 * GET /api/categories
 * Get all categories with subcategories
 */
router.get('/', async (req, res) => {
  try {
    const result = await query(`
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
      ORDER BY c.display_order
    `);

    res.json({ data: result.rows });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Failed to fetch categories', error: error.message });
  }
});

/**
 * GET /api/categories/:id
 * Get a single category by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(`
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
      WHERE c.id = $1 AND c.is_active = TRUE
      GROUP BY c.id
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json({ data: result.rows[0] });
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({ message: 'Failed to fetch category', error: error.message });
  }
});

/**
 * GET /api/categories/stats
 * Get product counts per category
 */
router.get('/stats', async (req, res) => {
  try {
    const result = await query(`
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
      ORDER BY c.display_order, sc.display_order
    `);

    res.json({ data: result.rows });
  } catch (error) {
    console.error('Error fetching category stats:', error);
    res.status(500).json({ message: 'Failed to fetch category stats', error: error.message });
  }
});

module.exports = router;

