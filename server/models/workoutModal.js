import mongoose from "mongoose";

const workoutSchema = mongoose.Schema({
    userId: { type: String, required: true, ref: 'User' },
    name: { type: String, required: true },
    category: { type: String, required: true },
    sets: { type: Number, required: true },
    reps: { type: Number, required: true },
    weight: { type: Number, default: 0 },
    notes: { type: String, default: '' },
    tag: { type: String, default: 'Hypertrophy' },
    status: { type: String, enum: ['pending', 'completed'], default: 'pending' },
    completedAt: { type: Date },
    duration: { type: Number, default: 0 } // in seconds
}, { timestamps: true });

// Admin Drill Schema for WorkoutOverview
const adminDrillSchema = mongoose.Schema({
    name: { type: String, required: true, uppercase: true, trim: true },
    category: { type: String, required: true, uppercase: true, trim: true },
    tag: { type: String, default: 'GENERAL', uppercase: true, trim: true },
    notes: { type: String, default: '', trim: true },
    videoUrl: { type: String, default: '', trim: true },
    mediaType: { type: String, enum: ['image', 'video'], default: null },
    mediaPublicId: { type: String, default: '', trim: true },
    pricing: { type: String, enum: ['Starter', 'Pro Performance', 'Elite Pro'], default: 'Starter' },
    isActive: { type: Boolean, default: true },
    createdBy: { type: String, default: 'admin' }
}, { timestamps: true });

// Category Schema for WorkoutOverview
const categorySchema = mongoose.Schema({
    name: { type: String, required: true, uppercase: true, unique: true, trim: true },
    description: { type: String, default: '', trim: true },
    color: { type: String, default: '#FF7222' },
    icon: { type: String, default: 'Dumbbell' },
    isActive: { type: Boolean, default: true },
    createdBy: { type: String, default: 'admin' }
}, { timestamps: true });

// Indexes for better performance
adminDrillSchema.index({ name: 1, category: 1, isActive: 1 });
adminDrillSchema.index({ category: 1, isActive: 1 });
adminDrillSchema.index({ pricing: 1, isActive: 1 });
categorySchema.index({ name: 1, isActive: 1 });

const Workout = mongoose.model("Workout", workoutSchema);
const AdminDrill = mongoose.model("AdminDrill", adminDrillSchema);
const Category = mongoose.model("Category", categorySchema);

export default Workout;
export { AdminDrill, Category };