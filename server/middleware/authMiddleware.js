import User from "../models/userModal.js";
export const protect = async (req, res, next) => {
    try {
        const authData = req.auth; // Agar @clerk/express hai to req.auth kafi hai
        const userId = authData?.userId;

        if (!userId) {
            return res.json({ success: false, message: "Not Authorized" });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.json({ success: false, message: "User not in Database" });
        }

        // Don't block banned users here - let the app handle the ban alert
        req.user = user;
        next();
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

export default  protect ;