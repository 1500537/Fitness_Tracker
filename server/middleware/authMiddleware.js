import User from "../models/userModal.js";
export const protect = async (req, res, next) => {
    try {
        const authData = await req.auth(); // Updated to use req.auth() as function
        const userId = authData?.userId;

        if (!userId) {
            return res.json({ success: false, message: "Not Authorized" });
        }

        // Try multiple lookup strategies: clerkId (custom field) or _id (if stored as Clerk id)
        let user = await User.findOne({ clerkId: userId });
        if (!user) {
            user = await User.findById(userId);
        }

        if (!user) {
            console.warn('Auth middleware: user not found for id', userId);
            return res.json({ success: false, message: "User not in Database" });
        }

        if (user.isBanned) {
            return res.json({ success: false, message: "Account banned" });
        }

        req.user = user;
        next();
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

export default  protect ;