import express from 'express';
import { register, login, getProfile, updateProfile, getAllUsers } from '../controllers/userController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);

// Admin routes
router.get('/admin/users', authenticate, requireAdmin, getAllUsers);

export default router;