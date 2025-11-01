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
  MessageSquare
} from 'lucide-react';

export default function ApprovalQueue() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [comments, setComments] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchPendingExpenses();
  }, []);

  const fetchPendingExpenses = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/expenses?status=pending');
      
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
        // Remove from pending list
        setExpenses(expenses.filter(exp => exp._id !== expenseId));
        setShowModal(false);
        setSelectedExpense(null);
        setComments('');
      }
    } catch (error) {
      console.error('Approval error:', error);
      alert(error.response?.data?.message || 'Failed to process approval');
    } finally {
      setProcessing(false);
    }
  };

  const openModal = (expense) => {
    setSelectedExpense(expense);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedExpense(null);
    setComments('');
  };

  if (loading) {
    return (
      <Card>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading pending approvals...</p>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Pending Approvals ({expenses.length})
          </h2>
          <Button variant="outline" onClick={fetchPendingExpenses}>
            Refresh
          </Button>
        </div>

        {expenses.length === 0 ? (
          <div className="text-center py-12">
            <CheckCircle className="w-16 h-16 text-green-300 mx-auto mb-4" />
            <p className="text-gray-500">No pending approvals</p>
          </div>
        ) : (
          <div className="space-y-4">
            {expenses.map((expense) => (
              <div
                key={expense._id}
                className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {expense.vendor}
                      </h3>
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

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Employee:</span>
                        <p className="font-medium text-gray-900">
                          {expense.employeeId?.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {expense.employeeId?.department}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500">Amount:</span>
                        <p className="font-bold text-gray-900 text-lg">
                          {formatCurrency(expense.amount)}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500">Date:</span>
                        <p className="font-medium text-gray-900">
                          {formatDate(expense.date)}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500">Submitted:</span>
                        <p className="font-medium text-gray-900">
                          {formatDate(expense.createdAt)}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3">
                      <span className="text-gray-500 text-sm">Description:</span>
                      <p className="text-gray-900 mt-1">{expense.description}</p>
                    </div>

                    {expense.policyViolations && expense.policyViolations.length > 0 && (
                      <div className="mt-4 bg-orange-50 border border-orange-200 rounded-lg p-4">
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
                    onClick={() => openModal(expense)}
                    className="flex-1"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => {
                      setSelectedExpense(expense);
                      setShowModal(true);
                    }}
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
                      View Receipt
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Approval Modal */}
      {showModal && selectedExpense && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Confirm Action
            </h3>
            
            <div className="mb-4">
              <p className="text-gray-700 mb-2">
                <strong>Expense:</strong> {selectedExpense.vendor}
              </p>
              <p className="text-gray-700 mb-2">
                <strong>Amount:</strong> {formatCurrency(selectedExpense.amount)}
              </p>
              <p className="text-gray-700">
                <strong>Employee:</strong> {selectedExpense.employeeId?.name}
              </p>
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
                variant="success"
                onClick={() => handleApproval(selectedExpense._id, 'approve')}
                disabled={processing}
                className="flex-1"
              >
                {processing ? 'Processing...' : 'Approve'}
              </Button>
              <Button
                variant="danger"
                onClick={() => handleApproval(selectedExpense._id, 'reject')}
                disabled={processing}
                className="flex-1"
              >
                {processing ? 'Processing...' : 'Reject'}
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
    </>
  );
}
