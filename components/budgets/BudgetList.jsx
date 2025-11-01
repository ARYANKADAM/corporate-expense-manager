'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { formatCurrency } from '@/lib/utils';
import { TrendingUp, AlertTriangle, CheckCircle, Plus } from 'lucide-react';

export default function BudgetList({ onCreateClick }) {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBudgets();
  }, []);

  const fetchBudgets = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/budgets');
      
      if (response.data.success) {
        setBudgets(response.data.budgets);
      }
    } catch (error) {
      console.error('Fetch budgets error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getUtilizationColor = (percentage) => {
    if (percentage >= 95) return 'text-red-600 bg-red-100';
    if (percentage >= 80) return 'text-orange-600 bg-orange-100';
    return 'text-green-600 bg-green-100';
  };

  const getUtilizationIcon = (percentage) => {
    if (percentage >= 95) return AlertTriangle;
    if (percentage >= 80) return TrendingUp;
    return CheckCircle;
  };

  const calculatePercentage = (spent, amount) => {
    return amount > 0 ? (spent / amount) * 100 : 0;
  };

  if (loading) {
    return (
      <Card>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading budgets...</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Budget Overview
          </h2>
          {onCreateClick && (
            <Button variant="primary" onClick={onCreateClick}>
              <Plus className="w-4 h-4 mr-2" />
              Create Budget
            </Button>
          )}
        </div>

        {budgets.length === 0 ? (
          <div className="text-center py-12">
            <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No budgets found</p>
            {onCreateClick && (
              <Button
                variant="outline"
                onClick={onCreateClick}
                className="mt-4"
              >
                Create First Budget
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {budgets.map((budget) => {
              const percentage = calculatePercentage(budget.spent, budget.amount);
              const Icon = getUtilizationIcon(percentage);
              
              return (
                <div
                  key={budget._id}
                  className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {budget.department}
                      </h3>
                      {budget.category && (
                        <p className="text-sm text-gray-500">{budget.category}</p>
                      )}
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getUtilizationColor(
                        percentage
                      )}`}
                    >
                      <Icon className="w-3 h-3 inline mr-1" />
                      {percentage.toFixed(0)}%
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-600">Spent</span>
                        <span className="font-medium text-gray-900">
                          {formatCurrency(budget.spent || 0)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Budget</span>
                        <span className="font-medium text-gray-900">
                          {formatCurrency(budget.amount)}
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          percentage >= 95
                            ? 'bg-red-600'
                            : percentage >= 80
                            ? 'bg-orange-500'
                            : 'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>

                    <div className="pt-3 border-t border-gray-200">
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>
                          {new Date(budget.startDate).toLocaleDateString()} -{' '}
                          {new Date(budget.endDate).toLocaleDateString()}
                        </span>
                        <span className="capitalize">{budget.period}</span>
                      </div>
                    </div>

                    {percentage >= 80 && (
                      <div
                        className={`mt-2 px-3 py-2 rounded-lg text-xs ${
                          percentage >= 95
                            ? 'bg-red-50 text-red-700'
                            : 'bg-orange-50 text-orange-700'
                        }`}
                      >
                        {percentage >= 95
                          ? '⚠️ Budget limit reached!'
                          : '⚡ Approaching budget limit'}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
