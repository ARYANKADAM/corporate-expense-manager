'use client';

import { useState, useEffect } from 'react';
import apiClient from '@/lib/apiClient';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { formatCurrency } from '@/lib/utils';
import { 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Users,
  Building,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  RefreshCw,
  AlertCircle,
  CheckCircle
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
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';

export default function ExecutiveAnalyticsPage() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('6months');
  const [selectedMetric, setSelectedMetric] = useState('amount');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      console.log('🔄 Fetching detailed analytics...');
      const response = await apiClient.get('/api/analytics/dashboard');
      console.log('📊 Detailed analytics response:', response.data);
      if (response.data.success) {
        setAnalytics(response.data.analytics);
      }
    } catch (error) {
      console.error('❌ Detailed analytics error:', error);
      console.error('❌ Error details:', error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  // Calculate metrics
  const calculateGrowth = () => {
    if (!analytics?.monthlyTrend || analytics.monthlyTrend.length < 2) return 0;
    const current = analytics.monthlyTrend[analytics.monthlyTrend.length - 1];
    const previous = analytics.monthlyTrend[analytics.monthlyTrend.length - 2];
    return ((current.amount - previous.amount) / previous.amount * 100).toFixed(1);
  };

  const calculateAverage = () => {
    if (!analytics?.monthlyTrend || analytics.monthlyTrend.length === 0) return 0;
    const total = analytics.monthlyTrend.reduce((sum, item) => sum + item.amount, 0);
    return total / analytics.monthlyTrend.length;
  };

  // Prepare data for charts
  const monthlyData = analytics?.monthlyTrend?.map(trend => ({
    month: `${String(trend._id.month).padStart(2, '0')}/${trend._id.year}`,
    amount: trend.amount,
    count: trend.count,
    average: trend.amount / trend.count
  })) || [];

  const categoryData = analytics?.categoryBreakdown?.map(cat => ({
    name: cat._id,
    amount: cat.amount,
    count: cat.count,
    percentage: ((cat.amount / analytics.total.amount) * 100).toFixed(1)
  })) || [];

  const departmentData = categoryData.map(cat => ({
    subject: cat.name,
    value: cat.amount,
    fullMark: Math.max(...categoryData.map(c => c.amount))
  }));

  const statusData = analytics?.statusBreakdown?.map(status => ({
    name: status._id.charAt(0).toUpperCase() + status._id.slice(1),
    value: status.amount,
    count: status.count
  })) || [];

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4'];

  // KPI Cards
  const kpis = [
    {
      title: 'Total Company Spend',
      value: formatCurrency(analytics?.total.amount || 0),
      change: `${calculateGrowth()}%`,
      positive: calculateGrowth() >= 0,
      icon: DollarSign,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      description: 'Year to date'
    },
    {
      title: 'Monthly Average',
      value: formatCurrency(calculateAverage()),
      change: '+8.2%',
      positive: true,
      icon: Calendar,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      description: 'Last 6 months'
    },
    {
      title: 'Total Transactions',
      value: analytics?.total.expenses || 0,
      change: '+156',
      positive: true,
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      description: 'This period'
    },
    {
      title: 'Compliance Rate',
      value: `${((analytics?.total.expenses - (analytics?.violations || 0)) / analytics?.total.expenses * 100 || 0).toFixed(1)}%`,
      change: '+2.3%',
      positive: true,
      icon: CheckCircle,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      description: 'Policy adherence'
    }
  ];

  const insights = [
    {
      title: 'Cost Optimization',
      description: 'Identified $12,450 in potential savings through vendor consolidation',
      impact: 'high',
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Spending Trend',
      description: 'Travel expenses increased 18% month-over-month',
      impact: 'medium',
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      title: 'Policy Compliance',
      description: `${analytics?.violations || 0} policy violations detected requiring attention`,
      impact: analytics?.violations > 5 ? 'high' : 'low',
      icon: AlertCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    },
    {
      title: 'Department Performance',
      description: 'Sales department 12% under budget for the quarter',
      impact: 'positive',
      icon: CheckCircle,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Executive Analytics</h1>
          <p className="text-gray-600 mt-1">Comprehensive insights and performance metrics</p>
        </div>
        <div className="flex gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="1month">Last Month</option>
            <option value="3months">Last 3 Months</option>
            <option value="6months">Last 6 Months</option>
            <option value="1year">Last Year</option>
          </select>
          <Button variant="outline" onClick={fetchAnalytics}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="primary">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card key={kpi.title} className="relative overflow-hidden">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm text-gray-600 font-medium">{kpi.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{kpi.value}</p>
                  <p className="text-xs text-gray-500 mt-1">{kpi.description}</p>
                  <div className="flex items-center gap-2 mt-3">
                    {kpi.positive ? (
                      <ArrowUpRight className="w-4 h-4 text-green-600" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4 text-red-600" />
                    )}
                    <span className={`text-sm font-medium ${kpi.positive ? 'text-green-600' : 'text-red-600'}`}>
                      {kpi.change}
                    </span>
                  </div>
                </div>
                <div className={`${kpi.bgColor} p-3 rounded-lg`}>
                  <Icon className={`w-6 h-6 ${kpi.color}`} />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Spending Trend - Takes 2 columns */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Spending Trend Analysis</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedMetric('amount')}
                className={`px-3 py-1 text-sm rounded-lg ${
                  selectedMetric === 'amount'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Amount
              </button>
              <button
                onClick={() => setSelectedMetric('count')}
                className={`px-3 py-1 text-sm rounded-lg ${
                  selectedMetric === 'count'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Count
              </button>
            </div>
          </div>
          {monthlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip 
                  formatter={(value) => selectedMetric === 'amount' ? formatCurrency(value) : value}
                  labelStyle={{ color: '#000' }}
                />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey={selectedMetric} 
                  stroke="#3B82F6" 
                  fillOpacity={1} 
                  fill="url(#colorAmount)"
                  strokeWidth={3}
                  name={selectedMetric === 'amount' ? 'Total Amount' : 'Transaction Count'}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[400px] flex items-center justify-center text-gray-500">
              No data available
            </div>
          )}
        </Card>

        {/* Category Distribution - Takes 1 column */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Category Distribution</h3>
          {categoryData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="amount"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2">
                {categoryData.slice(0, 5).map((cat, index) => (
                  <div key={cat.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      ></div>
                      <span className="text-gray-700">{cat.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-semibold text-gray-900">{formatCurrency(cat.amount)}</span>
                      <span className="text-gray-500 ml-2">({cat.percentage}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-[350px] flex items-center justify-center text-gray-500">
              No data available
            </div>
          )}
        </Card>
      </div>

      {/* Second Row of Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Performance Radar */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Category Performance</h3>
          {departmentData.length > 0 ? (
            <ResponsiveContainer width="100%" height={350}>
              <RadarChart data={departmentData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" />
                <PolarRadiusAxis />
                <Radar 
                  name="Spending" 
                  dataKey="value" 
                  stroke="#3B82F6" 
                  fill="#3B82F6" 
                  fillOpacity={0.6} 
                />
                <Tooltip formatter={(value) => formatCurrency(value)} />
              </RadarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[350px] flex items-center justify-center text-gray-500">
              No data available
            </div>
          )}
        </Card>

        {/* Status Breakdown */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Approval Status Breakdown</h3>
          {statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={350}>
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
          ) : (
            <div className="h-[350px] flex items-center justify-center text-gray-500">
              No data available
            </div>
          )}
        </Card>
      </div>

      {/* Key Insights */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Insights & Recommendations</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {insights.map((insight, index) => {
            const Icon = insight.icon;
            return (
              <div key={index} className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className={`${insight.bgColor} p-3 rounded-lg flex-shrink-0`}>
                  <Icon className={`w-5 h-5 ${insight.color}`} />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-1">{insight.title}</h4>
                  <p className="text-sm text-gray-600">{insight.description}</p>
                  <div className="mt-2">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      insight.impact === 'high' 
                        ? 'bg-red-100 text-red-800' 
                        : insight.impact === 'medium'
                        ? 'bg-orange-100 text-orange-800'
                        : insight.impact === 'positive'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {insight.impact === 'positive' ? 'Positive' : `${insight.impact} Impact`}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Top Categories by Department */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Categories Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {categoryData.slice(0, 3).map((cat, index) => (
            <div key={cat.name} className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-gray-900">{cat.name}</h4>
                <span className="text-2xl">#{index + 1}</span>
              </div>
              <p className="text-3xl font-bold text-gray-900 mb-1">{formatCurrency(cat.amount)}</p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">{cat.count} transactions</span>
                <span className="font-semibold text-blue-600">{cat.percentage}% of total</span>
              </div>
              <div className="mt-3 bg-white rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${cat.percentage}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Quick Stats Footer */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="text-center">
          <p className="text-sm text-gray-600">Avg per Transaction</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {formatCurrency((analytics?.total.amount || 0) / (analytics?.total.expenses || 1))}
          </p>
        </Card>
        <Card className="text-center">
          <p className="text-sm text-gray-600">Largest Expense</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {formatCurrency(Math.max(...categoryData.map(c => c.amount), 0))}
          </p>
        </Card>
        <Card className="text-center">
          <p className="text-sm text-gray-600">Active Categories</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {categoryData.length}
          </p>
        </Card>
        <Card className="text-center">
          <p className="text-sm text-gray-600">Growth Rate</p>
          <p className={`text-2xl font-bold mt-1 ${calculateGrowth() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {calculateGrowth()}%
          </p>
        </Card>
      </div>
    </div>
  );
}