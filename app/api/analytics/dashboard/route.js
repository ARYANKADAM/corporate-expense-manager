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

    console.log('📊 Analytics request from user:', user.userId, 'role:', user.role);

    // Get full user details including company
    const User = (await import('@/models/User')).default;
    const fullUser = await User.findById(user.userId).populate('company');
    
    if (!fullUser || !fullUser.company) {
      return NextResponse.json(
        { success: false, message: 'User or company not found' },
        { status: 404 }
      );
    }

    console.log('🏢 Analytics for company:', fullUser.company.name);

    // Build query - ALWAYS filter by company first
    let query = { company: fullUser.company._id };
    
    if (user.role === 'employee') {
      query.employeeId = user.userId;
    }
    // Manager, finance, and executive see all company data

    // Get current month start and end
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Total expenses
    const totalExpenses = await Expense.countDocuments(query);

    // Total amount
    const amountAgg = await Expense.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
        },
      },
    ]);
    const totalAmount = amountAgg.length > 0 ? amountAgg[0].total : 0;

    // Status breakdown
    const statusBreakdown = await Expense.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          amount: { $sum: '$amount' },
        },
      },
    ]);

    // Category breakdown
    const categoryBreakdown = await Expense.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          amount: { $sum: '$amount' },
        },
      },
      { $sort: { amount: -1 } },
    ]);

    // Monthly trend (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyTrend = await Expense.aggregate([
      {
        $match: {
          ...query,
          date: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
          },
          count: { $sum: 1 },
          amount: { $sum: '$amount' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Current month stats
    const monthQuery = { ...query, date: { $gte: startOfMonth, $lte: endOfMonth } };
    const currentMonthExpenses = await Expense.countDocuments(monthQuery);
    const currentMonthAgg = await Expense.aggregate([
      { $match: monthQuery },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
        },
      },
    ]);
    const currentMonthAmount = currentMonthAgg.length > 0 ? currentMonthAgg[0].total : 0;

    // Policy violations
    const violationsCount = await Expense.countDocuments({
      ...query,
      isCompliant: false,
    });

    // Recent expenses
    const recentExpenses = await Expense.find(query)
      .populate('employeeId', 'name email department')
      .sort({ createdAt: -1 })
      .limit(5);

    return NextResponse.json({
      success: true,
      analytics: {
        total: {
          expenses: totalExpenses,
          amount: totalAmount,
        },
        currentMonth: {
          expenses: currentMonthExpenses,
          amount: currentMonthAmount,
        },
        statusBreakdown,
        categoryBreakdown,
        monthlyTrend,
        violations: violationsCount,
        recentExpenses,
      },
    });
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
}