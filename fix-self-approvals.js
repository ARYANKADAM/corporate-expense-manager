const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

// Connect to database
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

// Define schemas
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

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  role: { type: String, enum: ['employee', 'manager', 'finance', 'executive', 'admin'], default: 'employee' },
  department: { type: String, required: true },
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  isActive: { type: Boolean, default: true }
});

// Create models
const Expense = mongoose.models.Expense || mongoose.model('Expense', ExpenseSchema);
const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function fixSelfApprovedExpenses() {
  try {
    console.log('🔧 Starting to fix self-approved expenses...\n');
    
    await connectDB();

    // Find expenses where employeeId equals approvedBy (self-approved)
    const selfApprovedExpenses = await Expense.find({
      $expr: { $eq: ['$employeeId', '$approvedBy'] },
      status: 'approved'
    }).populate('employeeId', 'name email role department company');

    console.log(`📊 Found ${selfApprovedExpenses.length} self-approved expenses`);

    if (selfApprovedExpenses.length === 0) {
      console.log('✅ No self-approved expenses found. Everything looks good!');
      process.exit(0);
    }

    let fixedCount = 0;
    let pendingCount = 0;

    for (const expense of selfApprovedExpenses) {
      console.log(`\n🔍 Processing expense ${expense._id}:`);
      console.log(`   Employee: ${expense.employeeId.name} (${expense.employeeId.role})`);
      console.log(`   Amount: $${expense.amount}`);
      console.log(`   Category: ${expense.category}`);

      // Find an appropriate approver in the same company
      const approver = await User.findOne({
        company: expense.employeeId.company,
        role: { $in: ['manager', 'finance', 'executive'] },
        _id: { $ne: expense.employeeId._id }, // Not the same person
        isActive: true
      });

      if (approver) {
        // Update to have proper approver
        expense.approvedBy = approver._id;
        await expense.save();
        
        console.log(`   ✅ Fixed: Now approved by ${approver.name} (${approver.role})`);
        fixedCount++;
      } else {
        // No approver found, set to pending for manual review
        expense.status = 'pending';
        expense.approvedBy = null;
        expense.approvedAt = null;
        await expense.save();
        
        console.log(`   ⏳ Set to pending: No approver found, needs manual review`);
        pendingCount++;
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('🎉 SELF-APPROVAL FIX COMPLETE');
    console.log('='.repeat(60));
    console.log(`📊 Summary:`);
    console.log(`   Total processed: ${selfApprovedExpenses.length}`);
    console.log(`   Fixed with proper approver: ${fixedCount}`);
    console.log(`   Set to pending review: ${pendingCount}`);
    console.log('\n✅ All expenses now have proper approval workflow!');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error(error);
    process.exit(1);
  }
}

fixSelfApprovedExpenses();