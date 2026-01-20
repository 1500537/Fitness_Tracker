import User from '../models/userModal.js';

// Get current user role and status
export const getCurrentUser = async (req, res) => {
    try {
        const userId = req.user?.userId || req.user?.id;
        
        if (!userId) {
            return res.json({ success: false, message: "User not authenticated" });
        }

        const user = await User.findById(userId);
        
        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }

        // Check if user is banned
        if (user.isBanned) {
            return res.json({ 
                success: false, 
                message: "Account suspended",
                reason: user.banReason || "Your account has been suspended. Please contact support."
            });
        }

        res.json({
            success: true,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                pricing: user.pricing,
                isBanned: user.isBanned,
                trialStart: user.trialStart,
                trialEnd: user.trialEnd
            }
        });

    } catch (error) {
        console.error('Get current user error:', error);
        res.json({ success: false, message: error.message });
    }
};

// Check if user has access to specific route
export const checkRouteAccess = async (req, res) => {
    try {
        const { route } = req.params; // 'dashboard' or 'admin'
        const userId = req.user?.userId || req.user?.id;
        
        if (!userId) {
            return res.json({ success: false, message: "Authentication required" });
        }

        const user = await User.findById(userId);
        
        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }

        if (user.isBanned) {
            return res.json({ success: false, message: "Account suspended" });
        }

        let hasAccess = false;
        
        if (route === 'dashboard') {
            // Users with 'user' role can access dashboard
            hasAccess = user.role === 'user';
        } else if (route === 'admin') {
            // Only admin and owner can access admin dashboard
            hasAccess = user.role === 'admin' || user.role === 'owner';
        }

        res.json({
            success: true,
            hasAccess,
            userRole: user.role,
            route
        });

    } catch (error) {
        console.error('Check route access error:', error);
        res.json({ success: false, message: error.message });
    }
};