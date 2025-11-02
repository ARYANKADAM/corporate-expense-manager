import mongoose from 'mongoose';

const CompanySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  domain: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    // e.g., "jpmc.com", "accenture.com", "tcs.com"
  },
  industry: {
    type: String,
    enum: ['Technology', 'Finance', 'Healthcare', 'Manufacturing', 'Consulting', 'Other'],
    default: 'Other',
  },
  address: {
    street: String,
    city: String,
    state: String,
    country: String,
    zipCode: String,
  },
  settings: {
    currency: {
      type: String,
      default: 'USD',
    },
    timezone: {
      type: String,
      default: 'UTC',
    },
    fiscalYearStart: {
      type: String,
      default: 'January',
    },
    approvalWorkflow: {
      requireManagerApproval: {
        type: Boolean,
        default: true,
      },
      requireFinanceApproval: {
        type: Boolean,
        default: true,
      },
      autoApprovalLimit: {
        type: Number,
        default: 100,
      },
    },
  },
  subscription: {
    plan: {
      type: String,
      enum: ['free', 'basic', 'premium', 'enterprise'],
      default: 'free',
    },
    maxUsers: {
      type: Number,
      default: 10,
    },
    maxExpensesPerMonth: {
      type: Number,
      default: 100,
    },
    features: {
      advancedAnalytics: {
        type: Boolean,
        default: false,
      },
      customPolicies: {
        type: Boolean,
        default: false,
      },
      integrations: {
        type: Boolean,
        default: false,
      },
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

// Indexes for better performance
CompanySchema.index({ domain: 1 });
CompanySchema.index({ name: 1 });

// Pre-save middleware to update the updatedAt field
CompanySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.models.Company || mongoose.model('Company', CompanySchema);