import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Budget from '@/models/Budget';
import Expense from '@/models/Expense';
import { getUserFromToken } from '@/lib/auth';

// GET - Fetch budgets
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
    const department = searchParams.get('department');

    let query = { isActive: true };
    
    if (user.role === 'employee' || user.role === 'manager') {
      query.department = user.department || department;
    } else if (department) {
      query.department = department;
    }

    const budgets = await Budget.find(query).sort({ createdAt: -1 });

    // Calculate spent amount for each budget
    const budgetsWithSpent = await Promise.all(
      budgets.map(async (budget) => {
        const query = {
          status: 'approved',
          date: {
            $gte: budget.startDate,
            $lte: budget.endDate,
          },
        };

        if (budget.department !== 'All') {
          // Need to join with User to filter by department
          const expenses = await Expense.aggregate([
            {
              $match: {
                status: 'approved',
                date: {
                  $gte: budget.startDate,
                  $lte: budget.endDate,
                },
              },
            },
            {
              $lookup: {
                from: 'users',
                localField: 'employeeId',
                foreignField: '_id',
                as: 'employee',
              },
            },
            {
              $match: {
                'employee.department': budget.department,
              },
            },
            {
              $group: {
                _id: null,
                total: { $sum: '$amount' },
              },
            },
          ]);

          const spent = expenses.length > 0 ? expenses[0].total : 0;
          budget.spent = spent;
          await budget.save();
        }

        return budget;
      })
    );

    return NextResponse.json({
      success: true,
      budgets: budgetsWithSpent,
    });
  } catch (error) {
    console.error('Get budgets error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
}

// POST - Create budget
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

    // Only finance and admin can create budgets
    if (!['finance', 'admin'].includes(user.role)) {
      return NextResponse.json(
        { success: false, message: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { department, category, amount, period, startDate, endDate } = body;

    if (!department || !amount || !startDate || !endDate) {
      return NextResponse.json(
        { success: false, message: 'Please provide all required fields' },
        { status: 400 }
      );
    }

    const budget = await Budget.create({
      department,
      category,
      amount: parseFloat(amount),
      period: period || 'monthly',
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      spent: 0,
      isActive: true,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Budget created successfully',
        budget,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create budget error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
}