import mongoose from "mongoose";

const planSchema = mongoose.Schema({
    name: {type: String, required: true, unique: true, trim: true},
    monthlyPrice: {type: Number, required: true, min: 0},
    annualPrice: {type: Number, required: true, min: 0},
    tagline: {type: String, required: true, trim: true},
    popular: {type: Boolean, default: false},
    features: [{type: String, trim: true}],
    isActive: {type: Boolean, default: true},
    sortOrder: {type: Number, default: 0}
}, {timestamps: true});

// Static method to get active plans
planSchema.statics.getActivePlans = async function() {
    return this.find({ isActive: true }).sort({ sortOrder: 1, createdAt: -1 });
};

// Static method to get plan by name
planSchema.statics.getPlanByName = async function(name) {
    return this.findOne({ name, isActive: true });
};

const Plan = mongoose.model("Plan", planSchema);

export default Plan;