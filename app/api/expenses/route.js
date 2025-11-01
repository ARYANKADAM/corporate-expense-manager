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

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Build query based on user role
    let query = {};

    if (user.role === 'employee') {
      query.employeeId = user.userId;
    } else if (user.role === 'manager') {
      // Manager sees their team's expenses (for now, all expenses)
      // TODO: Add manager-employee relationship
    }
    // Finance and Executive see all expenses

    // Apply filters
    if (status) query.status = status;
    if (category) query.category = category;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const expenses = await Expense.find(query)
      .populate('employeeId', 'name email department employeeId')
      .populate('approvedBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(100);

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

    const body = await request.json();
    const { amount, category, subcategory, vendor, description, date, receiptUrl } = body;

    // Validation
    if (!amount || !category || !vendor || !description || !date) {
      return NextResponse.json(
        { success: false, message: 'Please provide all required fields' },
        { status: 400 }
      );
    }

    // Create expense
    const expense = await Expense.create({
      employeeId: user.userId,
      amount: parseFloat(amount),
      category,
      subcategory,
      vendor,
      description,
      date: new Date(date),
      receiptUrl,
      status: 'pending',
    });

    // Check policy compliance
    const policyCheck = await checkPolicyCompliance(expense, user);
    
    if (!policyCheck.isCompliant) {
      expense.isCompliant = false;
      expense.policyViolations = policyCheck.violations;
      expense.status = 'flagged';
      await expense.save();
    } else if (policyCheck.autoApprove) {
      expense.status = 'approved';
      expense.approvedBy = user.userId;
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
    // Fetch department policy
    const policy = await Policy.findOne({
      department: user.department || 'Default',
      isActive: true,
    });

    if (!policy) {
      return { isCompliant: true, autoApprove: expense.amount < 50 };
    }

    const violations = [];
    const rules = policy.rules;

    // Check receipt requirement
    if (expense.amount > rules.requiresReceiptOver && !expense.receiptUrl) {
      violations.push({
        rule: 'Receipt Required',
        message: `Receipt required for expenses over $${rules.requiresReceiptOver}`,
        severity: 'high',
      });
    }

    // Check meal limits
    if (expense.category === 'Meals' && expense.amount > rules.mealLimitPerDay) {
      violations.push({
        rule: 'Meal Limit Exceeded',
        message: `Meal expense exceeds daily limit of $${rules.mealLimitPerDay}`,
        severity: 'medium',
      });
    }

    // Check hotel limits
    if (expense.category === 'Accommodation' && expense.amount > rules.hotelLimitPerNight) {
      violations.push({
        rule: 'Hotel Limit Exceeded',
        message: `Hotel expense exceeds nightly limit of $${rules.hotelLimitPerNight}`,
        severity: 'medium',
      });
    }

    // Check blacklisted vendors
    if (rules.blacklistedVendors && rules.blacklistedVendors.includes(expense.vendor)) {
      violations.push({
        rule: 'Blacklisted Vendor',
        message: `${expense.vendor} is not an approved vendor`,
        severity: 'high',
      });
    }

    // Auto-approve logic
    const autoApprove = violations.length === 0 && expense.amount < rules.autoApproveLimit;

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