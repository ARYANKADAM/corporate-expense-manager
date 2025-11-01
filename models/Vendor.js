import mongoose from 'mongoose';

const VendorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  category: {
    type: String,
  },
  isApproved: {
    type: Boolean,
    default: true,
  },
  isBlacklisted: {
    type: Boolean,
    default: false,
  },
  totalSpent: {
    type: Number,
    default: 0,
  },
  transactionCount: {
    type: Number,
    default: 0,
  },
  lastUsed: {
    type: Date,
  },
  aliases: [String], // For detecting duplicate vendors
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Vendor || mongoose.model('Vendor', VendorSchema);