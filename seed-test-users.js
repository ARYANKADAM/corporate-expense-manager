const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

// Connect to MongoDB
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

// Define schemas directly since we can't import ES6 modules easily
const CompanySchema = new mongoose.Schema({
  name: { type: String, required: true },
  domain: { type: String, required: true, unique: true },
  industry: String,
  subscription: {
    tier: { type: String, enum: ['basic', 'pro', 'enterprise'], default: 'basic' },
    maxUsers: { type: Number, default: 100 }
  },
  settings: {
    allowSelfRegistration: { type: Boolean, default: true }
  },
  createdAt: { type: Date, default: Date.now }
});

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['employee', 'manager', 'finance', 'executive', 'admin'], default: 'employee' },
  department: { type: String, required: true },
  employeeId: { type: String, required: true },
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

const PolicySchema = new mongoose.Schema({
  name: { type: String, required: true },
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  department: { type: String, required: true },
  rules: {
    mealLimitPerDay: { type: Number, default: 75 },
    hotelLimitPerNight: { type: Number, default: 250 },
    requiresReceiptOver: { type: Number, default: 25 },
    autoApproveLimit: { type: Number, default: 50 },
    managerApprovalLimit: { type: Number, default: 500 },
    directorApprovalLimit: { type: Number, default: 5000 }
  },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

const ExpenseSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  amount: { type: Number, required: true },
  category: { type: String, required: true },
  vendor: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: Date, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'flagged'], default: 'pending' },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvedAt: Date,
  createdAt: { type: Date, default: Date.now }
});

// Create models
const Company = mongoose.models.Company || mongoose.model('Company', CompanySchema);
const User = mongoose.models.User || mongoose.model('User', UserSchema);
const Policy = mongoose.models.Policy || mongoose.model('Policy', PolicySchema);
const Expense = mongoose.models.Expense || mongoose.model('Expense', ExpenseSchema);

async function seedTestData() {
  try {
    console.log('🌱 Starting test data seed...\n');
    
    await connectDB();

    // Hash password
    const hashedPassword = await bcrypt.hash('password123', 10);

    // 1. Create Companies
    console.log('🏢 Creating companies...');
    
    const jpmc = await Company.findOneAndUpdate(
      { domain: 'jpmc.com' },
      {
        name: 'JPMorgan Chase',
        domain: 'jpmc.com',
        industry: 'Finance',
        subscription: { tier: 'enterprise', maxUsers: 10000 },
        settings: { allowSelfRegistration: true }
      },
      { upsert: true, new: true }
    );

    const accenture = await Company.findOneAndUpdate(
      { domain: 'accenture.com' },
      {
        name: 'Accenture',
        domain: 'accenture.com',
        industry: 'Consulting',
        subscription: { tier: 'enterprise', maxUsers: 10000 },
        settings: { allowSelfRegistration: true }
      },
      { upsert: true, new: true }
    );

    console.log(`✅ Created/Updated JPMorgan Chase (${jpmc._id})`);
    console.log(`✅ Created/Updated Accenture (${accenture._id})`);

    // 2. Create JPMorgan Chase Users
    console.log('\n👥 Creating JPMorgan Chase users...');
    
    const jpmcUsers = [
      {
        name: 'Mike Finance',
        email: 'mike@jpmc.com',
        password: hashedPassword,
        role: 'finance',
        department: 'Finance',
        employeeId: 'JPM001',
        company: jpmc._id,
        isActive: true,
      },
      {
        name: 'John Executive',
        email: 'john@jpmc.com',
        password: hashedPassword,
        role: 'executive',
        department: 'Executive',
        employeeId: 'JPM002',
        company: jpmc._id,
        isActive: true,
      },
      {
        name: 'Sarah Manager',
        email: 'sarah@jpmc.com',
        password: hashedPassword,
        role: 'manager',
        department: 'Operations',
        employeeId: 'JPM003',
        company: jpmc._id,
        isActive: true,
      },
      {
        name: 'Emma Employee',
        email: 'emma@jpmc.com',
        password: hashedPassword,
        role: 'employee',
        department: 'Sales',
        employeeId: 'JPM004',
        company: jpmc._id,
        isActive: true,
      },
    ];

    // Clear existing JPMC users and create new ones
    await User.deleteMany({ company: jpmc._id });
    const createdJpmcUsers = await User.insertMany(jpmcUsers);
    console.log(`✅ Created ${createdJpmcUsers.length} JPMorgan Chase users`);

    // 3. Create Accenture Users
    console.log('\n👥 Creating Accenture users...');
    
    const accentureUsers = [
      {
        name: 'Alex Finance',
        email: 'alex@accenture.com',
        password: hashedPassword,
        role: 'finance',
        department: 'Finance',
        employeeId: 'ACC001',
        company: accenture._id,
        isActive: true,
      },
      {
        name: 'David Executive',
        email: 'david@accenture.com',
        password: hashedPassword,
        role: 'executive',
        department: 'Executive',
        employeeId: 'ACC002',
        company: accenture._id,
        isActive: true,
      },
      {
        name: 'Lisa Manager',
        email: 'lisa@accenture.com',
        password: hashedPassword,
        role: 'manager',
        department: 'Consulting',
        employeeId: 'ACC003',
        company: accenture._id,
        isActive: true,
      },
      {
        name: 'Sophie Employee',
        email: 'sophie@accenture.com',
        password: hashedPassword,
        role: 'employee',
        department: 'Technology',
        employeeId: 'ACC004',
        company: accenture._id,
        isActive: true,
      },
    ];

    // Clear existing Accenture users and create new ones
    await User.deleteMany({ company: accenture._id });
    const createdAccentureUsers = await User.insertMany(accentureUsers);
    console.log(`✅ Created ${createdAccentureUsers.length} Accenture users`);

    // 4. Create Company-specific Policies
    console.log('\n📋 Creating company policies...');
    
    await Policy.deleteMany({ company: { $in: [jpmc._id, accenture._id] } });
    
    const policies = [
      // JPMorgan Chase Policies
      {
        name: 'JPMorgan Chase Finance Policy',
        company: jpmc._id,
        department: 'Finance',
        rules: {
          mealLimitPerDay: 100,
          hotelLimitPerNight: 400,
          requiresReceiptOver: 25,
          autoApproveLimit: 100,
          managerApprovalLimit: 1000,
          directorApprovalLimit: 10000,
        },
        isActive: true,
      },
      {
        name: 'JPMorgan Chase General Policy',
        company: jpmc._id,
        department: 'All',
        rules: {
          mealLimitPerDay: 75,
          hotelLimitPerNight: 300,
          requiresReceiptOver: 25,
          autoApproveLimit: 75,
          managerApprovalLimit: 750,
          directorApprovalLimit: 7500,
        },
        isActive: true,
      },
      // Accenture Policies
      {
        name: 'Accenture Consulting Policy',
        company: accenture._id,
        department: 'Consulting',
        rules: {
          mealLimitPerDay: 120,
          hotelLimitPerNight: 500,
          requiresReceiptOver: 30,
          autoApproveLimit: 150,
          managerApprovalLimit: 1500,
          directorApprovalLimit: 15000,
        },
        isActive: true,
      },
      {
        name: 'Accenture General Policy',
        company: accenture._id,
        department: 'All',
        rules: {
          mealLimitPerDay: 90,
          hotelLimitPerNight: 350,
          requiresReceiptOver: 25,
          autoApproveLimit: 100,
          managerApprovalLimit: 1000,
          directorApprovalLimit: 10000,
        },
        isActive: true,
      },
    ];

    const createdPolicies = await Policy.insertMany(policies);
    console.log(`✅ Created ${createdPolicies.length} company policies`);

    // 5. Create Sample Expenses for Each Company
    console.log('\n💰 Creating sample expenses...');
    
    await Expense.deleteMany({ 
      employeeId: { 
        $in: [...createdJpmcUsers.map(u => u._id), ...createdAccentureUsers.map(u => u._id)] 
      } 
    });

    const sampleExpenses = [
      // JPMorgan Chase Expenses
      {
        employeeId: createdJpmcUsers[3]._id, // Emma Employee
        company: jpmc._id,
        amount: 65.50,
        category: 'Meals',
        vendor: 'Business Lunch Cafe',
        description: 'Client meeting lunch',
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        status: 'approved',
        approvedBy: createdJpmcUsers[2]._id, // Sarah Manager
        approvedAt: new Date(),
      },
      {
        employeeId: createdJpmcUsers[3]._id, // Emma Employee
        company: jpmc._id,
        amount: 250.00,
        category: 'Travel',
        vendor: 'United Airlines',
        description: 'Flight to Chicago for client visit',
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        status: 'pending',
      },
      // Accenture Expenses
      {
        employeeId: createdAccentureUsers[3]._id, // Sophie Employee
        company: accenture._id,
        amount: 95.00,
        category: 'Meals',
        vendor: 'Executive Restaurant',
        description: 'Team dinner',
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        status: 'approved',
        approvedBy: createdAccentureUsers[2]._id, // Lisa Manager
        approvedAt: new Date(),
      },
      {
        employeeId: createdAccentureUsers[3]._id, // Sophie Employee
        company: accenture._id,
        amount: 180.00,
        category: 'Accommodation',
        vendor: 'Marriott Hotel',
        description: 'Hotel stay for project work',
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        status: 'pending',
      },
    ];

    const createdExpenses = await Expense.insertMany(sampleExpenses);
    console.log(`✅ Created ${createdExpenses.length} sample expenses`);

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('🎉 TEST DATA SEEDED SUCCESSFULLY!');
    console.log('='.repeat(60));
    console.log('\n📊 Summary:');
    console.log(`   Companies: 2 (JPMorgan Chase, Accenture)`);
    console.log(`   Users:     ${createdJpmcUsers.length + createdAccentureUsers.length}`);
    console.log(`   Policies:  ${createdPolicies.length}`);
    console.log(`   Expenses:  ${createdExpenses.length}`);
    
    console.log('\n🔐 Test Accounts (password: password123):');
    console.log('\n   JPMorgan Chase Users:');
    console.log('   • Mike Finance:   mike@jpmc.com / finance');
    console.log('   • John Executive: john@jpmc.com / executive');
    console.log('   • Sarah Manager:  sarah@jpmc.com / manager');
    console.log('   • Emma Employee:  emma@jpmc.com / employee');
    
    console.log('\n   Accenture Users:');
    console.log('   • Alex Finance:   alex@accenture.com / finance');
    console.log('   • David Executive: david@accenture.com / executive');
    console.log('   • Lisa Manager:   lisa@accenture.com / manager');
    console.log('   • Sophie Employee: sophie@accenture.com / employee');

    console.log('\n✨ Ready to test role-based login!');
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

seedTestData();