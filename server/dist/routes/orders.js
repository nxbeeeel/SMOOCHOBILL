"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const orderController_1 = require("../controllers/orderController");
const router = (0, express_1.Router)();
router.get('/', auth_1.authenticateToken, orderController_1.getAllOrders);
router.get('/summary/daily', auth_1.authenticateToken, orderController_1.getDailySummary);
router.get('/:id', auth_1.authenticateToken, orderController_1.getOrderById);
router.post('/', auth_1.authenticateToken, orderController_1.createOrder);
router.put('/:id', auth_1.authenticateToken, orderController_1.updateOrder);
router.delete('/:id', auth_1.authenticateToken, orderController_1.cancelOrder);
exports.default = router;
//# sourceMappingURL=orders.js.map