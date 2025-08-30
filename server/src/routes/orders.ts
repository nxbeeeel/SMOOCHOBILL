import { Router } from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrder,
  cancelOrder,
  getDailySummary
} from '../controllers/orderController';

const router = Router();

// GET /api/orders - Get all orders
router.get('/', authenticateToken, getAllOrders);

// GET /api/orders/summary/daily - Get daily summary
router.get('/summary/daily', authenticateToken, getDailySummary);

// GET /api/orders/:id - Get order by ID
router.get('/:id', authenticateToken, getOrderById);

// POST /api/orders - Create new order
router.post('/', authenticateToken, createOrder);

// PUT /api/orders/:id - Update order
router.put('/:id', authenticateToken, updateOrder);

// DELETE /api/orders/:id - Cancel order
router.delete('/:id', authenticateToken, cancelOrder);

export default router;
