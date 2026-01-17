import Progress from "../models/progressModal.js";
import User from "../models/userModal.js";

// Get all progress entries for a user
export const getProgress = async (req, res) => {
    try {
        const userId = req.user._id;
        const progress = await Progress.find({ userId }).sort({ date: -1 });
        res.json({ success: true, progress });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Add new progress entry
export const addProgress = async (req, res) => {
    try {
        const userId = req.user._id;
        const { date, weight, bench, run, waist, neck, height } = req.body;

        // Validation
        const weightNum = parseFloat(weight);
        if (isNaN(weightNum) || weightNum <= 0 || weightNum > 500) {
            return res.json({ success: false, message: 'Invalid weight' });
        }
        const benchNum = parseFloat(bench);
        if (isNaN(benchNum) || benchNum <= 0 || benchNum > 1000) {
            return res.json({ success: false, message: 'Invalid bench' });
        }
        const runNum = parseFloat(run || 0);
        if (isNaN(runNum) || runNum < 0 || runNum > 100) {
            return res.json({ success: false, message: 'Invalid run' });
        }
        const waistNum = parseFloat(waist);
        if (isNaN(waistNum) || waistNum <= 0 || waistNum > 200) {
            return res.json({ success: false, message: 'Invalid waist' });
        }
        const neckNum = parseFloat(neck || 40);
        if (isNaN(neckNum) || neckNum <= 0 || neckNum > 100) {
            return res.json({ success: false, message: 'Invalid neck' });
        }
        const heightNum = parseFloat(height);
        if (isNaN(heightNum) || heightNum <= 0 || heightNum > 300) {
            return res.json({ success: false, message: 'Invalid height' });
        }
        const dateObj = new Date(date);
        if (isNaN(dateObj.getTime())) {
            return res.json({ success: false, message: 'Invalid date' });
        }

        const progressData = { userId, date: dateObj, weight: weightNum, bench: benchNum, run: runNum, waist: waistNum, neck: neckNum, height: heightNum };
        const progress = new Progress(progressData);
        await progress.save();
        res.json({ success: true, progress });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Update progress entry
export const updateProgress = async (req, res) => {
    try {
        const userId = req.user._id;
        const { id } = req.params;
        const progress = await Progress.findOneAndUpdate(
            { _id: id, userId },
            req.body,
            { new: true }
        );
        if (!progress) {
            return res.json({ success: false, message: "Progress entry not found" });
        }
        res.json({ success: true, progress });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Delete progress entry
export const deleteProgress = async (req, res) => {
    try {
        const userId = req.user._id;
        const { id } = req.params;
        const progress = await Progress.findOneAndDelete({ _id: id, userId });
        if (!progress) {
            return res.json({ success: false, message: "Progress entry not found" });
        }
        res.json({ success: true, message: "Progress entry deleted" });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Get user goals
export const getGoals = async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId);
        res.json({ success: true, goals: user.goals });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Update user goals
export const updateGoals = async (req, res) => {
    try {
        const userId = req.user._id;
        const { type, value } = req.body;
        if (!type || !['bench', 'weight', 'run'].includes(type)) {
            return res.json({ success: false, message: 'Invalid goal type' });
        }
        const valueNum = parseFloat(value);
        if (isNaN(valueNum) || valueNum <= 0) {
            return res.json({ success: false, message: 'Invalid goal value' });
        }
        const user = await User.findByIdAndUpdate(userId, { goals: { type, value: valueNum } }, { new: true });
        res.json({ success: true, goals: user.goals });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};
