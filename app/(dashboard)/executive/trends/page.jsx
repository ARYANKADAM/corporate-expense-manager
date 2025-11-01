'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import Card from '@/components/ui/Card';
import { formatCurrency } from '@/lib/utils';
import { 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Calendar,
  BarChart3,
  PieChart as PieChartIcon,
  ArrowUpRight,
  ArrowDownRight,
  Minus
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart
} from 'recharts';

export default function ExecutiveTrendsPage() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('6months'); // 3months, 6months, 1year

  useEffect(() => {
    fetchTrends();
  }, [timeRange]);

  const fetchTrends = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/analytics/dashboard');
      if (response.data.success) {
        setAnalytics(response.data.analytics);
      }
    } catch (error) {
      console.error('Trends error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Prepare data
  const monthlyData = analytics?.monthlyTrend?.map(trend => ({
    month: `${trend._id.month}/${trend._id.year}`,
    amount: trend.amount,
    count: trend.count,
    average: trend.count > 0 ? trend.amount / trend.count : 0
  })) || [];

  const categoryData = analytics?.categoryBreakdown?.map(cat => ({
    name: cat._id,
    value: cat.amount,
    count: cat.count,
    percentage: 0 // Will calculate below
  })) || [];

  // Calculate percentages
  const totalAmount = categoryData.reduce((sum, cat) => sum + cat.value, 0);
  categoryData.forEach(cat => {
    cat.percentage = totalAmount > 0 ? (cat.value / totalAmount) * 100 : 0;
  });

  // Calculate trends
  const calculateTrend = (data) => {
    if (data.length < 2) return { value: 0, direction: 'stable' };
    const recent = data[data.length - 1]?.amount || 0;
    const previous = data[data.length - 2]?.amount || 0;
    if (previous === 0) return { value: 0, direction: 'stable' };
    const change = ((recent - previous) / previous) * 100;
    return {
      value: Math.abs(change).toFixed(1),
      direction: change > 0 ? 'up' : change < 0 ? 'down' : 'stable'
    };
  };

  const spendingTrend = calculateTrend(monthlyData);
  const avgExpenseTrend = monthlyData.length >= 2 ? {
    value: (((monthlyData[monthlyData.length - 1]?.average || 0) - 
             (monthlyData[monthlyData.length - 2]?.average || 0)) / 
             (monthlyData[monthlyData.length - 2]?.average || 1) * 100).toFixed(1),
    direction: monthlyData[monthlyData.length - 1]?.average > monthlyData[monthlyData.length - 2]?.average ? 'up' : 'down'
  } : { value: 0, direction: 'stable' };

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#6366F1'];

  const getTrendIcon = (direction) => {
    switch (direction) {
      case 'up':
        return <TrendingUp className="w-5 h-5 text-red-600" />;
      case 'down':
        return <TrendingDown className="w-5 h-5 text-green-600" />;
      default:
        return <Minus className="w-5 h-5 text-gray-600" />;
    }
  };

  const getTrendColor = (direction) => {
    switch (direction) {
      case 'up':
        return 'text-red-600';
      case 'down':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const trendCards = [
    {
      title: 'Total Spending Trend',
      value: formatCurrency(monthlyData[monthlyData.length - 1]?.amount || 0),
      change: spendingTrend.value,
      direction: spendingTrend.direction,
      subtitle: 'Last month',
      icon: DollarSign,
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600'
    },
    {
      title: 'Average Expense',
      value: formatCurrency(monthlyData[monthlyData.length - 1]?.average || 0),
      change: avgExpenseTrend.value,
      direction: avgExpenseTrend.direction,
      subtitle: 'Per transaction',
      icon: BarChart3,
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600'
    },
    {
      title: 'Monthly Expenses',
      value: monthlyData[monthlyData.length - 1]?.count || 0,
      change: monthlyData.length >= 2 ? 
        (((monthlyData[monthlyData.length - 1]?.count - monthlyData[monthlyData.length - 2]?.count) / 
        monthlyData[monthlyData.length - 2]?.count * 100) || 0).toFixed(1) : 0,
      direction: monthlyData.length >= 2 && monthlyData[monthlyData.length - 1]?.count > monthlyData[monthlyData.length - 2]?.count ? 'up' : 'down',
      subtitle: 'Transaction count',
      icon: Calendar,
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600'
    },
    {
      title: 'Top Category',
      value: categoryData[0]?.name || 'N/A',
      change: categoryData[0]?.percentage.toFixed(1) || 0,
      direction: 'stable',
      subtitle: `${categoryData[0]?.percentage.toFixed(0) || 0}% of total`,
      icon: PieChartIcon,
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Expense Trends Analysis</h1>
          <p className="text-gray-600 mt-1">Track spending patterns and identify opportunities</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setTimeRange('3months')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              timeRange === '3months' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            3 Months
          </button>
          <button
            onClick={() => setTimeRange('6months')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              timeRange === '6months' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            6 Months
          </button>
          <button
            onClick={() => setTimeRange('1year')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              timeRange === '1year' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            1 Year
          </button>
        </div>
      </div>

      {/* Trend Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {trendCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm text-gray-600 mb-2">{card.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mb-1">
                    {card.value}
                  </p>
                  <p className="text-xs text-gray-500 mb-3">{card.subtitle}</p>
                  {card.direction !== 'stable' && (
                    <div className="flex items-center gap-2">
                      {getTrendIcon(card.direction)}
                      <span className={`text-sm font-medium ${getTrendColor(card.direction)}`}>
                        {card.change}%
                      </span>
                      <span className="text-xs text-gray-500">vs last month</span>
                    </div>
                  )}
                </div>
                <div className={`${card.bgColor} p-3 rounded-lg`}>
                  <Icon className={`w-6 h-6 ${card.iconColor}`} />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Main Chart - Spending Trend */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Spending Trend Over Time</h3>
            <p className="text-sm text-gray-500 mt-1">Monthly expense amounts and transaction counts</p>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-600 rounded"></div>
              <span className="text-gray-600">Amount</span>
            </div>
            <div className="flex items-center gap-2 ml-4">
              <div className="w-3 h-3 bg-green-600 rounded"></div>
              <span className="text-gray-600">Count</span>
            </div>
          </div>
        </div>
        {monthlyData.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip 
                formatter={(value, name) => [
                  name === 'amount' ? formatCurrency(value) : value,
                  name === 'amount' ? 'Amount' : 'Count'
                ]}
              />
              <Legend />
              <Area 
                yAxisId="left"
                type="monotone" 
                dataKey="amount" 
                fill="#3B82F6" 
                stroke="#3B82F6" 
                fillOpacity={0.2}
                name="Amount"
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="count" 
                stroke="#10B981" 
                strokeWidth={2}
                name="Count"
                dot={{ fill: '#10B981', r: 4 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[400px] flex items-center justify-center text-gray-500">
            No data available
          </div>
        )}
      </Card>

      {/* Category Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Spending by Category</h3>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name} ${percentage.toFixed(0)}%`}
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
          ) : (
            <div className="h-[350px] flex items-center justify-center text-gray-500">
              No data available
            </div>
          )}
        </Card>

        {/* Category Breakdown Table */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Category Breakdown</h3>
          <div className="space-y-3">
            {categoryData.slice(0, 7).map((cat, index) => (
              <div key={cat.name} className="flex items-center gap-4">
                <div 
                  className="w-4 h-4 rounded-full flex-shrink-0" 
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                ></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-gray-900 truncate">{cat.name}</span>
                    <span className="text-sm text-gray-600 ml-2">{cat.percentage.toFixed(1)}%</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{formatCurrency(cat.value)}</span>
                    <span className="text-gray-500">{cat.count} transactions</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                    <div 
                      className="h-1.5 rounded-full transition-all"
                      style={{ 
                        width: `${cat.percentage}%`,
                        backgroundColor: COLORS[index % COLORS.length]
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Average Expense Trend */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Average Expense per Transaction</h3>
        {monthlyData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="average" 
                stroke="#8B5CF6" 
                fill="#8B5CF6" 
                fillOpacity={0.3}
                name="Average Amount"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[300px] flex items-center justify-center text-gray-500">
            No data available
          </div>
        )}
      </Card>

      {/* Key Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="flex items-start gap-3">
            <div className="bg-blue-100 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 mb-1">Highest Spending Month</h4>
              <p className="text-2xl font-bold text-blue-600 mb-1">
                {monthlyData.reduce((max, month) => 
                  month.amount > max.amount ? month : max, 
                  { amount: 0, month: 'N/A' }
                ).month}
              </p>
              <p className="text-sm text-gray-600">
                {formatCurrency(Math.max(...monthlyData.map(m => m.amount), 0))}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-start gap-3">
            <div className="bg-green-100 p-3 rounded-lg">
              <TrendingDown className="w-6 h-6 text-green-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 mb-1">Lowest Spending Month</h4>
              <p className="text-2xl font-bold text-green-600 mb-1">
                {monthlyData.reduce((min, month) => 
                  month.amount < min.amount ? month : min, 
                  { amount: Infinity, month: 'N/A' }
                ).month}
              </p>
              <p className="text-sm text-gray-600">
                {formatCurrency(Math.min(...monthlyData.map(m => m.amount), 0))}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-start gap-3">
            <div className="bg-purple-100 p-3 rounded-lg">
              <BarChart3 className="w-6 h-6 text-purple-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 mb-1">Most Active Category</h4>
              <p className="text-2xl font-bold text-purple-600 mb-1">
                {categoryData[0]?.name || 'N/A'}
              </p>
              <p className="text-sm text-gray-600">
                {categoryData[0]?.count || 0} transactions
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Recommendations */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">💡 Insights & Recommendations</h3>
        <div className="space-y-4">
          {spendingTrend.direction === 'up' && (
            <div className="flex items-start gap-3 p-4 bg-orange-50 rounded-lg">
              <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">Increasing Spending Trend</p>
                <p className="text-sm text-gray-600 mt-1">
                  Overall spending has increased by {spendingTrend.value}% compared to the previous month. 
                  Consider reviewing expense policies and budget allocations.
                </p>
              </div>
            </div>
          )}
          
          {categoryData[0] && categoryData[0].percentage > 40 && (
            <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
              <PieChartIcon className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">Category Concentration</p>
                <p className="text-sm text-gray-600 mt-1">
                  {categoryData[0].name} accounts for {categoryData[0].percentage.toFixed(0)}% of total spending. 
                  Consider diversifying expense categories or reviewing {categoryData[0].name} policies.
                </p>
              </div>
            </div>
          )}

          {monthlyData.length >= 3 && (
            <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">Historical Analysis Available</p>
                <p className="text-sm text-gray-600 mt-1">
                  {monthlyData.length} months of data available for trend analysis. 
                  This provides good visibility into spending patterns and seasonal variations.
                </p>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}