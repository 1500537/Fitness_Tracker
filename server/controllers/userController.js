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
            price: subscription?.price || 0,
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
        
        res.json({
            success: true,
            timer: timerData
        });
    } catch (error) {
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
        
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
                $set: {
                    'subscription.planName': req.user.pricing || 'starter',
                    'subscription.billingCycle': 'monthly',
                    'subscription.price': 0,
                    'subscription.startDate': now,
                    'subscription.expiresAt': expiresAt,
                    'subscription.isActive': true
                }
            },
            { new: true }
        );
        
        res.json({
            success: true,
            message: 'Subscription updated successfully',
            user: updatedUser
        });
    } catch (error) {
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
                    price: 0,
                    startDate: now,
                    expiresAt: expiresAt,
                    isActive: true
                }
            },
            { new: true }
        );
        
        res.json({
            success: true,
            message: 'Subscription initialized',
            subscription: updatedUser.subscription
        });
    } catch (error) {
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
        
        // Calculate expiration date for testing (30 days for monthly, 365 for annual)
        const now = new Date();
        const expiresAt = new Date(now);
        let price = 0;
        if (pricing === 'pro') {
            expiresAt.setDate(now.getDate() + 30); // 30 days
            price = 29; // Default monthly price for pro
        } else if (pricing === 'elite') {
            expiresAt.setDate(now.getDate() + 365); // 365 days
            price = 59; // Default monthly price for elite
        } else {
            expiresAt.setDate(now.getDate() + 7); // 7 days for starter
            price = 0;
        }
        
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { 
                pricing,
                subscription: {
                    planName: pricing,
                    billingCycle: 'monthly',
                    price: price,
                    startDate: now,
                    expiresAt: expiresAt,
                    isActive: true
                }
            },
            { new: true }
        );
        
        if (updatedUser) {
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
        
        // Check if subscription is expired
        const now = new Date();
        let subscriptionStatus = 'active';
        let isActive = user.subscription?.isActive || false;
        
        if (user.subscription?.expiresAt) {
            const expiryTime = new Date(user.subscription.expiresAt);
            if (now > expiryTime) {
                subscriptionStatus = 'expired';
                isActive = false;
                
                // Update user subscription status in database
                await User.findByIdAndUpdate(user._id, {
                    'subscription.isActive': false
                });
            }
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
                goals: user.goals,
                subscription: {
                    ...user.subscription,
                    isActive: isActive,
                    status: subscriptionStatus
                },
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
            price: user.subscription?.price || 0,
            billingCycle: user.subscription?.billingCycle || 'monthly',
            expiresAt: user.subscription?.expiresAt || user.trialEnd || null,
            totalTime: user.subscription?.expiresAt 
                ? Math.floor((new Date(user.subscription.expiresAt) - (user.subscription.startDate ? new Date(user.subscription.startDate) : new Date())) / 1000)
                : (user.trialEnd ? Math.floor((new Date(user.trialEnd) - new Date(user.trialStart || new Date())) / 1000) : 0),
            isActive: user.subscription?.isActive || (user.trialEnd ? new Date() < new Date(user.trialEnd) : false),
            status: user.subscription?.status || 'active'
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

// Get user subscription with pricing details
export const getSubscriptionDetails = async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId);

        if (!user) {
            return res.json({
                success: false,
                message: "User not found"
            });
        }

        const subscription = {
            planName: user.subscription?.planName || user.pricing || 'starter',
            price: user.subscription?.price || 0,
            billingCycle: user.subscription?.billingCycle || 'monthly',
            startDate: user.subscription?.startDate || user.createdAt,
            expiresAt: user.subscription?.expiresAt,
            isActive: user.subscription?.isActive || false,
            status: user.subscription?.isActive ? 'active' : 'expired'
        };

        // Calculate time remaining
        if (subscription.expiresAt) {
            const now = new Date();
            const expiryTime = new Date(subscription.expiresAt);
            const timeLeft = Math.max(0, Math.floor((expiryTime - now) / 1000));
            subscription.timeLeft = timeLeft;
            subscription.isActive = timeLeft > 0;
        }

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
