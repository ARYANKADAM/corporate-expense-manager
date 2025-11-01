'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { formatCurrency, formatDate } from '@/lib/utils';
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Eye,
  Users,
  DollarSign,
  Clock,
  TrendingUp
} from 'lucide-react';

export default function ManagerDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [pendingExpenses, setPendingExpenses] = useState([]);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [comments, setComments] = useState('');
  const [processing, setProcessing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [analyticsRes, expensesRes] = await Promise.all([
        axios.get('/api/analytics/dashboard'),
        axios.get('/api/expenses?status=pending')
      ]);

      if (analyticsRes.data.success) {
        setStats(analyticsRes.data.analytics);
      }

      if (expensesRes.data.success) {
        setPendingExpenses(expensesRes.data.expenses);
      }
    } catch (error) {
      console.error('Fetch data error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (expenseId, action) => {
    try {
      setProcessing(true);
      const response = await axios.post('/api/expenses/approve', {
        expenseId,
        action,
        comments,
      });

      if (response.data.success) {
        setPendingExpenses(pendingExpenses.filter(exp => exp._id !== expenseId));
        setShowModal(false);
        setSelectedExpense(null);
        setComments('');
        alert(`Expense ${action}d successfully!`);
      }
    } catch (error) {
      console.error('Approval error:', error);
      alert(error.response?.data?.message || 'Failed to process approval');
    } finally {
      setProcessing(false);
    }
  };

  const openModal = (expense, action) => {
    setSelectedExpense({ ...expense, action });
    setShowModal(true);
  };

  const statCards = [
    {
      title: 'Pending Approvals',
      value: pendingExpenses.length,
      icon: Clock,
      color: 'bg-yellow-500',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-600'
    },
    {
      title: 'Team Expenses',
      value: stats?.total.expenses || 0,
      icon: Users,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600'
    },
    {
      title: 'Total Amount',
      value: formatCurrency(stats?.total.amount || 0),
      icon: DollarSign,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600'
    },
    {
      title: 'This Month',
      value: formatCurrency(stats?.currentMonth.amount || 0),
      icon: TrendingUp,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600'
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
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Manager Dashboard</h1>
        <p className="text-gray-600 mt-1">Review and approve team expenses</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {stat.value}
                  </p>
                </div>
                <div className={`${stat.bgColor} p-3 rounded-lg`}>
                  <Icon className={`w-6 h-6 ${stat.textColor}`} />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <Card>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Pending Approvals ({pendingExpenses.length})
          </h2>
          <Button variant="outline" onClick={fetchData}>Refresh</Button>
        </div>

        {pendingExpenses.length === 0 ? (
          <div className="text-center py-12">
            <CheckCircle className="w-16 h-16 text-green-300 mx-auto mb-4" />
            <p className="text-gray-500">No pending approvals</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingExpenses.map((expense) => (
              <div key={expense._id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-lg font-semibold text-gray-900">{expense.vendor}</h3>
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                        {expense.category}
                      </span>
                      {!expense.isCompliant && (
                        <span className="px-3 py-1 bg-orange-100 text-orange-800 text-xs font-medium rounded-full flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          Policy Violation
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                      <div>
                        <span className="text-gray-500">Employee:</span>
                        <p className="font-medium text-gray-900">{expense.employeeId?.name}</p>
                        <p className="text-xs text-gray-500">{expense.employeeId?.department}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Amount:</span>
                        <p className="font-bold text-gray-900 text-lg">{formatCurrency(expense.amount)}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Date:</span>
                        <p className="font-medium text-gray-900">{formatDate(expense.date)}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Submitted:</span>
                        <p className="font-medium text-gray-900">{formatDate(expense.createdAt)}</p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <span className="text-gray-500 text-sm">Description:</span>
                      <p className="text-gray-900 mt-1">{expense.description}</p>
                    </div>

                    {expense.policyViolations && expense.policyViolations.length > 0 && (
                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                        <h4 className="font-semibold text-orange-900 mb-2 flex items-center gap-2">
                          <AlertCircle className="w-4 h-4" />
                          Policy Violations:
                        </h4>
                        <ul className="space-y-1">
                          {expense.policyViolations.map((violation, idx) => (
                            <li key={idx} className="text-sm text-orange-800">
                              • {violation.message}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200">
                  <Button
                    variant="success"
                    onClick={() => openModal(expense, 'approve')}
                    className="flex-1"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => openModal(expense, 'reject')}
                    className="flex-1"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                  {expense.receiptUrl && (
                    <Button
                      variant="outline"
                      onClick={() => window.open(expense.receiptUrl, '_blank')}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Receipt
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {showModal && selectedExpense && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Confirm {selectedExpense.action === 'approve' ? 'Approval' : 'Rejection'}
            </h3>
            
            <div className="mb-4">
              <p className="text-gray-700 mb-2"><strong>Expense:</strong> {selectedExpense.vendor}</p>
              <p className="text-gray-700 mb-2"><strong>Amount:</strong> {formatCurrency(selectedExpense.amount)}</p>
              <p className="text-gray-700"><strong>Employee:</strong> {selectedExpense.employeeId?.name}</p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comments (Optional)
              </label>
              <textarea
                rows="4"
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Add any comments or reasons..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex gap-3">
              <Button
                variant={selectedExpense.action === 'approve' ? 'success' : 'danger'}
                onClick={() => handleApproval(selectedExpense._id, selectedExpense.action)}
                disabled={processing}
                className="flex-1"
              >
                {processing ? 'Processing...' : selectedExpense.action === 'approve' ? 'Approve' : 'Reject'}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowModal(false);
                  setSelectedExpense(null);
                  setComments('');
                }}
                disabled={processing}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}