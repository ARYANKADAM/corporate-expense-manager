import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Expense from '@/models/Expense';
import { getUserFromToken } from '@/lib/auth';

// GET - Single expense
export async function GET(request, { params }) {
  try {
    await connectDB();

    const user = getUserFromToken(request);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params; // ✅ Fix: Await params

    const expense = await Expense.findById(id)
      .populate('employeeId', 'name email department employeeId')
      .populate('approvedBy', 'name email');

    if (!expense) {
      return NextResponse.json(
        { success: false, message: 'Expense not found' },
        { status: 404 }
      );
    }

    // Check access rights
    if (
      user.role === 'employee' &&
      expense.employeeId._id.toString() !== user.userId
    ) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized access' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      expense,
    });
  } catch (error) {
    console.error('Get expense error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
}

// PUT - Update expense
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

    const { id } = await params; // ✅ Fix: Await params

    const expense = await Expense.findById(id);

    if (!expense) {
      return NextResponse.json(
        { success: false, message: 'Expense not found' },
        { status: 404 }
      );
    }

    // Check access rights
    if (
      user.role === 'employee' &&
      expense.employeeId.toString() !== user.userId
    ) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized access' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { amount, category, subcategory, vendor, description, date, receiptUrl } = body;

    // Only allow updates if expense is pending or flagged
    if (expense.status !== 'pending' && expense.status !== 'flagged') {
      return NextResponse.json(
        { success: false, message: 'Cannot update approved/rejected expense' },
        { status: 400 }
      );
    }

    // Update fields
    if (amount !== undefined) expense.amount = parseFloat(amount);
    if (category) expense.category = category;
    if (subcategory !== undefined) expense.subcategory = subcategory;
    if (vendor) expense.vendor = vendor;
    if (description) expense.description = description;
    if (date) expense.date = new Date(date);
    if (receiptUrl !== undefined) expense.receiptUrl = receiptUrl;

    await expense.save();

    const updatedExpense = await Expense.findById(expense._id)
      .populate('employeeId', 'name email department');

    return NextResponse.json({
      success: true,
      message: 'Expense updated successfully',
      expense: updatedExpense,
    });
  } catch (error) {
    console.error('Update expense error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Delete expense
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

    const { id } = await params; // ✅ Fix: Await params

    console.log('Deleting expense ID:', id); // Debug log
    console.log('User:', user.userId, user.role); // Debug log

    const expense = await Expense.findById(id);

    if (!expense) {
      return NextResponse.json(
        { success: false, message: 'Expense not found' },
        { status: 404 }
      );
    }

    console.log('Found expense:', expense._id, 'Owner:', expense.employeeId); // Debug log

    // Check access rights
    if (
      user.role === 'employee' &&
      expense.employeeId.toString() !== user.userId
    ) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized access - Not your expense' },
        { status: 403 }
      );
    }

    // Only allow deletion if expense is pending or flagged
    if (expense.status !== 'pending' && expense.status !== 'flagged') {
      return NextResponse.json(
        { success: false, message: `Cannot delete ${expense.status} expense. Only pending or flagged expenses can be deleted.` },
        { status: 400 }
      );
    }

    await Expense.findByIdAndDelete(id);

    console.log('Expense deleted successfully:', id); // Debug log

    return NextResponse.json({
      success: true,
      message: 'Expense deleted successfully',
    });
  } catch (error) {
    console.error('Delete expense error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
}