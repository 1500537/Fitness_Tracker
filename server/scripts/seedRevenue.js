import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Subscription } from '../models/subscriptionModal.js';
import User from '../models/userModal.js';

dotenv.config();

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Clear existing data
        await Subscription.deleteMany({});
        console.log('Cleared existing subscriptions');

        // Create sample users if they don't exist
        const sampleUsers = [
            { _id: 'user_sample1', username: 'Alex Vanguard', email: 'alex@uplink.io', image: '', role: 'user' },
            { _id: 'user_sample2', username: 'Sarah Connor', email: 'sarah@uplink.io', image: '', role: 'user' },
            { _id: 'user_sample3', username: 'John Matrix', email: 'john@uplink.io', image: '', role: 'user' },
            { _id: 'user_sample4', username: 'Neo Anderson', email: 'neo@uplink.io', image: '', role: 'user' },
            { _id: 'user_sample5', username: 'Trinity Smith', email: 'trinity@uplink.io', image: '', role: 'user' }
        ];

        for (const userData of sampleUsers) {
            await User.findOneAndUpdate(
                { _id: userData._id },
                userData,
                { upsert: true, new: true }
            );
        }

        // Create sample subscriptions
        const now = new Date();
        const subscriptions = [
            {
                userId: 'user_sample1',
                planName: 'Elite Force',
                planPrice: 499,
                status: 'active',
                startDate: new Date(now.getTime() - (5 * 24 * 60 * 60 * 1000)),
                endDate: new Date(now.getTime() + (25 * 24 * 60 * 60 * 1000)),
                transactionId: 'TXN_001'
            },
            {
                userId: 'user_sample2',
                planName: 'Premium',
                planPrice: 199,
                status: 'active',
                startDate: new Date(now.getTime() - (10 * 24 * 60 * 60 * 1000)),
                endDate: new Date(now.getTime() + (20 * 24 * 60 * 60 * 1000)),
                transactionId: 'TXN_002'
            },
            {
                userId: 'user_sample3',
                planName: 'Basic',
                planPrice: 49,
                status: 'active',
                startDate: new Date(now.getTime() - (15 * 24 * 60 * 60 * 1000)),
                endDate: new Date(now.getTime() + (15 * 24 * 60 * 60 * 1000)),
                transactionId: 'TXN_003'
            },
            {
                userId: 'user_sample4',
                planName: 'Premium',
                planPrice: 199,
                status: 'active',
                startDate: new Date(now.getTime() - (3 * 24 * 60 * 60 * 1000)),
                endDate: new Date(now.getTime() + (27 * 24 * 60 * 60 * 1000)),
                transactionId: 'TXN_004'
            },
            {
                userId: 'user_sample5',
                planName: 'Elite Force',
                planPrice: 499,
                status: 'active',
                startDate: new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000)),
                endDate: new Date(now.getTime() + (23 * 24 * 60 * 60 * 1000)),
                transactionId: 'TXN_005'
            }
        ];

        await Subscription.insertMany(subscriptions);
        console.log('Sample subscriptions created successfully');

        console.log('Seed data created successfully!');
        process.exit(0);

    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
};

seedData();