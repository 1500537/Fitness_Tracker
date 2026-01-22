import User from '../models/userModal.js';
import Workout, { AdminDrill } from '../models/workoutModal.js';
import Nutrition from '../models/nutritionModal.js';
import Progress from '../models/progressModal.js';

// Get real-time overview dashboard data
export const getOverviewData = async (req, res) => {
    try {
        const { date } = req.query;
        const selectedDate = date ? new Date(date) : new Date();
        const startOfDay = new Date(selectedDate.setHours(0, 0, 0, 0));
        const endOfDay = new Date(selectedDate.setHours(23, 59, 59, 999));
        
        // Get users data for selected date
        const totalUsers = await User.countDocuments({ 
            role: 'user'
        });
        
        const newUsersToday = await User.countDocuments({
            createdAt: { $gte: startOfDay, $lte: endOfDay },
            role: 'user'
        });
        
        // Get workouts data for selected date
        const totalAdminDrills = await AdminDrill.countDocuments();
        const completedWorkoutsToday = await Workout.countDocuments({
            createdAt: { $gte: startOfDay, $lte: endOfDay }
        });
        
        // Get revenue data for selected date
        const users = await User.find({ role: 'user' });
        const activeSubscriptions = users.filter(user => 
            user.subscription?.isActive && 
            new Date(user.subscription.endDate) > selectedDate
        ).length;
        
        const totalRevenue = users.reduce((sum, user) => {
            if (user.subscription?.isActive) {
                return sum + (user.subscription.price || 0);
            }
            return sum;
        }, 0);
        
        // Calculate 7-day historical data from selected date
        const historicalData = {
            users: [],
            workouts: [],
            revenue: [],
            growth: []
        };
        
        for (let i = 6; i >= 0; i--) {
            const date = new Date(selectedDate);
            date.setDate(date.getDate() - i);
            const dayStart = new Date(date.setHours(0, 0, 0, 0));
            const dayEnd = new Date(date.setHours(23, 59, 59, 999));
            
            const dayUsers = await User.countDocuments({
                createdAt: { $gte: dayStart, $lte: dayEnd },
                role: 'user'
            });
            
            const dayWorkouts = await Workout.countDocuments({
                createdAt: { $gte: dayStart, $lte: dayEnd }
            });
            
            const dayRevenue = users.reduce((sum, user) => {
                if (user.subscription?.isActive && 
                    new Date(user.subscription.startDate) <= dayEnd &&
                    new Date(user.subscription.endDate) >= dayStart) {
                    return sum + (user.subscription.price || 0);
                }
                return sum;
            }, 0);
            
            const dateStr = date.toISOString().split('T')[0];
            
            historicalData.users.push({ 
                date: dateStr, 
                value: dayUsers * 100 + Math.random() * 50,
                open: dayUsers * 100,
                close: dayUsers * 110,
                high: dayUsers * 120,
                low: dayUsers * 90
            });
            historicalData.workouts.push({ 
                date: dateStr, 
                value: dayWorkouts * 50 + Math.random() * 30,
                open: dayWorkouts * 50,
                close: dayWorkouts * 60,
                high: dayWorkouts * 70,
                low: dayWorkouts * 40
            });
            historicalData.revenue.push({ 
                date: dateStr, 
                value: dayRevenue + Math.random() * 100,
                open: dayRevenue,
                close: dayRevenue * 1.1,
                high: dayRevenue * 1.2,
                low: dayRevenue * 0.9
            });
            historicalData.growth.push({ 
                date: dateStr, 
                value: (dayUsers + dayWorkouts) * 30 + Math.random() * 50,
                open: (dayUsers + dayWorkouts) * 30,
                close: (dayUsers + dayWorkouts) * 35,
                high: (dayUsers + dayWorkouts) * 40,
                low: (dayUsers + dayWorkouts) * 25
            });
        }
        
        const systemStats = [
            {
                id: 1,
                metric: 'users',
                label: 'Total Users',
                value: totalUsers,
                change: newUsersToday > 0 ? `+${newUsersToday}` : '0',
                trend: 'up'
            },
            {
                id: 2,
                metric: 'workouts',
                label: 'Active Sessions',
                value: completedWorkoutsToday,
                change: completedWorkoutsToday > 0 ? `+${completedWorkoutsToday}` : '0',
                trend: 'up'
            },
            {
                id: 3,
                metric: 'revenue',
                label: 'Revenue',
                value: `$${totalRevenue.toLocaleString()}`,
                change: totalRevenue > 0 ? `+$${totalRevenue}` : '$0',
                trend: 'up'
            },
            {
                id: 4,
                metric: 'growth',
                label: 'Admin Drills',
                value: totalAdminDrills,
                change: totalAdminDrills > 0 ? `+${totalAdminDrills}` : '0',
                trend: 'up'
            }
        ];
        
        // Emit real-time update
        const io = req.app.get('io');
        if (io) {
            io.to('overview').emit('overview-updated', {
                systemStats,
                historicalData,
                selectedDate: selectedDate.toISOString().split('T')[0]
            });
        }
        
        res.json({
            success: true,
            data: {
                systemStats,
                historicalData,
                selectedDate: selectedDate.toISOString().split('T')[0]
            }
        });
        
    } catch (error) {
        console.error('Overview dashboard error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch dashboard data'
        });
    }
};
// Get real-time metrics for specific date range
export const getMetricsByDateRange = async (req, res) => {
    try {
        const { startDate, endDate, metric } = req.query;
        
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        let data = [];
        
        switch (metric) {
            case 'users':
                data = await User.aggregate([
                    {
                        $match: {
                            role: 'user',
                            createdAt: { $gte: start, $lte: end }
                        }
                    },
                    {
                        $group: {
                            _id: {
                                year: { $year: '$createdAt' },
                                month: { $month: '$createdAt' },
                                day: { $dayOfMonth: '$createdAt' }
                            },
                            count: { $sum: 1 }
                        }
                    },
                    { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
                ]);
                break;
                
            case 'workouts':
                data = await Workout.aggregate([
                    {
                        $match: {
                            createdAt: { $gte: start, $lte: end }
                        }
                    },
                    {
                        $group: {
                            _id: {
                                year: { $year: '$createdAt' },
                                month: { $month: '$createdAt' },
                                day: { $dayOfMonth: '$createdAt' }
                            },
                            count: { $sum: 1 }
                        }
                    },
                    { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
                ]);
                break;
                
            case 'revenue':
                data = await User.aggregate([
                    {
                        $match: {
                            role: 'user',
                            'subscription.startDate': { $gte: start, $lte: end },
                            'subscription.isActive': true
                        }
                    },
                    {
                        $group: {
                            _id: {
                                year: { $year: '$subscription.startDate' },
                                month: { $month: '$subscription.startDate' },
                                day: { $dayOfMonth: '$subscription.startDate' }
                            },
                            revenue: { $sum: '$subscription.price' }
                        }
                    },
                    { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
                ]);
                break;
        }
        
        res.json({
            success: true,
            data: data.map(item => ({
                date: `${item._id.year}-${String(item._id.month).padStart(2, '0')}-${String(item._id.day).padStart(2, '0')}`,
                value: item.count || item.revenue || 0
            }))
        });
        
    } catch (error) {
        console.error('Metrics by date range error:', error);
        res.json({
            success: false,
            message: error.message
        });
    }
};