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

    // Only finance and executives can view vendor analytics
    if (!['finance', 'executive', 'admin'].includes(user.role)) {
      return NextResponse.json(
        { success: false, message: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Get top vendors by spending
    const topVendors = await Expense.aggregate([
      {
        $match: {
          status: 'approved',
        },
      },
      {
        $group: {
          _id: '$vendor',
          totalSpent: { $sum: '$amount' },
          transactionCount: { $sum: 1 },
          avgAmount: { $avg: '$amount' },
        },
      },
      {
        $sort: { totalSpent: -1 },
      },
      {
        $limit: 20,
      },
    ]);

    // Get vendor concentration (top 5 vendors percentage)
    const totalSpending = await Expense.aggregate([
      {
        $match: { status: 'approved' },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
        },
      },
    ]);

    const total = totalSpending.length > 0 ? totalSpending[0].total : 0;
    const top5Total = topVendors.slice(0, 5).reduce((sum, v) => sum + v.totalSpent, 0);
    const concentration = total > 0 ? (top5Total / total) * 100 : 0;

    return NextResponse.json({
      success: true,
      analytics: {
        topVendors,
        totalSpending: total,
        top5Concentration: concentration.toFixed(2),
      },
    });
  } catch (error) {
    console.error('Vendor analytics error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
}