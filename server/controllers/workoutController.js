import Workout from "../models/workoutModal.js";

// Get all workouts for a user
export const getWorkouts = async (req, res) => {
    try {
        const userId = req.user._id;
        const workouts = await Workout.find({ userId }).sort({ createdAt: -1 });
        res.json({ success: true, workouts });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Create a new workout
export const createWorkout = async (req, res) => {
    try {
        const userId = req.user._id;
        const { name, category, sets, reps, weight, notes, tag } = req.body;

        // Validation
        if (!name || typeof name !== 'string' || name.trim().length < 2 || name.length > 100) {
            return res.json({ success: false, message: 'Invalid name' });
        }
        if (!category || !['Strength', 'Cardio', 'Power', 'Endurance', 'Hypertrophy'].includes(category)) {
            return res.json({ success: false, message: 'Invalid category' });
        }
        const setsNum = parseInt(sets);
        if (isNaN(setsNum) || setsNum < 1 || setsNum > 20) {
            return res.json({ success: false, message: 'Invalid sets' });
        }
        const repsNum = parseInt(reps);
        if (isNaN(repsNum) || repsNum < 1 || repsNum > 100) {
            return res.json({ success: false, message: 'Invalid reps' });
        }
        const weightNum = parseFloat(weight || 0);
        if (isNaN(weightNum) || weightNum < 0 || weightNum > 1000) {
            return res.json({ success: false, message: 'Invalid weight' });
        }
        if (notes && (typeof notes !== 'string' || notes.length > 500)) {
            return res.json({ success: false, message: 'Invalid notes' });
        }

        const workoutData = { userId, name: name.trim(), category, sets: setsNum, reps: repsNum, weight: weightNum, notes: notes ? notes.trim() : '', tag: tag || 'Hypertrophy' };
        const workout = new Workout(workoutData);
        await workout.save();
        res.json({ success: true, workout });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Update a workout
export const updateWorkout = async (req, res) => {
    try {
        const userId = req.user._id;
        const { id } = req.params;
        const { name, category, sets, reps, weight, notes, tag } = req.body;

        // Validation
        if (name && (typeof name !== 'string' || name.trim().length < 2 || name.length > 100)) {
            return res.json({ success: false, message: 'Invalid name' });
        }
        if (category && !['Strength', 'Cardio', 'Power', 'Endurance', 'Hypertrophy'].includes(category)) {
            return res.json({ success: false, message: 'Invalid category' });
        }
        if (sets !== undefined) {
            const setsNum = parseInt(sets);
            if (isNaN(setsNum) || setsNum < 1 || setsNum > 20) {
                return res.json({ success: false, message: 'Invalid sets' });
            }
        }
        if (reps !== undefined) {
            const repsNum = parseInt(reps);
            if (isNaN(repsNum) || repsNum < 1 || repsNum > 100) {
                return res.json({ success: false, message: 'Invalid reps' });
            }
        }
        if (weight !== undefined) {
            const weightNum = parseFloat(weight || 0);
            if (isNaN(weightNum) || weightNum < 0 || weightNum > 1000) {
                return res.json({ success: false, message: 'Invalid weight' });
            }
        }
        if (notes !== undefined && (typeof notes !== 'string' || notes.length > 500)) {
            return res.json({ success: false, message: 'Invalid notes' });
        }

        const updateData = {};
        if (name) updateData.name = name.trim();
        if (category) updateData.category = category;
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
            return res.json({ success: false, message: "Workout not found" });
        }
        res.json({ success: true, workout });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Delete a workout
export const deleteWorkout = async (req, res) => {
    try {
        const userId = req.user._id;
        const { id } = req.params;
        const workout = await Workout.findOneAndDelete({ _id: id, userId });
        if (!workout) {
            return res.json({ success: false, message: "Workout not found" });
        }
        res.json({ success: true, message: "Workout deleted" });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Mark workout as completed
export const completeWorkout = async (req, res) => {
    try {
        const userId = req.user._id;
        const { id } = req.params;
        const { duration } = req.body;
        const workout = await Workout.findOneAndUpdate(
            { _id: id, userId },
            { status: 'completed', completedAt: new Date(), duration },
            { new: true }
        );
        if (!workout) {
            return res.json({ success: false, message: "Workout not found" });
        }
        res.json({ success: true, workout });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};