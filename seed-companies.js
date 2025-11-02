// Demo Company Seed Script
// Run this to create test companies in your database

import connectDB from './lib/mongodb.js';
import Company from './models/Company.js';

const demoCompanies = [
  {
    name: 'Accenture',
    domain: 'accenture.com',
    industry: 'Consulting',
  },
  {
    name: 'JPMorgan Chase',
    domain: 'jpmc.com',
    industry: 'Finance',
  },
  {
    name: 'Tata Consultancy Services',
    domain: 'tcs.com',
    industry: 'Technology',
  },
  {
    name: 'Microsoft Corporation',
    domain: 'microsoft.com',
    industry: 'Technology',
  },
  {
    name: 'Demo Company', // For testing with Gmail
    domain: 'gmail.com',
    industry: 'Technology',
  },
];

async function seedCompanies() {
  try {
    await connectDB();
    
    // Clear existing companies (optional)
    // await Company.deleteMany({});
    
    // Create demo companies
    for (const companyData of demoCompanies) {
      const existingCompany = await Company.findOne({ domain: companyData.domain });
      
      if (!existingCompany) {
        const company = await Company.create(companyData);
        console.log(`✅ Created company: ${company.name} (${company.domain})`);
      } else {
        console.log(`⚠️  Company already exists: ${existingCompany.name}`);
      }
    }
    
    console.log('🎉 Demo companies seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding companies:', error);
    process.exit(1);
  }
}

seedCompanies();