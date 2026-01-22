import { SubscriptionRecord, Revenue } from "../models/subscriptionModal.js";
import User from "../models/userModal.js";

// Test endpoint (no auth required)
export const testConnection = async (req, res) => {
    try {
        const subscriptionCount = await SubscriptionRecord.countDocuments();
        const userCount = await User.countDocuments();
        const revenueCount = await Revenue.countDocuments();
        
        // Get some sample data
        const sampleSubscriptions = await SubscriptionRecord.find().limit(3).populate('userId', 'username email');
        const activeSubscriptions = await SubscriptionRecord.countDocuments({ status: 'active' });
        
        res.json({
            success: true,
            message: "Database connection successful",
            data: {
                subscriptions: subscriptionCount,
                activeSubscriptions,
                users: userCount,
                revenueRecords: revenueCount,
                sampleData: sampleSubscriptions.map(sub => ({
                    plan: sub.planName,
                    price: sub.planPrice,
                    user: sub.userId?.username || 'Unknown',
                    status: sub.status
                })),
                timestamp: new Date().toISOString()
            }
        });
    } catch (error) {
        console.error('Test connection error:', error);
        res.json({ success: false, message: error.message });
    }
};

// Get revenue dashboard data
export const getRevenueDashboard = async (req, res) => {
    try {
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const yesterdayStart = new Date(todayStart.getTime() - 24 * 60 * 60 * 1000);
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        
        // Get real-time data from users with active subscriptions (exclude admins)
        const activeUsers = await User.find({
            'subscription.isActive': true,
            role: { $ne: 'admin' }
        });
        
        // Calculate total revenue from user subscription prices
        const totalRevenue = activeUsers.reduce((sum, user) => {
            return sum + (user.subscription?.price || 0);
        }, 0);
        
        // Count active users
        const activeSubscriptions = activeUsers.length;
        
        // Today's revenue (new subscriptions today)
        const todaySubscriptions = await User.find({
            'subscription.startDate': { $gte: todayStart },
            'subscription.isActive': true,
            role: { $ne: 'admin' }
        });
        const todayRevenue = todaySubscriptions.reduce((sum, user) => sum + (user.subscription?.price || 0), 0);
        
        // Yesterday's revenue for comparison
        const yesterdaySubscriptions = await User.find({
            'subscription.startDate': { $gte: yesterdayStart, $lt: todayStart },
            'subscription.isActive': true,
            role: { $ne: 'admin' }
        });
        const yesterdayRevenue = yesterdaySubscriptions.reduce((sum, user) => sum + (user.subscription?.price || 0), 0);
        
        // New subscriptions this month
        const thisMonthNewSubs = await User.countDocuments({
            'subscription.startDate': { $gte: monthStart },
            'subscription.isActive': true,
            role: { $ne: 'admin' }
        });
        
        // Last month's new subscriptions for comparison
        const lastMonthNewSubs = await User.countDocuments({
            'subscription.startDate': { $gte: lastMonthStart, $lt: monthStart },
            'subscription.isActive': true,
            role: { $ne: 'admin' }
        });
        
        // Cancelled subscriptions this month (churn)
        const thisMonthCancelled = await User.countDocuments({
            'subscription.isActive': false,
            'subscription.expiresAt': { $gte: monthStart, $lt: now },
            role: { $ne: 'admin' }
        });
        
        // Last month's cancelled for comparison
        const lastMonthCancelled = await User.countDocuments({
            'subscription.isActive': false,
            'subscription.expiresAt': { $gte: lastMonthStart, $lt: monthStart },
            role: { $ne: 'admin' }
        });
        
        // Calculate percentages
        const todayRevenueChange = yesterdayRevenue > 0 ? ((todayRevenue - yesterdayRevenue) / yesterdayRevenue * 100).toFixed(1) : '0.0';
        const newSubsChange = lastMonthNewSubs > 0 ? ((thisMonthNewSubs - lastMonthNewSubs) / lastMonthNewSubs * 100).toFixed(1) : '0.0';
        const churnRate = activeSubscriptions > 0 ? (thisMonthCancelled / (activeSubscriptions + thisMonthCancelled) * 100).toFixed(1) : '0.0';
        const lastChurnRate = lastMonthCancelled > 0 ? (lastMonthCancelled / (lastMonthNewSubs + lastMonthCancelled) * 100) : 0;
        const churnChange = lastChurnRate > 0 ? ((parseFloat(churnRate) - lastChurnRate) / lastChurnRate * 100).toFixed(1) : '0.0';
        
        // Average revenue per user
        const avgRevenuePerUser = activeSubscriptions > 0 ? (totalRevenue / activeSubscriptions).toFixed(0) : 0;
        const lastMonthActiveUsers = await User.countDocuments({
            'subscription.startDate': { $lt: monthStart },
            'subscription.expiresAt': { $gte: lastMonthStart },
            role: { $ne: 'admin' }
        });
        const lastMonthTotalRevenue = await User.aggregate([
            { $match: { 'subscription.startDate': { $lt: monthStart }, 'subscription.expiresAt': { $gte: lastMonthStart }, role: { $ne: 'admin' } } },
            { $group: { _id: null, total: { $sum: '$subscription.price' } } }
        ]);
        const lastMonthAvgRevenue = lastMonthActiveUsers > 0 && lastMonthTotalRevenue[0] ? (lastMonthTotalRevenue[0].total / lastMonthActiveUsers) : 0;
        const avgRevenueChange = lastMonthAvgRevenue > 0 ? ((avgRevenuePerUser - lastMonthAvgRevenue) / lastMonthAvgRevenue * 100).toFixed(1) : '0.0';
        
        // Get chart data from subscription records and user payments
        const allChartData = await User.aggregate([
            {
                $match: {
                    'subscription.isActive': true,
                    'subscription.startDate': { $exists: true },
                    role: { $ne: 'admin' }
                }
            },
            {
                $group: {
                    _id: { 
                        month: { $dateToString: { format: "%b", date: "$subscription.startDate" } },
                        plan: "$subscription.planName"
                    },
                    revenue: { $sum: "$subscription.price" },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id.month": 1 } }
        ]);
        
        // Create comprehensive chart data
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const formattedChartData = [];
        
        // Add data for all plans combined
        months.forEach(month => {
            const monthData = allChartData.filter(d => d._id.month === month);
            const totalRevenue = monthData.reduce((sum, d) => sum + d.revenue, 0);
            const totalCount = monthData.reduce((sum, d) => sum + d.count, 0);
            
            formattedChartData.push({
                date: month,
                revenue: totalRevenue,
                subscriptions: totalCount,
                planFilter: 'all'
            });
        });
        
        // Add data for each plan type
        ['starter', 'pro', 'elite'].forEach(planType => {
            months.forEach(month => {
                const monthData = allChartData.find(d => 
                    d._id.month === month && 
                    d._id.plan?.toLowerCase().includes(planType)
                );
                
                formattedChartData.push({
                    date: month,
                    revenue: monthData ? monthData.revenue : 0,
                    subscriptions: monthData ? monthData.count : 0,
                    planFilter: planType
                });
            });
        });
        
        // Calculate real-time metrics
        const totalUsers = await User.countDocuments({ role: { $ne: 'admin' } });
        const syncStability = activeSubscriptions > 0 ? ((activeSubscriptions / totalUsers) * 100).toFixed(1) : '0.0';
        const lastMonthSyncStability = lastMonthActiveUsers > 0 && totalUsers > 0 ? ((lastMonthActiveUsers / totalUsers) * 100) : 0;
        const syncStabilityChange = lastMonthSyncStability > 0 ? ((parseFloat(syncStability) - lastMonthSyncStability) / lastMonthSyncStability * 100).toFixed(1) : '0.0';
        
        // Calculate monthly recurring revenue
        const monthlyRevenue = activeUsers.reduce((sum, user) => {
            if (user.subscription?.billingCycle === 'monthly') {
                return sum + (user.subscription?.price || 0);
            } else if (user.subscription?.billingCycle === 'annually') {
                return sum + ((user.subscription?.price || 0) / 12); // Convert annual to monthly
            }
            return sum;
        }, 0);
        const lastMonthMRR = lastMonthTotalRevenue[0] ? (lastMonthTotalRevenue[0].total / 12) : 0;
        const mrrChange = lastMonthMRR > 0 ? ((monthlyRevenue - lastMonthMRR) / lastMonthMRR * 100).toFixed(1) : '0.0';
        
        const metrics = {
            totalRevenue,
            activeSubscriptions,
            conversionRate: `${syncStability}%`,
            powerConsumption: `$${monthlyRevenue.toFixed(0)}`
        };
        
        // Quick stats with real calculations
        const quickStats = {
            todayRevenue: {
                value: `$${todayRevenue.toLocaleString()}`,
                change: `${todayRevenueChange >= 0 ? '+' : ''}${todayRevenueChange}%`
            },
            newSubscriptions: {
                value: thisMonthNewSubs.toString(),
                change: `${newSubsChange >= 0 ? '+' : ''}${newSubsChange}%`
            },
            churnRate: {
                value: `${churnRate}%`,
                change: `${churnChange >= 0 ? '+' : ''}${churnChange}%`
            },
            avgRevenuePerUser: {
                value: `$${avgRevenuePerUser}`,
                change: `${avgRevenueChange >= 0 ? '+' : ''}${avgRevenueChange}%`
            }
        };
        
        // Get subscription data for table
        const subscriptions = activeUsers.map(user => ({
            id: user._id,
            userName: user.username,
            userEmail: user.email,
            planName: user.subscription?.planName || user.pricing,
            billingCycle: user.subscription?.billingCycle || 'monthly',
            amount: user.subscription?.price || 0,
            startDate: user.subscription?.startDate,
            endDate: user.subscription?.expiresAt,
            status: 'active',
            role: user.role
        }));
        
        res.json({
            success: true,
            data: {
                metrics,
                quickStats,
                chartData: formattedChartData,
                subscriptions,
                syncStabilityChange,
                mrrChange
            }
        });
        
    } catch (error) {
        console.error('Revenue dashboard error:', error);
        res.json({ success: false, message: error.message });
    }
};

// Create subscription
export const createSubscription = async (req, res) => {
    try {
        const { userId, planName, duration = 30 } = req.body;

        if (!userId || !planName) {
            return res.status(400).json({ success: false, message: "User ID and plan name required" });
        }

        const planPrices = { 'Basic': 49, 'Premium': 199, 'Elite Force': 499 };
        const planPrice = planPrices[planName];

        if (!planPrice) {
            return res.status(400).json({ success: false, message: "Invalid plan name" });
        }

        // Check if user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const startDate = new Date();
        const endDate = new Date(startDate.getTime() + (duration * 24 * 60 * 60 * 1000));

        const subscription = new SubscriptionRecord({
            userId,
            planName,
            planPrice,
            startDate,
            endDate,
            transactionId: `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        });

        await subscription.save();
        
        // Update user pricing
        await User.findByIdAndUpdate(userId, { pricing: planName.toLowerCase().replace(' ', '') });

        // Emit real-time update
        const io = req.app.get('io');
        if (io) {
            io.to('revenue').emit('subscription-created', {
                subscription: {
                    id: subscription._id,
                    userName: user.username,
                    userEmail: user.email,
                    planName: subscription.planName,
                    amount: subscription.planPrice,
                    startDate: subscription.startDate,
                    endDate: subscription.endDate,
                    status: subscription.status
                }
            });
        }

        res.status(201).json({ 
            success: true, 
            message: "Subscription created successfully", 
            subscription: {
                id: subscription._id,
                userName: user.username,
                userEmail: user.email,
                planName: subscription.planName,
                amount: subscription.planPrice,
                startDate: subscription.startDate,
                endDate: subscription.endDate,
                status: subscription.status
            }
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update subscription
export const updateSubscription = async (req, res) => {
    try {
        const { subscriptionId } = req.params;
        const { planName, price } = req.body;
        console.log('Updating subscription for user:', subscriptionId, 'Plan:', planName, 'Price:', price);

        const user = await User.findByIdAndUpdate(
            subscriptionId,
            {
                'subscription.planName': planName,
                'subscription.price': price || 0,
                pricing: planName?.toLowerCase()
            },
            { new: true }
        );

        if (!user) {
            console.log('User not found:', subscriptionId);
            return res.status(404).json({ success: false, message: "User not found" });
        }

        console.log('Subscription updated successfully for:', user.username);
        res.json({ 
            success: true, 
            message: "Subscription updated successfully"
        });

    } catch (error) {
        console.error('Update subscription error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Delete subscription
export const deleteSubscription = async (req, res) => {
    try {
        const { subscriptionId } = req.params;
        console.log('Deleting subscription for user:', subscriptionId);

        const user = await User.findByIdAndUpdate(
            subscriptionId,
            {
                'subscription.isActive': false,
                'subscription.expiresAt': new Date(),
                'subscription.price': 0,
                pricing: 'starter'
            },
            { new: true }
        );

        if (!user) {
            console.log('User not found:', subscriptionId);
            return res.status(404).json({ success: false, message: "User not found" });
        }

        console.log('Subscription deleted successfully for:', user.username);
        res.json({ success: true, message: "Subscription deleted successfully" });

    } catch (error) {
        console.error('Delete subscription error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get all subscriptions with pagination
export const getAllSubscriptions = async (req, res) => {
    try {
        if (req.user.role !== 'admin' && req.user.role !== 'owner') {
            return res.json({ success: false, message: "Admin access required" });
        }

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const status = req.query.status;
        const planName = req.query.planName;

        let filter = {};
        if (status) filter.status = status;
        if (planName) filter.planName = planName;

        const subscriptions = await SubscriptionRecord.find(filter)
            .populate('userId', 'username email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await SubscriptionRecord.countDocuments(filter);

        res.json({
            success: true,
            data: {
                subscriptions: subscriptions.map(sub => ({
                    id: sub._id,
                    userName: sub.userId?.username || 'Unknown',
                    userEmail: sub.userId?.email || 'unknown@email.com',
                    planName: sub.planName,
                    amount: sub.planPrice,
                    startDate: sub.startDate,
                    endDate: sub.endDate,
                    status: sub.status,
                    transactionId: sub.transactionId
                })),
                pagination: {
                    current: page,
                    total: Math.ceil(total / limit),
                    count: total
                }
            }
        });

    } catch (error) {
        console.error('Get subscriptions error:', error);
        res.json({ success: false, message: error.message });
    }
};

// Get single subscription
export const getSubscription = async (req, res) => {
    try {
        if (req.user.role !== 'admin' && req.user.role !== 'owner') {
            return res.json({ success: false, message: "Admin access required" });
        }

        const { subscriptionId } = req.params;

        const subscription = await SubscriptionRecord.findById(subscriptionId)
            .populate('userId', 'username email');

        if (!subscription) {
            return res.json({ success: false, message: "Subscription not found" });
        }

        res.json({
            success: true,
            subscription: {
                id: subscription._id,
                userName: subscription.userId?.username || 'Unknown',
                userEmail: subscription.userId?.email || 'unknown@email.com',
                planName: subscription.planName,
                amount: subscription.planPrice,
                startDate: subscription.startDate,
                endDate: subscription.endDate,
                status: subscription.status,
                transactionId: subscription.transactionId,
                autoRenew: subscription.autoRenew,
                paymentMethod: subscription.paymentMethod
            }
        });

    } catch (error) {
        console.error('Get subscription error:', error);
        res.json({ success: false, message: error.message });
    }
};

// Extend subscription
export const extendSubscription = async (req, res) => {
    try {
        const { subscriptionId } = req.params;
        const { days = 30 } = req.body;
        console.log('Extending subscription for user:', subscriptionId, 'Days:', days);

        const user = await User.findById(subscriptionId);

        if (!user) {
            console.log('User not found:', subscriptionId);
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const currentExpiry = user.subscription?.expiresAt ? new Date(user.subscription.expiresAt) : new Date();
        const newEndDate = new Date(currentExpiry.getTime() + (days * 24 * 60 * 60 * 1000));
        
        await User.findByIdAndUpdate(subscriptionId, {
            'subscription.expiresAt': newEndDate,
            'subscription.isActive': true
        });

        console.log('Subscription extended successfully for:', user.username, 'New expiry:', newEndDate);
        res.json({ 
            success: true, 
            message: `Subscription extended by ${days} days`
        });

    } catch (error) {
        console.error('Extend subscription error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Cancel subscription
export const cancelSubscription = async (req, res) => {
    try {
        const { subscriptionId } = req.params;
        console.log('Cancelling subscription for user:', subscriptionId);

        const user = await User.findByIdAndUpdate(
            subscriptionId,
            { 
                'subscription.isActive': false,
                'subscription.expiresAt': new Date(),
                pricing: 'starter'
            },
            { new: true }
        );

        if (!user) {
            console.log('User not found:', subscriptionId);
            return res.status(404).json({ success: false, message: "User not found" });
        }

        console.log('Subscription cancelled successfully for:', user.username);
        res.json({ 
            success: true, 
            message: "Subscription cancelled successfully"
        });

    } catch (error) {
        console.error('Cancel subscription error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get subscription analytics
export const getSubscriptionAnalytics = async (req, res) => {
    try {
        if (req.user.role !== 'admin' && req.user.role !== 'owner') {
            return res.json({ success: false, message: "Admin access required" });
        }

        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));

        const recentSubscriptions = await SubscriptionRecord.find({
            createdAt: { $gte: thirtyDaysAgo }
        }).sort({ createdAt: -1 });

        const expiringSoon = await SubscriptionRecord.find({
            status: 'active',
            endDate: { $lte: new Date(now.getTime() + (7 * 24 * 60 * 60 * 1000)) }
        });

        const revenueTrend = await SubscriptionRecord.aggregate([
            { $match: { createdAt: { $gte: thirtyDaysAgo } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    revenue: { $sum: "$planPrice" },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        const totalActiveRevenue = await SubscriptionRecord.aggregate([
            { $match: { status: 'active' } },
            { $group: { _id: null, total: { $sum: "$planPrice" } } }
        ]);

        res.json({
            success: true,
            analytics: {
                recentSubscriptions: recentSubscriptions.length,
                expiringSoon: expiringSoon.length,
                revenueTrend,
                totalActiveRevenue: totalActiveRevenue[0]?.total || 0
            }
        });

    } catch (error) {
        console.error('Analytics error:', error);
        res.json({ success: false, message: error.message });
    }
};

// Generate PDF report
export const generatePDFReport = async (req, res) => {
    try {
        const { filterPlan, filterBilling, chartFilter } = req.body;
        
        // Get real-time data from users with active subscriptions
        const activeUsers = await User.find({
            'subscription.isActive': true,
            role: { $ne: 'admin' }
        });
        
        // Apply filters
        let filteredUsers = activeUsers;
        if (filterPlan !== 'all') {
            filteredUsers = filteredUsers.filter(user => 
                user.subscription?.planName?.toLowerCase().includes(filterPlan) ||
                user.pricing?.toLowerCase().includes(filterPlan)
            );
        }
        if (filterBilling !== 'all') {
            filteredUsers = filteredUsers.filter(user => 
                user.subscription?.billingCycle === filterBilling
            );
        }
        
        // Calculate metrics
        const totalRevenue = filteredUsers.reduce((sum, user) => sum + (user.subscription?.price || 0), 0);
        const activeSubscriptions = filteredUsers.length;
        const avgRevenue = activeSubscriptions > 0 ? (totalRevenue / activeSubscriptions).toFixed(2) : 0;
        
        // Create PDF content
        const reportData = {
            generatedAt: new Date().toISOString(),
            filters: { filterPlan, filterBilling, chartFilter },
            metrics: {
                totalRevenue,
                activeSubscriptions,
                avgRevenue
            },
            subscriptions: filteredUsers.map(user => ({
                userName: user.username,
                email: user.email,
                plan: user.subscription?.planName || user.pricing,
                billing: user.subscription?.billingCycle || 'monthly',
                amount: user.subscription?.price || 0,
                startDate: user.subscription?.startDate,
                endDate: user.subscription?.expiresAt
            }))
        };
        
        // Simple PDF generation (you can enhance this with a proper PDF library)
        const pdfContent = `
REVENUE REPORT
Generated: ${new Date().toLocaleDateString()}

METRICS:
- Total Revenue: $${totalRevenue.toLocaleString()}
- Active Subscriptions: ${activeSubscriptions}
- Average Revenue per User: $${avgRevenue}

FILTERS APPLIED:
- Plan Filter: ${filterPlan}
- Billing Filter: ${filterBilling}
- Chart Filter: ${chartFilter}

SUBSCRIPTION DETAILS:
${reportData.subscriptions.map(sub => 
    `${sub.userName} (${sub.email}) - ${sub.plan} - $${sub.amount} - ${sub.billing}`
).join('\n')}
        `;
        
        // Set headers for PDF download
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=revenue-report-${new Date().toISOString().split('T')[0]}.pdf`);
        
        // For now, send as text (you can integrate a proper PDF library like puppeteer or jsPDF)
        res.json({
            success: true,
            report: reportData,
            message: 'Report generated successfully'
        });
        
    } catch (error) {
        console.error('PDF generation error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};