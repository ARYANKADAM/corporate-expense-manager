'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { formatCurrency } from '@/lib/utils';
import { 
  Plus, 
  Receipt, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  DollarSign,
  Calendar,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [analytics, setAnalytics] = useState(null);
  const [recentExpenses, setRecentExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [analyticsRes, expensesRes] = await Promise.all([
        axios.get('/api/analytics/dashboard'),
        axios.get('/api/expenses?limit=5')
      ]);

      if (analyticsRes.data.success) {
        setAnalytics(analyticsRes.data.analytics);
      }

      if (expensesRes.data.success) {
        setRecentExpenses(expensesRes.data.expenses);
      }
    } catch (error) {
      console.error('Dashboard data error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusCount = (status) => {
    if (!analytics) return 0;
    const item = analytics.statusBreakdown.find(s => s._id === status);
    return item ? item.count : 0;
  };

  const getStatusAmount = (status) => {
    if (!analytics) return 0;
    const item = analytics.statusBreakdown.find(s => s._id === status);
    return item ? item.amount : 0;
  };

  // Prepare chart data
  const categoryData = analytics?.categoryBreakdown?.map(cat => ({
    name: cat._id,
    value: cat.amount,
    count: cat.count
  })) || [];

  const monthlyData = analytics?.monthlyTrend?.map(trend => ({
    month: `${trend._id.month}/${trend._id.year}`,
    amount: trend.amount,
    count: trend.count
  })) || [];

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Loading Skeleton */}
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <div className="h-96 bg-gray-200 rounded-lg"></div>
            <div className="h-96 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  const stats = [
    {
      title: 'Total Expenses',
      value: analytics?.total.expenses || 0,
      amount: formatCurrency(analytics?.total.amount || 0),
      icon: Receipt,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      trend: '+12%',
      trendUp: true
    },
    {
      title: 'This Month',
      value: analytics?.currentMonth.expenses || 0,
      amount: formatCurrency(analytics?.currentMonth.amount || 0),
      icon: Calendar,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
      trend: '+8%',
      trendUp: true
    },
    {
      title: 'Pending Approval',
      value: getStatusCount('pending'),
      amount: formatCurrency(getStatusAmount('pending')),
      icon: Clock,
      color: 'bg-yellow-500',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-600',
      trend: '3 items',
      trendUp: false
    },
    {
      title: 'Approved',
      value: getStatusCount('approved'),
      amount: formatCurrency(getStatusAmount('approved')),
      icon: CheckCircle,
      color: 'bg-emerald-500',
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-600',
      trend: '+5',
      trendUp: true
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.name}! 👋
          </h1>
          <p className="text-gray-600 mt-1">
            Here's an overview of your expenses
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => router.push('/employee/submit')}
          className="flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Submit Expense
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="relative overflow-hidden">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm text-gray-600 font-medium">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {stat.value}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">{stat.amount}</p>
                  
                  <div className="flex items-center gap-1 mt-2">
                    {stat.trendUp ? (
                      <ArrowUpRight className="w-4 h-4 text-green-600" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4 text-gray-600" />
                    )}
                    <span className={`text-xs font-medium ${stat.trendUp ? 'text-green-600' : 'text-gray-600'}`}>
                      {stat.trend}
                    </span>
                  </div>
                </div>
                <div className={`${stat.bgColor} p-3 rounded-lg`}>
                  <Icon className={`w-6 h-6 ${stat.textColor}`} />
                </div>
              </div>
              <div className={`absolute bottom-0 left-0 right-0 h-1 ${stat.color}`}></div>
            </Card>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spending by Category */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Spending by Category
          </h3>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500">
              No category data available
            </div>
          )}
          
          {/* Category Legend */}
          <div className="mt-4 grid grid-cols-2 gap-2">
            {categoryData.slice(0, 6).map((cat, index) => (
              <div key={cat.name} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                ></div>
                <span className="text-sm text-gray-600">
                  {cat.name}: {formatCurrency(cat.value)}
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Monthly Trend */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Spending Trend (Last 6 Months)
          </h3>
          {monthlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
                <Bar dataKey="amount" fill="#3B82F6" name="Amount" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500">
              No monthly data available
            </div>
          )}
        </Card>
      </div>

      {/* Recent Expenses & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Expenses */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Recent Expenses
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/employee/expenses')}
            >
              View All
            </Button>
          </div>

          {recentExpenses.length > 0 ? (
            <div className="space-y-3">
              {recentExpenses.map((expense) => (
                <div
                  key={expense._id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      expense.status === 'approved' ? 'bg-green-100' :
                      expense.status === 'pending' ? 'bg-yellow-100' :
                      expense.status === 'flagged' ? 'bg-orange-100' :
                      'bg-red-100'
                    }`}>
                      {expense.status === 'approved' ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : expense.status === 'pending' ? (
                        <Clock className="w-5 h-5 text-yellow-600" />
                      ) : expense.status === 'flagged' ? (
                        <AlertCircle className="w-5 h-5 text-orange-600" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{expense.vendor}</p>
                      <p className="text-sm text-gray-500">{expense.category}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      {formatCurrency(expense.amount)}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">
                      {expense.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Receipt className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No expenses yet</p>
              <Button
                variant="primary"
                size="sm"
                onClick={() => router.push('/employee/submit')}
                className="mt-4"
              >
                Submit Your First Expense
              </Button>
            </div>
          )}
        </Card>

        {/* Quick Actions */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Quick Actions
          </h3>
          <div className="space-y-3">
            <Button
              variant="primary"
              className="w-full justify-start"
              onClick={() => router.push('/employee/submit')}
            >
              <Plus className="w-5 h-5 mr-3" />
              Submit New Expense
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => router.push('/employee/expenses')}
            >
              <Receipt className="w-5 h-5 mr-3" />
              View All Expenses
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => router.push('/employee/expenses?status=pending')}
            >
              <Clock className="w-5 h-5 mr-3" />
              Pending Approvals ({getStatusCount('pending')})
            </Button>
          </div>

          {/* Policy Violations Alert */}
          {analytics?.violations > 0 && (
            <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-center gap-2 text-orange-800">
                <AlertCircle className="w-5 h-5" />
                <div>
                  <p className="font-medium text-sm">Policy Violations</p>
                  <p className="text-xs mt-1">
                    {analytics.violations} expense{analytics.violations > 1 ? 's' : ''} flagged for review
                  </p>
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}