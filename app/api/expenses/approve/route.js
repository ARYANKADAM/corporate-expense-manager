import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Expense from '@/models/Expense';
import Approval from '@/models/Approval';
import { getUserFromToken } from '@/lib/auth';

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

    // Only managers, finance, and executives can approve
    if (!['manager', 'finance', 'executive', 'admin'].includes(user.role)) {
      return NextResponse.json(
        { success: false, message: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { expenseId, action, comments } = body;

    if (!expenseId || !action) {
      return NextResponse.json(
        { success: false, message: 'Please provide expenseId and action' },
        { status: 400 }
      );
    }

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { success: false, message: 'Invalid action' },
        { status: 400 }
      );
    }

    const expense = await Expense.findById(expenseId)
      .populate('employeeId', 'name email department');

    if (!expense) {
      return NextResponse.json(
        { success: false, message: 'Expense not found' },
        { status: 404 }
      );
    }

    if (expense.status !== 'pending' && expense.status !== 'flagged') {
      return NextResponse.json(
        { success: false, message: 'Expense already processed' },
        { status: 400 }
      );
    }

    // Create approval record
    await Approval.create({
      expenseId,
      approverId: user.userId,
      status: action === 'approve' ? 'approved' : 'rejected',
      comments,
      level: user.role,
      processedAt: new Date(),
    });

    // Update expense
    expense.status = action === 'approve' ? 'approved' : 'rejected';
    expense.approvedBy = user.userId;
    expense.approvedAt = new Date();
    if (action === 'reject' && comments) {
      expense.rejectionReason = comments;
    }
    await expense.save();

    const updatedExpense = await Expense.findById(expenseId)
      .populate('employeeId', 'name email department')
      .populate('approvedBy', 'name email');

    return NextResponse.json({
      success: true,
      message: `Expense ${action}d successfully`,
      expense: updatedExpense,
    });
  } catch (error) {
    console.error('Approve expense error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
}