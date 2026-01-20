import mongoose from 'mongoose';
import { Subscription } from '../models/subscriptionModal.js';
import User from '../models/userModal.js';
import dotenv from 'dotenv';

dotenv.config();

const addMoreSubscriptions = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected');

    const users = await User.find();
    if (users.length === 0) {
      console.log('No users found. Please run seed:subscriptions first.');
      process.exit(1);
    }

    const plans = ['Basic', 'Premium', 'Elite Force'];
    const planPrices = { 'Basic': 49, 'Premium': 199, 'Elite Force': 499 };
    const additionalSubscriptions = [];

    // Add more subscriptions for existing users
    for (let i = 0; i < Math.min(users.length, 10); i++) {
      const user = users[i];
      const planName = plans[Math.floor(Math.random() * plans.length)];
      const startDate = new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000); // Random start within last 60 days
      const endDate = new Date(startDate.getTime() + (30 * 24 * 60 * 60 * 1000)); // 30 days from start

      additionalSubscriptions.push({
        userId: user._id,
        planName,
        planPrice: planPrices[planName],
        status: Math.random() > 0.2 ? 'active' : 'expired', // 80% active
        startDate,
        endDate,
        transactionId: `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      });
    }

    const created = await Subscription.insertMany(additionalSubscriptions);
    console.log(`✅ Added ${created.length} more subscriptions!`);
    
    const totalActive = await Subscription.countDocuments({ status: 'active' });
    const totalRevenue = await Subscription.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: null, total: { $sum: '$planPrice' } } }
    ]);

    console.log(`📊 Total Active Subscriptions: ${totalActive}`);
    console.log(`💰 Total Active Revenue: $${totalRevenue[0]?.total || 0}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

addMoreSubscriptions();