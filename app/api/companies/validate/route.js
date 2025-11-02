import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Company from '@/models/Company';

// Validate company domain and get company info
export async function POST(request) {
  try {
    await connectDB();

    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email is required' },
        { status: 400 }
      );
    }

    // Extract domain from email
    const domain = email.split('@')[1];
    
    if (!domain) {
      return NextResponse.json(
        { success: false, message: 'Invalid email format' },
        { status: 400 }
      );
    }

    // List of common personal email providers
    const personalEmailProviders = [
      'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 
      'aol.com', 'icloud.com', 'protonmail.com', 'zoho.com'
    ];

    const isPersonalEmail = personalEmailProviders.includes(domain.toLowerCase());

    // Check if company exists with this domain
    const company = await Company.findOne({ domain: domain.toLowerCase() });

    if (company) {
      return NextResponse.json({
        success: true,
        company: {
          id: company._id,
          name: company.name,
          domain: company.domain,
          industry: company.industry,
        },
      });
    } else {
      // For testing: Auto-create a demo company for any domain
      const companyName = domain.includes('jpmc') ? 'JPMorgan Chase' :
                         domain.includes('accenture') ? 'Accenture' :
                         domain.includes('tcs') ? 'Tata Consultancy Services' :
                         domain.includes('microsoft') ? 'Microsoft' :
                         `Demo Company (${domain.split('.')[0].toUpperCase()})`;

      // Create a temporary company for testing
      const newCompany = await Company.create({
        name: companyName,
        domain: domain.toLowerCase(),
        industry: 'Technology',
        settings: {
          currency: 'USD',
          timezone: 'UTC',
          fiscalYearStart: 'January',
        }
      });

      return NextResponse.json({
        success: true,
        company: {
          id: newCompany._id,
          name: newCompany.name,
          domain: newCompany.domain,
          industry: newCompany.industry,
        },
        isNewCompany: true,
        message: `Created demo company: ${companyName}`
      });
    }
  } catch (error) {
    console.error('Company validation error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}

// Create a new company (for first-time setup)
export async function PUT(request) {
  try {
    await connectDB();

    const { name, domain, industry, adminEmail, adminName } = await request.json();

    // Validation
    if (!name || !domain || !adminEmail || !adminName) {
      return NextResponse.json(
        { success: false, message: 'All fields are required' },
        { status: 400 }
      );
    }

    // Check if company already exists
    const existingCompany = await Company.findOne({ 
      $or: [{ domain: domain.toLowerCase() }, { name: name }] 
    });

    if (existingCompany) {
      return NextResponse.json(
        { success: false, message: 'Company with this domain or name already exists' },
        { status: 400 }
      );
    }

    // Create new company
    const company = await Company.create({
      name,
      domain: domain.toLowerCase(),
      industry: industry || 'Other',
      settings: {
        currency: 'USD',
        timezone: 'UTC',
        fiscalYearStart: 'January',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Company created successfully',
      company: {
        id: company._id,
        name: company.name,
        domain: company.domain,
        industry: company.industry,
      },
    });
  } catch (error) {
    console.error('Company creation error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create company' },
      { status: 500 }
    );
  }
}