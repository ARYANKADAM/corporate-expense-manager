const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

// MongoDB connection string from .env.local
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/expense-management';

// User Schema
const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  role: {
    type: String,
    enum: ['employee', 'manager', 'finance', 'executive', 'admin'],
    default: 'employee',
  },
  department: {
    type: String,
    required: true,
  },
  employeeId: {
    type: String,
    unique: true,
    required: true,
  },
  managerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
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

// Policy Schema
const PolicySchema = new mongoose.Schema({
  name: {
    type: String,
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

// Expense Schema
const ExpenseSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  category: {
    type: String,
    required: true,
    enum: ['Meals', 'Travel', 'Office Supplies', 'Entertainment', 'Accommodation', 'Transportation', 'Other'],
  },
  subcategory: {
    type: String,
  },
  vendor: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
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
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Budget Schema
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
      default: 80,
    },
    critical: {
      type: Number,
      default: 95,
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

// Create Models
const User = mongoose.model('User', UserSchema);
const Policy = mongoose.model('Policy', PolicySchema);
const Expense = mongoose.model('Expense', ExpenseSchema);
const Budget = mongoose.model('Budget', BudgetSchema);

// Helper function to get random date in last 30 days
function getRandomDate(daysBack = 30) {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * daysBack));
  return date;
}

// Main seed function
async function seed() {
  try {
    console.log('🌱 Starting database seed...\n');
    
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB:', MONGODB_URI);

    // Clear existing data
    console.log('\n🗑️  Clearing existing data...');
    await User.deleteMany({});
    await Policy.deleteMany({});
    await Expense.deleteMany({});
    await Budget.deleteMany({});
    console.log('✅ Existing data cleared');

    // Hash password
    const hashedPassword = await bcrypt.hash('password123', 10);

    // Create Users
    console.log('\n👥 Creating users...');
    const users = await User.insertMany([
      {
        name: 'John Employee',
        email: 'employee@company.com',
        password: hashedPassword,
        role: 'employee',
        department: 'Sales',
        employeeId: 'EMP001',
        isActive: true,
      },
      {
        name: 'Jane Smith',
        email: 'jane@company.com',
        password: hashedPassword,
        role: 'employee',
        department: 'Engineering',
        employeeId: 'EMP002',
        isActive: true,
      },
      {
        name: 'Mike Johnson',
        email: 'mike@company.com',
        password: hashedPassword,
        role: 'employee',
        department: 'Marketing',
        employeeId: 'EMP003',
        isActive: true,
      },
      {
        name: 'Sarah Manager',
        email: 'manager@company.com',
        password: hashedPassword,
        role: 'manager',
        department: 'Sales',
        employeeId: 'MGR001',
        isActive: true,
      },
      {
        name: 'Tom Director',
        email: 'director@company.com',
        password: hashedPassword,
        role: 'manager',
        department: 'Engineering',
        employeeId: 'MGR002',
        isActive: true,
      },
      {
        name: 'Lisa Finance',
        email: 'finance@company.com',
        password: hashedPassword,
        role: 'finance',
        department: 'Finance',
        employeeId: 'FIN001',
        isActive: true,
      },
      {
        name: 'David CFO',
        email: 'executive@company.com',
        password: hashedPassword,
        role: 'executive',
        department: 'Executive',
        employeeId: 'EXE001',
        isActive: true,
      },
    ]);

    console.log(`✅ Created ${users.length} users`);

    // Create Policies
    console.log('\n📋 Creating policies...');
    const policies = await Policy.insertMany([
      {
        name: 'Sales Department Policy',
        department: 'Sales',
        rules: {
          mealLimitPerDay: 75,
          hotelLimitPerNight: 250,
          requiresReceiptOver: 25,
          approvedAirlines: ['United', 'Delta', 'American'],
          blacklistedVendors: ['Luxury Hotels Inc', 'Premium Catering'],
          autoApproveLimit: 50,
          managerApprovalLimit: 500,
          directorApprovalLimit: 5000,
        },
        isActive: true,
      },
      {
        name: 'Engineering Department Policy',
        department: 'Engineering',
        rules: {
          mealLimitPerDay: 60,
          hotelLimitPerNight: 200,
          requiresReceiptOver: 25,
          approvedAirlines: ['United', 'Delta', 'Southwest'],
          blacklistedVendors: [],
          autoApproveLimit: 50,
          managerApprovalLimit: 500,
          directorApprovalLimit: 5000,
        },
        isActive: true,
      },
      {
        name: 'Marketing Department Policy',
        department: 'Marketing',
        rules: {
          mealLimitPerDay: 80,
          hotelLimitPerNight: 300,
          requiresReceiptOver: 25,
          approvedAirlines: ['United', 'Delta', 'American', 'Southwest'],
          blacklistedVendors: [],
          autoApproveLimit: 50,
          managerApprovalLimit: 500,
          directorApprovalLimit: 5000,
        },
        isActive: true,
      },
      {
        name: 'Finance Department Policy',
        department: 'Finance',
        rules: {
          mealLimitPerDay: 50,
          hotelLimitPerNight: 150,
          requiresReceiptOver: 25,
          approvedAirlines: ['United', 'Delta'],
          blacklistedVendors: [],
          autoApproveLimit: 50,
          managerApprovalLimit: 500,
          directorApprovalLimit: 5000,
        },
        isActive: true,
      },
      {
        name: 'Default Company Policy',
        department: 'Default',
        rules: {
          mealLimitPerDay: 50,
          hotelLimitPerNight: 150,
          requiresReceiptOver: 25,
          approvedAirlines: ['United', 'Delta'],
          blacklistedVendors: [],
          autoApproveLimit: 50,
          managerApprovalLimit: 500,
          directorApprovalLimit: 5000,
        },
        isActive: true,
      },
    ]);

    console.log(`✅ Created ${policies.length} policies`);

    // Create Sample Expenses
    console.log('\n💰 Creating sample expenses...');
    const employeeUser = users[0]; // John Employee
    const employee2 = users[1]; // Jane Smith
    const employee3 = users[2]; // Mike Johnson
    const managerUser = users[3]; // Sarah Manager

    const sampleExpenses = [
      // Approved expenses
      {
        employeeId: employeeUser._id,
        amount: 45.50,
        category: 'Meals',
        vendor: 'Starbucks',
        description: 'Client meeting coffee and breakfast',
        date: getRandomDate(10),
        status: 'approved',
        approvedBy: managerUser._id,
        approvedAt: new Date(),
        isCompliant: true,
      },
      {
        employeeId: employeeUser._id,
        amount: 125.00,
        category: 'Travel',
        vendor: 'Uber',
        description: 'Airport transportation for client visit',
        date: getRandomDate(15),
        status: 'approved',
        approvedBy: managerUser._id,
        approvedAt: new Date(),
        isCompliant: true,
      },
      {
        employeeId: employee2._id,
        amount: 89.99,
        category: 'Office Supplies',
        vendor: 'Staples',
        description: 'Team supplies - notebooks, pens, markers',
        date: getRandomDate(5),
        status: 'approved',
        approvedBy: managerUser._id,
        approvedAt: new Date(),
        isCompliant: true,
      },
      // Pending expenses
      {
        employeeId: employeeUser._id,
        amount: 250.00,
        category: 'Meals',
        vendor: 'The Capital Grille',
        description: 'Team dinner with important client',
        date: getRandomDate(3),
        status: 'pending',
        isCompliant: true,
      },
      {
        employeeId: employee2._id,
        amount: 450.00,
        category: 'Travel',
        vendor: 'United Airlines',
        description: 'Flight to San Francisco for conference',
        date: getRandomDate(7),
        status: 'pending',
        isCompliant: true,
      },
      {
        employeeId: employee3._id,
        amount: 180.00,
        category: 'Accommodation',
        vendor: 'Marriott Hotel',
        description: 'Hotel stay for client meeting in Chicago',
        date: getRandomDate(4),
        status: 'pending',
        isCompliant: true,
      },
      // Flagged expense (policy violation)
      {
        employeeId: employeeUser._id,
        amount: 95.00,
        category: 'Meals',
        vendor: 'Ruth\'s Chris Steak House',
        description: 'Business lunch',
        date: getRandomDate(2),
        status: 'flagged',
        isCompliant: false,
        policyViolations: [
          {
            rule: 'Meal Limit Exceeded',
            message: 'Meal expense exceeds daily limit of $75',
            severity: 'medium',
          },
        ],
      },
      {
        employeeId: employee3._id,
        amount: 300.00,
        category: 'Accommodation',
        vendor: 'Luxury Hotels Inc',
        description: 'Hotel stay for sales trip',
        date: getRandomDate(8),
        status: 'flagged',
        isCompliant: false,
        policyViolations: [
          {
            rule: 'Blacklisted Vendor',
            message: 'Luxury Hotels Inc is not an approved vendor',
            severity: 'high',
          },
        ],
      },
      // Rejected expense
      {
        employeeId: employee2._id,
        amount: 500.00,
        category: 'Entertainment',
        vendor: 'Premium Event Center',
        description: 'Team building event',
        date: getRandomDate(12),
        status: 'rejected',
        approvedBy: managerUser._id,
        approvedAt: new Date(),
        rejectionReason: 'Requires pre-approval for entertainment expenses over $300',
        isCompliant: false,
      },
      // More approved expenses for analytics
      {
        employeeId: employeeUser._id,
        amount: 35.00,
        category: 'Transportation',
        vendor: 'Lyft',
        description: 'Client meeting transportation',
        date: getRandomDate(20),
        status: 'approved',
        approvedBy: managerUser._id,
        approvedAt: new Date(),
        isCompliant: true,
      },
      {
        employeeId: employee2._id,
        amount: 67.50,
        category: 'Meals',
        vendor: 'Panera Bread',
        description: 'Working lunch with team',
        date: getRandomDate(6),
        status: 'approved',
        approvedBy: managerUser._id,
        approvedAt: new Date(),
        isCompliant: true,
      },
      {
        employeeId: employee3._id,
        amount: 150.00,
        category: 'Office Supplies',
        vendor: 'Best Buy',
        description: 'USB drives and cables for presentations',
        date: getRandomDate(14),
        status: 'approved',
        approvedBy: managerUser._id,
        approvedAt: new Date(),
        isCompliant: true,
      },
    ];

    const expenses = await Expense.insertMany(sampleExpenses);
    console.log(`✅ Created ${expenses.length} sample expenses`);

    // Create Budgets
    console.log('\n💼 Creating budgets...');
    const currentDate = new Date();
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    const budgets = await Budget.insertMany([
      {
        department: 'Sales',
        category: 'Meals',
        amount: 5000,
        spent: 0,
        period: 'monthly',
        startDate: startOfMonth,
        endDate: endOfMonth,
        isActive: true,
      },
      {
        department: 'Sales',
        category: 'Travel',
        amount: 10000,
        spent: 0,
        period: 'monthly',
        startDate: startOfMonth,
        endDate: endOfMonth,
        isActive: true,
      },
      {
        department: 'Engineering',
        category: 'Office Supplies',
        amount: 3000,
        spent: 0,
        period: 'monthly',
        startDate: startOfMonth,
        endDate: endOfMonth,
        isActive: true,
      },
      {
        department: 'Marketing',
        amount: 15000,
        spent: 0,
        period: 'monthly',
        startDate: startOfMonth,
        endDate: endOfMonth,
        isActive: true,
      },
    ]);

    console.log(`✅ Created ${budgets.length} budgets`);

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('🎉 DATABASE SEEDED SUCCESSFULLY!');
    console.log('='.repeat(60));
    console.log('\n📊 Summary:');
    console.log(`   Users:    ${users.length}`);
    console.log(`   Policies: ${policies.length}`);
    console.log(`   Expenses: ${expenses.length}`);
    console.log(`   Budgets:  ${budgets.length}`);
    
    console.log('\n🔐 Test Accounts (all passwords: password123):');
    console.log('   Employee:  employee@company.com');
    console.log('   Employee:  jane@company.com');
    console.log('   Employee:  mike@company.com');
    console.log('   Manager:   manager@company.com');
    console.log('   Manager:   director@company.com');
    console.log('   Finance:   finance@company.com');
    console.log('   Executive: executive@company.com');

    console.log('\n✨ You can now start the application with: npm run dev');
    console.log('='.repeat(60) + '\n');

    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB\n');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Run the seed function
seed();