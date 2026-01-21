import User from "../models/userModal.js";

// Get subscription timer data
export const getSubscriptionTimer = async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId);
        
        if (!user) {
            return res.json({ success: false, message: 'User not found' });
        }
        
        const now = new Date();
        const subscription = user.subscription;
        
        let timerData = {
            planName: user.pricing || 'starter',
            billingCycle: subscription?.billingCycle || 'monthly',
            isActive: subscription?.isActive || false,
            timeLeft: 0,
            status: 'expired'
        };
        
        if (subscription?.expiresAt) {
            const expiryTime = new Date(subscription.expiresAt).getTime();
            const currentTime = now.getTime();
            const difference = expiryTime - currentTime;
            
            if (difference > 0) {
                timerData.timeLeft = Math.floor(difference / 1000); // seconds
                timerData.status = 'active';
            }
        } else if (user.pricing === 'starter') {
            timerData.timeLeft = -1; // unlimited
            timerData.status = 'unlimited';
        }
        
        console.log(`🕰️ Timer data for user ${userId}:`, timerData);
        
        res.json({
            success: true,
            timer: timerData
        });
    } catch (error) {
        console.error('❌ Error getting timer data:', error);
        res.json({
            success: false,
            message: error.message
        });
    }
};

// Force update subscription for current user
export const forceUpdateSubscription = async (req, res) => {
    try {
        const userId = req.user._id;
        
        // Set subscription with future date
        const now = new Date();
        const expiresAt = new Date(now);
        expiresAt.setDate(now.getDate() + 30); // 30 days from now
        
        console.log(`🔄 Force updating subscription for user ${userId}`);
        console.log(`📅 Setting expiration to: ${expiresAt}`);
        
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
                $set: {
                    'subscription.planName': req.user.pricing || 'starter',
                    'subscription.billingCycle': 'monthly',
                    'subscription.startDate': now,
                    'subscription.expiresAt': expiresAt,
                    'subscription.isActive': true
                }
            },
            { new: true }
        );
        
        console.log(`✅ Subscription updated:`, updatedUser.subscription);
        
        res.json({
            success: true,
            message: 'Subscription updated successfully',
            user: updatedUser
        });
    } catch (error) {
        console.error('❌ Error updating subscription:', error);
        res.json({
            success: false,
            message: error.message
        });
    }
};

// Initialize subscription for current user
export const initializeSubscription = async (req, res) => {
    try {
        const userId = req.user._id;
        
        // Check if user already has subscription
        const user = await User.findById(userId);
        if (user.subscription?.expiresAt) {
            return res.json({
                success: true,
                message: 'Subscription already exists',
                subscription: user.subscription
            });
        }
        
        // Set default 30-day subscription
        const now = new Date();
        const expiresAt = new Date(now);
        expiresAt.setDate(now.getDate() + 30);
        
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
                subscription: {
                    planName: user.pricing || 'starter',
                    billingCycle: 'monthly',
                    startDate: now,
                    expiresAt: expiresAt,
                    isActive: true
                }
            },
            { new: true }
        );
        
        console.log(`✅ Subscription initialized for user ${userId}:`, updatedUser.subscription);
        
        res.json({
            success: true,
            message: 'Subscription initialized',
            subscription: updatedUser.subscription
        });
    } catch (error) {
        console.error('❌ Error initializing subscription:', error);
        res.json({
            success: false,
            message: error.message
        });
    }
};

// Update current user pricing (for testing)
export const updateCurrentUserPricing = async (req, res) => {
    try {
        const { pricing } = req.body;
        const userId = req.user._id;
        
        console.log(`🔄 Updating user ${userId} pricing to: ${pricing}`);
        
        // Calculate expiration date for testing (30 days for monthly, 365 for annual)
        const now = new Date();
        const expiresAt = new Date(now);
        if (pricing === 'pro') {
            expiresAt.setDate(now.getDate() + 30); // 30 days
        } else if (pricing === 'elite') {
            expiresAt.setDate(now.getDate() + 365); // 365 days
        } else {
            expiresAt.setDate(now.getDate() + 7); // 7 days for starter
        }
        
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { 
                pricing,
                subscription: {
                    planName: pricing,
                    billingCycle: 'monthly',
                    startDate: now,
                    expiresAt: expiresAt,
                    isActive: true
                }
            },
            { new: true }
        );
        
        if (updatedUser) {
            console.log(`✅ User pricing updated successfully:`, updatedUser.pricing);
            console.log(`📅 Subscription expires at:`, updatedUser.subscription.expiresAt);
            res.json({
                success: true,
                message: 'Pricing updated successfully',
                user: {
                    _id: updatedUser._id,
                    pricing: updatedUser.pricing,
                    subscription: updatedUser.subscription
                }
            });
        } else {
            res.json({
                success: false,
                message: 'User not found'
            });
        }
    } catch (error) {
        console.error('❌ Error updating pricing:', error);
        res.json({
            success: false,
            message: error.message
        });
    }
};

// Get current user data
export const getCurrentUser = async (req, res) => {
    try {
        const user = req.user;
        
        res.json({
            success: true,
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                image: user.image,
                pricing: user.pricing,
                role: user.role,
                goals: user.goals,
                createdAt: user.createdAt
            }
        });
    } catch (error) {
        res.json({
            success: false,
            message: error.message
        });
    }
};

// Get all users (Admin only)
export const getAllUsers = async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== 'admin' && req.user.role !== 'owner') {
            return res.json({
                success: false,
                message: "Admin access required"
            });
        }

        const users = await User.find({})
            .select('-password')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            users: users.map(user => ({
                _id: user._id,
                username: user.username,
                email: user.email,
                image: user.image,
                pricing: user.pricing,
                role: user.role,
                isBanned: user.isBanned,
                banReason: user.banReason,
                goals: user.goals,
                trialStart: user.trialStart,
                trialEnd: user.trialEnd,
                createdAt: user.createdAt
            }))
        });

    } catch (error) {
        res.json({
            success: false,
            message: error.message
        });
    }
};

// Update user (Admin only)
export const updateUser = async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== 'admin' && req.user.role !== 'owner') {
            return res.json({
                success: false,
                message: "Admin access required"
            });
        }

        const { userId } = req.params;
        const { username, role, pricing } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.json({
                success: false,
                message: "User not found"
            });
        }

        // Update fields
        if (username) user.username = username;
        if (role) user.role = role;
        if (pricing) user.pricing = pricing;

        await user.save();

        res.json({
            success: true,
            message: "User updated successfully",
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                pricing: user.pricing
            }
        });

    } catch (error) {
        res.json({
            success: false,
            message: error.message
        });
    }
};

// Delete user (Admin only)
export const deleteUser = async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== 'admin' && req.user.role !== 'owner') {
            return res.json({
                success: false,
                message: "Admin access required"
            });
        }

        const { userId } = req.params;

        const user = await User.findById(userId);
        if (!user) {
            return res.json({
                success: false,
                message: "User not found"
            });
        }

        // Prevent deleting admin/owner accounts
        if (user.role === 'admin' || user.role === 'owner') {
            return res.json({
                success: false,
                message: "Cannot delete admin accounts"
            });
        }

        await User.findByIdAndDelete(userId);

        res.json({
            success: true,
            message: "User deleted successfully"
        });

    } catch (error) {
        res.json({
            success: false,
            message: error.message
        });
    }
};

// Toggle user ban status (Admin only)
export const toggleUserBan = async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== 'admin' && req.user.role !== 'owner') {
            return res.json({
                success: false,
                message: "Admin access required"
            });
        }

        const { userId } = req.params;
        const { banReason } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.json({
                success: false,
                message: "User not found"
            });
        }

        // Prevent banning admin/owner accounts
        if (user.role === 'admin' || user.role === 'owner') {
            return res.json({
                success: false,
                message: "Cannot ban admin accounts"
            });
        }

        user.isBanned = !user.isBanned;
        if (user.isBanned && banReason) {
            user.banReason = banReason;
        } else if (!user.isBanned) {
            user.banReason = "";
        }

        await user.save();

        // Emit real-time ban notification to the banned user
        if (user.isBanned) {
            const io = req.app.get('io');
            if (io) {
                io.to(`user_${userId}`).emit('user-banned', {
                    message: 'Your account has been suspended',
                    reason: user.banReason || 'Your account has been suspended. Please contact support.',
                    bannedAt: new Date()
                });
            }
        }

        res.json({
            success: true,
            message: `User ${user.isBanned ? 'banned' : 'unbanned'} successfully`,
            user: {
                _id: user._id,
                username: user.username,
                isBanned: user.isBanned,
                banReason: user.banReason
            }
        });

    } catch (error) {
        res.json({
            success: false,
            message: error.message
        });
    }
};

// Get user subscription
export const getUserSubscription = async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId);

        if (!user) {
            return res.json({
                success: false,
                message: "User not found"
            });
        }

        // Get subscription data from user model
        const subscription = {
            planName: user.subscription?.planName || user.pricing || 'Free Plan',
            expiresAt: user.subscription?.expiresAt || user.trialEnd || null,
            totalTime: user.subscription?.expiresAt 
                ? Math.floor((new Date(user.subscription.expiresAt) - (user.subscription.startDate ? new Date(user.subscription.startDate) : new Date())) / 1000)
                : (user.trialEnd ? Math.floor((new Date(user.trialEnd) - new Date(user.trialStart || new Date())) / 1000) : 0),
            isActive: user.subscription?.isActive || (user.trialEnd ? new Date() < new Date(user.trialEnd) : false),
            status: user.subscription?.status || 'active',
            billingCycle: user.subscription?.billingCycle || 'monthly'
        };

        res.json({
            success: true,
            subscription
        });

    } catch (error) {
        res.json({
            success: false,
            message: error.message
        });
    }
};

// Check if user is banned (used during login)
export const checkUserStatus = async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId);

        if (!user) {
            return res.json({
                success: false,
                message: "User not found"
            });
        }

        if (user.isBanned) {
            return res.json({
                success: false,
                message: "Account suspended",
                reason: user.banReason || "Your account has been suspended. Please contact support."
            });
        }

        res.json({
            success: true,
            message: "User is active"
        });

    } catch (error) {
        res.json({
            success: false,
            message: error.message
        });
    }
};
