import { Router } from 'express';
import { authenticateToken, requireCashier } from '../middleware/auth';
import {
  printBill,
  printDailySummary,
  testPrinter,
  getPrinterConfig,
  updatePrinterConfig,
  getPrintLogs
} from '../controllers/printerController';

const router = Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Print bill for specific order
router.post('/bill/:order_id', requireCashier, printBill);

// Print daily summary
router.post('/daily-summary', requireCashier, printDailySummary);

// Test printer connection
router.post('/test', requireCashier, testPrinter);

// Get printer configuration
router.get('/config', requireCashier, getPrinterConfig);

// Update printer configuration
router.put('/config', requireCashier, updatePrinterConfig);

// Get print logs
router.get('/logs', requireCashier, getPrintLogs);

export default router;
