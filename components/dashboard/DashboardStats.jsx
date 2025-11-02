'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import Card from '@/components/ui/Card';
import Skeleton from '@/components/ui/Skeleton';
import { formatCurrency, cn } from '@/lib/utils';
import { 
  Receipt, 
  DollarSign, 
  TrendingUp, 
  AlertCircle,
  Clock,
  CheckCircle,
  ArrowUpRight,
  ArrowDownRight,
  Users,
  Calendar
} from 'lucide-react';

export default function DashboardStats({ userRole = 'employee', className }) {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setError(null);
      const response = await axios.get('/api/analytics/dashboard');
      
      if (response.data.success) {
        setAnalytics(response.data.analytics);
      }
    } catch (error) {
      console.error('Fetch analytics error:', error);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={cn('grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6', className)}>
        {[...Array(4)].map((_, i) => (
          <Card key={i} variant="elevated" className="animate-pulse">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <Skeleton width="60%" height="14px" />
                <Skeleton width="80%" height="28px" className="mt-3" />
                <Skeleton width="50%" height="12px" className="mt-2" />
                <div className="flex items-center gap-1 mt-3">
                  <Skeleton variant="circle" width="16px" height="16px" />
                  <Skeleton width="40px" height="12px" />
                </div>
              </div>
              <Skeleton variant="circle" width="48px" height="48px" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn('grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6', className)}>
        <Card variant="flat" className="col-span-full">
          <div className="flex items-center justify-center py-8 text-center">
            <div>
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 font-medium">Unable to load dashboard stats</p>
              <p className="text-sm text-gray-500 mt-1">{error}</p>
              <button
                onClick={fetchAnalytics}
                className="mt-3 text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Try again
              </button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (!analytics) {
    return null;
  }

  const getStatusCount = (status) => {
    const item = analytics.statusBreakdown?.find(s => s._id === status);
    return item ? item.count : 0;
  };

  const getStatusAmount = (status) => {
    const item = analytics.statusBreakdown?.find(s => s._id === status);
    return item ? item.amount : 0;
  };

  // Calculate trends (mock data for now - could be calculated from historical data)
  const calculateTrend = (current, previous) => {
    if (!previous) return { percent: 0, isUp: false };
    const change = ((current - previous) / previous) * 100;
    return { percent: Math.abs(change).toFixed(1), isUp: change > 0 };
  };

  const stats = [
    {
      title: 'Total Expenses',
      value: analytics.total?.expenses || 0,
      amount: analytics.total?.amount || 0,
      icon: Receipt,
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      borderColor: 'border-blue-200',
      trend: { percent: '12.5', isUp: true },
      description: 'All time submissions'
    },
    {
      title: 'This Month',
      value: analytics.currentMonth?.expenses || 0,
      amount: analytics.currentMonth?.amount || 0,
      icon: Calendar,
      bgColor: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
      borderColor: 'border-emerald-200',
      trend: { percent: '8.3', isUp: true },
      description: 'Current month total'
    },
    {
      title: 'Pending Approval',
      value: getStatusCount('pending'),
      amount: getStatusAmount('pending'),
      icon: Clock,
      bgColor: 'bg-amber-50',
      iconColor: 'text-amber-600',
      borderColor: 'border-amber-200',
      trend: { percent: '5.2', isUp: false },
      description: 'Awaiting review'
    },
    {
      title: 'Approved',
      value: getStatusCount('approved'),
      amount: getStatusAmount('approved'),
      icon: CheckCircle,
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
      borderColor: 'border-green-200',
      trend: { percent: '15.8', isUp: true },
      description: 'Successfully processed'
    },
  ];

  // Add role-specific stats
  if (userRole === 'manager' || userRole === 'finance' || userRole === 'executive') {
    stats.push({
      title: 'Policy Violations',
      value: analytics.violations || 0,
      amount: 0,
      icon: AlertCircle,
      bgColor: 'bg-red-50',
      iconColor: 'text-red-600',
      borderColor: 'border-red-200',
      trend: { percent: '2.1', isUp: false },
      description: 'Flagged for review'
    });
  }

  return (
    <div className={cn('grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6', className)}>
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card 
            key={stat.title} 
            variant="elevated"
            className={cn(
              'relative overflow-hidden border-l-4 hover:shadow-lg transition-all duration-200 group cursor-pointer',
              stat.borderColor
            )}
          >
            <div className="flex items-start justify-between p-1">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <p className="text-sm font-semibold text-gray-600 truncate">{stat.title}</p>
                </div>
                
                <div className="space-y-1">
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                    {stat.value.toLocaleString()}
                  </p>
                  {stat.amount > 0 && (
                    <p className="text-sm font-medium text-gray-700">
                      {formatCurrency(stat.amount)}
                    </p>
                  )}
                  <p className="text-xs text-gray-500">{stat.description}</p>
                </div>
                
                {/* Trend indicator */}
                <div className="flex items-center gap-1 mt-3">
                  {stat.trend.isUp ? (
                    <ArrowUpRight className="w-3 h-3 text-green-600" />
                  ) : (
                    <ArrowDownRight className="w-3 h-3 text-red-600" />
                  )}
                  <span className={cn(
                    'text-xs font-semibold',
                    stat.trend.isUp ? 'text-green-600' : 'text-red-600'
                  )}>
                    {stat.trend.percent}%
                  </span>
                  <span className="text-xs text-gray-500">vs last period</span>
                </div>
              </div>
              
              {/* Icon */}
              <div className={cn(
                'shrink-0 p-3 rounded-xl transition-colors group-hover:scale-110 transform duration-200',
                stat.bgColor
              )}>
                <Icon className={cn('w-6 h-6', stat.iconColor)} />
              </div>
            </div>
            
            {/* Hover gradient overlay */}
            <div className="absolute inset-0 bg-linear-to-r from-transparent to-blue-50/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
          </Card>
        );
      })}
    </div>
  );
}