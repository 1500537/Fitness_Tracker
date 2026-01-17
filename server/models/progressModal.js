import mongoose from "mongoose";

const progressSchema = mongoose.Schema({
    userId: { type: String, required: true, ref: 'User' },
    date: { type: Date, required: true },
    weight: { type: Number, required: true },
    bench: { type: Number, default: 0 },
    run: { type: Number, default: 0 }, // in minutes or km?
    waist: { type: Number, default: 0 },
    neck: { type: Number, default: 0 },
    height: { type: Number, default: 175 }
}, { timestamps: true });

const Progress = mongoose.model("Progress", progressSchema);

export default Progress;
