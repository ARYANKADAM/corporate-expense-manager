'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import Card from '@/components/ui/Card';
import { formatCurrency } from '@/lib/utils';
import { 
  Receipt, 
  DollarSign, 
  TrendingUp, 
  AlertCircle,
  Clock,
  CheckCircle
} from 'lucide-react';

export default function DashboardStats({ userRole = 'employee' }) {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await axios.get('/api/analytics/dashboard');
      
      if (response.data.success) {
        setAnalytics(response.data.analytics);
      }
    } catch (error) {
      console.error('Fetch analytics error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (!analytics) {
    return null;
  }

  const getStatusCount = (status) => {
    const item = analytics.statusBreakdown.find(s => s._id === status);
    return item ? item.count : 0;
  };

  const stats = [
    {
      title: 'Total Expenses',
      value: analytics.total.expenses,
      subtitle: formatCurrency(analytics.total.amount),
      icon: Receipt,
      color: 'bg-blue-100 text-blue-600',
    },
    {
      title: 'This Month',
      value: analytics.currentMonth.expenses,
      subtitle: formatCurrency(analytics.currentMonth.amount),
      icon: DollarSign,
      color: 'bg-green-100 text-green-600',
    },
    {
      title: 'Pending Approval',
      value: getStatusCount('pending'),
      subtitle: 'Awaiting review',
      icon: Clock,
      color: 'bg-yellow-100 text-yellow-600',
    },
    {
      title: 'Policy Violations',
      value: analytics.violations,
      subtitle: 'Flagged items',
      icon: AlertCircle,
      color: 'bg-red-100 text-red-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {stat.value}
                </p>
                <p className="text-xs text-gray-500 mt-1">{stat.subtitle}</p>
              </div>
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}