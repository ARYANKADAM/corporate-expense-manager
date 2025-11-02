import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Company from '@/models/Company';

export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();
    const { name, email, password, department, role, companyId } = body;

    // Validation
    if (!name || !email || !password || !department || !companyId) {
      return NextResponse.json(
        { success: false, message: 'Please provide all required fields including company' },
        { status: 400 }
      );
    }

    // Verify company exists
    const company = await Company.findById(companyId);
    if (!company) {
      return NextResponse.json(
        { success: false, message: 'Invalid company. Please contact your administrator.' },
        { status: 400 }
      );
    }

    // Verify email domain matches company domain
    const emailDomain = email.split('@')[1];
    if (emailDomain.toLowerCase() !== company.domain) {
      return NextResponse.json(
        { success: false, message: `Email domain must match company domain: ${company.domain}` },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'User already exists with this email' },
        { status: 400 }
      );
    }

    // Generate employee ID with company prefix
    const companyPrefix = company.name.substring(0, 3).toUpperCase();
    const employeeId = `${companyPrefix}${Date.now().toString().slice(-6)}`;

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      department,
      role: role || 'employee',
      employeeId,
      company: companyId,
    });

    // Return success message (without token - user needs to login separately)
    return NextResponse.json(
      {
        success: true,
        message: 'Account created successfully! Please sign in with your credentials.',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          department: user.department,
          employeeId: user.employeeId,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
}