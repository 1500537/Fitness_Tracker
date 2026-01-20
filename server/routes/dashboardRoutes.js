import express from 'express';
import { getDashboardData, getDashboardSummary, getUserData } from '../controllers/dashboardController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// Get full dashboard data
router.get('/', authMiddleware, getDashboardData);

// Get dashboard summary (lightweight)
router.get('/summary', authMiddleware, getDashboardSummary);

// Get user data
router.get('/user', authMiddleware, getUserData);

export default router;