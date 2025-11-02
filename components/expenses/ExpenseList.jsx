'use client';

import { useState, useEffect } from 'react';
import apiClient from '@/lib/apiClient';
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

      console.log('🔄 Fetching expenses with params:', params.toString());
      
      const response = await apiClient.get(`/api/expenses?${params.toString()}`);

      console.log('📋 Expenses response:', response.data);

      if (response.data.success) {
        setExpenses(response.data.expenses);
      }
    } catch (error) {
      console.error('❌ Fetch expenses error:', error);
      console.error('❌ Error details:', error.response?.data || error.message);
      console.error('❌ Status:', error.response?.status);
      
      if (error.response?.status === 401) {
        console.error('❌ Authentication failed - token might be expired');
        // You might want to redirect to login or refresh token here
      }
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
      const response = await apiClient.delete(`/api/expenses/${expenseId}`);
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
    console.log('Opening edit modal for expense:', expense); // Debug log
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
      <Card className="bg-linear-to-r from-blue-50 to-indigo-50 border-blue-200">
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by description, vendor, or category..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
          </div>

          {/* Filter Options */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 space-y-3 sm:space-y-0 sm:flex sm:gap-3">
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white transition-all duration-200"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="flagged">Flagged</option>
              </select>

              <select
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white transition-all duration-200"
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
            </div>

            <Button 
              variant="outline" 
              onClick={fetchExpenses}
              className="sm:w-auto w-full justify-center"
            >
              <Filter className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>

          {/* Active Filters Display */}
          {(filters.search || filters.status || filters.category) && (
            <div className="flex flex-wrap gap-2 pt-2 border-t border-blue-200">
              <span className="text-sm font-medium text-gray-600">Active filters:</span>
              {filters.search && (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Search: "{filters.search}"
                  <button
                    onClick={() => setFilters({ ...filters, search: '' })}
                    className="ml-1.5 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              )}
              {filters.status && (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Status: {filters.status}
                  <button
                    onClick={() => setFilters({ ...filters, status: '' })}
                    className="ml-1.5 text-green-600 hover:text-green-800"
                  >
                    ×
                  </button>
                </span>
              )}
              {filters.category && (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  Category: {filters.category}
                  <button
                    onClick={() => setFilters({ ...filters, category: '' })}
                    className="ml-1.5 text-purple-600 hover:text-purple-800"
                  >
                    ×
                  </button>
                </span>
              )}
              <button
                onClick={() => setFilters({ search: '', status: '', category: '' })}
                className="text-xs text-red-600 hover:text-red-800 font-medium"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      </Card>

      {/* Expense List */}
      <Card>
        {filteredExpenses.length === 0 ? (
          <div className="text-center py-12">
            <Receipt className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No expenses found</p>
            <p className="text-sm text-gray-400 mt-2">
              Try adjusting your search criteria or filters
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden lg:block">
              <div className="overflow-hidden rounded-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Details
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Status
                      </th>
                      {userRole !== 'employee' && (
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Employee
                        </th>
                      )}
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredExpenses.map((expense) => (
                      <tr key={expense._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(expense.date)}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-900">
                          <div className="max-w-xs">
                            <div className="font-medium text-gray-900 truncate" title={expense.description}>
                              {expense.description}
                            </div>
                            <div className="text-sm text-gray-500 truncate" title={expense.vendor}>
                              {expense.vendor}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {expense.category}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                          {formatCurrency(expense.amount)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          {getStatusBadge(expense.status)}
                        </td>
                        {userRole !== 'employee' && (
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div className="flex items-center">
                              <div className="shrink-0 h-8 w-8">
                                <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                                  <span className="text-xs font-medium text-gray-600">
                                    {expense.employeeId?.name?.charAt(0) || 'U'}
                                  </span>
                                </div>
                              </div>
                              <div className="ml-3">
                                <div className="text-sm font-medium text-gray-900 truncate max-w-[120px]" title={expense.employeeId?.name}>
                                  {expense.employeeId?.name}
                                </div>
                                <div className="text-xs text-gray-500 truncate max-w-[120px]" title={expense.employeeId?.department}>
                                  {expense.employeeId?.department}
                                </div>
                              </div>
                            </div>
                          </td>
                        )}
                        <td className="px-4 py-4 whitespace-nowrap text-sm">
                          <div className="flex items-center gap-1">
                            {/* View Details */}
                            <button
                              onClick={() => handleView(expense)}
                              className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            {/* Edit */}
                            {canDelete(expense) && (
                              <button
                                onClick={() => handleEdit(expense)}
                                className="p-1 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded transition-colors"
                                title="Edit Expense"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                            )}

                            {/* View Receipt */}
                            {expense.receiptUrl && (
                              <button
                                onClick={() => window.open(expense.receiptUrl, '_blank')}
                                className="p-1 text-green-600 hover:text-green-800 hover:bg-green-50 rounded transition-colors"
                                title="View Receipt"
                              >
                                <Receipt className="w-4 h-4" />
                              </button>
                            )}

                            {/* Delete */}
                            {canDelete(expense) && (
                              <button
                                onClick={() => handleDelete(expense._id, expense.status)}
                                disabled={deleting === expense._id}
                                className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
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
                              <span className="p-1 text-gray-400" title="Cannot edit/delete approved/rejected expenses">
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
            </div>

            {/* Mobile/Tablet Card View */}
            <div className="block lg:hidden space-y-4">
              {filteredExpenses.map((expense) => (
                <div
                  key={expense._id}
                  className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-gray-900 truncate" title={expense.description}>
                        {expense.description}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">{formatDate(expense.date)}</p>
                    </div>
                    <div className="shrink-0 ml-3">
                      {getStatusBadge(expense.status)}
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Vendor</label>
                      <p className="text-sm text-gray-900 truncate" title={expense.vendor}>{expense.vendor}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Amount</label>
                      <p className="text-sm font-semibold text-gray-900">{formatCurrency(expense.amount)}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Category</label>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {expense.category}
                      </span>
                    </div>
                    {userRole !== 'employee' && expense.employeeId && (
                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Employee</label>
                        <div className="flex items-center mt-1">
                          <div className="shrink-0 h-6 w-6 bg-gray-200 rounded-full flex items-center justify-center">
                            <span className="text-xs font-medium text-gray-600">
                              {expense.employeeId?.name?.charAt(0) || 'U'}
                            </span>
                          </div>
                          <div className="ml-2 min-w-0 flex-1">
                            <p className="text-sm text-gray-900 truncate" title={expense.employeeId?.name}>
                              {expense.employeeId?.name}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div className="flex items-center space-x-3">
                      {/* View Details */}
                      <button
                        onClick={() => handleView(expense)}
                        className="flex items-center text-xs text-blue-600 hover:text-blue-800 font-medium"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Details
                      </button>

                      {/* View Receipt */}
                      {expense.receiptUrl && (
                        <button
                          onClick={() => window.open(expense.receiptUrl, '_blank')}
                          className="flex items-center text-xs text-green-600 hover:text-green-800 font-medium"
                        >
                          <Receipt className="w-4 h-4 mr-1" />
                          Receipt
                        </button>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      {/* Edit */}
                      {canDelete(expense) && (
                        <button
                          onClick={() => handleEdit(expense)}
                          className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Edit Expense"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      )}

                      {/* Delete */}
                      {canDelete(expense) && (
                        <button
                          onClick={() => handleDelete(expense._id, expense.status)}
                          disabled={deleting === expense._id}
                          className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
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
                        <span className="p-2 text-gray-400" title="Cannot edit/delete approved/rejected expenses">
                          🔒
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Results Summary */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Showing {filteredExpenses.length} of {expenses.length} expenses
                {filters.search && ` matching "${filters.search}"`}
                {(filters.status || filters.category) && ' with applied filters'}
              </p>
            </div>
          </>
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

      {/* Quick Guide */}
      <Card className="bg-linear-to-r from-gray-50 to-blue-50 border-gray-200">
        <div className="flex items-start gap-3">
          <div className="shrink-0 w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <AlertCircle className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Quick Actions Guide</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-blue-600" />
                <span>View details & receipt</span>
              </div>
              <div className="flex items-center gap-2">
                <Edit className="w-4 h-4 text-gray-600" />
                <span>Edit pending/flagged</span>
              </div>
              <div className="flex items-center gap-2">
                <Trash2 className="w-4 h-4 text-red-600" />
                <span>Delete (if allowed)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-400">🔒</span>
                <span>Locked (approved/rejected)</span>
              </div>
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-green-600" />
                <span>View receipt document</span>
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-purple-600" />
                <span>Use filters to narrow results</span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
