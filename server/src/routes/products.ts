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

// Public POS endpoints (no authentication required)
router.get('/pos', getAllProducts); // Get all products for POS
router.get('/pos/categories', getCategories); // Get categories for POS
router.get('/pos/search', searchProducts); // Search products for POS
router.get('/pos/:id', getProductById); // Get product by ID for POS

// Protected admin endpoints (require authentication)
router.get('/', authenticateToken, getAllProducts);
router.get('/search', authenticateToken, searchProducts);
router.get('/categories', authenticateToken, getCategories);
router.get('/:id', authenticateToken, getProductById);
router.post('/', authenticateToken, requireAdmin, createProduct);
router.put('/:id', authenticateToken, requireAdmin, updateProduct);
router.delete('/:id', authenticateToken, requireAdmin, deleteProduct);

export default router;
