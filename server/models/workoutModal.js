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

const Workout = mongoose.model("Workout", workoutSchema);

export default Workout;