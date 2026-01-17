import express from 'express';
import { getDashboardData, getDashboardSummary } from '../controllers/dashboardController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// Get full dashboard data
router.get('/', authMiddleware, getDashboardData);

// Get dashboard summary (lightweight)
router.get('/summary', authMiddleware, getDashboardSummary);

export default router;