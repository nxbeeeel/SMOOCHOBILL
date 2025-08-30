import { Router } from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  searchProducts,
  getCategories
} from '../controllers/productController';

const router = Router();

// GET /api/products - Get all products
router.get('/', authenticateToken, getAllProducts);

// GET /api/products/search - Search products
router.get('/search', authenticateToken, searchProducts);

// GET /api/products/categories - Get categories
router.get('/categories', authenticateToken, getCategories);

// GET /api/products/:id - Get product by ID
router.get('/:id', authenticateToken, getProductById);

// POST /api/products - Create new product (Admin only)
router.post('/', authenticateToken, requireAdmin, createProduct);

// PUT /api/products/:id - Update product (Admin only)
router.put('/:id', authenticateToken, requireAdmin, updateProduct);

// DELETE /api/products/:id - Delete product (Admin only)
router.delete('/:id', authenticateToken, requireAdmin, deleteProduct);

export default router;
