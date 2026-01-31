/**
 * Tomo Batik Indonesia - Express API Server
 * 
 * This is an example backend server using Express.js with PostgreSQL
 * 
 * Setup:
 * 1. Install dependencies: npm install express cors helmet dotenv pg
 * 2. Create .env file with database credentials
 * 3. Run PostgreSQL schema: psql -d tomo_batik -f ../schema.sql
 * 4. Start server: node server.js
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

// Import routes
const productsRouter = require('./routes/products');
const categoriesRouter = require('./routes/categories');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet()); // Security headers
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} | ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'Tomo Batik API'
  });
});

// API Routes
app.use('/api/products', productsRouter);
app.use('/api/categories', categoriesRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Endpoint not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🛒 TOMO BATIK INDONESIA API                             ║
║                                                           ║
║   Server running on: http://localhost:${PORT}               ║
║   API Base URL: http://localhost:${PORT}/api                ║
║                                                           ║
║   Endpoints:                                              ║
║   - GET  /api/health           Health check               ║
║   - GET  /api/products         List products              ║
║   - GET  /api/products/:id     Get product                ║
║   - GET  /api/products/featured Featured products         ║
║   - GET  /api/products/new-arrivals New arrivals          ║
║   - GET  /api/categories       List categories            ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
  `);
});

module.exports = app;

