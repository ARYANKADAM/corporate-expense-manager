import mongoose from 'mongoose';

const PolicySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true,
  },
  department: {
    type: String,
    required: true,
  },
  rules: {
    mealLimitPerDay: {
      type: Number,
      default: 75,
    },
    hotelLimitPerNight: {
      type: Number,
      default: 250,
    },
    requiresReceiptOver: {
      type: Number,
      default: 25,
    },
    approvedAirlines: [String],
    blacklistedVendors: [String],
    autoApproveLimit: {
      type: Number,
      default: 50,
    },
    managerApprovalLimit: {
      type: Number,
      default: 500,
    },
    directorApprovalLimit: {
      type: Number,
      default: 5000,
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
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Policy || mongoose.model('Policy', PolicySchema);