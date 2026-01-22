import mongoose from "mongoose";

const subscriptionSchema = mongoose.Schema({
    userId: { type: String, required: true },
    planName: { type: String, required: true, enum: ['Basic', 'Premium', 'Elite Force'] },
    planPrice: { type: Number, required: true },
    status: { type: String, enum: ['active', 'expired', 'cancelled'], default: 'active' },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    autoRenew: { type: Boolean, default: true },
    paymentMethod: { type: String, default: 'card' },
    transactionId: { type: String, required: true }
}, { timestamps: true });

const revenueSchema = mongoose.Schema({
    date: { type: Date, required: true },
    totalRevenue: { type: Number, required: true },
    subscriptionCount: { type: Number, required: true },
    planBreakdown: {
        basic: { count: Number, revenue: Number },
        premium: { count: Number, revenue: Number },
        eliteForce: { count: Number, revenue: Number }
    }
}, { timestamps: true });

export const SubscriptionRecord = mongoose.model("SubscriptionRecord", subscriptionSchema);
export const Revenue = mongoose.model("Revenue", revenueSchema);