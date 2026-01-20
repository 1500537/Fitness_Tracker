import mongoose from 'mongoose';
import { Subscription, Revenue } from '../models/subscriptionModal.js';
import User from '../models/userModal.js';
import dotenv from 'dotenv';

dotenv.config();

const checkDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const users = await User.find();
    const subscriptions = await Subscription.find();
    const revenue = await Revenue.find();
    
    console.log('\n=== DATABASE STATUS ===');
    console.log(`Users: ${users.length}`);
    console.log(`Subscriptions: ${subscriptions.length}`);
    console.log(`Revenue Records: ${revenue.length}`);
    
    if (users.length > 0) {
      console.log('\n=== USERS ===');
      users.forEach(user => {
        console.log(`- ${user.username} (${user.email})`);
      });
    }
    
    if (subscriptions.length > 0) {
      console.log('\n=== SUBSCRIPTIONS ===');
      subscriptions.forEach(sub => {
        console.log(`- ${sub.planName} - $${sub.planPrice} - ${sub.status}`);
      });
    }
    
    if (revenue.length > 0) {
      console.log('\n=== REVENUE ===');
      revenue.forEach(rev => {
        console.log(`- ${rev.date.toDateString()} - $${rev.totalRevenue}`);
      });
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

checkDatabase();