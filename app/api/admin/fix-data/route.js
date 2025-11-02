import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Policy from '@/models/Policy';
import Company from '@/models/Company';

export async function POST() {
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

    const updatedUsers = [];
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
      updatedUsers.push(`${user.email} -> ${userCompany.name}`);
      console.log(`✅ Updated user ${user.email} -> ${userCompany.name}`);
    }

    // 3. Update policies without company
    const policiesWithoutCompany = await Policy.find({ company: { $exists: false } });
    console.log(`📋 Found ${policiesWithoutCompany.length} policies without company`);

    const updatedPolicies = [];
    for (const policy of policiesWithoutCompany) {
      policy.company = defaultCompany._id;
      await policy.save();
      updatedPolicies.push(`${policy.name} -> ${defaultCompany.name}`);
      console.log(`✅ Updated policy "${policy.name}" -> ${defaultCompany.name}`);
    }

    console.log('🎉 Data migration completed!');

    return NextResponse.json({
      success: true,
      message: 'Data migration completed successfully!',
      results: {
        updatedUsers,
        updatedPolicies,
        companiesCreated: await Company.countDocuments(),
      }
    });

  } catch (error) {
    console.error('❌ Migration error:', error);
    return NextResponse.json(
      { success: false, message: 'Migration failed', error: error.message },
      { status: 500 }
    );
  }
}