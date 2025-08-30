"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const rateLimiter_1 = require("../middleware/rateLimiter");
const auth_1 = require("../middleware/auth");
const authController_1 = require("../controllers/authController");
const router = (0, express_1.Router)();
router.post('/login', rateLimiter_1.authRateLimiter, authController_1.login);
router.get('/profile', auth_1.authenticateToken, authController_1.getProfile);
router.put('/profile', auth_1.authenticateToken, authController_1.updateProfile);
router.put('/change-password', auth_1.authenticateToken, authController_1.changePassword);
exports.default = router;
//# sourceMappingURL=auth.js.map