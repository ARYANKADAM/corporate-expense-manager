'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import Card from '@/components/ui/Card';
import { formatCurrency } from '@/lib/utils';
import { 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Users,
  Building,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon,
  Calendar
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
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';

export default function FinanceAnalyticsPage() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('6months'); // 1month, 3months, 6months, 1year

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/analytics/dashboard');
      
      if (response.data.success) {
        setAnalytics(response.data.analytics);
      }
    } catch (error) {
      console.error('Analytics error:', error);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4'];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const categoryData = analytics?.categoryBreakdown?.map(cat => ({
    name: cat._id,
    value: cat.amount,
    count: cat.count
  })) || [];

  const monthlyData = analytics?.monthlyTrend?.map(trend => ({
    month: `${trend._id.month}/${String(trend._id.year).slice(-2)}`,
    amount: trend.amount,
    count: trend.count
  })) || [];

  const statusData = analytics?.statusBreakdown?.map(status => ({
    name: status._id.charAt(0).toUpperCase() + status._id.slice(1),
    value: status.amount,
    count: status.count
  })) || [];

  // Calculate insights
  const totalSpending = analytics?.total?.amount || 0;
  const avgExpenseAmount = analytics?.total?.expenses > 0 
    ? totalSpending / analytics.total.expenses 
    : 0;
  const violationRate = analytics?.total?.expenses > 0
    ? (analytics.violations / analytics.total.expenses) * 100
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Comprehensive insights into company expenses
          </p>
        </div>
        
        {/* Time Range Selector */}
        <div className="flex gap-2">
          {['1month', '3months', '6months', '1year'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                timeRange === range
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {range === '1month' ? '1M' : range === '3months' ? '3M' : range === '6months' ? '6M' : '1Y'}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Spending</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {formatCurrency(totalSpending)}
              </p>
              <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                +12.5% from last period
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Expense</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {formatCurrency(avgExpenseAmount)}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Per transaction
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <BarChartIcon className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Expenses</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {analytics?.total?.expenses || 0}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Transactions
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <PieChartIcon className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Violation Rate</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {violationRate.toFixed(1)}%
              </p>
              <p className="text-sm text-orange-600 mt-1 flex items-center gap-1">
                <TrendingDown className="w-4 h-4" />
                {analytics?.violations || 0} flagged
              </p>
            </div>
            <div className="bg-orange-100 p-3 rounded-lg">
              <Building className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spending Trend */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Spending Trend Over Time
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={monthlyData}>
              <defs>
                <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Area 
                type="monotone" 
                dataKey="amount" 
                stroke="#3B82F6" 
                fillOpacity={1} 
                fill="url(#colorAmount)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Category Breakdown */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Spending by Category
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
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
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Expense Status Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={statusData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Legend />
              <Bar dataKey="value" fill="#3B82F6" name="Amount" />
              <Bar dataKey="count" fill="#10B981" name="Count" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Top Categories Table */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Top Spending Categories
          </h3>
          <div className="space-y-3">
            {categoryData.slice(0, 5).map((cat, index) => {
              const percentage = (cat.value / totalSpending) * 100;
              return (
                <div key={cat.name}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      ></div>
                      <span className="text-sm font-medium text-gray-900">{cat.name}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">
                        {formatCurrency(cat.value)}
                      </p>
                      <p className="text-xs text-gray-500">{percentage.toFixed(1)}%</p>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all"
                      style={{ 
                        width: `${percentage}%`,
                        backgroundColor: COLORS[index % COLORS.length]
                      }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Summary Statistics */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Quick Statistics
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <p className="text-3xl font-bold text-blue-600">
              {analytics?.currentMonth?.expenses || 0}
            </p>
            <p className="text-sm text-gray-600 mt-1">This Month</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-green-600">
              {statusData.find(s => s.name === 'Approved')?.count || 0}
            </p>
            <p className="text-sm text-gray-600 mt-1">Approved</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-yellow-600">
              {statusData.find(s => s.name === 'Pending')?.count || 0}
            </p>
            <p className="text-sm text-gray-600 mt-1">Pending</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-orange-600">
              {analytics?.violations || 0}
            </p>
            <p className="text-sm text-gray-600 mt-1">Violations</p>
          </div>
        </div>
      </Card>
    </div>
  );
}