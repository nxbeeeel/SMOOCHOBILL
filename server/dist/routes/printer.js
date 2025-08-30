"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const printerController_1 = require("../controllers/printerController");
const router = (0, express_1.Router)();
router.use(auth_1.authenticateToken);
router.post('/bill/:order_id', auth_1.requireCashier, printerController_1.printBill);
router.post('/daily-summary', auth_1.requireCashier, printerController_1.printDailySummary);
router.post('/test', auth_1.requireCashier, printerController_1.testPrinter);
router.get('/config', auth_1.requireCashier, printerController_1.getPrinterConfig);
router.put('/config', auth_1.requireCashier, printerController_1.updatePrinterConfig);
router.get('/logs', auth_1.requireCashier, printerController_1.getPrintLogs);
exports.default = router;
//# sourceMappingURL=printer.js.map