"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const inventoryController_1 = require("../controllers/inventoryController");
const router = (0, express_1.Router)();
router.use(auth_1.authenticateToken);
router.get('/', auth_1.requireCashier, inventoryController_1.getAllInventoryItems);
router.get('/:id', auth_1.requireCashier, inventoryController_1.getInventoryItemById);
router.post('/', auth_1.requireAdmin, inventoryController_1.createInventoryItem);
router.put('/:id', auth_1.requireAdmin, inventoryController_1.updateInventoryItem);
router.post('/:id/stock/add', auth_1.requireCashier, inventoryController_1.addStock);
router.post('/:id/stock/deduct', auth_1.requireCashier, inventoryController_1.deductStock);
router.get('/:id/transactions', auth_1.requireCashier, inventoryController_1.getStockTransactions);
router.get('/alerts/low-stock', auth_1.requireCashier, inventoryController_1.getLowStockAlerts);
router.get('/alerts/expiry', auth_1.requireCashier, inventoryController_1.getExpiryAlerts);
router.get('/reports/summary', auth_1.requireCashier, inventoryController_1.getInventoryReport);
exports.default = router;
//# sourceMappingURL=inventory.js.map