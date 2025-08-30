"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const reportsController_1 = require("../controllers/reportsController");
const router = (0, express_1.Router)();
router.use(auth_1.authenticateToken);
router.get('/daily-sales', auth_1.requireCashier, reportsController_1.getDailySalesSummary);
router.get('/monthly', auth_1.requireCashier, reportsController_1.getMonthlyReport);
router.get('/profit-analysis', auth_1.requireCashier, reportsController_1.getProfitAnalysis);
router.get('/stock-usage', auth_1.requireCashier, reportsController_1.getStockUsageReport);
router.get('/export/daily-sales-pdf', auth_1.requireCashier, reportsController_1.exportDailySalesPDF);
exports.default = router;
//# sourceMappingURL=reports.js.map