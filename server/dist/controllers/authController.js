"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePassword = exports.updateProfile = exports.getProfile = exports.login = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const database_1 = __importDefault(require("../database"));
const errorHandler_1 = require("../middleware/errorHandler");
const login = async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            throw (0, errorHandler_1.createError)('Username and password are required', 400);
        }
        const user = await database_1.default.get('SELECT * FROM users WHERE username = ? AND is_active = 1', [username]);
        if (!user) {
            throw (0, errorHandler_1.createError)('Invalid username or password', 401);
        }
        const isValidPassword = await bcryptjs_1.default.compare(password, user.password_hash);
        if (!isValidPassword) {
            throw (0, errorHandler_1.createError)('Invalid username or password', 401);
        }
        await database_1.default.run('UPDATE users SET last_login = datetime("now") WHERE id = ?', [user.id]);
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            throw (0, errorHandler_1.createError)('JWT_SECRET not configured', 500);
        }
        const token = jsonwebtoken_1.default.sign({
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        }, secret, {
            expiresIn: process.env.JWT_EXPIRES_IN || '24h'
        });
        const { password_hash, ...userWithoutPassword } = user;
        const response = {
            user: userWithoutPassword,
            token,
            expires_in: 24 * 60 * 60
        };
        res.json({
            success: true,
            data: response,
            message: 'Login successful'
        });
    }
    catch (error) {
        if (error instanceof Error && 'statusCode' in error) {
            throw error;
        }
        console.error('Login error:', error);
        throw (0, errorHandler_1.createError)('Login failed', 500);
    }
};
exports.login = login;
const getProfile = async (req, res) => {
    try {
        if (!req.user) {
            throw (0, errorHandler_1.createError)('User not authenticated', 401);
        }
        const user = await database_1.default.get('SELECT id, username, email, role, created_at, last_login, is_active FROM users WHERE id = ?', [req.user.id]);
        if (!user) {
            throw (0, errorHandler_1.createError)('User not found', 404);
        }
        res.json({
            success: true,
            data: user,
            message: 'Profile retrieved successfully'
        });
    }
    catch (error) {
        if (error instanceof Error && 'statusCode' in error) {
            throw error;
        }
        console.error('Get profile error:', error);
        throw (0, errorHandler_1.createError)('Failed to get profile', 500);
    }
};
exports.getProfile = getProfile;
const updateProfile = async (req, res) => {
    try {
        if (!req.user) {
            throw (0, errorHandler_1.createError)('User not authenticated', 401);
        }
        const { email } = req.body;
        if (email && !isValidEmail(email)) {
            throw (0, errorHandler_1.createError)('Invalid email format', 400);
        }
        if (email) {
            const existingUser = await database_1.default.get('SELECT id FROM users WHERE email = ? AND id != ?', [email, req.user.id]);
            if (existingUser) {
                throw (0, errorHandler_1.createError)('Email already in use', 400);
            }
        }
        const updateFields = [];
        const params = [];
        if (email) {
            updateFields.push('email = ?');
            params.push(email);
        }
        if (updateFields.length === 0) {
            throw (0, errorHandler_1.createError)('No fields to update', 400);
        }
        updateFields.push('updated_at = datetime("now")');
        params.push(req.user.id);
        await database_1.default.run(`UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`, params);
        const updatedUser = await database_1.default.get('SELECT id, username, email, role, created_at, last_login, is_active FROM users WHERE id = ?', [req.user.id]);
        res.json({
            success: true,
            data: updatedUser,
            message: 'Profile updated successfully'
        });
    }
    catch (error) {
        if (error instanceof Error && 'statusCode' in error) {
            throw error;
        }
        console.error('Update profile error:', error);
        throw (0, errorHandler_1.createError)('Failed to update profile', 500);
    }
};
exports.updateProfile = updateProfile;
const changePassword = async (req, res) => {
    try {
        if (!req.user) {
            throw (0, errorHandler_1.createError)('User not authenticated', 401);
        }
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword) {
            throw (0, errorHandler_1.createError)('Current password and new password are required', 400);
        }
        if (newPassword.length < 6) {
            throw (0, errorHandler_1.createError)('New password must be at least 6 characters long', 400);
        }
        const user = await database_1.default.get('SELECT password_hash FROM users WHERE id = ?', [req.user.id]);
        if (!user) {
            throw (0, errorHandler_1.createError)('User not found', 404);
        }
        const isValidPassword = await bcryptjs_1.default.compare(currentPassword, user.password_hash);
        if (!isValidPassword) {
            throw (0, errorHandler_1.createError)('Current password is incorrect', 401);
        }
        const saltRounds = 10;
        const newPasswordHash = await bcryptjs_1.default.hash(newPassword, saltRounds);
        await database_1.default.run('UPDATE users SET password_hash = ?, updated_at = datetime("now") WHERE id = ?', [newPasswordHash, req.user.id]);
        res.json({
            success: true,
            message: 'Password changed successfully'
        });
    }
    catch (error) {
        if (error instanceof Error && 'statusCode' in error) {
            throw error;
        }
        console.error('Change password error:', error);
        throw (0, errorHandler_1.createError)('Failed to change password', 500);
    }
};
exports.changePassword = changePassword;
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}
//# sourceMappingURL=authController.js.map