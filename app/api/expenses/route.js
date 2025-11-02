import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Expense from '@/models/Expense';
import Policy from '@/models/Policy';
import { getUserFromToken } from '@/lib/auth';

// n8n Webhook Trigger Function
async function triggerN8nWorkflow(event, data) {
  const n8nUrl = process.env.N8N_WEBHOOK_URL;
  
  if (!n8nUrl) {
    console.log('⚠️ N8N_WEBHOOK_URL not configured');
    return;
  }

  try {
    console.log('🚀 Triggering n8n workflow:', n8nUrl);
    console.log('📦 Event:', event);
    
    const response = await fetch(n8nUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        event,
        data,
        timestamp: new Date().toISOString(),
      }),
    });

    if (response.ok) {
      const result = await response.json().catch(() => ({}));
      console.log('✅ n8n workflow triggered successfully');
      console.log('📥 n8n response:', result);
    } else {
      console.error('❌ n8n workflow failed:', response.status, response.statusText);
    }
  } catch (error) {
    console.error('❌ n8n trigger error:', error.message);
    // Don't fail the main request if n8n fails
  }
}

// GET - Fetch expenses
export async function GET(request) {
  try {
    await connectDB();

    const user = getUserFromToken(request);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get full user details including company
    const User = (await import('@/models/User')).default;
    const fullUser = await User.findById(user.userId).populate('company');
    
    if (!fullUser || !fullUser.company) {
      return NextResponse.json(
        { success: false, message: 'User or company not found' },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Build query based on user role - ALWAYS filter by company first
    let query = { company: fullUser.company._id };

    if (user.role === 'employee') {
      query.employeeId = user.userId;
    } else if (user.role === 'manager') {
      // Manager sees their company's expenses (could be refined to team later)
      // Company filter already applied above
    }
    // Finance and Executive see all company expenses

    // Apply filters
    if (status) query.status = status;
    if (category) query.category = category;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    console.log(`📋 Fetching expenses for company: ${fullUser.company.name}, query:`, query);

    const expenses = await Expense.find(query)
      .populate('employeeId', 'name email department employeeId')
      .populate('approvedBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(100);

    console.log(`✅ Found ${expenses.length} expenses for company: ${fullUser.company.name}`);

    return NextResponse.json({
      success: true,
      expenses,
    });
  } catch (error) {
    console.error('Get expenses error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
}

// POST - Create expense
export async function POST(request) {
  try {
    await connectDB();

    const user = getUserFromToken(request);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('🔄 Creating expense for user:', user);

    // Get full user details including company
    const User = (await import('@/models/User')).default;
    const fullUser = await User.findById(user.userId).populate('company');
    
    if (!fullUser) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    console.log('👤 Full user details:', { 
      id: fullUser._id, 
      name: fullUser.name, 
      company: fullUser.company?.name 
    });

    const body = await request.json();
    const { amount, category, subcategory, vendor, description, date, receiptUrl } = body;

    console.log('📋 Expense data:', { amount, category, vendor, description });

    // Validation
    if (!amount || !category || !vendor || !description || !date) {
      return NextResponse.json(
        { success: false, message: 'Please provide all required fields' },
        { status: 400 }
      );
    }

    if (!fullUser.company) {
      return NextResponse.json(
        { success: false, message: 'User company not found' },
        { status: 400 }
      );
    }

    // Create expense with company
    const expense = await Expense.create({
      employeeId: user.userId,
      company: fullUser.company._id,
      amount: parseFloat(amount),
      category,
      subcategory,
      vendor,
      description,
      date: new Date(date),
      receiptUrl,
      status: 'pending',
    });

    console.log('✅ Expense created:', expense._id);

    // Check policy compliance
    const policyCheck = await checkPolicyCompliance(expense, user);
    
    if (!policyCheck.isCompliant) {
      expense.isCompliant = false;
      expense.policyViolations = policyCheck.violations;
      expense.status = 'flagged';
      await expense.save();
    } else if (policyCheck.autoApprove) {
      // Auto-approve but don't set employee as approver - leave for system/manager approval
      expense.status = 'approved';
      // Don't set approvedBy to the submitting employee - leave it null for system approval
      // or find and set the manager/finance person as approver
      
      // Find a manager or finance person in the same company to set as approver
      const User = (await import('@/models/User')).default;
      const approver = await User.findOne({
        company: fullUser.company._id,
        role: { $in: ['manager', 'finance', 'executive'] },
        _id: { $ne: user.userId } // Not the same person
      });
      
      if (approver) {
        expense.approvedBy = approver._id;
      }
      // If no approver found, leave approvedBy as null (system approval)
      
      expense.approvedAt = new Date();
      await expense.save();
    }

    const populatedExpense = await Expense.findById(expense._id)
      .populate('employeeId', 'name email department');

    // ✨ TRIGGER n8n WEBHOOK ✨
    await triggerN8nWorkflow('expense.submitted', {
      expenseId: expense._id.toString(),
      employee: {
        id: populatedExpense.employeeId._id.toString(),
        name: populatedExpense.employeeId.name,
        email: populatedExpense.employeeId.email,
        department: populatedExpense.employeeId.department,
        employeeId: populatedExpense.employeeId.employeeId,
      },
      expense: {
        amount: expense.amount,
        category: expense.category,
        subcategory: expense.subcategory || '',
        vendor: expense.vendor,
        description: expense.description,
        date: expense.date.toISOString(),
        receiptUrl: expense.receiptUrl || '',
        status: expense.status,
      },
      compliance: {
        isCompliant: expense.isCompliant,
        violations: expense.policyViolations || [],
        autoApproved: policyCheck.autoApprove,
      },
      metadata: {
        submittedAt: expense.createdAt.toISOString(),
        requiresApproval: !policyCheck.autoApprove,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Expense submitted successfully',
        expense: populatedExpense,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create expense error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
}

// Policy compliance check function
async function checkPolicyCompliance(expense, user) {
  try {
    // Get user's company
    const User = (await import('@/models/User')).default;
    const fullUser = await User.findById(user.userId).populate('company');
    
    if (!fullUser || !fullUser.company) {
      return { isCompliant: true, autoApprove: expense.amount < 50 };
    }

    // Fetch company policies based on category
    const policy = await Policy.findOne({
      company: fullUser.company._id,
      category: expense.category.toLowerCase(),
    });

    console.log(`🔍 Policy check for ${expense.category}:`, policy ? 'Found' : 'Not found');

    if (!policy) {
      // Default auto-approve for small amounts if no policy
      return { isCompliant: true, autoApprove: expense.amount < 100 };
    }

    const violations = [];

    // Check if expense exceeds policy max amount
    if (expense.amount > policy.maxAmount) {
      violations.push({
        rule: 'Amount Limit Exceeded',
        message: `Amount $${expense.amount} exceeds policy limit of $${policy.maxAmount}`,
        severity: 'high',
      });
    }

    // Check receipt requirement
    if (policy.requiresReceipt && !expense.receiptUrl) {
      violations.push({
        rule: 'Receipt Required',
        message: `Receipt is required for this expense category`,
        severity: 'high',
      });
    }

    // Auto-approve logic - only for very small amounts and only if user is not an employee
    // Employees should never have auto-approved expenses - they need manager approval
    const autoApprove = violations.length === 0 && 
                       !policy.requiresApproval && 
                       expense.amount <= 25 && // Very small amounts only
                       user.role !== 'employee'; // Never auto-approve for employees

    return {
      isCompliant: violations.length === 0,
      violations,
      autoApprove,
    };
  } catch (error) {
    console.error('Policy check error:', error);
    return { isCompliant: true, autoApprove: false };
  }
}