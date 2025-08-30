import { Router } from 'express';
import { authenticateToken, requireAdmin, requireCashier } from '../middleware/auth';
import {
  getAllInventoryItems,
  getInventoryItemById,
  createInventoryItem,
  updateInventoryItem,
  addStock,
  deductStock,
  getStockTransactions,
  getLowStockAlerts,
  getExpiryAlerts,
  getInventoryReport
} from '../controllers/inventoryController';

const router = Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Get all inventory items
router.get('/', requireCashier, getAllInventoryItems);

// Get inventory item by ID
router.get('/:id', requireCashier, getInventoryItemById);

// Create new inventory item (Admin only)
router.post('/', requireAdmin, createInventoryItem);

// Update inventory item (Admin only)
router.put('/:id', requireAdmin, updateInventoryItem);

// Add stock to item
router.post('/:id/stock/add', requireCashier, addStock);

// Deduct stock from item
router.post('/:id/stock/deduct', requireCashier, deductStock);

// Get stock transactions for an item
router.get('/:id/transactions', requireCashier, getStockTransactions);

// Get low stock alerts
router.get('/alerts/low-stock', requireCashier, getLowStockAlerts);

// Get expiry alerts
router.get('/alerts/expiry', requireCashier, getExpiryAlerts);

// Get inventory report
router.get('/reports/summary', requireCashier, getInventoryReport);

export default router;
