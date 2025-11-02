'use client';

import { useState } from 'react';
import axios from 'axios';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { X, AlertCircle, CheckCircle } from 'lucide-react';

export default function EditExpenseModal({ expense, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    amount: expense.amount || '',
    category: expense.category || '',
    subcategory: expense.subcategory || '',
    vendor: expense.vendor || '',
    description: expense.description || '',
    date: expense.date ? new Date(expense.date).toISOString().split('T')[0] : '',
    receiptUrl: expense.receiptUrl || '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const categories = [
    'Meals',
    'Travel',
    'Office Supplies',
    'Entertainment',
    'Accommodation',
    'Transportation',
    'Other',
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validate required fields
    if (!formData.amount || formData.amount <= 0) {
      setError('Please enter a valid amount');
      setLoading(false);
      return;
    }

    if (!formData.category) {
      setError('Please select a category');
      setLoading(false);
      return;
    }

    if (!formData.vendor.trim()) {
      setError('Please enter a vendor name');
      setLoading(false);
      return;
    }

    if (!formData.description.trim()) {
      setError('Please provide a description');
      setLoading(false);
      return;
    }

    try {
      console.log('Submitting expense update:', formData); // Debug log
      const response = await axios.put(`/api/expenses/${expense._id}`, formData);

      if (response.data.success) {
        console.log('Update successful:', response.data); // Debug log
        onSuccess(response.data.expense); // Pass the updated expense data
        onClose();
      } else {
        setError(response.data.message || 'Update failed');
      }
    } catch (err) {
      console.error('Edit expense error:', err);
      console.error('Error response:', err.response?.data); // More detailed error logging
      setError(
        err.response?.data?.message || 
        err.message || 
        'Failed to update expense. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between rounded-t-2xl">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Edit Expense</h2>
            <p className="text-sm text-gray-600 mt-1">Update your expense details</p>
          </div>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 text-red-700 px-4 py-4 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Error updating expense</p>
                <p className="text-sm mt-1">{error}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Input
              label="Amount"
              type="number"
              name="amount"
              placeholder="0.00"
              step="0.01"
              min="0"
              value={formData.amount}
              onChange={handleChange}
              required
              helperText="Enter the expense amount in USD"
            />

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Category
                <span className="text-red-500 ml-1">*</span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 hover:border-gray-300"
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="Vendor"
              type="text"
              name="vendor"
              placeholder="e.g., Starbucks, Amazon"
              value={formData.vendor}
              onChange={handleChange}
              required
              helperText="Who did you pay?"
            />

            <Input
              label="Date"
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
              helperText="When did this expense occur?"
            />
          </div>

          <Input
            label="Subcategory"
            type="text"
            name="subcategory"
            placeholder="e.g., Client Meeting, Conference"
            value={formData.subcategory}
            onChange={handleChange}
            helperText="Optional: Add more specific category details"
          />

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Description
              <span className="text-red-500 ml-1">*</span>
            </label>
            <textarea
              name="description"
              rows="4"
              placeholder="Provide detailed description of the expense..."
              value={formData.description}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 hover:border-gray-300 resize-none"
            />
            <p className="text-sm text-gray-500 mt-2">Be as specific as possible for faster approval</p>
          </div>

          <Input
            label="Receipt URL"
            type="url"
            name="receiptUrl"
            placeholder="https://example.com/receipt.pdf"
            value={formData.receiptUrl}
            onChange={handleChange}
            helperText="Optional: Link to uploaded receipt or document"
          />

          <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
            <Button
              type="submit"
              variant="primary"
              disabled={loading}
              className="flex-1 justify-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Updating...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Update Expense
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="sm:w-auto"
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}