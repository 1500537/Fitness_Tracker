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
        const workoutData = { ...req.body, userId };
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
        const workout = await Workout.findOneAndUpdate(
            { _id: id, userId },
            req.body,
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