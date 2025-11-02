import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Company from '@/models/Company';
import { generateToken } from '@/lib/auth';

export async function POST(request) {
  try {
    console.log('🚀 Login API called');
    await connectDB();
    console.log('✅ Connected to database');

    const body = await request.json();
    const { email, password, role } = body;
    console.log('📝 Request body:', { email, role: role || 'not provided' });

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Please provide email and password' },
        { status: 400 }
      );
    }

    // Build query - if role is provided, use it for more specific matching
    let query = { email };
    if (role) {
      query.role = role;
    }

    console.log('🔍 Login attempt:', { email, role: role || 'not specified' });

    // Find user with matching email and optionally role, include password
    const user = await User.findOne(query).select('+password');
    
    console.log('👤 Found user:', user ? { id: user._id, email: user.email, role: user.role } : 'Not found');
    
    // Try to populate company if user exists
    if (user && user.company) {
      await user.populate('company');
    }
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials or role mismatch' },
        { status: 401 }
      );
    }

    // Check if user is active
    if (!user.isActive) {
      return NextResponse.json(
        { success: false, message: 'Account is deactivated' },
        { status: 401 }
      );
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Generate token
    const token = generateToken({
      userId: user._id,
      email: user.email,
      role: user.role,
    });

    // Return user data (without password)
    return NextResponse.json(
      {
        success: true,
        message: 'Login successful',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          department: user.department,
          employeeId: user.employeeId,
          company: user.company || null,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
}