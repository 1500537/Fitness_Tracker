import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
    getWorkouts,
    createWorkout,
    updateWorkout,
    deleteWorkout,
    completeWorkout
} from '../controllers/workoutController.js';

const router = express.Router();

// All user workout routes require authentication
router.use(protect);

// Get all workouts for the authenticated user
router.get('/', getWorkouts);

// Create a new workout
router.post('/', createWorkout);

// Update a workout
router.put('/:id', updateWorkout);

// Delete a workout
router.delete('/:id', deleteWorkout);

// Mark workout as completed
router.patch('/:id/complete', completeWorkout);

export default router;