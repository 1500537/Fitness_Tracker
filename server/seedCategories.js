import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import { Category } from "./models/workoutModal.js";

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("MongoDB connected");
    } catch (error) {
        console.error("MongoDB connection error:", error);
        process.exit(1);
    }
};

const seedCategories = async () => {
    try {
        await connectDB();

        const defaultCategories = [
            { name: "STRENGTH", description: "Strength training exercises", color: "#FF7222", icon: "Dumbbell" },
            { name: "CARDIO", description: "Cardiovascular exercises", color: "#22FF72", icon: "Heart" },
            { name: "FLEXIBILITY", description: "Stretching and flexibility", color: "#7222FF", icon: "Zap" },
            { name: "CORE", description: "Core strengthening exercises", color: "#FF2272", icon: "Target" },
            { name: "FUNCTIONAL", description: "Functional movement patterns", color: "#22A5FF", icon: "Activity" }
        ];

        for (const categoryData of defaultCategories) {
            const existingCategory = await Category.findOne({ name: categoryData.name });
            if (!existingCategory) {
                const category = new Category(categoryData);
                await category.save();
                console.log(`Created category: ${categoryData.name}`);
            } else {
                console.log(`Category already exists: ${categoryData.name}`);
            }
        }

        console.log("Categories seeded successfully!");
        process.exit(0);
    } catch (error) {
        console.error("Error seeding categories:", error);
        process.exit(1);
    }
};

seedCategories();