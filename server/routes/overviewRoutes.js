import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { getOverviewData, getMetricsByDateRange } from '../controllers/overviewController.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Get real-time overview dashboard data
router.get('/dashboard', getOverviewData);

// Get metrics by date range
router.get('/metrics', getMetricsByDateRange);

export default router;