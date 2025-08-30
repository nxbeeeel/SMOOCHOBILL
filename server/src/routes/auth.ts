import { Router } from 'express';
import { authRateLimiter } from '../middleware/rateLimiter';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { login, getProfile, updateProfile, changePassword } from '../controllers/authController';

const router = Router();

// Public routes
router.post('/login', authRateLimiter, login);

// Protected routes
router.get('/profile', authenticateToken, getProfile);
router.put('/profile', authenticateToken, updateProfile);
router.put('/change-password', authenticateToken, changePassword);

export default router;

