"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireCashier = exports.requireAdmin = exports.requireRole = exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({
            error: 'Access token required',
            message: 'Please provide a valid authentication token'
        });
    }
    try {
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            throw new Error('JWT_SECRET not configured');
        }
        const decoded = jsonwebtoken_1.default.verify(token, secret);
        req.user = decoded.user;
        next();
        return;
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            return res.status(403).json({
                error: 'Invalid token',
                message: 'The provided token is invalid or expired'
            });
        }
        console.error('Token verification error:', error);
        return res.status(500).json({
            error: 'Token verification failed',
            message: 'Internal server error during authentication'
        });
    }
};
exports.authenticateToken = authenticateToken;
const requireRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                error: 'Authentication required',
                message: 'User must be authenticated'
            });
        }
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                error: 'Insufficient permissions',
                message: `Access denied. Required roles: ${roles.join(', ')}`
            });
        }
        next();
        return;
    };
};
exports.requireRole = requireRole;
exports.requireAdmin = (0, exports.requireRole)(['admin']);
exports.requireCashier = (0, exports.requireRole)(['admin', 'cashier']);
//# sourceMappingURL=auth.js.map