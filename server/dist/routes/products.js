"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const productController_1 = require("../controllers/productController");
const router = (0, express_1.Router)();
router.get('/', auth_1.authenticateToken, productController_1.getAllProducts);
router.get('/search', auth_1.authenticateToken, productController_1.searchProducts);
router.get('/categories', auth_1.authenticateToken, productController_1.getCategories);
router.get('/:id', auth_1.authenticateToken, productController_1.getProductById);
router.post('/', auth_1.authenticateToken, auth_1.requireAdmin, productController_1.createProduct);
router.put('/:id', auth_1.authenticateToken, auth_1.requireAdmin, productController_1.updateProduct);
router.delete('/:id', auth_1.authenticateToken, auth_1.requireAdmin, productController_1.deleteProduct);
exports.default = router;
//# sourceMappingURL=products.js.map