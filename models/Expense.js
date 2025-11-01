import mongoose from 'mongoose';

const ExpenseSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  amount: {
    type: Number,
    required: [true, 'Please provide an amount'],
    min: 0,
  },
  category: {
    type: String,
    required: [true, 'Please provide a category'],
    enum: ['Meals', 'Travel', 'Office Supplies', 'Entertainment', 'Accommodation', 'Transportation', 'Other'],
  },
  subcategory: {
    type: String,
  },
  vendor: {
    type: String,
    required: [true, 'Please provide a vendor name'],
  },
  description: {
    type: String,
    required: [true, 'Please provide a description'],
  },
  date: {
    type: Date,
    required: [true, 'Please provide a date'],
  },
  receiptUrl: {
    type: String,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'flagged'],
    default: 'pending',
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  approvedAt: {
    type: Date,
  },
  rejectionReason: {
    type: String,
  },
  policyViolations: [{
    rule: String,
    message: String,
    severity: {
      type: String,
      enum: ['low', 'medium', 'high'],
    },
  }],
  isCompliant: {
    type: Boolean,
    default: true,
  },
  aiCategorization: {
    confidence: Number,
    originalCategory: String,
  },
  metadata: {
    type: Map,
    of: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Indexes for better query performance
ExpenseSchema.index({ employeeId: 1, date: -1 });
ExpenseSchema.index({ status: 1 });
ExpenseSchema.index({ category: 1 });

export default mongoose.models.Expense || mongoose.model('Expense', ExpenseSchema);