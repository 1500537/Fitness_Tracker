import express from 'express';
import { getCurrentUser, checkRouteAccess } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Get current user info
router.get('/me', getCurrentUser);

// Check route access
router.get('/access/:route', checkRouteAccess);

export default router;