import mongoose from "mongoose";

let cachedConnection = null;

const connectDB = async () => {
    if (cachedConnection?.readyState === 1) {
        return cachedConnection;
    }

    try {
        const connection = await mongoose.connect(process.env.MONGODB_URI, {
            maxPoolSize: 1,
            serverSelectionTimeoutMS: 3000,
            socketTimeoutMS: 3000,
            connectTimeoutMS: 3000,
            bufferCommands: false
        });
        
        cachedConnection = connection.connection;
        console.log('✅ DB connected');
        return cachedConnection;
        
    } catch (error) {
        console.error('❌ DB failed:', error.message);
        cachedConnection = null;
        throw error;
    }
};

export default connectDB;