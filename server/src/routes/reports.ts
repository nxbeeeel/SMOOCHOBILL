import { Router } from 'express';
import { authenticateToken, requireCashier } from '../middleware/auth';
import {
  getDailySalesSummary,
  getMonthlyReport,
  getProfitAnalysis,
  getStockUsageReport,
  exportDailySalesPDF
} from '../controllers/reportsController';

const router = Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Daily sales summary
router.get('/daily-sales', requireCashier, getDailySalesSummary);

// Monthly report
router.get('/monthly', requireCashier, getMonthlyReport);

// Profit analysis
router.get('/profit-analysis', requireCashier, getProfitAnalysis);

// Stock usage report
router.get('/stock-usage', requireCashier, getStockUsageReport);

// Export daily sales as PDF
router.get('/export/daily-sales-pdf', requireCashier, exportDailySalesPDF);

export default router;
