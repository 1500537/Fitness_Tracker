import express from 'express';
import { 
    getRevenueDashboard, 
    createSubscription, 
    updateSubscription,
    deleteSubscription,
    getAllSubscriptions,
    getSubscription,
    extendSubscription,
    cancelSubscription,
    getSubscriptionAnalytics,
    testConnection
} from '../controllers/revenueController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Test endpoint (no auth required)
router.get('/test', testConnection);

// Dashboard endpoint (temporarily no auth for testing)
router.get('/dashboard', getRevenueDashboard);

// Subscription CRUD (temporarily no auth)
router.post('/subscription', createSubscription);
router.put('/subscription/:subscriptionId', updateSubscription);
router.delete('/subscription/:subscriptionId', deleteSubscription);
router.patch('/subscription/:subscriptionId/extend', extendSubscription);
router.patch('/subscription/:subscriptionId/cancel', cancelSubscription);

// All other routes require authentication
router.use(protect);
router.get('/analytics', getSubscriptionAnalytics);
router.get('/subscriptions', getAllSubscriptions);
router.get('/subscription/:subscriptionId', getSubscription);

export default router;