import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
    getAllUsers,
    updateUser,
    deleteUser,
    toggleUserBan,
    checkUserStatus,
    getUserSubscription,
    getCurrentUser,
    updateCurrentUserPricing,
    initializeSubscription,
    forceUpdateSubscription,
    getSubscriptionTimer,
    getSubscriptionDetails
} from '../controllers/userController.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Get subscription timer
router.get('/me/timer', getSubscriptionTimer);

// Get subscription details with pricing
router.get('/me/subscription-details', getSubscriptionDetails);

// Force update subscription
router.post('/me/force-subscription', forceUpdateSubscription);

// Initialize subscription
router.post('/me/init-subscription', initializeSubscription);

// Update current user pricing
router.put('/me/pricing', updateCurrentUserPricing);

// Get current user data
router.get('/me', getCurrentUser);

// Get all users (Admin only)
router.get('/all', getAllUsers);

// Check user status (for login validation)
router.get('/status', checkUserStatus);

// Get user subscription
router.get('/subscription', getUserSubscription);

// Update user (Admin only)
router.put('/:userId', updateUser);

// Delete user (Admin only)
router.delete('/:userId', deleteUser);

// Toggle user ban status (Admin only)
router.patch('/:userId/ban', toggleUserBan);

export default router;
