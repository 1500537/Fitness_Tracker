import mongoose from "mongoose";

// Connection state ko track karne ke liye variable
let isConnected = false;

const connectDB = async () => {
    // Agar pehle se connected hai toh dubara connect na karein (Performance fix)
    if (isConnected) {
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
        console.log('Database connected successfully');
    } catch (error) {
        if (process.env.NODE_ENV === 'development') {
            console.error('Database connection failed:', error.message);
        }
        process.exit(1);
    }
};

export default connectDB;