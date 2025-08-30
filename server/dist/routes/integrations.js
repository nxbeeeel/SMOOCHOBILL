"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const integrationsController_1 = require("../controllers/integrationsController");
const router = (0, express_1.Router)();
router.use(auth_1.authenticateToken);
router.get('/zomato/sync', auth_1.requireCashier, integrationsController_1.syncZomatoOrders);
router.put('/zomato/orders/:order_id/status', auth_1.requireCashier, integrationsController_1.updateZomatoOrderStatus);
router.get('/swiggy/sync', auth_1.requireCashier, integrationsController_1.syncSwiggyOrders);
router.put('/swiggy/orders/:order_id/status', auth_1.requireCashier, integrationsController_1.updateSwiggyOrderStatus);
router.post('/paytm/payment', auth_1.requireCashier, integrationsController_1.processPaytmPayment);
router.post('/zomato/webhook', integrationsController_1.zomatoWebhook);
router.post('/swiggy/webhook', integrationsController_1.swiggyWebhook);
router.post('/paytm/callback', integrationsController_1.paytmCallback);
exports.default = router;
//# sourceMappingURL=integrations.js.map