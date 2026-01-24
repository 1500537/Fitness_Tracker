import mongoose from "mongoose";

// Connection state ko track karne ke liye variable
let isConnected = false;

const connectDB = async () => {
    // Agar pehle se connected hai toh dubara connect na karein (Performance fix)
    if (isConnected) {
        console.log("Using existing database connection");
        return;
    }

    console.log("MONGODB_URI:", process.env.MONGODB_URI);

    try {
        // Mongoose settings
        mongoose.set('strictQuery', true);
        mongoose.set('bufferCommands', false);
        mongoose.set('bufferMaxEntries', 0);

        // Connection process
        const db = await mongoose.connect(process.env.MONGODB_URI, {
            dbName: "TrackForce",
            serverSelectionTimeoutMS: 30000,
            socketTimeoutMS: 45000,
            connectTimeoutMS: 30000,
            maxPoolSize: 10,
            minPoolSize: 5,
            retryWrites: true,
            retryReads: true
        });

        isConnected = db.connections[0].readyState;
        console.log("Database connected successfully to Atlas");

    } catch (error) {
        console.error("MongoDB Connection Error:", error.message);
        process.exit(1);
    }
};

export default connectDB;