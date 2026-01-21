import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  userName: {
    type: String,
    required: true
  },
  userEmail: {
    type: String,
    required: true
  },
  planName: {
    type: String,
    required: true,
    enum: ['Basic', 'Premium', 'Elite Force']
  },
  amount: {
    type: Number,
    required: true
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'expired', 'cancelled'],
    default: 'active'
  },
  paymentMethod: {
    type: String,
    default: 'credit_card'
  },
  transactionId: {
    type: String,
    unique: true,
    sparse: true
  },
  isAutoRenew: {
    type: Boolean,
    default: false
  },
  cancelledAt: {
    type: Date
  },
  cancelReason: {
    type: String
  }
}, {
  timestamps: true
});

// Index for efficient queries
subscriptionSchema.index({ userId: 1, status: 1 });
subscriptionSchema.index({ endDate: 1 });
subscriptionSchema.index({ createdAt: -1 });

// Virtual for checking if subscription is active
subscriptionSchema.virtual('isActive').get(function() {
  return this.status === 'active' && this.endDate > new Date();
});

// Method to extend subscription
subscriptionSchema.methods.extend = function(days) {
  this.endDate = new Date(this.endDate.getTime() + (days * 24 * 60 * 60 * 1000));
  if (this.status === 'expired') {
    this.status = 'active';
  }
  return this.save();
};

// Method to cancel subscription
subscriptionSchema.methods.cancel = function(reason = '') {
  this.status = 'cancelled';
  this.cancelledAt = new Date();
  this.cancelReason = reason;
  return this.save();
};

// Static method to get revenue metrics
subscriptionSchema.statics.getRevenueMetrics = async function() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfYear = new Date(now.getFullYear(), 0, 1);

  const [totalRevenue, monthlyRevenue, activeSubscriptions, totalSubscriptions] = await Promise.all([
    this.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]),
    this.aggregate([
      { $match: { createdAt: { $gte: startOfMonth }, status: { $ne: 'cancelled' } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]),
    this.countDocuments({ status: 'active', endDate: { $gt: now } }),
    this.countDocuments()
  ]);

  return {
    totalRevenue: totalRevenue[0]?.total || 0,
    monthlyRevenue: monthlyRevenue[0]?.total || 0,
    activeSubscriptions,
    totalSubscriptions,
    conversionRate: totalSubscriptions > 0 ? ((activeSubscriptions / totalSubscriptions) * 100).toFixed(1) + '%' : '0%',
    powerConsumption: '24.8kW' // Mock data for UI
  };
};

// Static method to get chart data
subscriptionSchema.statics.getChartData = async function(days = 30) {
  const endDate = new Date();
  const startDate = new Date(endDate.getTime() - (days * 24 * 60 * 60 * 1000));

  const data = await this.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate },
        status: { $ne: 'cancelled' }
      }
    },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
        },
        revenue: { $sum: '$amount' },
        count: { $sum: 1 }
      }
    },
    { $sort: { '_id': 1 } }
  ]);

  // Fill missing dates with 0 revenue
  const chartData = [];
  for (let i = 0; i < days; i++) {
    const date = new Date(startDate.getTime() + (i * 24 * 60 * 60 * 1000));
    const dateStr = date.toISOString().split('T')[0];
    const existingData = data.find(d => d._id === dateStr);
    
    chartData.push({
      date: dateStr,
      revenue: existingData?.revenue || 0,
      subscriptions: existingData?.count || 0
    });
  }

  return chartData;
};

const Subscription = mongoose.model('Subscription', subscriptionSchema);

export default Subscription;