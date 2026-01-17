import Workout from "../models/workoutModal.js";
import Nutrition from "../models/nutritionModal.js";
import Progress from "../models/progressModal.js";

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
        const recentProgress = progress.slice(0, 7);
        const progressChartData = progress.slice(-7).map(p => ({
            date: new Date(p.date).toLocaleDateString('en-GB', { month: 'short', day: 'numeric' }),
            weight: p.weight,
            bench: p.benchPress
        }));

        // Create progress bar data for the top visualization
        const progressBarData = progress.slice(-7).map((p, index) => ({
            date: new Date(p.date).toLocaleDateString('en-US', { weekday: 'short' }),
            weight: p.weight,
            performance: Math.min(100, 70 + index * 5), // Mock performance based on progress
            chest: p.benchPress
        }));

        // Calculate goals and achievements
        const goals = {
            type: 'bench',
            value: 100,
            current: progress.length > 0 ? progress[0].benchPress : 0
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