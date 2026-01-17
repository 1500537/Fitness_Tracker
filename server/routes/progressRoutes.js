import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
    getProgress,
    addProgress,
    updateProgress,
    deleteProgress,
    getGoals,
    updateGoals
} from '../controllers/progressController.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Progress entries
router.get('/', getProgress);
router.post('/', addProgress);
router.put('/:id', updateProgress);
router.delete('/:id', deleteProgress);

// Goals
router.get('/goals', getGoals);
router.put('/goals', updateGoals);

export default router;