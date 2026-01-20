import mongoose from 'mongoose';
import { Subscription, Revenue } from '../models/subscriptionModal.js';
import User from '../models/userModal.js';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected for seeding');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const seedData = async () => {
  try {
    await connectDB();

    // Clear existing data
    await Subscription.deleteMany({});
    await Revenue.deleteMany({});
    console.log('Cleared existing subscription and revenue data');

    // Get existing users or create sample ones
    let users = await User.find().limit(10);
    
    if (users.length === 0) {
      // Create sample users if none exist
      const sampleUsers = [
        { _id: 'user_1', username: 'John Doe', email: 'john@example.com', image: 'https://via.placeholder.com/150', pricing: 'starter' },
        { _id: 'user_2', username: 'Jane Smith', email: 'jane@example.com', image: 'https://via.placeholder.com/150', pricing: 'pro' },
        { _id: 'user_3', username: 'Mike Johnson', email: 'mike@example.com', image: 'https://via.placeholder.com/150', pricing: 'elite' },
        { _id: 'user_4', username: 'Sarah Wilson', email: 'sarah@example.com', image: 'https://via.placeholder.com/150', pricing: 'starter' },
        { _id: 'user_5', username: 'David Brown', email: 'david@example.com', image: 'https://via.placeholder.com/150', pricing: 'pro' }
      ];

      users = await User.insertMany(sampleUsers);
      console.log('Created sample users');
    }

    // Create sample subscriptions
    const plans = ['Basic', 'Premium', 'Elite Force'];
    const planPrices = { 'Basic': 49, 'Premium': 199, 'Elite Force': 499 };
    const subscriptions = [];

    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      const planName = plans[Math.floor(Math.random() * plans.length)];
      const startDate = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000); // Random start within last 30 days
      const endDate = new Date(startDate.getTime() + (30 * 24 * 60 * 60 * 1000)); // 30 days from start

      subscriptions.push({
        userId: user._id,
        planName,
        planPrice: planPrices[planName],
        status: Math.random() > 0.1 ? 'active' : 'expired', // 90% active
        startDate,
        endDate,
        transactionId: `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      });
    }

    const createdSubscriptions = await Subscription.insertMany(subscriptions);
    console.log(`Created ${createdSubscriptions.length} sample subscriptions`);

    // Create monthly revenue data for the last 12 months
    const revenueData = [];
    const now = new Date();
    
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const totalRevenue = Math.floor(Math.random() * 5000) + 2000; // Random revenue between 2000-7000
      const subscriptionCount = Math.floor(Math.random() * 50) + 20; // Random count between 20-70

      revenueData.push({
        date,
        totalRevenue,
        subscriptionCount,
        planBreakdown: {
          basic: { count: Math.floor(subscriptionCount * 0.5), revenue: Math.floor(totalRevenue * 0.2) },
          premium: { count: Math.floor(subscriptionCount * 0.3), revenue: Math.floor(totalRevenue * 0.4) },
          eliteForce: { count: Math.floor(subscriptionCount * 0.2), revenue: Math.floor(totalRevenue * 0.4) }
        }
      });
    }

    await Revenue.insertMany(revenueData);
    console.log(`Created ${revenueData.length} months of revenue data`);

    console.log('✅ Database seeded successfully!');
    console.log(`📊 Total Subscriptions: ${createdSubscriptions.length}`);
    console.log(`💰 Total Revenue Records: ${revenueData.length}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
};

seedData();