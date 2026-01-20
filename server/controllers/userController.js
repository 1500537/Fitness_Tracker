import User from "../models/userModal.js";

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
            io.to(`user_${userId}`).emit('user-banned', {
                message: 'Your account has been suspended',
                reason: user.banReason || 'Your account has been suspended. Please contact support.',
                bannedAt: new Date()
            });
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
