'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { formatCurrency, formatDate } from '@/lib/utils';
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Eye,
  MessageSquare,
  User,
  Calendar,
  DollarSign,
  Tag,
  Building,
  FileText,
  Clock,
  Search,
  Filter
} from 'lucide-react';

export default function ManagerApprovalsPage() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [comments, setComments] = useState('');
  const [processing, setProcessing] = useState(false);
  const [filter, setFilter] = useState('all'); // all, violations, high-value

  useEffect(() => {
    fetchPendingExpenses();
  }, []);

  const fetchPendingExpenses = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/expenses?status=pending,flagged');
      
      if (response.data.success) {
        setExpenses(response.data.expenses);
      }
    } catch (error) {
      console.error('Fetch expenses error:', error);
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
        setExpenses(expenses.filter(exp => exp._id !== expenseId));
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

  const closeModal = () => {
    setShowModal(false);
    setSelectedExpense(null);
    setComments('');
  };

  const filteredExpenses = expenses.filter(expense => {
    if (filter === 'violations') return !expense.isCompliant;
    if (filter === 'high-value') return expense.amount > 500;
    return true;
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Approval Queue</h1>
          <p className="text-gray-600 mt-1">
            {filteredExpenses.length} expense{filteredExpenses.length !== 1 ? 's' : ''} awaiting your review
          </p>
        </div>
        <Button variant="outline" onClick={fetchPendingExpenses}>
          <Clock className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex items-center gap-4">
          <Filter className="w-5 h-5 text-gray-600" />
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'all' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All ({expenses.length})
            </button>
            <button
              onClick={() => setFilter('violations')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'violations' 
                  ? 'bg-orange-100 text-orange-700' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Policy Violations ({expenses.filter(e => !e.isCompliant).length})
            </button>
            <button
              onClick={() => setFilter('high-value')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'high-value' 
                  ? 'bg-purple-100 text-purple-700' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              High Value (${'>'}500) ({expenses.filter(e => e.amount > 500).length})
            </button>
          </div>
        </div>
      </Card>

      {/* Expense List */}
      {filteredExpenses.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <CheckCircle className="w-16 h-16 text-green-300 mx-auto mb-4" />
            <p className="text-gray-500">No pending approvals</p>
            <p className="text-sm text-gray-400 mt-2">All caught up! 🎉</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredExpenses.map((expense) => (
            <Card key={expense._id} className="hover:shadow-lg transition-shadow">
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-3 rounded-lg">
                      <User className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {expense.employeeId?.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {expense.employeeId?.department} • {expense.employeeId?.employeeId}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!expense.isCompliant && (
                      <span className="px-3 py-1 bg-orange-100 text-orange-800 text-xs font-medium rounded-full flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        Policy Violation
                      </span>
                    )}
                    {expense.amount > 500 && (
                      <span className="px-3 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">
                        High Value
                      </span>
                    )}
                  </div>
                </div>

                {/* Expense Details Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Amount</p>
                      <p className="font-bold text-gray-900 text-lg">
                        {formatCurrency(expense.amount)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Category</p>
                      <p className="font-medium text-gray-900">{expense.category}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Vendor</p>
                      <p className="font-medium text-gray-900">{expense.vendor}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Date</p>
                      <p className="font-medium text-gray-900">
                        {formatDate(expense.date)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-start gap-2">
                    <FileText className="w-4 h-4 text-gray-400 mt-1" />
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Description</p>
                      <p className="text-gray-900">{expense.description}</p>
                    </div>
                  </div>
                </div>

                {/* Policy Violations */}
                {expense.policyViolations && expense.policyViolations.length > 0 && (
                  <div className="pt-4 border-t border-gray-200">
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                      <h4 className="font-semibold text-orange-900 mb-2 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        Policy Violations Detected:
                      </h4>
                      <ul className="space-y-1">
                        {expense.policyViolations.map((violation, idx) => (
                          <li key={idx} className="text-sm text-orange-800 flex items-start gap-2">
                            <span className="font-medium">[{violation.severity.toUpperCase()}]</span>
                            <span>{violation.rule}: {violation.message}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t border-gray-200">
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
            </Card>
          ))}
        </div>
      )}

      {/* Approval Modal */}
      {showModal && selectedExpense && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              {selectedExpense.action === 'approve' ? '✅ Approve' : '❌ Reject'} Expense
            </h3>
            
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <div className="space-y-2">
                <p className="text-sm">
                  <span className="text-gray-600">Employee:</span>{' '}
                  <span className="font-medium text-gray-900">
                    {selectedExpense.employeeId?.name}
                  </span>
                </p>
                <p className="text-sm">
                  <span className="text-gray-600">Amount:</span>{' '}
                  <span className="font-medium text-gray-900">
                    {formatCurrency(selectedExpense.amount)}
                  </span>
                </p>
                <p className="text-sm">
                  <span className="text-gray-600">Vendor:</span>{' '}
                  <span className="font-medium text-gray-900">
                    {selectedExpense.vendor}
                  </span>
                </p>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comments {selectedExpense.action === 'reject' && <span className="text-red-500">*</span>}
              </label>
              <textarea
                rows="4"
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder={
                  selectedExpense.action === 'approve'
                    ? 'Add any comments (optional)...'
                    : 'Please provide a reason for rejection...'
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex gap-3">
              <Button
                variant={selectedExpense.action === 'approve' ? 'success' : 'danger'}
                onClick={() => handleApproval(selectedExpense._id, selectedExpense.action)}
                disabled={processing || (selectedExpense.action === 'reject' && !comments.trim())}
                className="flex-1"
              >
                {processing ? 'Processing...' : selectedExpense.action === 'approve' ? 'Approve' : 'Reject'}
              </Button>
              <Button
                variant="outline"
                onClick={closeModal}
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