'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  Receipt,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Filter,
  Search,
  Trash2,
  Edit,
  Eye,
} from 'lucide-react';
import ExpenseDetailModal from './ExpenseDetailModal';
import EditExpenseModal from './EditExpenseModal';

export default function ExpenseList({ userRole = 'employee' }) {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    search: '',
  });

  // modal + selected expense states
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    fetchExpenses();
  }, [filters.status, filters.category]);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.category) params.append('category', filters.category);

      const response = await axios.get(`/api/expenses?${params.toString()}`);

      if (response.data.success) {
        setExpenses(response.data.expenses);
      }
    } catch (error) {
      console.error('Fetch expenses error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (expenseId, expenseStatus) => {
    if (expenseStatus === 'approved' || expenseStatus === 'rejected') {
      alert(
        'Cannot delete approved or rejected expenses. Contact your manager if changes are needed.'
      );
      return;
    }

    const confirmDelete = window.confirm(
      'Are you sure you want to delete this expense? This action cannot be undone.'
    );
    if (!confirmDelete) return;

    try {
      setDeleting(expenseId);
      const response = await axios.delete(`/api/expenses/${expenseId}`);
      if (response.data.success) {
        setExpenses(expenses.filter((exp) => exp._id !== expenseId));
        alert('Expense deleted successfully!');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert(error.response?.data?.message || 'Failed to delete expense');
    } finally {
      setDeleting(null);
    }
  };

  const handleView = (expense) => {
    setSelectedExpense(expense);
    setShowDetailModal(true);
  };

  const handleEdit = (expense) => {
    setSelectedExpense(expense);
    setShowEditModal(true);
  };

  const handleEditSuccess = (updatedExpense) => {
    setExpenses((prev) =>
      prev.map((exp) =>
        exp._id === updatedExpense._id ? updatedExpense : exp
      )
    );
  };

  const canDelete = (expense) => {
    if (userRole === 'employee') {
      return expense.status === 'pending' || expense.status === 'flagged';
    }
    return expense.status === 'pending' || expense.status === 'flagged';
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      flagged: 'bg-orange-100 text-orange-800',
    };

    const icons = {
      pending: Clock,
      approved: CheckCircle,
      rejected: XCircle,
      flagged: AlertCircle,
    };

    const Icon = icons[status] || Clock;

    return (
      <span
        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${styles[status]}`}
      >
        <Icon className="w-3 h-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const filteredExpenses = expenses.filter((expense) => {
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return (
        expense.vendor.toLowerCase().includes(searchLower) ||
        expense.description.toLowerCase().includes(searchLower) ||
        expense.category.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  if (loading) {
    return (
      <Card>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading expenses...</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search expenses..."
                value={filters.search}
                onChange={(e) =>
                  setFilters({ ...filters, search: e.target.value })
                }
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <select
            value={filters.status}
            onChange={(e) =>
              setFilters({ ...filters, status: e.target.value })
            }
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="flagged">Flagged</option>
          </select>

          <select
            value={filters.category}
            onChange={(e) =>
              setFilters({ ...filters, category: e.target.value })
            }
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Categories</option>
            <option value="Meals">Meals</option>
            <option value="Travel">Travel</option>
            <option value="Office Supplies">Office Supplies</option>
            <option value="Entertainment">Entertainment</option>
            <option value="Accommodation">Accommodation</option>
            <option value="Transportation">Transportation</option>
            <option value="Other">Other</option>
          </select>

          <Button variant="outline" onClick={fetchExpenses}>
            <Filter className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </Card>

      {/* Expense List */}
      <Card>
        {filteredExpenses.length === 0 ? (
          <div className="text-center py-12">
            <Receipt className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No expenses found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vendor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  {userRole !== 'employee' && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Employee
                    </th>
                  )}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredExpenses.map((expense) => (
                  <tr key={expense._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(expense.date)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div
                        className="max-w-xs truncate"
                        title={expense.description}
                      >
                        {expense.description}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {expense.vendor}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {expense.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(expense.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(expense.status)}
                    </td>
                    {userRole !== 'employee' && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>
                          <div className="font-medium">
                            {expense.employeeId?.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {expense.employeeId?.department}
                          </div>
                        </div>
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-2">
                        {/* View Details */}
                        <button
                          onClick={() => handleView(expense)}
                          className="text-blue-600 hover:text-blue-800"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Edit */}
                        {canDelete(expense) && (
                          <button
                            onClick={() => handleEdit(expense)}
                            className="text-gray-600 hover:text-gray-800"
                            title="Edit Expense"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        )}

                        {/* View Receipt */}
                        {expense.receiptUrl && (
                          <button
                            onClick={() =>
                              window.open(expense.receiptUrl, '_blank')
                            }
                            className="text-green-600 hover:text-green-800"
                            title="View Receipt"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        )}

                        {/* Delete */}
                        {canDelete(expense) && (
                          <button
                            onClick={() =>
                              handleDelete(expense._id, expense.status)
                            }
                            disabled={deleting === expense._id}
                            className="text-red-600 hover:text-red-800 disabled:opacity-50"
                            title="Delete Expense"
                          >
                            {deleting === expense._id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        )}

                        {!canDelete(expense) && (
                          <span
                            className="text-xs text-gray-400"
                            title="Cannot edit/delete approved/rejected expenses"
                          >
                            🔒
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Modals */}
      {showDetailModal && selectedExpense && (
        <ExpenseDetailModal
          expense={selectedExpense}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedExpense(null);
          }}
        />
      )}

      {showEditModal && selectedExpense && (
        <EditExpenseModal
          expense={selectedExpense}
          onClose={() => {
            setShowEditModal(false);
            setSelectedExpense(null);
          }}
          onSuccess={handleEditSuccess}
        />
      )}

      {/* Legend */}
      <Card>
        <div className="text-sm text-gray-600">
          <p className="font-semibold mb-2">💡 Quick Guide:</p>
          <ul className="space-y-1">
            <li>• 👁️ View expense details</li>
            <li>• <Edit className="w-3 h-3 inline" /> Edit pending/flagged expenses</li>
            <li>• <Eye className="w-3 h-3 inline" /> View receipt (if uploaded)</li>
            <li>• <Trash2 className="w-3 h-3 inline" /> Delete expense (only pending/flagged)</li>
            <li>• 🔒 Approved/rejected expenses are locked</li>
          </ul>
        </div>
      </Card>
    </div>
  );
}
