import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Budget from '@/models/Budget';
import { getUserFromToken } from '@/lib/auth';

// PUT - Update budget
export async function PUT(request, { params }) {
  try {
    await connectDB();

    const user = getUserFromToken(request);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!['finance', 'admin'].includes(user.role)) {
      return NextResponse.json(
        { success: false, message: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const budget = await Budget.findById(params.id);

    if (!budget) {
      return NextResponse.json(
        { success: false, message: 'Budget not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { department, category, amount, period, startDate, endDate, isActive } = body;

    if (department) budget.department = department;
    if (category) budget.category = category;
    if (amount) budget.amount = parseFloat(amount);
    if (period) budget.period = period;
    if (startDate) budget.startDate = new Date(startDate);
    if (endDate) budget.endDate = new Date(endDate);
    if (typeof isActive !== 'undefined') budget.isActive = isActive;

    await budget.save();

    return NextResponse.json({
      success: true,
      message: 'Budget updated successfully',
      budget,
    });
  } catch (error) {
    console.error('Update budget error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Delete budget
export async function DELETE(request, { params }) {
  try {
    await connectDB();

    const user = getUserFromToken(request);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!['finance', 'admin'].includes(user.role)) {
      return NextResponse.json(
        { success: false, message: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    await Budget.findByIdAndDelete(params.id);

    return NextResponse.json({
      success: true,
      message: 'Budget deleted successfully',
    });
  } catch (error) {
    console.error('Delete budget error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
}