import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Company from '@/models/Company';
import Policy from '@/models/Policy';
import Expense from '@/models/Expense';
import Budget from '@/models/Budget';
import bcryptjs from 'bcryptjs';

export async function POST() {
  try {
    await connectDB();
    
    console.log('🗑️ Clearing all existing data...');
    
    // Clear all collections
    await User.deleteMany({});
    await Company.deleteMany({});
    await Policy.deleteMany({});
    await Expense.deleteMany({});
    await Budget.deleteMany({});
    
    console.log('✅ All data cleared');
    
    console.log('🏢 Creating companies...');
    
    // Create JPMorgan Chase company
    const jpmcCompany = await Company.create({
      name: 'JPMorgan Chase',
      domain: 'jpmc.com',
      subscriptionTier: 'enterprise',
      settings: {
        autoApproveLimit: 1000,
        requireReceipts: true,
        allowPersonalExpenses: false
      }
    });
    
    // Create Accenture company
    const accentureCompany = await Company.create({
      name: 'Accenture',
      domain: 'accenture.com', 
      subscriptionTier: 'enterprise',
      settings: {
        autoApproveLimit: 500,
        requireReceipts: true,
        allowPersonalExpenses: false
      }
    });
    
    console.log('✅ Companies created');
    
    console.log('👥 Creating JPMC users...');
    
    // Use plain text password - let User model handle hashing
    const plainPassword = 'password123';
    
    // JPMC Users
    const jpmcUsers = await User.create([
      {
        name: 'John Executive',
        email: 'john@jpmc.com',
        password: plainPassword,
        role: 'executive',
        department: 'Executive',
        employeeId: 'JPMC001',
        company: jpmcCompany._id
      },
      {
        name: 'Sarah Manager',
        email: 'sarah@jpmc.com', 
        password: plainPassword,
        role: 'manager',
        department: 'Operations',
        employeeId: 'JPMC002',
        company: jpmcCompany._id
      },
      {
        name: 'Mike Finance',
        email: 'mike@jpmc.com',
        password: plainPassword,
        role: 'finance',
        department: 'Finance',
        employeeId: 'JPMC003',
        company: jpmcCompany._id
      },
      {
        name: 'Emma Employee',
        email: 'emma@jpmc.com',
        password: plainPassword,
        role: 'employee',
        department: 'Marketing',
        employeeId: 'JPMC004',
        company: jpmcCompany._id
      }
    ]);
    
    console.log('👥 Creating Accenture users...');
    
    // Accenture Users
    const accentureUsers = await User.create([
      {
        name: 'David Executive',
        email: 'david@accenture.com',
        password: plainPassword,
        role: 'executive',
        department: 'Executive',
        employeeId: 'ACC001',
        company: accentureCompany._id
      },
      {
        name: 'Lisa Manager',
        email: 'lisa@accenture.com',
        password: plainPassword,
        role: 'manager',
        department: 'Consulting',
        employeeId: 'ACC002',
        company: accentureCompany._id
      },
      {
        name: 'Alex Finance',
        email: 'alex@accenture.com',
        password: plainPassword,
        role: 'finance',
        department: 'Finance',
        employeeId: 'ACC003',
        company: accentureCompany._id
      },
      {
        name: 'Sophie Employee',
        email: 'sophie@accenture.com',
        password: plainPassword,
        role: 'employee',
        department: 'Technology',
        employeeId: 'ACC004',
        company: accentureCompany._id
      }
    ]);
    
    console.log('✅ Users created');
    
    console.log('📋 Creating JPMC policies...');
    
    // JPMC Policies
    await Policy.create([
      {
        name: 'JPMC Travel Policy',
        department: 'Finance',
        company: jpmcCompany._id
      },
      {
        name: 'JPMC Meal Policy', 
        department: 'Finance',
        company: jpmcCompany._id
      }
    ]);
    
    console.log('📋 Creating Accenture policies...');
    
    // Accenture Policies
    await Policy.create([
      {
        name: 'Accenture Travel Policy',
        department: 'Finance',
        company: accentureCompany._id
      },
      {
        name: 'Accenture Client Entertainment',
        department: 'Finance',
        company: accentureCompany._id
      }
    ]);
    
    console.log('💰 Creating sample expenses...');
    
    // JPMC Expenses
    await Expense.create([
      {
        description: 'Lunch with JP Morgan client',
        amount: 85,
        category: 'Meals',
        vendor: 'Downtown Restaurant',
        date: new Date('2024-10-15'),
        status: 'approved',
        company: jpmcCompany._id,
        employeeId: jpmcUsers.find(u => u.role === 'employee')._id
      },
      {
        description: 'Flight and hotel for NYC conference',
        amount: 1200,
        category: 'Travel',
        vendor: 'American Airlines & Hilton',
        date: new Date('2024-10-20'),
        status: 'pending',
        company: jpmcCompany._id,
        employeeId: jpmcUsers.find(u => u.role === 'manager')._id
      }
    ]);
    
    // Accenture Expenses  
    await Expense.create([
      {
        description: 'Dinner with Accenture client team',
        amount: 150,
        category: 'Meals',
        vendor: 'Fine Dining Restaurant',
        date: new Date('2024-10-18'),
        status: 'approved',
        company: accentureCompany._id,
        employeeId: accentureUsers.find(u => u.role === 'employee')._id
      },
      {
        description: 'Travel for client engagement',
        amount: 2500,
        category: 'Travel',
        vendor: 'British Airways & Hotel',
        date: new Date('2024-10-25'),
        status: 'pending',
        company: accentureCompany._id,
        employeeId: accentureUsers.find(u => u.role === 'manager')._id
      }
    ]);
    
    console.log('✅ Fresh company-specific data created successfully!');
    
    return Response.json({
      success: true,
      message: 'Database reset and seeded with company-specific data',
      data: {
        companies: 2,
        jpmcUsers: jpmcUsers.length,
        accentureUsers: accentureUsers.length,
        jpmcPolicies: 2,
        accenturePolicies: 2,
        jpmcExpenses: 2,
        accentureExpenses: 2
      }
    });
    
  } catch (error) {
    console.error('❌ Reset data error:', error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}