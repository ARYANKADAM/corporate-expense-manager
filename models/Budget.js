import mongoose from 'mongoose';

const BudgetSchema = new mongoose.Schema({
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true,
  },
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

// Multi-tenant indexes for performance
BudgetSchema.index({ company: 1, department: 1 });
BudgetSchema.index({ company: 1, isActive: 1 });
BudgetSchema.index({ company: 1, startDate: 1, endDate: 1 });

export default mongoose.models.Budget || mongoose.model('Budget', BudgetSchema);