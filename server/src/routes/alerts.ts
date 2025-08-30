import { Router } from 'express';
import { authenticateToken, requireCashier } from '../middleware/auth';
import {
  sendEmailAlert,
  sendWhatsAppAlert,
  sendLowStockAlert,
  sendExpiryAlert,
  getAlertLogs,
  testAlertConfiguration
} from '../controllers/alertController';

const router = Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Send email alert
router.post('/email', requireCashier, sendEmailAlert);

// Send WhatsApp alert
router.post('/whatsapp', requireCashier, sendWhatsAppAlert);

// Send low stock alert for specific item
router.post('/low-stock/:item_id', requireCashier, sendLowStockAlert);

// Send expiry alert for specific item
router.post('/expiry/:item_id', requireCashier, sendExpiryAlert);

// Get alert logs
router.get('/logs', requireCashier, getAlertLogs);

// Test alert configuration
router.post('/test', requireCashier, testAlertConfiguration);

export default router;
