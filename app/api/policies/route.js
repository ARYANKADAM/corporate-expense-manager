import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Policy from "@/models/Policy";
import User from "@/models/User";
import jwt from "jsonwebtoken";

// Fetch all policies for the user's company
export async function GET(request) {
  await connectDB();
  
  // Get user from JWT token
  const authHeader = request.headers.get('authorization');
  if (!authHeader) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).populate('company');
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    console.log('🔍 User company:', user.company);
    
    if (!user.company) {
      // User doesn't have company assigned - for testing, show all policies
      console.log('⚠️ User has no company assigned - showing all policies for testing');
      const allPolicies = await Policy.find().sort({ createdAt: -1 });
      return NextResponse.json({
        success: true,
        policies: allPolicies,
        count: allPolicies.length
      });
    }
    
    // Only fetch policies for user's company
    const policies = await Policy.find({ company: user.company._id }).sort({ createdAt: -1 });
    console.log(`📋 Found ${policies.length} policies for company:`, user.company.name);
    
    // If no company-specific policies found, show all for testing
    if (policies.length === 0) {
      console.log('📋 No company-specific policies found - showing all for testing');
      const allPolicies = await Policy.find().sort({ createdAt: -1 });
      return NextResponse.json({
        success: true,
        policies: allPolicies,
        count: allPolicies.length
      });
    }
    
    return NextResponse.json({
      success: true,
      policies: policies,
      count: policies.length
    });
  } catch (error) {
    console.error('❌ Policy fetch error:', error);
    return NextResponse.json({ error: 'Invalid token or server error' }, { status: 401 });
  }
}

// Create a new policy
export async function POST(req) {
  await connectDB();
  
  // Get user from JWT token
  const authHeader = req.headers.get('authorization');
  if (!authHeader) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    
    if (!user || user.role !== 'finance') {
      return NextResponse.json({ error: 'Only finance users can create policies' }, { status: 403 });
    }
    
    const body = await req.json();
    // Add company to policy
    const policyData = { ...body, company: user.company };
    const newPolicy = await Policy.create(policyData);
    
    return NextResponse.json({ success: true, policy: newPolicy });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }
}
