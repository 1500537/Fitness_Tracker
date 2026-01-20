import express from 'express';
import {
    getAllAdminDrills,
    createAdminDrill,
    updateAdminDrill,
    deleteAdminDrill,
    uploadDrillMedia,
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory
} from '../controllers/workoutOverviewController.js';
import { protect } from '../middleware/authMiddleware.js';
import upload, { handleMulterError } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// ===== ADMIN DRILLS ROUTES =====
// GET /api/workout-overview/drills - Get all admin drills
router.get('/drills', protect, getAllAdminDrills);

// POST /api/workout-overview/drills - Create new admin drill
router.post('/drills', protect, createAdminDrill);

// PUT /api/workout-overview/drills/:id - Update admin drill
router.put('/drills/:id', protect, updateAdminDrill);

// DELETE /api/workout-overview/drills/:id - Delete admin drill
router.delete('/drills/:id', protect, deleteAdminDrill);

// POST /api/workout-overview/drills/upload - Upload media for drill
router.post('/drills/upload', protect, upload.single('media'), handleMulterError, uploadDrillMedia);

// ===== CATEGORY ROUTES =====
// GET /api/workout-overview/categories - Get all categories
router.get('/categories', protect, getCategories);

// POST /api/workout-overview/categories - Create new category
router.post('/categories', protect, createCategory);

// PUT /api/workout-overview/categories/:id - Update category
router.put('/categories/:id', protect, updateCategory);

// DELETE /api/workout-overview/categories/:id - Delete category
router.delete('/categories/:id', protect, deleteCategory);

export default router;