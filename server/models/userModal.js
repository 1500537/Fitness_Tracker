import mongoose from "mongoose";

const userSchema = mongoose.Schema({
    _id: {type: String, required: true},
    clerkId: { type: String, index: true },
    username: {type: String, required: true},
    email: {type: String, required: true},
    image: {type: String, required: true},
    pricing: {type: String, default: "starter"} ,
    subscription: {
        planName: {type: String, default: "starter"},
        billingCycle: {type: String, enum: ["monthly", "annually"], default: "monthly"},
        startDate: {type: Date, default: Date.now},
        expiresAt: {
            type: Date,
            default: function() {
                // Set default expiration to 30 days from now for new users
                const date = new Date();
                date.setDate(date.getDate() + 30);
                return date;
            }
        },
        isActive: {type: Boolean, default: true}
    },
    role: {type: String, enum: ["user", "admin", "owner"], default: "user"},
    isBanned: {type: Boolean, default: false},
    banReason: {type: String, default: ""},
},{timestamps: true}
);

const User = mongoose.model("User", userSchema);

export default User;