import Workout from "../models/workoutModal.js";
import { Category } from "../models/workoutModal.js";

// Get all workouts for a user
export const getWorkouts = async (req, res) => {
    try {
        const userId = req.user._id;
        const workouts = await Workout.find({ userId }).sort({ createdAt: -1 });
        res.json({ success: true, workouts });
    } catch (error) {
        console.error('Error fetching workouts:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Create a new workout
export const createWorkout = async (req, res) => {
    try {
        const userId = req.user._id;
        const { name, category, sets, reps, weight, notes, tag } = req.body;

        console.log('Creating workout:', { name, category, sets, reps, weight, notes, tag });

        // Validation
        if (!name || typeof name !== 'string' || name.trim().length < 2 || name.length > 100) {
            return res.status(400).json({ success: false, message: 'Exercise name must be 2-100 characters' });
        }
        
        // Check if category exists in database
        if (!category) {
            return res.status(400).json({ success: false, message: 'Category is required' });
        }
        
        const existingCategory = await Category.findOne({ name: category.toUpperCase(), isActive: true });
        if (!existingCategory) {
            return res.status(400).json({ success: false, message: `Category "${category}" does not exist` });
        }
        
        const setsNum = parseInt(sets);
        if (isNaN(setsNum) || setsNum < 1 || setsNum > 20) {
            return res.status(400).json({ success: false, message: 'Sets must be between 1-20' });
        }
        
        const repsNum = parseInt(reps);
        if (isNaN(repsNum) || repsNum < 1 || repsNum > 100) {
            return res.status(400).json({ success: false, message: 'Reps must be between 1-100' });
        }
        
        const weightNum = parseFloat(weight || 0);
        if (isNaN(weightNum) || weightNum < 0 || weightNum > 1000) {
            return res.status(400).json({ success: false, message: 'Weight must be between 0-1000 kg' });
        }
        
        if (notes && (typeof notes !== 'string' || notes.length > 500)) {
            return res.status(400).json({ success: false, message: 'Notes must be less than 500 characters' });
        }

        const workoutData = { 
            userId, 
            name: name.trim(), 
            category: category.toUpperCase(), 
            sets: setsNum, 
            reps: repsNum, 
            weight: weightNum, 
            notes: notes ? notes.trim() : '', 
            tag: tag || 'Hypertrophy' 
        };
        
        const workout = new Workout(workoutData);
        await workout.save();
        
        console.log('Workout created successfully:', workout);
        res.json({ success: true, workout, message: 'Workout created successfully' });
    } catch (error) {
        console.error('Error creating workout:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update a workout
export const updateWorkout = async (req, res) => {
    try {
        const userId = req.user._id;
        const { id } = req.params;
        const { name, category, sets, reps, weight, notes, tag } = req.body;

        console.log('Updating workout:', { id, name, category, sets, reps, weight });

        // Validation
        if (name && (typeof name !== 'string' || name.trim().length < 2 || name.length > 100)) {
            return res.status(400).json({ success: false, message: 'Exercise name must be 2-100 characters' });
        }
        
        // Check if category exists in database
        if (category) {
            const existingCategory = await Category.findOne({ name: category.toUpperCase(), isActive: true });
            if (!existingCategory) {
                return res.status(400).json({ success: false, message: `Category "${category}" does not exist` });
            }
        }
        
        if (sets !== undefined) {
            const setsNum = parseInt(sets);
            if (isNaN(setsNum) || setsNum < 1 || setsNum > 20) {
                return res.status(400).json({ success: false, message: 'Sets must be between 1-20' });
            }
        }
        
        if (reps !== undefined) {
            const repsNum = parseInt(reps);
            if (isNaN(repsNum) || repsNum < 1 || repsNum > 100) {
                return res.status(400).json({ success: false, message: 'Reps must be between 1-100' });
            }
        }
        
        if (weight !== undefined) {
            const weightNum = parseFloat(weight || 0);
            if (isNaN(weightNum) || weightNum < 0 || weightNum > 1000) {
                return res.status(400).json({ success: false, message: 'Weight must be between 0-1000 kg' });
            }
        }
        
        if (notes !== undefined && (typeof notes !== 'string' || notes.length > 500)) {
            return res.status(400).json({ success: false, message: 'Notes must be less than 500 characters' });
        }

        const updateData = {};
        if (name) updateData.name = name.trim();
        if (category) updateData.category = category.toUpperCase();
        if (sets !== undefined) updateData.sets = parseInt(sets);
        if (reps !== undefined) updateData.reps = parseInt(reps);
        if (weight !== undefined) updateData.weight = parseFloat(weight || 0);
        if (notes !== undefined) updateData.notes = notes.trim();
        if (tag) updateData.tag = tag;

        const workout = await Workout.findOneAndUpdate(
            { _id: id, userId },
            updateData,
            { new: true }
        );
        
        if (!workout) {
            return res.status(404).json({ success: false, message: "Workout not found" });
        }
        
        console.log('Workout updated successfully:', workout);
        res.json({ success: true, workout, message: 'Workout updated successfully' });
    } catch (error) {
        console.error('Error updating workout:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Delete a workout
export const deleteWorkout = async (req, res) => {
    try {
        const userId = req.user._id;
        const { id } = req.params;
        
        console.log('Deleting workout:', { id, userId });
        
        // Validate ObjectId format
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ success: false, message: "Invalid workout ID format" });
        }
        
        const workout = await Workout.findOneAndDelete({ _id: id, userId });
        if (!workout) {
            return res.status(404).json({ success: false, message: "Workout not found or already deleted" });
        }
        
        console.log('Workout deleted successfully:', workout.name);
        res.json({ success: true, message: "Workout deleted successfully" });
    } catch (error) {
        console.error('Error deleting workout:', error);
        if (error.name === 'CastError') {
            return res.status(400).json({ success: false, message: "Invalid workout ID" });
        }
        res.status(500).json({ success: false, message: error.message });
    }
};

// Mark workout as completed
export const completeWorkout = async (req, res) => {
    try {
        const userId = req.user._id;
        const { id } = req.params;
        const { duration } = req.body;
        
        console.log('Completing workout:', { id, duration });
        
        const workout = await Workout.findOneAndUpdate(
            { _id: id, userId },
            { status: 'completed', completedAt: new Date(), duration: duration || 0 },
            { new: true }
        );
        
        if (!workout) {
            return res.status(404).json({ success: false, message: "Workout not found" });
        }
        
        console.log('Workout completed successfully:', workout.name);
        res.json({ success: true, workout, message: 'Workout completed successfully' });
    } catch (error) {
        console.error('Error completing workout:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};