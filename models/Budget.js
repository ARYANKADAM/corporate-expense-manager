import mongoose from 'mongoose';

const BudgetSchema = new mongoose.Schema({
  department: {
    type: String,
    required: true,
  },
  category: {
    type: String,
  },
  amount: {
    type: Number,
    required: true,
  },
  spent: {
    type: Number,
    default: 0,
  },
  period: {
    type: String,
    enum: ['monthly', 'quarterly', 'yearly'],
    default: 'monthly',
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  alertThresholds: {
    warning: {
      type: Number,
      default: 80, // 80%
    },
    critical: {
      type: Number,
      default: 95, // 95%
    },
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Budget || mongoose.model('Budget', BudgetSchema);