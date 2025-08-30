"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const alertController_1 = require("../controllers/alertController");
const router = (0, express_1.Router)();
router.use(auth_1.authenticateToken);
router.post('/email', auth_1.requireCashier, alertController_1.sendEmailAlert);
router.post('/whatsapp', auth_1.requireCashier, alertController_1.sendWhatsAppAlert);
router.post('/low-stock/:item_id', auth_1.requireCashier, alertController_1.sendLowStockAlert);
router.post('/expiry/:item_id', auth_1.requireCashier, alertController_1.sendExpiryAlert);
router.get('/logs', auth_1.requireCashier, alertController_1.getAlertLogs);
router.post('/test', auth_1.requireCashier, alertController_1.testAlertConfiguration);
exports.default = router;
//# sourceMappingURL=alerts.js.map