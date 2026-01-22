import express from 'express';
import {
    testConnection,
    getRevenueDashboard,
    createSubscription,
    updateSubscription,
    deleteSubscription,
    getAllSubscriptions,
    getSubscription,
    extendSubscription,
    cancelSubscription,
    getSubscriptionAnalytics,
    generatePDFReport
} from '../controllers/revenueController.js';

const router = express.Router();

// Test endpoint (no auth required)
router.get('/test', testConnection);

// Revenue dashboard data
router.get('/dashboard', getRevenueDashboard);

// Subscription CRUD operations
router.post('/subscriptions', createSubscription);
router.get('/subscriptions', getAllSubscriptions);
router.get('/subscriptions/:subscriptionId', getSubscription);
router.put('/subscriptions/:subscriptionId', updateSubscription);
router.delete('/subscriptions/:subscriptionId', deleteSubscription);

// Subscription management
router.patch('/subscriptions/:subscriptionId/extend', extendSubscription);
router.patch('/subscriptions/:subscriptionId/cancel', cancelSubscription);

// Analytics
router.get('/analytics', getSubscriptionAnalytics);

// Generate PDF report
router.post('/generate-pdf', generatePDFReport);

export default router;