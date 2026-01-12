import User from "../models/userModal.js";


// Middleware to authenticate user
export const protect = async (req, res, next) => { 
    const {userId} = req.auth;
    if (!userId) {
         res.json({success: false, message: "Not Authorized"});
    }else{
        const user = await User.findById(userId);
        req.user = user;
        next()
}

}