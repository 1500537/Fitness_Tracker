import mongoose from "mongoose";

const userSchema = mongoose.Schema({
    _id: {type: String, required: true},
    username: {type: String, required: true},
    email: {type: String, required: true},
    image: {type: String, required: true},
    pricing: {type: String, enum: ["starter", "pro", "elite"], default: "starter"} ,
    role: {type: String, enum: ["user", "admin", "owner"], default: "user"},
    isBanned: {type: Boolean, default: false},
    banReason: {type: String, default: ""},
    goals: {type: Object, default: { type: 'bench', value: 100 }},
    trialStart: {type: Date},
    trialEnd: {type: Date}
},{timestamps: true}
);

const User = mongoose.model("User", userSchema);

export default User;