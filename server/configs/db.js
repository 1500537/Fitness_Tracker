import mongoose from "mongoose";

// Connection state ko track karne ke liye variable
let isConnected = false;

const connectDB = async () => {
    // Agar pehle se connected hai toh dubara connect na karein (Performance fix)
    if (isConnected) {
        console.log("Using existing database connection");
        return;
    }

    try {
        // Mongoose settings
        mongoose.set('strictQuery', true);

        // Connection process
        const db = await mongoose.connect(process.env.MONGODB_URI, {
            dbName: "TrackForce", // DB name yahan specify karna zyada behtar hai
        });

        isConnected = db.connections[0].readyState;
        console.log("✅ Database connected successfully to Atlas");
        console.log("📊 Database Name: TrackForce");

    } catch (error) {
        console.error("❌ MongoDB Connection Error:", error.message);
        console.error("🔧 Please check your MONGODB_URI and network connection");
        // Error par crash na ho balki log kare
        process.exit(1);
    }
};

export default connectDB;