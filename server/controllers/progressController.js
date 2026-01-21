import Progress from "../models/progressModal.js";
import User from "../models/userModal.js";

// Professional vitality score calculation
const calculateVitalityScore = (data) => {
    const { weight, bench, run, waist, neck, height } = data;
    
    // Base score
    let score = 50;
    
    // Body Fat Percentage (using Navy Method)
    let bodyFat = 20; // Default
    if (waist && neck && height && waist > neck && height > 100) {
        // For males: BF% = 86.010 * log10(waist - neck) - 70.041 * log10(height) + 36.76
        try {
            const waistNeckDiff = waist - neck;
            if (waistNeckDiff > 10) { // Minimum reasonable difference
                bodyFat = 86.010 * Math.log10(waistNeckDiff) - 70.041 * Math.log10(height) + 36.76;
                bodyFat = Math.max(3, Math.min(50, bodyFat)); // Clamp between 3-50%
            }
        } catch (e) {
            bodyFat = 20; // Default if calculation fails
        }
    }
    
    // Strength ratio (bench press to body weight) - handle edge cases
    const strengthRatio = weight > 0 ? bench / weight : 0;
    
    // Cardiovascular fitness (run distance) - improved scaling
    const cardioScore = run > 0 ? Math.min(25, Math.max(0, run * 1.5)) : 0; // Max 25 points for running
    
    // Scoring algorithm with improved logic
    // Body composition (35% weight)
    if (bodyFat < 8) score += 25; // Exceptional
    else if (bodyFat < 12) score += 20; // Excellent
    else if (bodyFat < 15) score += 15; // Very good
    else if (bodyFat < 18) score += 10; // Good
    else if (bodyFat < 22) score += 5; // Average
    else if (bodyFat < 25) score += 0; // Below average
    else if (bodyFat > 30) score -= 10; // Poor
    
    // Strength assessment (40% weight) - improved benchmarks
    if (strengthRatio >= 2.0) score += 25; // Elite
    else if (strengthRatio >= 1.5) score += 20; // Advanced
    else if (strengthRatio >= 1.2) score += 15; // Good
    else if (strengthRatio >= 1.0) score += 10; // Average
    else if (strengthRatio >= 0.8) score += 5; // Beginner
    else score -= 5; // Needs improvement
    
    // Cardiovascular fitness (25% weight)
    score += cardioScore;
    
    // Bonus for balanced metrics
    const metricsComplete = [weight > 30, bench > 10, waist > 50, height > 140].filter(Boolean).length;
    score += metricsComplete * 2; // Up to 8 bonus points for complete data
    
    // Ensure score is between 0-100
    return Math.max(0, Math.min(100, Math.round(score)));
};

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

        // Validation with realistic human ranges
        const weightNum = parseFloat(weight);
        if (isNaN(weightNum) || weightNum < 30 || weightNum > 300) {
            return res.json({ success: false, message: 'Weight must be between 30-300 kg' });
        }
        const benchNum = parseFloat(bench);
        if (isNaN(benchNum) || benchNum < 5 || benchNum > 600) {
            return res.json({ success: false, message: 'Bench press must be between 5-600 kg' });
        }
        const runNum = parseFloat(run || 0);
        if (isNaN(runNum) || runNum < 0 || runNum > 50) {
            return res.json({ success: false, message: 'Run distance must be between 0-50 km' });
        }
        const waistNum = parseFloat(waist);
        if (isNaN(waistNum) || waistNum < 50 || waistNum > 200) {
            return res.json({ success: false, message: 'Waist must be between 50-200 cm' });
        }
        const neckNum = parseFloat(neck || 35);
        if (isNaN(neckNum) || neckNum < 25 || neckNum > 60) {
            return res.json({ success: false, message: 'Neck must be between 25-60 cm' });
        }
        const heightNum = parseFloat(height);
        if (isNaN(heightNum) || heightNum < 140 || heightNum > 220) {
            return res.json({ success: false, message: 'Height must be between 140-220 cm' });
        }
        const dateObj = new Date(date);
        if (isNaN(dateObj.getTime())) {
            return res.json({ success: false, message: 'Invalid date' });
        }

        const progressData = { userId, date: dateObj, weight: weightNum, bench: benchNum, run: runNum, waist: waistNum, neck: neckNum, height: heightNum };
        
        // Calculate professional vitality score
        const score = calculateVitalityScore({
            weight: weightNum,
            bench: benchNum,
            run: runNum,
            waist: waistNum,
            neck: neckNum,
            height: heightNum
        });
        
        progressData.score = score;
        
        const progress = new Progress(progressData);
        await progress.save();
        
        // Emit real-time update to user's progress room
        req.io.to(`progress-${userId}`).emit('progress-added', progress);
        
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
        
        // Recalculate score if metrics are being updated
        const updateData = { ...req.body };
        if (updateData.weight || updateData.bench || updateData.run || updateData.waist || updateData.neck || updateData.height) {
            // Get current progress data
            const currentProgress = await Progress.findOne({ _id: id, userId });
            if (currentProgress) {
                const updatedData = {
                    weight: updateData.weight || currentProgress.weight,
                    bench: updateData.bench || currentProgress.bench,
                    run: updateData.run || currentProgress.run,
                    waist: updateData.waist || currentProgress.waist,
                    neck: updateData.neck || currentProgress.neck,
                    height: updateData.height || currentProgress.height
                };
                updateData.score = calculateVitalityScore(updatedData);
            }
        }
        
        const progress = await Progress.findOneAndUpdate(
            { _id: id, userId },
            updateData,
            { new: true }
        );
        if (!progress) {
            return res.json({ success: false, message: "Progress entry not found" });
        }
        
        // Emit real-time update to user's progress room
        req.io.to(`progress-${userId}`).emit('progress-updated', progress);
        
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
        
        // Emit real-time update to user's progress room
        req.io.to(`progress-${userId}`).emit('progress-deleted', { id });
        
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
