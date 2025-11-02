// Fix existing users and policies - assign them to companies
// Run this script to update existing data

// Manually set environment variables
process.env.MONGODB_URI = 'mongodb+srv://kadamaryan21418_db_user:tvVwUanRHHbjYwas@cluster0.nhnaqtu.mongodb.net/corporate-expense-system?retryWrites=true&w=majority';
process.env.JWT_SECRET = '60ff76539ght456fer345de3bf43h5g7';

import connectDB from './lib/mongodb.js';
import User from './models/User.js';
import Policy from './models/Policy.js';
import Company from './models/Company.js';

async function fixExistingData() {
  try {
    await connectDB();
    console.log('🔧 Starting data migration...');

    // 1. Find or create a default company for existing users
    let defaultCompany = await Company.findOne({ domain: 'jpmc.com' });
    
    if (!defaultCompany) {
      defaultCompany = await Company.create({
        name: 'JPMorgan Chase',
        domain: 'jpmc.com',
        industry: 'Finance'
      });
      console.log('✅ Created default company:', defaultCompany.name);
    }

    // 2. Update users without company
    const usersWithoutCompany = await User.find({ company: { $exists: false } });
    console.log(`👥 Found ${usersWithoutCompany.length} users without company`);

    for (const user of usersWithoutCompany) {
      // Assign company based on email domain or use default
      let userCompany = defaultCompany;
      
      const emailDomain = user.email.split('@')[1];
      if (emailDomain !== 'jpmc.com') {
        // Try to find or create company for this domain
        let existingCompany = await Company.findOne({ domain: emailDomain });
        if (!existingCompany) {
          const companyName = emailDomain.includes('accenture') ? 'Accenture' :
                             emailDomain.includes('tcs') ? 'Tata Consultancy Services' :
                             emailDomain.includes('microsoft') ? 'Microsoft' :
                             `Demo Company (${emailDomain.split('.')[0].toUpperCase()})`;
          
          existingCompany = await Company.create({
            name: companyName,
            domain: emailDomain,
            industry: 'Technology'
          });
          console.log('✅ Created company for user:', existingCompany.name);
        }
        userCompany = existingCompany;
      }
      
      user.company = userCompany._id;
      await user.save();
      console.log(`✅ Updated user ${user.email} -> ${userCompany.name}`);
    }

    // 3. Update policies without company
    const policiesWithoutCompany = await Policy.find({ company: { $exists: false } });
    console.log(`📋 Found ${policiesWithoutCompany.length} policies without company`);

    for (const policy of policiesWithoutCompany) {
      policy.company = defaultCompany._id;
      await policy.save();
      console.log(`✅ Updated policy "${policy.name}" -> ${defaultCompany.name}`);
    }

    console.log('🎉 Data migration completed!');
    
    // Show summary
    const allUsers = await User.find().populate('company');
    const allPolicies = await Policy.find().populate('company');
    
    console.log('\n📊 Summary:');
    console.log('Users:');
    allUsers.forEach(user => {
      console.log(`  - ${user.email} -> ${user.company?.name || 'No company'}`);
    });
    
    console.log('\nPolicies:');
    allPolicies.forEach(policy => {
      console.log(`  - ${policy.name} -> ${policy.company?.name || 'No company'}`);
    });

  } catch (error) {
    console.error('❌ Migration error:', error);
  }
  
  process.exit(0);
}

fixExistingData();