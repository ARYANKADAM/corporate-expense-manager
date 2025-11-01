import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Expense from '@/models/Expense';
import { getUserFromToken } from '@/lib/auth';

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
    const format = searchParams.get('format') || 'csv';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Build query
    let query = {};
    if (user.role === 'employee') {
      query.employeeId = user.userId;
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const expenses = await Expense.find(query)
      .populate('employeeId', 'name email department employeeId')
      .populate('approvedBy', 'name email')
      .sort({ date: -1 });

    if (format === 'csv') {
      // Generate CSV
      const headers = [
        'Date',
        'Employee',
        'Department',
        'Category',
        'Vendor',
        'Description',
        'Amount',
        'Status',
        'Approved By',
        'Approved Date',
      ];

      const rows = expenses.map((exp) => [
        new Date(exp.date).toLocaleDateString(),
        exp.employeeId?.name || '',
        exp.employeeId?.department || '',
        exp.category,
        exp.vendor,
        exp.description,
        exp.amount.toFixed(2),
        exp.status,
        exp.approvedBy?.name || '',
        exp.approvedAt ? new Date(exp.approvedAt).toLocaleDateString() : '',
      ]);

      const csv = [
        headers.join(','),
        ...rows.map((row) =>
          row.map((cell) => `"${cell}"`).join(',')
        ),
      ].join('\n');

      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="expenses-${Date.now()}.csv"`,
        },
      });
    }

    // Return JSON for PDF generation on client
    return NextResponse.json({
      success: true,
      expenses: expenses.map((exp) => ({
        date: new Date(exp.date).toLocaleDateString(),
        employee: exp.employeeId?.name || '',
        department: exp.employeeId?.department || '',
        category: exp.category,
        vendor: exp.vendor,
        description: exp.description,
        amount: exp.amount.toFixed(2),
        status: exp.status,
        approvedBy: exp.approvedBy?.name || '',
        approvedDate: exp.approvedAt ? new Date(exp.approvedAt).toLocaleDateString() : '',
      })),
    });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
}