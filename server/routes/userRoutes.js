import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
    getAllUsers,
    updateUser,
    deleteUser,
    toggleUserBan,
    checkUserStatus
} from '../controllers/userController.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Get all users (Admin only)
router.get('/all', getAllUsers);

// Check user status (for login validation)
router.get('/status', checkUserStatus);

// Update user (Admin only)
router.put('/:userId', updateUser);

// Delete user (Admin only)
router.delete('/:userId', deleteUser);

// Toggle user ban status (Admin only)
router.patch('/:userId/ban', toggleUserBan);

export default router;
