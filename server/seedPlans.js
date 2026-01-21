import dotenv from "dotenv";
import mongoose from "mongoose";
import Plan from "./models/planModal.js";

dotenv.config();

const seedPlans = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            dbName: "TrackForce"
        });
        
        console.log("Connected to database");
        
        // Clear existing plans
        await Plan.deleteMany({});
        console.log("Cleared existing plans");
        
        // Create new plans
        const plans = [
            {
                name: "Starter",
                monthlyPrice: 0,
                annualPrice: 0,
                tagline: "Basic Features",
                popular: false,
                tier: "starter",
                features: ["Basic workout tracking", "Simple progress logging", "Basic nutrition tracking"]
            },
            {
                name: "Pro",
                monthlyPrice: 29,
                annualPrice: 24,
                tagline: "Advanced Analytics",
                popular: true,
                tier: "pro",
                features: ["Advanced progress analytics", "Bio analytics charts", "Weekly nutrition forecasts", "Advanced nutrition logging"]
            },
            {
                name: "Elite",
                monthlyPrice: 59,
                annualPrice: 49,
                tagline: "Premium Experience",
                popular: false,
                tier: "elite",
                features: ["Vital trace monitoring", "AI coach neural link", "Advanced trend analysis", "Neural stability diagnostics"]
            }
        ];

        await Plan.insertMany(plans);
        console.log("Plans seeded successfully!");
        
        process.exit(0);
    } catch (error) {
        console.error("Error seeding plans:", error);
        process.exit(1);
    }
};

seedPlans();