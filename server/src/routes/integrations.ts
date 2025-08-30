import { Router } from 'express';
import { authenticateToken, requireCashier } from '../middleware/auth';
import {
  syncZomatoOrders,
  updateZomatoOrderStatus,
  syncSwiggyOrders,
  updateSwiggyOrderStatus,
  processPaytmPayment,
  paytmCallback,
  zomatoWebhook,
  swiggyWebhook
} from '../controllers/integrationsController';

const router = Router();

// Apply authentication to protected routes
router.use(authenticateToken);

// Zomato Integration
router.get('/zomato/sync', requireCashier, syncZomatoOrders);
router.put('/zomato/orders/:order_id/status', requireCashier, updateZomatoOrderStatus);

// Swiggy Integration
router.get('/swiggy/sync', requireCashier, syncSwiggyOrders);
router.put('/swiggy/orders/:order_id/status', requireCashier, updateSwiggyOrderStatus);

// Paytm Integration
router.post('/paytm/payment', requireCashier, processPaytmPayment);

// Webhook endpoints (no authentication required)
router.post('/zomato/webhook', zomatoWebhook);
router.post('/swiggy/webhook', swiggyWebhook);
router.post('/paytm/callback', paytmCallback);

export default router;
