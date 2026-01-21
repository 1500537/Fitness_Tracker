import Workout from "../models/workoutModal.js";
import Nutrition from "../models/nutritionModal.js";
import Progress from "../models/progressModal.js";
import User from "../models/userModal.js";

// Get dashboard data for a user
export const getDashboardData = async (req, res) => {
    try {
        const userId = req.user._id;

        // Get all data in parallel for better performance
        const [workouts, nutrition, progress] = await Promise.all([
            Workout.find({ userId }).sort({ createdAt: -1 }),
            Nutrition.find({ userId }).sort({ createdAt: -1 }),
            Progress.find({ userId }).sort({ createdAt: -1 })
        ]);

        // Calculate workout statistics
        const totalWorkouts = workouts.length;
        const completedWorkouts = workouts.filter(w => w.status === 'completed').length;
        const recentWorkouts = workouts.slice(0, 5);

        // Calculate nutrition statistics
        const totalCalories = nutrition.reduce((sum, meal) => sum + (meal.calories || 0), 0);
        const totalProtein = nutrition.reduce((sum, meal) => sum + (meal.protein || 0), 0);
        const totalCarbs = nutrition.reduce((sum, meal) => sum + (meal.carbs || 0), 0);
        const totalFats = nutrition.reduce((sum, meal) => sum + (meal.fats || 0), 0);
        const recentNutrition = nutrition.slice(0, 5);

        // Calculate progress statistics
        const uniqueProgress = progress.filter((item, index, arr) => 
            arr.findIndex(p => p._id.toString() === item._id.toString()) === index
        );
        const recentProgress = uniqueProgress.slice(0, 7);
        const progressChartData = progress.slice(-7).map(p => ({
            date: new Date(p.date).toLocaleDateString('en-GB', { month: 'short', day: 'numeric' }),
            weight: p.weight,
            bench: p.bench // Fixed: use 'bench' instead of 'benchPress'
        }));

        // Create progress bar data for the top visualization
        const progressBarData = progress.slice(-7).map((p, index) => ({
            date: new Date(p.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
            weight: p.bench, // Use bench press weight for the bars
            performance: Math.min(100, Math.round((p.bench / 150) * 100)), // Calculate performance based on 150kg max
            bench: p.bench,
            bodyWeight: p.weight,
            waist: p.waist,
            run: p.run || 0,
            score: p.score || 50
        }));

        // Calculate goals and achievements
        const goals = {
            type: 'bench',
            value: 100,
            current: progress.length > 0 ? progress[0].bench : 0 // Fixed: use 'bench' instead of 'benchPress'
        };

        const dashboardData = {
            stats: {
                totalWorkouts,
                completedWorkouts,
                totalCalories,
                totalProtein,
                totalCarbs,
                totalFats,
                workoutCompletionRate: totalWorkouts > 0 ? Math.round((completedWorkouts / totalWorkouts) * 100) : 0
            },
            recentWorkouts,
            recentNutrition,
            recentProgress,
            progressChartData,
            progressBarData,
            goals,
            lastUpdated: new Date()
        };

        res.json({
            success: true,
            dashboard: dashboardData
        });

    } catch (error) {
        console.error('Dashboard data error:', error);
        res.json({
            success: false,
            message: error.message
        });
    }
};

// Get dashboard summary (lightweight version for quick loads)
export const getDashboardSummary = async (req, res) => {
    try {
        const userId = req.user._id;

        const [workoutCount, nutritionCount, progressCount] = await Promise.all([
            Workout.countDocuments({ userId }),
            Nutrition.countDocuments({ userId }),
            Progress.countDocuments({ userId })
        ]);

        res.json({
            success: true,
            summary: {
                workouts: workoutCount,
                nutrition: nutritionCount,
                progress: progressCount,
                lastUpdated: new Date()
            }
        });

    } catch (error) {
        res.json({
            success: false,
            message: error.message
        });
    }
};

// Get user data including trial info
export const getUserData = async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId).select('-password');

        if (!user) {
            return res.json({
                success: false,
                message: 'User not found'
            });
        }

        // If starter and no trial start, initialize trial
        if (user.pricing === 'starter' && !user.trialStart) {
            const now = new Date();
            const trialEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days
            user.trialStart = now;
            user.trialEnd = trialEnd;
            await user.save();
        }

        res.json({
            success: true,
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                image: user.image,
                pricing: user.pricing,
                role: user.role,
                isAdmin: user.role === 'admin' || user.role === 'owner',
                isBanned: user.isBanned,
                banReason: user.banReason,
                goals: user.goals,
                trialStart: user.trialStart,
                trialEnd: user.trialEnd
            }
        });

    } catch (error) {
        res.json({
            success: false,
            message: error.message
        });
    }
};