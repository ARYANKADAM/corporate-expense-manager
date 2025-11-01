'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';
import { CheckCircle, XCircle } from 'lucide-react';
import axios from 'axios';

export default function BulkActions({ selectedIds, onSuccess }) {
  const [processing, setProcessing] = useState(false);

  const handleBulkAction = async (action) => {
    if (selectedIds.length === 0) {
      alert('Please select at least one expense');
      return;
    }

    const confirmMessage = `Are you sure you want to ${action} ${selectedIds.length} expense(s)?`;
    if (!window.confirm(confirmMessage)) return;

    try {
      setProcessing(true);
      const promises = selectedIds.map(id =>
        axios.post('/api/expenses/approve', {
          expenseId: id,
          action,
          comments: `Bulk ${action}`,
        })
      );

      await Promise.all(promises);
      alert(`Successfully ${action}d ${selectedIds.length} expense(s)`);
      onSuccess();
    } catch (error) {
      console.error('Bulk action error:', error);
      alert('Failed to process bulk action');
    } finally {
      setProcessing(false);
    }
  };

  if (selectedIds.length === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg border border-gray-200 p-4 flex items-center gap-4 z-50">
      <span className="text-sm font-medium text-gray-700">
        {selectedIds.length} selected
      </span>
      <div className="flex gap-2">
        <Button
          variant="success"
          size="sm"
          onClick={() => handleBulkAction('approve')}
          disabled={processing}
        >
          <CheckCircle className="w-4 h-4 mr-1" />
          Approve All
        </Button>
        <Button
          variant="danger"
          size="sm"
          onClick={() => handleBulkAction('reject')}
          disabled={processing}
        >
          <XCircle className="w-4 h-4 mr-1" />
          Reject All
        </Button>
      </div>
    </div>
  );
}
