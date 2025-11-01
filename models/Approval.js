import mongoose from 'mongoose';

const ApprovalSchema = new mongoose.Schema({
  expenseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Expense',
    required: true,
  },
  approverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  comments: {
    type: String,
  },
  level: {
    type: String,
    enum: ['manager', 'director', 'cfo', 'auto'],
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  processedAt: {
    type: Date,
  },
});

export default mongoose.models.Approval || mongoose.model('Approval', ApprovalSchema);